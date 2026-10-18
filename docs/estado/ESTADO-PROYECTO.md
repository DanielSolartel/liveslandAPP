# Estado del proyecto LIVE

Actualizado el 17-10-2026, revisión LIVE-FASE02-E01 v1.1 (anteriores: LIVE-FASE02-E01 v1.0 y LIVE-FASE01-E01, 17-10-2026, y encargo LIVE-001-R02, 16-10-2026). Es el punto de entrada para saber qué está vigente, qué es historial y qué falta. El orden de trabajo y el flujo de publicación están en el [plan por fases, v1.2](PLAN-POR-FASES.md). Los cambios de requisitos posteriores a la v0.33 están en el [registro de decisiones del promotor, v1.0](../producto/REGISTRO-DECISIONES.md).

## 1. Etapa actual

- **FASE-01, cierre de investigación documental: cerrada.** El paquete LIVE-FASE01-E01 se auditó y el usuario lo publicó manualmente en el commit `95bc81cb94d28c3b9d03e8696be454898749e5f0` (17-10-2026). Según el encargo LIVE-FASE02-E01, la auditoría y la comprobación en GitHub confirmaron que sus tres archivos son idénticos a los auditados; Claude comprobó además que coinciden byte a byte con el paquete entregado.
- **LIVE-FASE02-E01 v1.0: publicada** en el commit `bc5f14617f68a334cffb4f5dfaf10de4f4f9ced4` (17-10-2026), con base `95bc81c`. ChatGPT comunicó comprobaciones del ZIP de la v1.0, de la aplicación de su parche y de la comparación de los tres blobs publicados; constan como antecedente comunicado. En la sesión que preparó la v1.1, Claude comprobó en su copia de `bc5f146` que esos tres archivos coinciden en tamaño y SHA-256 con los valores comunicados. No se ha localizado en la base un informe formal versionado de auditoría específico de E01 v1.0: no se registra acta, aprobación formal ni dictamen. Las respuestas del promotor a su primer bloque de preguntas se recibieron el 17-10-2026.
- **Fase activa: FASE-02, viabilidad y decisiones del piloto**, centrada en el piloto de directos y su economía. Única revisión activa: **LIVE-FASE02-E01 v1.1**, reconciliación documental y alcance del primer piloto, con el [registro de decisiones](../producto/REGISTRO-DECISIONES.md), la [ficha del promotor, v1.1](../expedientes/LIVE-FASE02-E01-ficha-promotor.md) y el [plan, v1.2](PLAN-POR-FASES.md). Está **preparada y pendiente de auditoría y publicación manual**. FASE-02 no está cerrada.
- **Alcance del primer piloto** ([RD-001](../producto/REGISTRO-DECISIONES.md#rd-001-alcance-del-primer-piloto)): prioridad de las transmisiones en vivo. Los juegos con monedas no son obligatorios para el piloto inicial y quedan para una etapa posterior. FASE-09 queda diferida, sin fecha ni activación autorizada. El alcance funcional concreto de las demás funciones confirmadas sigue por delimitar.
- **Investigación documental consolidada** en [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md), síntesis de FASE-01, que sigue **provisional** en las materias jurídicas y contractuales. Sus pendientes no están resueltos ni hay aceptación de proveedores: se tratan en FASE-02. La v1.2 estudió el circuito completo de la v0.33, con casino; **no evaluó ni aprobó el piloto de directos sin juegos**.
- **LIVE-002 sigue pausado** para FASE-03. LIVE-005 y LIVE-006 no se ejecutan ni se envían en esta entrega; sus borradores se conservan, **preparados y no enviados**. No ha habido contacto con terceros.
- La aplicación **no está implementada**: no hay código, infraestructura, cuentas de pago ni publicación web.
- «LIVE» es un identificador provisional, no el nombre comercial.

## 2. Requisito base y origen

| Documento | Versión y fecha | Origen | SHA-256 |
| --- | --- | --- | --- |
| [Definición del proyecto](../producto/proyecto-live-definicion-v0.33.md) | v0.33, 09-10-2026 | Copia byte a byte del archivo subido a la sesión de Claude Code el 10-10-2026 (`0b0f0522-proyecto-live-definicion-v0.33.md`) | `163c247e8fbfd32d608c7e5bc650c1c8d27a313b4aa416cc3d135c17c3ded569` |

**Base histórica y requisitos vigentes.** La v0.33 es la base original de requisitos y se conserva sin cambios como referencia histórica. **Sus decisiones siguen vigentes**, salvo los cambios explícitos del [registro de decisiones](../producto/REGISTRO-DECISIONES.md) (RD-001 a RD-005), que prevalece solo en ellos. Los informes de investigación no la modifican. Según la propia v0.33 (§5), los requisitos cambian mediante un registro de decisiones del promotor, no mediante ediciones implícitas. Donde la v0.33 menciona un «techo mensual de US$3.000» (sexta ronda y v0.7) es registro histórico: la v0.11 lo convirtió en referencia. Sus menciones del casino como imprescindible en el lanzamiento son también históricas en lo que respecta al primer piloto ([registro, §4](../producto/REGISTRO-DECISIONES.md#4-menciones-de-la-v033-afectadas-por-rd-001)).

## 3. Resultados y síntesis vigente

| Documento | Papel | Estado |
| --- | --- | --- |
| [Registro de decisiones](../producto/REGISTRO-DECISIONES.md) | Cambios explícitos de requisitos posteriores a la v0.33 (RD-001 a RD-005) | v1.0 (E01 v1.1); preparado, pendiente de auditoría y publicación manual |
| [Plan por fases](PLAN-POR-FASES.md) | Fases, reglas de secuencia y flujo de entrega con publicación manual | v1.2 (E01 v1.1), preparada; v1.1 publicada en `bc5f146`; v1.0, en `95bc81c` |
| [Ficha del promotor](../expedientes/LIVE-FASE02-E01-ficha-promotor.md) | Datos confirmados, pendientes por ámbito, primer bloque de tres preguntas y respuestas recibidas | v1.1, preparada; pendiente de auditoría y publicación manual. v1.0 publicada en `bc5f146` |
| [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md) | **Síntesis vigente** de conclusiones, evidencia, cálculos y pendientes; síntesis de FASE-01 | Consolidada; provisional en lo jurídico y contractual. No evaluó el piloto de directos sin juegos |
| [Registro R02](../investigacion/LIVE-001-R02-registro-correcciones.md) | Correcciones v1.1 → v1.2, procedencia y accesos de R02 | Vigente |
| [Borrador LIVE-005 y LIVE-006](../expedientes/LIVE-005-006-borrador.md) | Circuito, preguntas, evidencia por adjuntar y datos que faltan | Preparado, no enviado; entrada de FASE-02. Sus preguntas exclusivas de los juegos quedan diferidas (§7) |
| [Borrador de alcance de LIVE-002](../expedientes/LIVE-002-alcance-borrador.md) | Prueba técnica móvil sin dinero real | Preparado, no ejecutado; pausado, entrada de FASE-03 |
| [LIVE-001-resultado-v1.1](../investigacion/LIVE-001-resultado-v1.1.md) | Verificación R01: auditoría detallada, matrices y fuentes | Histórico |
| [Registro R01](../investigacion/LIVE-001-R01-registro-correcciones.md) | Correcciones v1.0 → v1.1. Superado por R02 en Stripe, Payoneer, Mastercard, la carga humana (guardia), el decreto de edad, la grabación y el casino | Histórico |
| [LIVE-001-resultado-v1.0](../investigacion/LIVE-001-resultado-v1.0.md) | Informe inicial de viabilidad | Histórico |

**Límite de la evidencia.** Claude no ha leído íntegro ningún documento externo. La evidencia externa de la v1.2 tiene tres orígenes:

- extractos de buscador obtenidos en R01 (10-10-2026);
- fuentes de la v1.0 no reverificadas, citadas solo como antecedente (por ejemplo, F40 o los extractos de Bold y Wise);
- la auditoría de ChatGPT descrita en el encargo R02, pendiente de cotejo propio y sin fecha de consulta consignada.

Los datos de esa auditoría parafrasean estas líneas del encargo R02:

- comprobaciones de GitHub: líneas 14–23;
- Stripe: 43–45;
- Payoneer: 53;
- Mastercard: 61–65;
- MinTIC: 71–73;
- Cloudflare: 81–82 y 87;
- Acuerdo 01/2026: 112;
- cálculos reproducidos: 140–151.

## 4. Decisiones del promotor: base v0.33 y registro vigente

Resumen de la v0.33, §1, tabla «Respuestas confirmadas» y párrafo de la v0.24, con los cambios explícitos del [registro de decisiones](../producto/REGISTRO-DECISIONES.md). Donde el registro cambia la v0.33, la fila separa lo **vigente** de lo **histórico**. La columna de viabilidad remite a la [v1.2, §2](../investigacion/LIVE-001-resultado-v1.2.md#2-conclusiones-por-requisito-decisivo) y **no modifica la decisión**.

| Tema | Decisión confirmada | Viabilidad según la v1.2 |
| --- | --- | --- |
| Alcance del primer piloto | **Vigente (RD-001):** prioridad de las transmisiones en vivo; los juegos con monedas no son obligatorios para el piloto inicial y quedan para una etapa posterior. El alcance funcional concreto de las demás funciones sigue por delimitar | No evaluado: la v1.2 estudió el circuito con casino |
| Mercado y canal | Colombia como primer mercado de recargas y retiros. Web primero; app compatible con las tiendas después, sin equivalencia presupuesta con la web. La empresa aún no existe. Preferencia inicial para constituirla: Colombia, abierta a alternativas justificadas; país y forma societaria sin decidir definitivamente (RD-004, preferencia) | App posterior: alcance por definir; replicar en tiendas el contenido explícito no es posible (límite documentado) |
| Contenido | Se admiten desnudos y contenido sexual explícito | Evidencia insuficiente: normas de contenido no reverificadas (Q15) |
| Edad | Los espectadores verifican su mayoría de edad durante el registro, antes de usar la plataforma. No basta una declaración. Método y proveedor sin elegir | Evidencia insuficiente, sin incompatibilidad identificada |
| Casino y juegos con monedas | **Vigente (RD-001, RD-002):** no obligatorios para el primer piloto; se conservan como idea para una etapa posterior (FASE-09, diferida). Podrían inspirarse en BuzzCast y desarrollarse por nosotros. Reglas, implementación, arquitectura y clasificación jurídica pendientes, sin presumir exención por usar monedas o desarrollo propio. **Histórico (v0.33):** imprescindible desde el lanzamiento con usuarios reales. Sin decisión nueva: dados y juegos rápidos, tragamonedas y ruleta, con anfitrión social o sin él | Tragamonedas, ruleta y premio inmediato: ruta condicionada (concesión o socio; retiro del jugador si el modelo queda clasificado en el régimen, conclusión provisional). Dados, «desde el lanzamiento» y casino dentro del sitio de LIVE en la ruta B: evidencia insuficiente |
| Territorio de los jugadores de los futuros juegos | **Sin definir** (RD-003, dato pendiente); sustituye la respuesta anterior «solo Colombia». No se extiende a creadores, anfitriones ni espectadores | Admisibilidad pendiente (Q2, Q20); diferido con los juegos |
| Ganancias del jugador | Uso interno sin retiro a su banco: nuevas apuestas, regalos, intervalos, publicaciones y suscripciones. Requisito de los juegos, diferido con ellos; no se renuncia a él | Sin retiro: **incompatibilidad documentada provisional** en el régimen estudiado, si el modelo queda clasificado en él (clasificación pendiente, Q2). Uso en regalos o contenido: evidencia insuficiente |
| Anfitrión | Papel social; el juego funciona automáticamente. Remuneración deseada: porcentaje de lo apostado, con fórmula pendiente (visión del promotor, no decisión cerrada). Diferido con los juegos | No reverificado |
| Monedas y pagos | Recargas de dinero para monedas. Suscripciones y publicaciones solo con saldo interno. Aportes directos en dinero por un pago independiente | Monedas en el casino y pagos: evidencia insuficiente |
| Creadores | Creadores del piloto: alta por invitación y revisión previa; residentes en Colombia, EE. UU., España y Venezuela. Solicitudes diarias de retiro con saldo mínimo por definir | Pagos: evidencia insuficiente. Retiros diarios y residencias: no reverificados |
| Directos y salas | Un creador por transmisión. Contador individual con pausas. 1 minuto para reconectar. Devoluciones proporcionales en monedas al cerrar, con financiación compartida. Devolución al expulsar salvo infracción comprobada. Grabación opcional activada por el creador y publicable en su perfil | Grabación del creador: evidencia insuficiente. Reglas de consumo: no reverificadas |
| Multistream | BuzzCast, TikTok Live y Bigo Live. En el piloto, desde un solo celular, sin computador, con consulta de chat y regalos. Al pasar a sala exclusiva se finalizan las emisiones externas | Conjunto: evidencia insuficiente. Cierre de emisiones y captura en Android: ruta condicionada (pruebas en FASE-03) |
| Piloto | Hasta 5 creadores y 50 espectadores simultáneos en total dentro de la plataforma, no por sala. Más de 8 h diarias con al menos un directo | Infraestructura: ruta condicionada |
| Administración | Durante el piloto, solo el usuario del proyecto administra y revisa reportes. Tickets y chat de soporte; atención humana según su disponibilidad, sin horario fijo. Cada creador y sus moderadores designados moderan su sala, además de la supervisión general de la plataforma | Administración única: evidencia insuficiente |
| Promoción | Tareas físicas con QR en Bogotá y Medellín; pago base más bono por captación, en dinero o monedas, a elección del participante. Monedas publicitarias usables en regalos, casino, intervalos, publicaciones y suscripciones; el uso en los juegos se difiere con ellos. Cartel con video en vivo continuo | Remuneración y monedas en regalos y acceso: evidencia insuficiente (Q22). Monedas en el casino: evidencia insuficiente (Q6) |
| Presupuesto | US$3.000 mensuales aparte de Claude como referencia anterior, no como límite de diseño. Capital inicial sin definir. Importe para asesoría: sin definir, que no equivale a cero (RD-005, dato pendiente) | — |

Perfiles, mensajes privados, descubrimiento, notificaciones, intervalos y renovaciones: ver la v0.33, §1.

## 5. Documentos originales

| Documento | Ubicación en el repositorio | Origen (adjunto de la sesión) | SHA-256 |
| --- | --- | --- | --- |
| Definición v0.33 | [docs/producto/proyecto-live-definicion-v0.33.md](../producto/proyecto-live-definicion-v0.33.md) | `0b0f0522-proyecto-live-definicion-v0.33.md`, subido el 10-10-2026 | `163c247e…c3ded569` ([SHA256SUMS](../producto/SHA256SUMS)) |
| Encargo LIVE-001 v1.0 | [docs/encargos/LIVE-001-investigacion-viabilidad-v1.0.md](../encargos/LIVE-001-investigacion-viabilidad-v1.0.md) | `b9623da8-LIVE-001-investigacion-viabilidad-v1.0.md`, subido el 10-10-2026. Su texto coincide con el de la v0.33, §7 | `2de412a6…1baa8d97` |
| Encargo LIVE-001-R01 v1.0 | [docs/encargos/LIVE-001-R01-verificacion-informe-v1.0.md](../encargos/LIVE-001-R01-verificacion-informe-v1.0.md) | `f9e33d2a-LIVE-001-R01-verificacion-informe-v1.0.md`, subido el 10-10-2026 | `bc3f70dc…cada41c4` |
| Encargo LIVE-001-R02 v1.0 | [docs/encargos/LIVE-001-R02-cierre-documental-v1.0.md](../encargos/LIVE-001-R02-cierre-documental-v1.0.md) | `18c628f3-LIVE-001-R02-cierre-documental-v1.0.md`, fechado el 10-10-2026 y subido el 16-10-2026 | `15054aac…e8090183` |

Las sumas completas están en el `SHA256SUMS` de cada carpeta ([encargos](../encargos/SHA256SUMS)). Las copias se comprobaron con `cmp` contra los archivos subidos. La v0.33 enlaza el encargo LIVE-001 a una ruta `sandbox:` que no es accesible; la copia de `docs/encargos/` es el mismo texto.

**Originales ausentes:**

- Versiones v0.1 a v0.32 de la definición. Solo constan en el registro de cambios de la v0.33 (§11).
- Encargos LIVE-002, LIVE-003 y LIVE-004 como archivos independientes. Solo existen como borradores sin número de versión dentro de la v0.33 (§8 a §10), sujetos al resultado de LIVE-001. Para LIVE-002 hay además el [borrador de alcance](../expedientes/LIVE-002-alcance-borrador.md), preparado y no ejecutado, que no sustituye al de la v0.33, §8.
- Encargos LIVE-005, LIVE-006 y LIVE-007. No existen: fueron propuestos en la v1.0 (§11). Para LIVE-005 y LIVE-006 solo hay el borrador de expedientes.
- Texto completo de la auditoría de ChatGPT y de su revisión preliminar de R01. Solo se conoce su resumen dentro de los encargos R01 y R02.

## 6. Propuestas no aprobadas por el promotor

**Ninguna está elegida** y no deben usarse como base de diseño. **Aplazar los juegos con monedas** ya no es una propuesta: el promotor lo decidió para el primer piloto ([RD-001](../producto/REGISTRO-DECISIONES.md#rd-001-alcance-del-primer-piloto)). Siguen **sin decidir** convertirlos en juegos sociales, sustituir sus monedas económicas por puntos ficticios o cambiar los usos de monedas y ganancias.

**De la propia v0.33** (propuestas para la versión adulta y las campañas):

- acceso exclusivo de mayores de 18 años en todos los roles;
- verificación de creadores y de las personas que aparezcan;
- consentimiento documentado;
- reportes y moderación con capacidad de interrumpir directos (la revisión de reportes por el usuario del proyecto sí está confirmada);
- participación adulta en las campañas.

**De los informes v1.0 y v1.1:**

- separar el casino en otro dominio de saldos;
- permitir retiros al jugador;
- impedir que las ganancias se usen en regalos o contenido, o diseñar sin ese uso hasta tener dictamen;
- monedas segregadas sin uso en el casino;
- remuneración de campaña solo en dinero o en monedas sin uso en el casino;
- bono del concesionario para monedas publicitarias (hipótesis evaluada);
- limitar los usos de las monedas promocionales (cuentas vinculadas, topes);
- hacer el casino social (posponerlo dejó de ser una propuesta: es la decisión RD-001);
- multistream solo de video, sin chat ni regalos integrados, o por fases;
- APK fuera de tienda o entrada RTMP desde una app;
- limitar horas de directo o concurrencia;
- moderación automatizada con escalado y guardia (7a) o vigilancia externa por turnos (7b);
- aplazar a los creadores residentes en Venezuela;
- anfitriones de casino solo residentes en Colombia;
- remunerar al anfitrión de otra forma;
- separar marca, dominio o sociedad entre contenido adulto y juego;
- limitar el mercado de espectadores a Colombia con bloqueo geográfico;
- app de tienda como otro producto;
- material de campaña neutro;
- indicador manual de disponibilidad del soporte;
- fórmula de reparto de la financiación de devoluciones.

La arquitectura de saldos debe conservar el uso de ganancias que pidió el promotor como requisito pendiente de viabilidad, para la etapa de los juegos.

## 7. Pendientes de FASE-02

Siguen abiertos; FASE-01 no los resolvió. Detalle y orden en la [v1.2, §5](../investigacion/LIVE-001-resultado-v1.2.md#5-pendientes-priorizados). Cada pendiente indica su ámbito: **[piloto]**, piloto de directos y su economía; **[juegos, diferido]**, exclusivo de los juegos con monedas, diferido con FASE-09 (RD-001) y sin borrarse. Esta clasificación es una propuesta de trabajo de Claude en esta revisión, sujeta a la delimitación del circuito del piloto.

1. **[Juegos, diferido]** Texto y vigencia de las reglas de retiro y bonos: cotejo con el Diario Oficial y anexo del Acuerdo 01/2026.
2. Clasificación jurídica del circuito completo de la v0.33. **[Piloto]**: la del circuito del piloto de directos, cuando se delimite; esta revisión no la presupone. **[Juegos, diferido]**: la del casino en las rutas A y B, incluido el retiro del jugador.
3. **[Piloto]** Aceptación de proveedores de pago para cada tramo del piloto. Las actividades que se declaren dependerán del circuito delimitado.
4. **[Piloto]** Condiciones del adquirente sobre moderación y horas que quiera declarar el promotor (P5).
5. **[Piloto]** Método y proveedor de verificación de edad.
6. **[Piloto]** Egress de video, aceptación del contenido y decisión sobre la grabación técnica del proveedor, que sería consecuencia de usar Cloudflare con HLS/DASH (no es una propuesta de los informes).
7. **[Juegos, diferido]** Capital, impuestos y garantías de una concesión propia, que siguen provisionales. **[Piloto]**: el capital del proyecto (P2) y el importe para asesoría (RD-005) siguen sin definir.
8. Cotejo propio de las fuentes leídas por ChatGPT: **[piloto]** en lo que afecte a su circuito; el resto, **[juegos, diferido]**. Requiere ampliar el acceso de red del entorno.

Preguntas y datos del [borrador de expedientes](../expedientes/LIVE-005-006-borrador.md) por ámbito, con la misma clasificación de trabajo:

- **Piloto de directos:** Q2 (a) aplicada al circuito del piloto; Q9 a Q19; Q20 en lo relativo a pagos a creadores residentes en Venezuela; Q21 y Q22; P2 (capital), P5, P6, volúmenes y grabación técnica. Q17 y Q22 dependen además del alcance de las campañas en el piloto, por delimitar. Las preguntas que mencionan el casino como actividad declarada o como contexto (por ejemplo, Q11-S, Q14 (d) y Q22) se ajustarán al delimitar el circuito; el borrador no se modifica en esta revisión.
- **Juegos, diferidos:** Q1; Q2 (b) y (c); Q3 a Q8; Q20 en lo relativo al territorio de los jugadores; P2 (cotización de la ruta B), P7 y P8; territorio de los jugadores (RD-003) y regla de retiro del jugador.

Las pruebas técnicas del punto 6 corresponden a FASE-03. Los datos que piden los borradores (país de constitución, capital, franjas de atención y cambios de monedas) son datos y decisiones de FASE-02. La [ficha del promotor, v1.1](../expedientes/LIVE-FASE02-E01-ficha-promotor.md) registra las respuestas recibidas, los ordena por ámbito y separa lo que depende de profesionales o proveedores.

## 8. Siguiente paso

Se sigue el [plan por fases](PLAN-POR-FASES.md): una fase activa y una entrega activa.

1. **Auditar y publicar LIVE-FASE02-E01 v1.1.** ChatGPT audita el paquete de la v1.1; el usuario lo aplica, hace commit y push, y se verifica el SHA publicado. Hasta entonces, la v1.1 no está publicada.
2. **Siguiente entrega de FASE-02, solo con un encargo explícito del usuario.** Delimitaría el circuito del piloto de directos y sus validaciones concretas ([ficha, §4](../expedientes/LIVE-FASE02-E01-ficha-promotor.md#4-paso-posterior-propuesto)). No está preparada ni lista para envío. FASE-02 requiere respuestas concretas, dictámenes, condiciones y decisiones, no otra ronda de informes. Las preguntas siguen en el [borrador de expedientes LIVE-005 y LIVE-006](../expedientes/LIVE-005-006-borrador.md); las exclusivas de los juegos, diferidas.
3. **LIVE-002 sigue pausado** hasta FASE-03. Su [borrador de alcance](../expedientes/LIVE-002-alcance-borrador.md) se conserva sin cambios.

Enviar consultas o contactar a terceros requiere el encargo de la fase correspondiente.

## 9. Repositorio

- **Ramas.** Rama histórica de publicación: `claude/new-session-tzsjwj`. Según el encargo R02, también es la rama predeterminada. Los commits `95bc81c` (LIVE-FASE01-E01) y `bc5f146` (LIVE-FASE02-E01 v1.0) forman parte de ella. La v1.1 se preparó en una sesión de Claude con la rama local `claude/sweet-archimedes-tmwqr7`, situada en `bc5f146`. No se presupone que esa rama exista en GitHub. No se cambian ahora la rama predeterminada, el nombre de rama, los permisos de GitHub, los correos ni la identidad Git.
- **Publicación manual.** Desde LIVE-FASE01-E01, Claude entrega un parche y un paquete para auditoría; el usuario aplica, hace commit y push. Claude no hace commit, push ni modificaciones remotas ([plan, §3](PLAN-POR-FASES.md#3-flujo-de-entrega-y-publicación)). Las entregas anteriores, hasta `7184f7c`, se publicaron desde la sesión de Claude con las instrucciones vigentes entonces; ese historial no se reescribe. LIVE-FASE01-E01 se publicó manualmente en `95bc81c`. LIVE-FASE02-E01 v1.0 está publicada en `bc5f146`, commit con la autoría del usuario.
- Carpetas: producto en `docs/producto/` (definición v0.33 y registro de decisiones), encargos en `docs/encargos/`, investigación en `docs/investigacion/`, expedientes en `docs/expedientes/` y estado en `docs/estado/`.
