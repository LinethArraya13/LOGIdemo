# Demo DMS — Puerto a Puerta

Demo comercial para **DMS Bolivia S.R.L.**, agente consolidador de carga y
agenciamiento aduanal (La Paz). Se muestra en reuniones de venta. No es producción.

## Qué problema demuestra

DMS parte de dos dolores logísticos y el demo agrega dos capacidades de control
interno para completar el ciclo:

- **Puertas adentro** — su CRM no soporta el volumen de adjuntos de cada trámite
  de importación/exportación. Las plataformas que probaron fallaron. Un trámite
  son hasta 12 documentos, 7 de ellos escaneos, más lotes de fotos de inspección
  de 30-40 MB.
- **Puertas afuera** — no tienen forma ágil de conseguir ni verificar
  transportistas para el tramo terrestre, ni de seguir la carga en tránsito.
- **Responsabilidad interna** — Personal centraliza empleados, cargos, áreas,
  accesos y asignaciones; además detecta concentración de carga.
- **Visibilidad financiera** — Finanzas conecta cobros y costos con operaciones,
  incorpora gastos generales y muestra cuentas pendientes y margen.

## Regla dura: `artifact.html` es un FRAGMENTO

No tiene `<!doctype>`, `<html>`, `<head>` ni `<body>`. **No se los agregues.**
La plataforma de Artifacts los inyecta al publicar; si los escribís a mano, la
página se rompe al publicar. El `<title>` y el `<style>` van al inicio del archivo,
eso sí es correcto.

`serve.py` reproduce ese mismo envoltorio en local para que el preview sea fiel.

## Cómo levantarlo

```powershell
python serve.py      # http://127.0.0.1:5173
```

Sin dependencias, sin npm. En Linux/macOS puede ser `python3 serve.py`.
Guardás `artifact.html`, refrescás, listo.

## Cómo republicar el artifact

Está publicado en https://claude.ai/artifact/BzNikeXusGGyfb2Rqwa975

Para actualizarlo desde otra conversación, pasale esa URL como `url` a la
herramienta Artifact. Publicar sin `url` crea un artifact nuevo en vez de
actualizar este.

## Arquitectura

Un solo archivo: HTML + CSS + JS vanilla en un IIFE. Sin framework, sin build,
sin dependencias externas salvo Google Fonts (Archivo, IBM Plex Sans, IBM Plex Mono).

Estado en memoria (`Seed` + repositorios). Recargar reinicia el demo — es intencional: cada
reunión arranca limpia.

### Secciones del JS, en orden

1. Utilidades de DOM, formato, componentes UI, modal, sesión y estado.
2. `Seed` — datos ficticios de CRM, personal, finanzas, documentos y transporte.
3. `Repo` y servicios de dominio (`Personas`, `Finanzas`, `Operaciones`, etc.).
4. Reglas de matching, tracking, POD y asignación.
5. Funciones `v*()` — una vista por módulo o ficha.
6. Modales y servicios de mutación en memoria.
7. `Nav`, `Routes`, `Actions`, `Inputs`, `Botones`, `Router` y `Login`.

`Router.render()` redibuja `#content` y `Router.wire()` vuelve a asociar eventos.
No hay diffing. Una acción nueva debe registrarse en `Actions` o `Botones`.

### Personal y permisos

- `PERSONAS`, `AREAS`, `CARGOS` y `PERFILES_ACCESO` son catálogos separados.
- Clientes, actividades y operaciones guardan IDs de persona, no nombres libres.
- `GestionPersonal.reasignar()` transfiere trabajo activo antes de una baja.
- Cargo y perfil de acceso no deben fusionarse: describen conceptos distintos.

### Finanzas

- `MOVIMIENTOS` contiene cobros, pagos operativos y gastos generales.
- `op:null` identifica un movimiento general no atribuible a una operación.
- La moneda base del demo es BOB; `Finanzas.base()` convierte USD usando `tc`.
- `fob` es valor de mercancía y nunca debe sumarse como ingreso de DMS.
- Es control financiero interno, no contabilidad fiscal o partida doble.

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
| R06 | Disponibilidad en la fecha de carga |

Puntaje = cumplimiento (40) + rotación equitativa (30) + unidad en origen (20)
+ disponibilidad (10).

**La rotación es intencional**: Andes Cargo le gana a Illimani (88 vs 83) pese a
tener peor calificación, porque lleva 3 cargas en 30 días contra 7. Si DMS
prefiere premiar calificación, cambiar los pesos en `puntaje()`.

Las fechas se comparan como strings ISO (`hasta` vs `entregaISO`). Funciona
porque el formato es `YYYY-MM-DD`. Si agregás fechas, respetá ese formato — el
campo `vence` es solo para mostrar, el que se compara es `hasta`.

## Los cinco roles seed

Login sin contraseña, un clic. Cada rol obtiene sus módulos desde
`PERFILES_ACCESO`.

| Rol | Quién | Para qué está |
|---|---|---|
| `ops` | Diego Flores | CRM, documentos, demandas, viajes y consulta de Personal. |
| `ger` | Rodrigo Salazar | Visión ejecutiva, Personal y Finanzas en consulta. |
| `adm` | Carla Mendoza | Administra Personal, cobros, pagos y gastos. |
| `cli` | Cliente externo | Solo sus operaciones, documentos y viajes. |
| `tra` | Transportista | Solo sus demandas, viajes y certificaciones. |

### Recorridos de demostración

- Flujo integral original: CRM → documentos → demanda → matching → viaje → POD.
- Ampliación administrativa: rol `adm` → dashboard → Personal → Finanzas
  → rentabilidad → ficha de operación.
- Ver el guion detallado en `DEMO_SUPERVISORA.md`.

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
- **Producción**: backend, base de datos, autenticación real, auditoría y
  almacenamiento de archivos.
- **Contabilidad formal**: plan de cuentas, asientos, impuestos, facturación y
  conciliación bancaria. La versión actual es control financiero interno.

## Fuentes del análisis

`~/Downloads/Analisis_empresas_dolor_y_plataformas.xlsx` → hoja *Detalle DMS (ejemplo DeltaX)*
`~/Downloads/DMS_SRL_Bolivia_Analisis_DeltaX.xlsx` → perfil y criterios de decisión
