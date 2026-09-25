# Demo DMS — Puerto a Puerta

Demo comercial para DMS Bolivia S.R.L. (agente consolidador de carga, La Paz).
Datos ficticios. No es un sistema en producción.

El flujo integra CRM, documentos, operaciones, transportistas, tracking,
personal y control financiero interno. La guía de presentación de los módulos
nuevos está en [DEMO_SUPERVISORA.md](DEMO_SUPERVISORA.md).

## Desarrollo local

```powershell
python serve.py
```

→ http://127.0.0.1:5173

Editás `artifact.html`, guardás, refrescás. Sin npm, sin build, sin dependencias.
En Linux o macOS también puede usarse `python3 serve.py`.

> `artifact.html` es un **fragmento**: no lleva `<!doctype>`, `<html>`, `<head>`
> ni `<body>`. No se los agregues — ver [CLAUDE.md](CLAUDE.md). `serve.py` los
> inyecta al vuelo y `build.mjs` hace lo mismo para producción.

## Build de producción

```bash
node build.mjs     # genera public/index.html
```

## Prueba de humo

En Windows, con Edge o Chrome instalado:

```powershell
node smoke-test.mjs
```

La prueba levanta el servidor y recorre automáticamente login, Personal,
Finanzas, la ficha financiera de una operación y la restricción del rol Cliente.

## Despliegue

El proyecto está conectado a Vercel vía GitHub: **cada `git push` a `main`
dispara un deploy automático**.

```bash
git add -A
git commit -m "…"
git push
```

Vercel corre `node build.mjs` y sirve `public/` (configurado en `vercel.json`).

### Conexión inicial, una sola vez

1. Crear un repo **privado** vacío en https://github.com/new
   (sin README, sin .gitignore, sin licencia — este proyecto ya los tiene)
2. Conectar y subir:
   ```bash
   git remote add origin git@github.com:USUARIO/REPO.git
   git push -u origin main
   ```
3. Importar el repo en https://vercel.com/new — Vercel lee `vercel.json` solo,
   no hay que configurar nada.

## Sobre la exposición pública

Un deploy de Vercel es accesible para cualquiera con el link (la protección por
contraseña requiere plan Pro). El demo usa el nombre real de DMS con números de
DUI, placas y cifras inventadas, marcados como ficticios en pantalla.

Por eso el build incluye `noindex` por meta y por cabecera `X-Robots-Tag`: no
aparece en buscadores, pero **no es privado**. Si el demo no debería circular
fuera de la reunión, conviene mantener el artifact privado en vez de Vercel.

## Contexto completo

Reglas del motor de asignación, roles seed, qué no romper y qué quedó pendiente:
[CLAUDE.md](CLAUDE.md).
