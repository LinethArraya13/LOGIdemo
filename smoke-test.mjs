import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
  "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];
const browserPath = browsers.find(existsSync);
if (!browserPath) throw new Error("No se encontró Brave, Edge o Chrome para la prueba.");
console.log(`BROWSER  ${browserPath}`);

const profile = mkdtempSync(join(tmpdir(), "dms-smoke-"));
const port = 9300 + Math.floor(Math.random() * 400);
const server = spawn("python", ["serve.py"], { cwd: ROOT, stdio: "ignore" });
const browser = spawn(browserPath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--window-size=1440,1000",
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

  await cdp.evaluate("document.querySelector('#btn-salir').click();document.querySelector('[data-role=ops]').click();document.querySelector('#btn-enter').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('#nav').textContent.includes('Fase 1 · Frente interno') && document.querySelector('#nav').textContent.includes('Fase 2 · Ecosistema')"),
    "la navegación separa el compromiso interno de ESP");

  await cdp.evaluate("document.querySelector('[data-mod=clientes]').click();document.querySelector('[data-cli=C011]').click()");
  await delay(150);
  assert(await cdp.evaluate("!!document.querySelector('[data-cli-avanzar=C011]')"),
    "un prospecto ofrece avanzar de etapa");
  await cdp.evaluate("document.querySelector('[data-cli-avanzar=C011]').click();document.querySelector('[data-clitab=historial]').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('#content').textContent.includes('Etapa actualizada: Prospecto → Contactado')"),
    "el avance CRM queda registrado en historial");
  await cdp.evaluate("document.querySelector('[data-clitab=servicios]').click();document.querySelector('[data-nueva-oport=C011]').click();document.querySelector('#opp-t').value='Seguro para exportación';document.querySelector('#m-save').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('#content').textContent.includes('Seguro para exportación')"),
    "el cliente permite registrar oportunidades de ampliación");

  await cdp.evaluate("document.querySelector('[data-mod=clientes]').click();document.querySelector('[data-cli=C004]').click();document.querySelector('[data-nueva-op=C004]').click();document.querySelector('#op-merc').value='Carga demo supervisión';document.querySelector('#m-save').click()");
  await delay(200);
  assert(await cdp.evaluate("document.querySelector('#content h2').textContent.startsWith('IMP-2026-') && document.querySelector('#content').textContent.includes('Carga demo supervisión')"),
    "un cliente activo origina una operación y su expediente");

  await cdp.evaluate("document.querySelector('[data-mod=documentos]').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('#content').textContent.includes('Proyección de almacenamiento')"),
    "Documentos muestra la proyección recurrente de almacenamiento");
  await cdp.evaluate("Array.from(document.querySelectorAll('#content tbody tr')).find(x=>x.textContent.includes('Pendiente')).click()");
  await delay(100);
  assert(await cdp.evaluate("!!document.querySelector('[data-doc-ok]') && !!document.querySelector('[data-doc-rech]')"),
    "Operaciones puede revisar un documento pendiente");
  await cdp.evaluate("document.querySelector('[data-doc-ok]').click()");
  await delay(150);
  assert(await cdp.evaluate("document.querySelector('.toast').textContent.includes('aprobado por')"),
    "la aprobación registra al responsable");
  const screenshot = await cdp.send("Page.captureScreenshot", { format: "png" });
  const screenshotPath = join(tmpdir(), "dms-smoke-brave.png");
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"));
  console.log(`SCREENSHOT  ${screenshotPath}`);

  await cdp.evaluate("document.querySelector('#btn-salir').click();document.querySelector('[data-role=cli]').click();document.querySelector('#btn-enter').click()");
  await delay(150);
  assert(await cdp.evaluate("!document.querySelector('[data-mod=finanzas]')"),
    "el portal Cliente no expone Finanzas");
  await cdp.evaluate("document.querySelector('[data-mod=documentos]').click();Array.from(document.querySelectorAll('#content tbody tr')).find(x=>x.textContent.includes('Pendiente')).click()");
  await delay(100);
  assert(await cdp.evaluate("!document.querySelector('[data-doc-ok]') && !document.querySelector('[data-doc-rech]')"),
    "el Cliente no puede aprobar ni rechazar documentos");

  assert(cdp.exceptions.length === 0, "el recorrido no produjo excepciones JavaScript");
  cdp.ws.close();
} finally {
  server.kill();
  browser.kill();
  await delay(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
