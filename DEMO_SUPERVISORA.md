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
- El valor FOB queda separado de los ingresos de DMS.
- Tablero específico para Administración y Contabilidad.
- Gerencia tiene consulta; Administración puede registrar y pagar movimientos.
- Operaciones puede consultar el directorio de personal, pero no datos financieros.

## Guion sugerido — 8 a 10 minutos

### 1. Presentar el problema — 1 minuto

Mensaje:

> El demo ya resolvía documentos, asignación de transporte y seguimiento. Faltaba
> conectar la operación con las personas responsables y con su resultado económico.

Explicar que no se busca reemplazar un ERP contable o de RR. HH. en esta fase. Se
busca control interno y trazabilidad para tomar decisiones.

### 2. Entrar como Administración y Contabilidad — 2 minutos

Seleccionar el rol **Administración y Contabilidad**.

Mostrar en el tablero:

- Por cobrar y por pagar.
- Resultado proyectado.
- Cobertura financiera de operaciones.
- Operaciones sin registro financiero.
- Personas con carga alta.

Mensaje:

> El tablero no solo muestra cuánto se mueve; también detecta lo que puede quedar
> sin facturar y dónde existe dependencia excesiva de una persona.

### 3. Mostrar Personal — 2 minutos

Abrir **Personal**.

1. Mostrar áreas y responsables.
2. Señalar las personas con carga alta.
3. Abrir la ficha de Ana Quispe.
4. Mostrar clientes y tareas asignadas.
5. Pulsar **Desactivar** para enseñar la protección de continuidad.
6. Mostrar el selector de reasignación y cancelar el diálogo.

Mensaje:

> Una baja no deja clientes ni operaciones huérfanos. El sistema exige transferir
> el trabajo activo y conserva el historial cerrado con la persona original.

### 4. Mostrar Finanzas — 2 minutos

Abrir **Finanzas**.

1. Señalar la cuenta vencida.
2. Mostrar cobros, pagos y gastos generales en una sola vista.
3. Explicar que alquiler o planilla no necesitan una operación.
4. Mostrar la rentabilidad por operación.
5. Abrir `IMP-2026-0847` desde la tabla de rentabilidad.

Mensaje:

> Los gastos generales afectan el resultado de empresa; los costos directos afectan
> además el margen de la operación a la que pertenecen.

### 5. Mostrar la ficha de operación — 2 minutos

En `IMP-2026-0847`:

1. Mostrar el responsable interno.
2. Explicar que el FOB es el valor de la mercancía y no un ingreso de DMS.
3. Recorrer Documentos y Viajes.
4. Abrir Finanzas y mostrar ingresos, costos, saldo y margen.
5. Usar **+ Movimiento** para enseñar el formulario y cancelarlo.

Mensaje:

> La operación deja de ser solo un expediente logístico: ahora tiene dueño,
> documentos, transporte y resultado económico en una misma ficha.

### 6. Cierre — 1 minuto

> Personal reduce dependencia y falta de responsables. Finanzas reduce fugas de
> facturación y operaciones sin margen visible. Juntos completan el flujo que ya
> demostraba Puerto a Puerta sin convertir el demo en un ERP pesado.

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
5. Recargar la página para reiniciar todos los datos antes de presentar.
6. Mantener el navegador en zoom 90–100 %.
7. Tener este documento abierto como guía.

