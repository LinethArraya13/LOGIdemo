/**
 * Genera public/index.html — un documento HTML completo — a partir de
 * artifact.html, que es un FRAGMENTO (sin doctype/html/head/body, porque la
 * plataforma de Artifacts los inyecta al publicar).
 *
 * Es el equivalente estático de lo que serve.py hace al vuelo en desarrollo.
 *   node build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "public");

let frag = readFileSync(join(ROOT, "artifact.html"), "utf8");

// Sacar <title> y los <link> del fragmento para ubicarlos en el <head>.
let title = "DMS Puerto a Puerta";
frag = frag.replace(/<title>([\s\S]*?)<\/title>\s*/i, (_, t) => {
  title = t.trim();
  return "";
});

const links = [];
frag = frag.replace(/^[ \t]*<link\b[^>]*>\s*$/gim, (m) => {
  links.push(m.trim());
  return "";
});

const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<text y="26" font-size="26">🚛</text></svg>'
  );

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Demo comercial — datos ficticios. No es un sistema en producción.">
<title>${title}</title>
<link rel="icon" href="${favicon}">
${links.join("\n")}
<style>
  :root{color-scheme:light dark;
        padding-top:env(safe-area-inset-top,0px);
        padding-bottom:env(safe-area-inset-bottom,0px)}
  body{margin:0;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>
</head>
<body>
${frag.trim()}
</body>
</html>
`;

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "index.html"), html, "utf8");
console.log(`public/index.html — ${(html.length / 1024).toFixed(1)} KB · "${title}"`);
