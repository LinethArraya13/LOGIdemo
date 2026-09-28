# Demo DMS — Puerto a Puerta

Demo comercial para DMS Bolivia S.R.L. (agente consolidador de carga, La Paz).
Datos ficticios. No es un sistema en producción.

El flujo integra CRM, documentos, operaciones, transportistas, tracking,
personal y control financiero interno. La guía de presentación de los módulos
nuevos está en [DEMO_SUPERVISORA.md](DEMO_SUPERVISORA.md).

La interfaz separa el alcance comercial en **Fase 1 · Frente interno**,
**Extensiones opcionales** y **Fase 2 · Ecosistema (ESP)**. Esta separación es
parte del mensaje del demo y no debe eliminarse.

## Roles

El login no pide contraseña: se elige un rol y se entra. Los permisos salen de
un **perfil** (`perfilId`), no de una lista fija por rol.

| Rol | Perfil | Alcance |
|---|---|---|
| Operaciones | `PF-OPE` | CRM, documentos, demandas y viajes |
| Gerencia | `PF-GER` | Tablero, pipeline y reportes |
| **Administración y Contabilidad** | `PF-ADM` | Personal, cobros, pagos y gastos |
| Cliente | `PF-CLI` | Solo sus operaciones, documentos y viajes |
| Transportista | `PF-TRA` | Demandas, sus viajes y sus certificaciones |

Administración y Contabilidad ve Dashboard, Clientes, Operaciones, Personal,
Finanzas y Reportes. No accede a Demandas, Viajes, Directorio ni Certificaciones.

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

En Windows, con Brave, Edge o Chrome instalado:

```powershell
node smoke-test.mjs
```

La prueba levanta el servidor y recorre automáticamente login, avance CRM,
creación de operación, aprobación documental, costo de almacenamiento,
Personal, Finanzas y restricciones del rol Cliente.

## Despliegue

El proyecto está conectado a Vercel vía GitHub: **cada `git push` a `main`
dispara un deploy automático**.

```bash
git add -A
git commit -m "…"
git push
```

Vercel corre `node build.mjs` y sirve `public/` (configurado en `vercel.json`).

## Trabajar sobre el repo

El repositorio es **público**: cualquiera puede clonarlo. Pushear requiere ser
colaborador con permiso de escritura; sin eso, el camino es *fork* y Pull Request.

```bash
git clone https://github.com/LinethArraya13/LOGIdemo.git
cd LOGIdemo
git checkout -b feature/mi-cambio
git push -u origin feature/mi-cambio
```

Configurá tu identidad de git antes del primer commit. Vercel bloquea los
deploys cuyo email de autor no corresponde a una cuenta de GitHub:

```bash
git config user.email "tu-email-de-github@ejemplo.com"
```

Un push a una rama distinta de `main` genera un *preview deployment* con su
propia URL. Solo `main` actualiza producción.

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
