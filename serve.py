#!/usr/bin/env python3
"""
Servidor de desarrollo para el demo DMS.

artifact.html es un FRAGMENTO: no tiene <!doctype>, <html>, <head> ni <body>,
porque la plataforma de Artifacts los agrega al publicar. Este servidor
reproduce ese mismo envoltorio en local, para que lo que ves en el navegador
sea igual a lo que se publica. Reenvuelve en cada request: guardás y refrescás.
"""
import http.server, socketserver, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
PORT = 5173

HEAD = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>
  :root{color-scheme:light;
        padding-top:env(safe-area-inset-top,0px);
        padding-bottom:env(safe-area-inset-bottom,0px)}
  body{margin:0;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fafaf9}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>
</head>
<body>
"""

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?")[0] in ("/", "/index.html"):
            try:
                frag = (ROOT / "artifact.html").read_text(encoding="utf-8")
            except OSError as e:
                self.send_error(500, f"No se pudo leer artifact.html: {e}")
                return
            body = (HEAD + frag + "\n</body>\n</html>\n").encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

    def log_message(self, fmt, *args):
        pass

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Demo DMS en http://127.0.0.1:{PORT}  (Ctrl+C para parar)", flush=True)
        httpd.serve_forever()
