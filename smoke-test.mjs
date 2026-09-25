import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`OK  ${message}`);
};

async function retry(fn, attempts = 40) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      last = error;
      await delay(250);
    }
  }
  throw last;
}

async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let seq = 0;
  const pending = new Map();
  const exceptions = [];
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
    if (msg.method === "Runtime.exceptionThrown") {
      exceptions.push(msg.params.exceptionDetails.text);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const out = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (out.exceptionDetails) throw new Error(out.exceptionDetails.text);
    return out.result.value;
  };
  return { ws, send, evaluate, exceptions };
}

const browsers = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];
const browserPath = browsers.find(existsSync);
if (!browserPath) throw new Error("No se encontró Edge o Chrome para la prueba.");

const profile = mkdtempSync(join(tmpdir(), "dms-smoke-"));
const port = 9300 + Math.floor(Math.random() * 400);
const server = spawn("python", ["serve.py"], { cwd: ROOT, stdio: "ignore" });
const browser = spawn(browserPath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "http://127.0.0.1:5173",
], { stdio: "ignore" });

try {
  const pages = await retry(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    if (!response.ok) throw new Error("CDP todavía no disponible");
    const list = await response.json();
    if (!list.length) throw new Error("Edge no publicó una pestaña");
    return list;
  });
  const page = pages.find((p) => p.url.includes("127.0.0.1:5173")) || pages[0];
  const cdp = await connect(page.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable");
  await retry(async () => {
    const ready = await cdp.evaluate("document.querySelectorAll('[data-role]').length");
    if (ready !== 5) throw new Error("El login todavía no terminó de renderizar");
    return ready;
  });

  assert(await cdp.evaluate("document.querySelectorAll('[data-role]').length") === 5,
    "el login muestra cinco perfiles");

  await cdp.evaluate("document.querySelector('[data-role=adm]').click();document.querySelector('#btn-enter').click()");
  await delay(200);
  assert(await cdp.evaluate("document.querySelector('#content h2').textContent") === "Administración y Contabilidad",
    "Administración abre su tablero");
  assert(await cdp.evaluate("!!document.querySelector('[data-mod=personal]') && !!document.querySelector('[data-mod=finanzas]')"),
    "Administración tiene Personal y Finanzas");

  await cdp.evaluate("document.querySelector('[data-mod=personal]').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('#content h2').textContent") === "Personal",
    "el módulo Personal renderiza");
  await cdp.evaluate("document.querySelector('[data-per=P01]').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('#content h2').textContent") === "Ana Quispe",
    "la ficha de persona abre sus asignaciones");

  await cdp.evaluate("document.querySelector('[data-mod=finanzas]').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('#content h2').textContent") === "Finanzas",
    "el módulo Finanzas renderiza");
  assert(await cdp.evaluate("document.querySelector('#content').textContent.includes('Resultado proyectado')"),
    "Finanzas calcula el resultado proyectado");

  await cdp.evaluate("document.querySelector('[data-op=\"IMP-2026-0847\"]').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('#content h2').textContent") === "IMP-2026-0847",
    "la ficha de operación abre desde rentabilidad");
  await cdp.evaluate("document.querySelector('[data-optab=finanzas]').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('#content').textContent.includes('Margen proyectado')"),
    "la operación muestra ingresos, costos y margen");

  await cdp.evaluate("document.querySelector('#btn-salir').click();document.querySelector('[data-role=cli]').click();document.querySelector('#btn-enter').click()");
  await delay(150);
  assert(await cdp.evaluate("!document.querySelector('[data-mod=finanzas]')"),
    "el portal Cliente no expone Finanzas");

  assert(cdp.exceptions.length === 0, "el recorrido no produjo excepciones JavaScript");
  cdp.ws.close();
} finally {
  server.kill();
  browser.kill();
  await delay(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
