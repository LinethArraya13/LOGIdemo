# Demo DMS — Puerto a Puerta

Demo comercial para **DMS Bolivia S.R.L.**, agente consolidador de carga y
agenciamiento aduanal (La Paz). Se muestra en reuniones de venta. No es producción.

## Qué problema demuestra

DMS tiene dos dolores, y el demo cubre los dos en una sola operación:

- **Puertas adentro** — su CRM no soporta el volumen de adjuntos de cada trámite
  de importación/exportación. Las plataformas que probaron fallaron. Un trámite
  son hasta 12 documentos, 7 de ellos escaneos, más lotes de fotos de inspección
  de 30-40 MB.
- **Puertas afuera** — no tienen forma ágil de conseguir ni verificar
  transportistas para el tramo terrestre, ni de seguir la carga en tránsito.

## Regla dura: `artifact.html` es un FRAGMENTO

No tiene `<!doctype>`, `<html>`, `<head>` ni `<body>`. **No se los agregues.**
La plataforma de Artifacts los inyecta al publicar; si los escribís a mano, la
página se rompe al publicar. El `<title>` y el `<style>` van al inicio del archivo,
eso sí es correcto.

`serve.py` reproduce ese mismo envoltorio en local para que el preview sea fiel.

## Cómo levantarlo

```bash
python3 serve.py      # http://127.0.0.1:5173
```

Sin dependencias, sin npm. Guardás `artifact.html`, refrescás, listo.

## Cómo republicar el artifact

Está publicado en https://claude.ai/artifact/BzNikeXusGGyfb2Rqwa975

Para actualizarlo desde otra conversación, pasale esa URL como `url` a la
herramienta Artifact. Publicar sin `url` crea un artifact nuevo en vez de
actualizar este.

## Arquitectura

Un solo archivo: HTML + CSS + JS vanilla en un IIFE. Sin framework, sin build,
sin dependencias externas salvo Google Fonts (Archivo, IBM Plex Sans, IBM Plex Mono).

Estado en memoria (`var S`). Recargar reinicia el demo — es intencional: cada
reunión arranca limpia.

### Secciones del JS, en orden

1. `CATALOG` / `EXPEDIENTES` / `OCR` — el frente documental
2. `CERTS` / `CARRIERS` — transportistas y sus certificaciones
3. `LOADS` + `evaluar()` / `puntaje()` / `evaluarTodos()` — **el motor de asignación**
4. `SHIPMENTS` — seguimiento de carga
5. `ROLES` — los cuatro logins seed
6. `view*()` — una función por pantalla, devuelven strings de HTML
7. `render()` / `wire()` — render completo + rebind de eventos

`render()` redibuja todo el `#content` y `wire()` vuelve a atar los listeners.
Es deliberadamente tonto: no hay diffing. Si agregás un botón, agregá su
handler en `wire()`.

### El motor de asignación (el corazón del demo)

`evaluar(carrier, load)` devuelve `null` si el transportista pasa, o
`{motivo, regla}` si no. Las reglas corren **en orden** y la primera que falla
es la que se reporta:

| Regla | Qué valida |
|---|---|
| R01 | Documentación obligatoria aprobada y vigente (licencia C, seguro, habilitación, antecedentes) |
| R02 | El seguro cubre **hasta la fecha de entrega**, no solo hasta hoy |
| R03 | Certificación de carga peligrosa si la carga lo exige |
| R04 | Cubre el corredor |
| R05 | Capacidad suficiente |
| R06 | Entre los que pasan, gana el puntaje |

Puntaje = calificación (40) + rotación equitativa (35) + unidad en origen (25)
+ manejo defensivo (5).

**La rotación es intencional**: Andes Cargo le gana a Illimani (88 vs 83) pese a
tener peor calificación, porque lleva 3 cargas en 30 días contra 7. Si DMS
prefiere premiar calificación, cambiar los pesos en `puntaje()`.

Las fechas se comparan como strings ISO (`hasta` vs `entregaISO`). Funciona
porque el formato es `YYYY-MM-DD`. Si agregás fechas, respetá ese formato — el
campo `vence` es solo para mostrar, el que se compara es `hasta`.

## Los cuatro roles seed

Login sin contraseña, un clic. Cada rol ve solo sus secciones (`ROLES[].secs`).

| Rol | Quién | Para qué está |
|---|---|---|
| `ops` | Ana Quispe | Operaciones DMS. Aprueba papeles y ejecuta la asignación. |
| `ger` | Rodrigo Salazar | Gerencia. Ve el antes/ahora y el riesgo. |
| `cli` | Marcela Ortiz | Cliente importador. Scoped a Ferretería Illimani. Es el rol que deja de llamar. |
| `tra` | Marco Vargas | Transportista. Sube sus propios papeles. |

### El recorrido que se muestra en la reunión

Vargas tiene el seguro vigente **hoy** pero vence el 20 sep, y la entrega es el 21.
El motor lo excluye por R02.

1. Entrar como **Marco Vargas** → *Mi perfil y papeles* → Subir el seguro
2. Cambiar a **Ana Quispe** → *Aprobaciones* → Aprobar
3. *Asignación de carga* → Vargas ya aparece entre los elegibles

## Honestidad de los datos

Todo es ficticio y está marcado como tal en pantalla. Dos cosas a no romper:

- Las cifras de «antes / ahora» del tablero de Gerencia llevan el chip
  **"Proyección a validar"**. Son hipótesis de discovery, no números medidos.
- DeltaX (competencia real, boliviana, ~2.200 transportistas) publica −5% en
  costos y −33% en llamadas. No inflar las proyecciones del demo por encima de
  lo que publica quien realmente opera esto hace seis años.

## Pendiente

- **Carga de retorno (backhaul)**: el camión que descarga en Arica vuelve vacío.
  Es el único mecanismo que *crearía* carga nueva en vez de repartir la existente.
  Propuesto, no confirmado por el usuario, no implementado.

## Fuentes del análisis

`~/Downloads/Analisis_empresas_dolor_y_plataformas.xlsx` → hoja *Detalle DMS (ejemplo DeltaX)*
`~/Downloads/DMS_SRL_Bolivia_Analisis_DeltaX.xlsx` → perfil y criterios de decisión
