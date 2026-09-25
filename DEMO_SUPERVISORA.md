# Demo para supervisión — Personal y Finanzas

## Objetivo de la ampliación

La propuesta convierte el demo de una solución principalmente logística en una
vista integrada de la operación de DMS. Ahora permite responder cuatro preguntas
en el mismo lugar:

1. ¿Quién es responsable de cada cliente, tarea y operación?
2. ¿Dónde está concentrada la carga de trabajo?
3. ¿Cuánto ingresa, cuesta y deja cada operación?
4. ¿Qué compromisos generales tiene la empresa aunque no pertenezcan a un viaje?

La ampliación complementa al demo porque cierra el ciclo:

`cliente → operación → documentos → transporte → entrega → cobro/costo → margen`

Personal aporta el responsable y la continuidad en cada etapa. Finanzas aporta
el resultado económico y evita que una operación terminada quede sin cobrar o
sin registrar sus costos.

## Diferencias entre `main` y esta rama

Punto de comparación: `main` en el commit `f0bdf82`. La rama de demostración es
`feature/personal-contabilidad`.

| Tema | En `main` | En esta rama | Por qué importa |
|---|---|---|---|
| Alcance comercial | CRM, documentos y ecosistema de transporte aparecían mezclados | La navegación distingue Fase 1, extensiones opcionales y Fase 2/ESP | Evita prometer el marketplace dentro del frente interno urgente |
| Responsables | Ejecutivos y responsables eran nombres de texto | Personas, cargos, áreas, responsables y accesos relacionados por ID | Evita duplicados y permite ver la carga real de cada persona |
| Continuidad | No existía tratamiento de bajas | Una baja exige reasignar clientes, tareas y operaciones activas | No deja trabajo sin dueño |
| Finanzas | Solo había valores comerciales o FOB | Cobros, pagos, gastos, saldos y margen por operación | Permite saber si la operación genera resultado y si fue cobrada |
| Ficha de operación | Al abrir una operación se llegaba a documentos del cliente | Resumen, Documentos, Viajes y Finanzas en una ficha propia | El expediente pasa a ser el centro del flujo |
| Ciclo CRM | Pipeline principalmente visual | Se puede avanzar la etapa y queda registro en historial | Demuestra gestión, no solo consulta |
| Ampliación de servicios | Oportunidades precargadas | Se pueden crear oportunidades desde la ficha del cliente | Conecta fidelización con venta cruzada |
| Alta de operación | Las operaciones eran datos precargados | Un cliente activo puede originar una nueva operación y expediente | Completa cliente → operación → documentos |
| Revisión documental | Aprobar/Rechazar eran controles sin acción | Operaciones aprueba o rechaza con responsable, fecha y observación | Cierra el circuito cliente → revisión interna |
| Permisos documentales | El cliente podía ver controles internos | El cliente solo consulta/sube; Operaciones revisa | Evita autoaprobación y separa responsabilidades |
| Asociación documental | Una carga global podía quedar en el cliente equivocado | El cliente se deriva de la operación elegida | Preserva integridad del expediente |
| Almacenamiento | Se mostraba volumen, pero sin costo | Proyección mensual configurable con base, GB incluidos y excedente | Hace visible el costo recurrente pedido en DOC-01 |
| Verificación | Build manual | Prueba de humo automatizada del recorrido principal | Reduce riesgo antes de una reunión |

Lo que **sigue siendo una simulación** en ambas ramas: persistencia, archivos
reales en almacenamiento de objetos, autenticación de servidor, GPS real y
auditoría productiva. Debe declararse con claridad.

## Qué se implementó

### Personal

- Registro único de personas, áreas, cargos, responsables y perfiles de acceso.
- Ejecutivos de clientes y responsables de actividades referenciados por ID, no
  como texto libre.
- Responsable interno de cada operación.
- Ficha de persona con clientes, tareas y operaciones asignadas.
- Indicador de carga combinada para detectar concentración de trabajo.
- Alta y edición de personas.
- Baja lógica con reasignación obligatoria de trabajo activo.
- Separación entre cargo laboral y permisos dentro del sistema.

### Finanzas

- Cobros, pagos operativos y gastos generales.
- Movimientos asociados a una operación o a la empresa en general.
- Estados pendiente, parcial, pagado y vencido.
- Registro en BOB o USD y consolidación en moneda base BOB.
- Cuentas por cobrar y por pagar.
- Resultado general proyectado.
- Rentabilidad y margen por operación.
- Gastos generales como alquiler, servicios, software y planilla.
- Alerta de operaciones sin movimientos financieros.

### Integración adicional

- Nueva ficha de operación con Resumen, Documentos, Viajes y Finanzas.
- Avance de etapa CRM con historial de responsable y fecha.
- Alta de oportunidades de ampliación desde el cliente.
- Creación de operaciones y expedientes desde clientes activos.
- Aprobación y rechazo documental restringidos a Operaciones.
- Proyección configurable de almacenamiento para contemplar DOC-01.
- Etiquetas visibles de Fase 1, extensión opcional y Fase 2/ESP.
- El valor FOB queda separado de los ingresos de DMS.
- Tablero específico para Administración y Contabilidad.
- Gerencia tiene consulta; Administración puede registrar y pagar movimientos.
- Operaciones puede consultar el directorio de personal, pero no datos financieros.

## Guion sugerido — 12 a 15 minutos

El orden es deliberado: primero el compromiso vigente, después las diferencias
contra `main`, luego las extensiones y al final el concepto ESP separado.

### 1. Enmarcar alcance y diferencia contra `main` — 1 minuto

En el login seleccionar **Operaciones**. Mostrar en la navegación los tres bloques:

1. **Fase 1 · Frente interno** — compromiso urgente.
2. **Extensiones opcionales** — Personal y Finanzas.
3. **Fase 2 · Ecosistema** — `ESP-01`, fuera de la propuesta inicial.

Mensaje:

> En `main` las capacidades aparecían juntas. Esta rama hace explícito qué está
> incluido, qué agrega valor de forma opcional y qué requiere propuesta propia.

### 2. Demostrar el ciclo CRM — 2 minutos

Abrir **Clientes** y entrar a un prospecto, por ejemplo `Textiles Pacajes Ltda.`.

1. Mostrar etapa, ejecutivo y servicios.
2. Pulsar **Avanzar a Contactado**.
3. Abrir la pestaña **Historial** y mostrar el cambio con persona y fecha.
4. En **Servicios**, registrar una oportunidad de ampliación o explicar el botón.

Justificación:

> `main` mostraba el pipeline; esta rama permite gestionarlo y deja trazabilidad.

### 3. Crear operación y expediente — 2 minutos

Volver a **Clientes** y abrir un cliente activo, por ejemplo `Ferretería Illimani`.

1. Pulsar **+ Operación**.
2. Completar mercancía y crear el expediente.
3. Mostrar la nueva ficha con responsable, ruta, peso y valor FOB.
4. Aclarar que el FOB es valor de mercancía, no ingreso de DMS.

Justificación:

> El CRM rodea al expediente: el cliente origina una operación y la operación
> concentra documentos, transporte y, opcionalmente, finanzas.

### 4. Mostrar control documental — 3 minutos

Abrir **Documentos** dentro de un cliente u operación con archivos precargados.

1. Mostrar búsqueda, categorías, operación, estado, volumen y duplicados.
2. Abrir un documento pendiente.
3. Aprobarlo y señalar responsable y fecha de revisión.
4. En otro documento, abrir **Rechazar**, escribir una observación y cancelar si
   no se desea alterar el resto de la demostración.
5. Mostrar **Proyección de almacenamiento** al final del módulo.

Justificación:

> Esta es la mejora central: el expediente organiza adjuntos por cliente y
> operación, separa carga de revisión y hace visible el costo recurrente DOC-01.

Declaración obligatoria:

> El demo conserva metadatos en memoria. El almacenamiento persistente y las
> cargas reanudables son parte de la implementación productiva, no de este prototipo.

### 5. Mostrar permisos — 1 minuto

Cambiar al rol **Cliente**.

1. Abrir Documentos.
2. Mostrar que puede consultar y subir.
3. Abrir un pendiente y confirmar que no aparecen Aprobar/Rechazar.

Justificación:

> La carga y la aprobación pertenecen a actores distintos. En producción esta
> regla se aplicará también en el servidor.

### 6. Mostrar Personal como extensión — 2 minutos

Entrar como **Administración y Contabilidad** y abrir **Personal**.

1. Mostrar áreas, responsables y carga alta.
2. Abrir la ficha de Ana Quispe.
3. Mostrar clientes, tareas y operaciones.
4. Pulsar **Desactivar**, enseñar la reasignación obligatoria y cancelar.

Justificación:

> La nueva operación no solo tiene datos: tiene un responsable y continuidad si
> esa persona deja el equipo.

### 7. Mostrar Finanzas como extensión — 2 minutos

Abrir **Finanzas**.

1. Mostrar cuentas vencidas, por cobrar y por pagar.
2. Diferenciar costos por operación de alquiler, servicios o planilla.
3. Abrir `IMP-2026-0847` desde rentabilidad.
4. Mostrar ingresos DMS, costos, saldo y margen.

Justificación:

> El valor FOB no se confunde con ingreso. La operación muestra lo que DMS cobra,
> lo que paga y el margen que proyecta.

### 8. Cerrar con Fase 2/ESP — 1 minuto

Mostrar brevemente el grupo **Fase 2 · Ecosistema** sin recorrerlo completo.

Mensaje:

> Directorio, certificación, demandas y tracking validan una visión futura, pero
> son un producto de dos lados y deben tener discovery, alcance y precio separados.

### 9. Cierre

> Frente a `main`, esta rama convierte pantallas aisladas en un flujo demostrable:
> prospecto → cliente → operación → expediente → revisión. Personal y Finanzas
> completan la gestión interna; ESP queda claramente identificado como Fase 2.

## Valor adicional incorporado

- **Continuidad operativa:** no permite desactivar una persona dejando trabajo activo
  sin responsable.
- **Detección de fuga de ingresos:** alerta operaciones que todavía no tienen cobro
  ni costo registrado.
- **Carga de trabajo:** combina clientes, tareas pendientes y operaciones abiertas.
- **Rentabilidad real:** separa el valor de la mercancía de los honorarios de DMS.
- **Control multimoneda:** evita sumar directamente BOB y USD.
- **Segregación de acceso:** cargo y permisos son conceptos independientes.
- **Trazabilidad transversal:** desde una persona o movimiento se llega a la
  operación relacionada.

## Alcance y límites que conviene declarar

Este módulo es **control financiero interno**, no contabilidad fiscal completa.
No incluye todavía:

- Plan de cuentas y partida doble.
- Impuestos o facturación electrónica.
- Conciliación bancaria.
- Cálculo de planillas o beneficios sociales.
- Persistencia en base de datos.
- Auditoría de cambios y autenticación real.

Los importes, nombres, fechas y tipos de cambio son ficticios. El tipo de cambio
del demo es fijo y solo demuestra la consolidación de monedas.

## Preguntas probables

### ¿Por qué no usar directamente el CRM o un sistema contable?

El objetivo es que DMS pueda relacionar personas y finanzas con el expediente
operativo. Una futura integración podría enviar asientos o facturas al sistema
contable formal sin duplicar la operación logística.

### ¿Por qué Personal no es todavía RR. HH. completo?

La necesidad inmediata es asignación, responsabilidad, accesos y continuidad. La
nómina, vacaciones, asistencia y evaluación pueden incorporarse después si el
discovery confirma que aportan valor.

### ¿Qué sería necesario para producción?

Backend, base de datos, autenticación, permisos del lado servidor, adjuntos reales,
auditoría, integración bancaria/contable, reglas tributarias y pruebas automatizadas.

## Checklist antes de la reunión

1. Abrir PowerShell en la carpeta del proyecto.
2. Ejecutar `python serve.py`.
3. Abrir `http://127.0.0.1:5173`.
4. Confirmar que aparece el rol **Administración y Contabilidad**.
5. Ejecutar `node smoke-test.mjs` y confirmar todos los mensajes `OK`.
6. Recargar la página para reiniciar todos los datos antes de presentar.
7. Mantener el navegador en zoom 90–100 %.
8. Tener este documento abierto como guía.
