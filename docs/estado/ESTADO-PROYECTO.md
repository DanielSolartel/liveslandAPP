# Estado del proyecto LIVE

Actualizado el 18-10-2026, entrega LIVE-FASE03-E01 v1.2, que corrige la v1.0 y la v1.1 tras las revisiones R01 y R02 (anteriores: LIVE-FASE02-E04 v1.1, LIVE-FASE02-E03 v1.0 y LIVE-FASE02-E02 v1.1, publicadas el 18-10-2026; LIVE-FASE02-E01 v1.1, preparada el 17-10-2026 y publicada el 18-10-2026; LIVE-FASE02-E01 v1.0 y LIVE-FASE01-E01, 17-10-2026; encargo LIVE-001-R02, 16-10-2026). Es el punto de entrada para saber qué está vigente, qué es historial y qué falta. El orden de trabajo y el flujo de publicación están en el [plan por fases, v1.6](PLAN-POR-FASES.md). Los cambios de requisitos posteriores a la v0.33 están en el [registro de decisiones del promotor, v1.2](../producto/REGISTRO-DECISIONES.md).

## 1. Etapa actual

- **FASE-01, cierre de investigación documental: cerrada.** El paquete LIVE-FASE01-E01 se auditó y el usuario lo publicó manualmente en el commit `95bc81cb94d28c3b9d03e8696be454898749e5f0` (17-10-2026). Según el encargo LIVE-FASE02-E01, la auditoría y la comprobación en GitHub confirmaron que sus tres archivos son idénticos a los auditados; Claude comprobó además que coinciden byte a byte con el paquete entregado.
- **LIVE-FASE02-E01 v1.0: publicada** en el commit `bc5f14617f68a334cffb4f5dfaf10de4f4f9ced4` (17-10-2026), con base `95bc81c`. ChatGPT comunicó comprobaciones del ZIP de la v1.0, de la aplicación de su parche y de la comparación de los tres blobs publicados; constan como antecedente comunicado. En la sesión que preparó la v1.1, Claude comprobó en su copia de `bc5f146` que esos tres archivos coinciden en tamaño y SHA-256 con los valores comunicados. No se ha localizado en la base un informe formal versionado de auditoría específico de E01 v1.0: no se registra acta, aprobación formal ni dictamen. Las respuestas del promotor a su primer bloque de preguntas se recibieron el 17-10-2026.
- **LIVE-FASE02-E01 v1.1: cerrada y publicada** en el commit `65378a49c17453aa768ca871819abe6748a03908` (18-10-2026), con base `bc5f146` y la autoría del usuario. Comprende el [registro de decisiones v1.0](../producto/REGISTRO-DECISIONES.md), la [ficha del promotor v1.1](../expedientes/LIVE-FASE02-E01-ficha-promotor.md), el plan v1.2 y la versión anterior de este estado. Según el encargo de E02, ChatGPT la auditó, contrastó los cuatro blobs publicados con los auditados y comprobó que los otros quince archivos permanecieron intactos: consta como antecedente comunicado. Claude comprobó por su parte que `65378a4` tiene como único padre `bc5f146`, que solo cambia esas cuatro rutas y que sus cuatro blobs coinciden en tamaño y SHA-256 con las copias que preparó. No hay un informe formal independiente ni una aprobación jurídica.
- **LIVE-FASE02-E02 v1.1: publicada** en el commit `14926d2575acf492afdbfb60a8777eabfa077fcd` (18-10-2026), con padre `65378a4` y la autoría del usuario. Su encargo de preparación de la propuesta está terminado; sus pendientes reales siguen abiertos (§7). Según el encargo de E03, ChatGPT la auditó y comprobó sus cuatro blobs, la conservación de los otros dieciséis archivos, el padre, la rama de publicación y la autoría asociada a DanielSolartel: consta como antecedente comunicado. Claude comprobó por su parte que `14926d2` tiene como único padre `65378a4`, que solo cambia esas cuatro rutas, que sus blobs coinciden en tamaño y SHA-256 con las copias de E02 v1.1 y que el commit tiene la autoría del usuario. No hay un informe formal independiente ni una aprobación jurídica. La v1.0 de E02 no se publicó.
- **LIVE-FASE02-E03 v1.0: cerrada y publicada** en el commit `8128802bbeca0349755776a0383e79853ff8c4b8` (18-10-2026), con padre `14926d2` y la autoría del usuario. Comprende el registro de decisiones v1.1 (RD-006 a RD-010), el plan v1.4, la versión anterior de este estado y el README. Según el encargo de E04, ChatGPT la auditó, comprobó que sus cuatro archivos coinciden con los auditados y que los otros dieciséis permanecieron intactos, y que la autoría de GitHub está asociada a DanielSolartel: consta como antecedente comunicado. Claude comprobó por su parte que `8128802` tiene como único padre `14926d2`, que solo cambia esas cuatro rutas, que sus blobs coinciden en tamaño y SHA-256 con las copias de E03 v1.0 y que el commit tiene la autoría del usuario. No hay un acta de auditoría en el repositorio ni una aprobación jurídica.
- **LIVE-FASE02-E04 v1.1: cerrada y publicada** en el commit `4cd3ce453f2bdb8ba34f763e5c87836d4187a683` (18-10-2026), con padre `8128802` y la autoría del usuario. Comprende el [expediente de validaciones del piloto](../expedientes/LIVE-FASE02-E04-validaciones-piloto.md), el plan v1.5 y la versión anterior de este estado. La v1.0 de E04 no se publicó. Según el encargo de FASE03-E01, ChatGPT auditó la v1.1 y comprobó su publicación, sus tres blobs idénticos a los auditados, los otros dieciocho archivos intactos y la autoría asociada a DanielSolartel: consta como antecedente comunicado. Claude comprobó por su parte que `4cd3ce4` tiene como único padre `8128802`, que solo cambia esas tres rutas, que sus blobs coinciden en tamaño y SHA-256 con las copias de E04 v1.1 y que el commit tiene la autoría del usuario. Sus borradores siguen sin enviar y sin autorización de envío.
- **Documentos anteriores.** La ficha E01 conserva en su cabecera el estado de preparación del momento de su entrega; su publicación consta aquí. La propuesta E02 v1.1 también conserva el suyo: está publicada y se mantiene sin editar como **propuesta histórica**. Las decisiones vigentes se leen en el [registro](../producto/REGISTRO-DECISIONES.md) y en este estado; E02 no se convierte retrospectivamente en alcance aprobado. El registro v1.1 y el plan v1.4 se publicaron con E03 en `8128802`; la cabecera del registro conserva el estado de preparación de esa entrega, que aquí consta como publicada. El expediente E04 también conserva en su cabecera el estado de sus borradores: está publicado en `4cd3ce4`.
- **Fase activa: FASE-03, prueba técnica móvil.** Única entrega activa: **LIVE-FASE03-E01 v1.2**, primer directo técnico ejecutable: el [experimento `experimentos/directo-movil/`](../../experimentos/directo-movil/README.md), con los ajustes de secuencia del plan v1.6, el registro v1.2, este estado, `CLAUDE.md` y el README. ChatGPT revisó la v1.0, que no se publicó. Según el encargo R01, su auditoría mecánica fue conforme y en su entorno se superaron los tipos y las 26 pruebas unitarias, pero Chromium no arrancó allí. Con dobles controlados en Node reprodujo dos fallos del cliente, R01-01 y R01-02, y detectó un tercero en las pruebas, R01-03. La v1.1 los corrige:
  - R01-01: finalizar o salir libera los medios y cierra las conexiones sin esperar a la red, y el aviso al servidor tiene un límite de 3 s;
  - R01-02: las capturas y tareas pendientes de una sesión anterior se descartan;
  - R01-03: la batería del navegador termina sola si este no arranca.

  ChatGPT revisó después la v1.1, que tampoco se publicó. Según el encargo R02, confirmó R01-01 y R01-02 con dobles controlados y el cierre de recursos de R01-03. Con Node 24.19.0, la prueba automática de R01-03 fallaba porque el proceso hijo usaba otro formato de salida (R02-01). La v1.2 fija el formato TAP en ese proceso; el código del cliente y del servidor no cambia.

  Está **preparada y pendiente de auditoría y publicación manual**. Cubre solo una parte de FASE-03: la emisión interna de un emisor a un espectador, verificada en Cloud con medios sintéticos y, para la lógica del cliente, con dobles controlados. La prueba física en Android sigue pendiente.
- **FASE-02 en espera de validaciones externas, no cerrada.** Sus pendientes y su criterio de cierre se conservan, y no hay viabilidad aprobada. Por la excepción del [plan, v1.6](PLAN-POR-FASES.md), sus validaciones no impiden la prueba técnica con contenido neutral y sin dinero real, pero deben resolverse para habilitar la operación real del piloto. Los borradores de E04 siguen sin enviar, sin autorización de envío y sin respuestas de terceros.
- **Respuestas del promotor del 18-10-2026**, de su conversación con ChatGPT, transmitidas por el encargo de FASE03-E01:
  - Espectadores: objetivo de acceso internacional sujeto a las restricciones que se validen ([RD-011](../producto/REGISTRO-DECISIONES.md#rd-011-acceso-internacional-de-los-espectadores)). No es cobertura aprobada.
  - Remitente de futuras consultas: el promotor como persona natural. No autoriza ningún envío ni cambia quién operaría la futura empresa.
  - Disponibilidad: sin horario fijo. Las horas semanales siguen sin definir y no se supone guardia continua.
  - Pidió empezar pronto el desarrollo. La excepción de secuencia la autoriza el encargo, sin atribuirle al promotor afirmaciones jurídicas ni elecciones técnicas.
- **Alcance del primer piloto** ([RD-001](../producto/REGISTRO-DECISIONES.md#rd-001-alcance-del-primer-piloto) y RD-006 a RD-010): prioridad de las transmisiones en vivo. Incluye el contenido exclusivo del perfil ([RD-007](../producto/REGISTRO-DECISIONES.md#rd-007-contenido-exclusivo-del-perfil)) y los controles adoptados ([RD-010](../producto/REGISTRO-DECISIONES.md#rd-010-controles-del-piloto)). Quedan para después del primer piloto los juegos con monedas (RD-001), los aportes directos ([RD-006](../producto/REGISTRO-DECISIONES.md#rd-006-aportes-directos-en-dinero)), las campañas QR remuneradas ([RD-008](../producto/REGISTRO-DECISIONES.md#rd-008-campañas-qr-remuneradas)) y «Cercanos» ([RD-009](../producto/REGISTRO-DECISIONES.md#rd-009-cercanos)). FASE-09 y FASE-10 quedan diferidas, sin fecha ni activación autorizada. El alcance funcional no está íntegramente cerrado: las demás recomendaciones de E02 siguen sin elegir.
- **Investigación documental consolidada** en [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md), síntesis de FASE-01, que sigue **provisional** en las materias jurídicas y contractuales. Sus pendientes no están resueltos ni hay aceptación de proveedores: se tratan en FASE-02. La v1.2 estudió el circuito completo de la v0.33, con casino; **no evaluó ni aprobó el piloto de directos sin juegos**.
- **LIVE-002:** su [borrador de alcance](../expedientes/LIVE-002-alcance-borrador.md) es la entrada de FASE-03. LIVE-FASE03-E01 no lo ejecuta entero: siguen pendientes el multistream hacia BuzzCast, TikTok Live y Bigo Live, el chat y los regalos externos, las sesiones largas, la reconexión, el paso a exclusivo sin tramas externas, la grabación, el cartel y la detección y el corte. La viabilidad del multistream sigue incierta. LIVE-005 y LIVE-006 no se ejecutan ni se envían; sus borradores se conservan, **preparados y no enviados**. No ha habido contacto con terceros.
- La aplicación de producción **no está implementada**: no hay infraestructura, cuentas de pago ni publicación web. Existe un **experimento técnico** local ([directo-movil](../../experimentos/directo-movil/README.md)), que no es la arquitectura de producción.
- «LIVE» es un identificador provisional, no el nombre comercial.

## 2. Requisito base y origen

| Documento | Versión y fecha | Origen | SHA-256 |
| --- | --- | --- | --- |
| [Definición del proyecto](../producto/proyecto-live-definicion-v0.33.md) | v0.33, 09-10-2026 | Copia byte a byte del archivo subido a la sesión de Claude Code el 10-10-2026 (`0b0f0522-proyecto-live-definicion-v0.33.md`) | `163c247e8fbfd32d608c7e5bc650c1c8d27a313b4aa416cc3d135c17c3ded569` |

**Base histórica y requisitos vigentes.** La v0.33 es la base original de requisitos y se conserva sin cambios como referencia histórica. **Sus decisiones siguen vigentes**, salvo los cambios explícitos del [registro de decisiones](../producto/REGISTRO-DECISIONES.md) (RD-001 a RD-011), que prevalece solo en ellos. Los informes de investigación no la modifican. Según la propia v0.33 (§5), los requisitos cambian mediante un registro de decisiones del promotor, no mediante ediciones implícitas. Donde la v0.33 menciona un «techo mensual de US$3.000» (sexta ronda y v0.7) es registro histórico: la v0.11 lo convirtió en referencia. Sus menciones del casino como imprescindible en el lanzamiento son también históricas en lo que respecta al primer piloto ([registro, §4](../producto/REGISTRO-DECISIONES.md#4-menciones-de-la-v033-afectadas-por-rd-001)).

## 3. Resultados y síntesis vigente

| Documento | Papel | Estado |
| --- | --- | --- |
| [Registro de decisiones](../producto/REGISTRO-DECISIONES.md) | Cambios explícitos de requisitos posteriores a la v0.33 (RD-001 a RD-011) | v1.2 (FASE03-E01), preparado: añade RD-011. v1.1 (RD-006 a RD-010), publicado en `8128802`; v1.0 (RD-001 a RD-005), en `65378a4` |
| [Plan por fases](PLAN-POR-FASES.md) | Fases, reglas de secuencia y flujo de entrega con publicación manual | v1.6 (FASE03-E01), preparada; v1.5 publicada en `4cd3ce4`; v1.4, en `8128802`; v1.3, en `14926d2`; v1.2, en `65378a4`; v1.1, en `bc5f146`; v1.0, en `95bc81c` |
| [Ficha del promotor](../expedientes/LIVE-FASE02-E01-ficha-promotor.md) | Datos confirmados, pendientes por ámbito, primer bloque de tres preguntas y respuestas recibidas | v1.1, publicada en `65378a4`; E01 cerrada. v1.0, en `bc5f146`. Su cabecera conserva el estado de preparación |
| [Propuesta de alcance del piloto (E02)](../expedientes/LIVE-FASE02-E02-alcance-piloto.md) | Propuesta histórica: matriz de alcance, circuito económico, validaciones y preguntas al promotor | v1.1, publicada en `14926d2`; se conserva sin editar. Las respuestas A1, B2, C1, D1 y E1 constan en el registro (RD-006 a RD-010). El resto de sus recomendaciones no está elegido |
| [Validaciones del piloto (E04)](../expedientes/LIVE-FASE02-E04-validaciones-piloto.md) | Descripción común, matriz de consultas, borradores para asesoría jurídica y para proveedores, datos faltantes y orden de respuesta | v1.1, publicada en `4cd3ce4`; E04 cerrada. Borradores no enviados ni autorizados para envío. Su cabecera conserva el estado de preparación |
| [Experimento directo-movil](../../experimentos/directo-movil/README.md) | Emisión interna de un emisor a un espectador por WebRTC, con señalización local; pruebas y procedimiento para Android | v1.2 (FASE03-E01), preparado: corrige la v1.0 y la v1.1, no publicadas, tras las revisiones R01 y R02. Pendiente de auditoría y publicación. No es la aplicación de producción |
| [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md) | **Síntesis vigente** de conclusiones, evidencia, cálculos y pendientes; síntesis de FASE-01 | Consolidada; provisional en lo jurídico y contractual. No evaluó el piloto de directos sin juegos |
| [Registro R02](../investigacion/LIVE-001-R02-registro-correcciones.md) | Correcciones v1.1 → v1.2, procedencia y accesos de R02 | Vigente |
| [Borrador LIVE-005 y LIVE-006](../expedientes/LIVE-005-006-borrador.md) | Circuito, preguntas, evidencia por adjuntar y datos que faltan | Preparado, no enviado; entrada de FASE-02. Sus preguntas exclusivas de los juegos quedan diferidas (§7). E02 propuso cuáles aplican al piloto y E04 las adapta en borradores, sin modificarlo |
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

Resumen de la v0.33, §1, tabla «Respuestas confirmadas» y párrafo de la v0.24, con los cambios explícitos del [registro de decisiones](../producto/REGISTRO-DECISIONES.md). Donde el registro cambia la v0.33, la fila separa lo **vigente** de lo **histórico**. La columna de viabilidad remite a la [v1.2, §2](../investigacion/LIVE-001-resultado-v1.2.md#2-conclusiones-por-requisito-decisivo) y **no modifica la decisión**. Las respuestas del promotor a E02 sí figuran (RD-006 a RD-010). Las demás recomendaciones de E02 no son decisiones y no figuran en esta tabla.

| Tema | Decisión confirmada | Viabilidad según la v1.2 |
| --- | --- | --- |
| Alcance del primer piloto | **Vigente (RD-001, RD-006 a RD-010):** prioridad de las transmisiones en vivo. Incluidos: contenido exclusivo del perfil (RD-007) y controles adoptados (RD-010). Diferidos para después del primer piloto: juegos con monedas (RD-001), aportes directos (RD-006), campañas QR remuneradas (RD-008) y «Cercanos» (RD-009). El alcance funcional no está íntegramente cerrado | No evaluado: la v1.2 estudió el circuito con casino |
| Mercado y canal | Colombia como primer mercado de recargas y retiros. Web primero; app compatible con las tiendas después, sin equivalencia presupuesta con la web. La empresa aún no existe. Preferencia inicial para constituirla: Colombia, abierta a alternativas justificadas; país y forma societaria sin decidir definitivamente (RD-004, preferencia) | App posterior: alcance por definir; replicar en tiendas el contenido explícito no es posible (límite documentado) |
| Contenido | Se admiten desnudos y contenido sexual explícito | Evidencia insuficiente: normas de contenido no reverificadas (Q15) |
| Edad | Los espectadores verifican su mayoría de edad durante el registro, antes de usar la plataforma. No basta una declaración. Método y proveedor sin elegir | Evidencia insuficiente, sin incompatibilidad identificada |
| Controles del piloto | **Vigente (RD-010):** verificación de identidad y edad de creadores y de las personas que aparezcan, consentimiento documentado, capacidad de bloqueo e interrupción de directos y registro de acciones de moderación. Antes eran propuestas de la v0.33. Métodos, proveedores y condiciones, pendientes; no se eligen vigilancia humana continua, plantilla, horarios, plazos de conservación, proveedor de identidad ni arquitectura | Condiciones del adquirente: evidencia insuficiente (Q10). Métodos y proveedores: Q14 y Q18 |
| Casino y juegos con monedas | **Vigente (RD-001, RD-002):** no obligatorios para el primer piloto; se conservan como idea para una etapa posterior (FASE-09, diferida). Podrían inspirarse en BuzzCast y desarrollarse por nosotros. Reglas, implementación, arquitectura y clasificación jurídica pendientes, sin presumir exención por usar monedas o desarrollo propio. **Histórico (v0.33):** imprescindible desde el lanzamiento con usuarios reales. Sin decisión nueva: dados y juegos rápidos, tragamonedas y ruleta, con anfitrión social o sin él | Tragamonedas, ruleta y premio inmediato: ruta condicionada (concesión o socio; retiro del jugador si el modelo queda clasificado en el régimen, conclusión provisional). Dados, «desde el lanzamiento» y casino dentro del sitio de LIVE en la ruta B: evidencia insuficiente |
| Territorio de los jugadores de los futuros juegos | **Sin definir** (RD-003, dato pendiente); sustituye la respuesta anterior «solo Colombia». No se extiende a creadores, anfitriones ni espectadores | Admisibilidad pendiente (Q2, Q20); diferido con los juegos |
| Territorio de los espectadores | **Vigente como objetivo (RD-011, preferencia):** permitir acceso internacional sujeto a las restricciones que se validen. No es cobertura aprobada ni fija países; no modifica RD-003 ni convierte las residencias de los creadores en territorios de espectadores | Pendiente de validación (Q2 (a), Q11, Q14 y Q15) |
| Ganancias del jugador | Uso interno sin retiro a su banco: nuevas apuestas, regalos, intervalos, publicaciones y suscripciones. Requisito de los juegos, diferido con ellos; no se renuncia a él | Sin retiro: **incompatibilidad documentada provisional** en el régimen estudiado, si el modelo queda clasificado en él (clasificación pendiente, Q2). Uso en regalos o contenido: evidencia insuficiente |
| Anfitrión | Papel social; el juego funciona automáticamente. Remuneración deseada: porcentaje de lo apostado, con fórmula pendiente (visión del promotor, no decisión cerrada). Diferido con los juegos | No reverificado |
| Monedas y pagos | Recargas de dinero para monedas. Suscripciones y publicaciones solo con saldo interno. Aportes directos en dinero por un pago independiente: **diferidos** para después del primer piloto (RD-006) y conservados como función futura | Monedas en el casino y pagos: evidencia insuficiente |
| Creadores | Creadores del piloto: alta por invitación y revisión previa; residentes en Colombia, EE. UU., España y Venezuela. Solicitudes diarias de retiro con saldo mínimo por definir | Pagos: evidencia insuficiente. Retiros diarios y residencias: no reverificados |
| Directos y salas | Un creador por transmisión. Contador individual con pausas. 1 minuto para reconectar. Devoluciones proporcionales en monedas al cerrar, con financiación compartida. Devolución al expulsar salvo infracción comprobada. Grabación opcional activada por el creador y publicable en su perfil; la publicación entra en el primer piloto (RD-007). La grabación técnica del proveedor sigue pendiente | Grabación del creador: evidencia insuficiente. Reglas de consumo: no reverificadas |
| Contenido exclusivo del perfil | **Vigente (RD-007):** incluido en el primer piloto: fotos y videos, compras individuales, suscripciones y publicación de grabaciones. Pago con saldo interno; precios y catálogo del creador; renovación manual o automática elegida por el usuario; compras sin vencimiento mientras el contenido siga disponible. Pagar un intervalo no da acceso a una grabación | Grabación del creador y su publicación: evidencia insuficiente. Reglas de consumo: no reverificadas (Q16) |
| Descubrimiento | **Vigente (RD-009):** «Cercanos» diferido para después del primer piloto, sin recogida de ubicación para esa función. Se conservan la búsqueda, las categorías, los filtros y el resto del descubrimiento de la v0.33 | No reverificado |
| Multistream | BuzzCast, TikTok Live y Bigo Live. En el piloto, desde un solo celular, sin computador, con consulta de chat y regalos. Al pasar a sala exclusiva se finalizan las emisiones externas | Conjunto: evidencia insuficiente. Cierre de emisiones y captura en Android: ruta condicionada (pruebas en FASE-03) |
| Piloto | Hasta 5 creadores y 50 espectadores simultáneos en total dentro de la plataforma, no por sala. Más de 8 h diarias con al menos un directo | Infraestructura: ruta condicionada |
| Administración | Durante el piloto, solo el usuario del proyecto administra y revisa reportes. Tickets y chat de soporte; atención humana según su disponibilidad, sin horario fijo. Cada creador y sus moderadores designados moderan su sala, además de la supervisión general de la plataforma | Administración única: evidencia insuficiente |
| Promoción | Tareas físicas con QR en Bogotá y Medellín; pago base más bono por captación, en dinero o monedas, a elección del participante. Monedas publicitarias usables en regalos, casino, intervalos, publicaciones y suscripciones; el uso en los juegos se difiere con ellos. Cartel con video en vivo continuo. **Diferida** para después del primer piloto (RD-008), sin eliminarse | Remuneración y monedas en regalos y acceso: evidencia insuficiente (Q22). Monedas en el casino: evidencia insuficiente (Q6) |
| Presupuesto | US$3.000 mensuales aparte de Claude como referencia anterior, no como límite de diseño. Capital inicial sin definir. Importe para asesoría: sin definir, que no equivale a cero (RD-005, dato pendiente) | — |

**Efecto económico**, con la [propuesta E02, §2](../expedientes/LIVE-FASE02-E02-alcance-piloto.md#2-circuito-económico-funcional) como referencia:

- Para validar el circuito de directos y contenido exclusivo son relevantes los tramos C1–C8 y K1. Quedan diferidos K2 (aportes directos, RD-006) y K3 (remuneración QR, RD-008). Esta relación no aprueba todas las formulaciones técnicas de esas filas.
- Los regalos que habilitan intervalos (C3) se cuentan una sola vez como ingreso del creador y como base de la comisión (C2 y C7).
- Los ingresos del creador proceden de los regalos (C2) y del contenido exclusivo (K1). Ambos se retiran por la misma solicitud de retiro (C6), sin otra política.
- Sin campañas QR en el primer piloto, no hay monedas publicitarias en él (E02, combinación B2 + C1).

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

**Ninguna está elegida** y no deben usarse como base de diseño. **Aplazar los juegos con monedas** ya no es una propuesta: el promotor lo decidió para el primer piloto ([RD-001](../producto/REGISTRO-DECISIONES.md#rd-001-alcance-del-primer-piloto)). Siguen **sin decidir** convertirlos en juegos sociales, sustituir sus monedas económicas por puntos ficticios o cambiar los usos de monedas y ganancias. Sobre la propuesta E02, el promotor respondió A1, B2, C1, D1 y E1 (RD-006 a RD-010). Las demás recomendaciones de E02 siguen sin elegir y constan en la propuesta, no en esta lista.

**De la propia v0.33** (propuestas para la versión adulta y las campañas). [RD-010](../producto/REGISTRO-DECISIONES.md#rd-010-controles-del-piloto) adoptó como requisitos del piloto la verificación de identidad y edad de creadores y de las personas que aparezcan, el consentimiento documentado, la capacidad de bloqueo e interrupción de directos y el registro de acciones de moderación: dejan de ser propuestas. Siguen sin elegir:

- acceso exclusivo de mayores de 18 años en todos los roles;
- reportes, en lo que RD-010 no cubre (la revisión de reportes por el usuario del proyecto sí está confirmada);
- participación adulta en las campañas, que quedan diferidas (RD-008).

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

Siguen abiertos, con FASE-02 en espera; FASE-01 no los resolvió. Detalle y orden en la [v1.2, §5](../investigacion/LIVE-001-resultado-v1.2.md#5-pendientes-priorizados). Cada pendiente indica su ámbito: **[piloto]**, piloto de directos y su economía; **[juegos, diferido]**, exclusivo de los juegos con monedas, diferido con FASE-09 (RD-001) y sin borrarse. Esta clasificación es una propuesta de trabajo de Claude en esta revisión, sujeta a la delimitación del circuito del piloto.

1. **[Juegos, diferido]** Texto y vigencia de las reglas de retiro y bonos: cotejo con el Diario Oficial y anexo del Acuerdo 01/2026.
2. Clasificación jurídica del circuito completo de la v0.33. **[Piloto]**: la del circuito del piloto de directos, cuando se delimite; esta revisión no la presupone. **[Juegos, diferido]**: la del casino en las rutas A y B, incluido el retiro del jugador.
3. **[Piloto]** Aceptación de proveedores de pago para cada tramo del piloto. Las actividades que se declaren dependerán del circuito delimitado.
4. **[Piloto]** Condiciones del adquirente sobre moderación y horas que quiera declarar el promotor (P5). Disponibilidad comunicada: sin horario fijo; horas semanales sin definir.
5. **[Piloto]** Método y proveedor de verificación de edad.
6. **[Piloto]** Egress de video, aceptación del contenido y decisión sobre la grabación técnica del proveedor, que sería consecuencia de usar Cloudflare con HLS/DASH (no es una propuesta de los informes).
7. **[Juegos, diferido]** Capital, impuestos y garantías de una concesión propia, que siguen provisionales. **[Piloto]**: el capital del proyecto (P2) y el importe para asesoría (RD-005) siguen sin definir.
8. Cotejo propio de las fuentes leídas por ChatGPT: **[piloto]** en lo que afecte a su circuito; el resto, **[juegos, diferido]**. Requiere ampliar el acceso de red del entorno.

Preguntas y datos del [borrador de expedientes](../expedientes/LIVE-005-006-borrador.md) por ámbito, con la misma clasificación de trabajo:

- **Piloto de directos y contenido exclusivo:** Q2 (a) aplicada al circuito del piloto; Q9 a Q16; Q18 y Q19; Q20 en lo relativo a pagos a creadores residentes en Venezuela; Q21; CP-1, salvo la parte de «Cercanos»; CP-3; P2 (capital), P5, P6, volúmenes y grabación técnica. Para el contenido exclusivo incluido (RD-007) siguen pertinentes Q10 (d), Q16 y Q21; para la grabación técnica pendiente, Q12 y Q21, en el orden de la [propuesta E02, §3.5](../expedientes/LIVE-FASE02-E02-alcance-piloto.md#35-orden-de-las-decisiones-de-grabación). Las preguntas que mencionan el casino como actividad declarada o como contexto (por ejemplo, Q11-S y Q14 (d)) se ajustarán al delimitar el circuito; el borrador no se modifica en esta revisión.
- **Juegos, diferidos:** Q1; Q2 (b) y (c); Q3 a Q8; Q20 en lo relativo al territorio de los jugadores; P2 (cotización de la ruta B), P7 y P8; territorio de los jugadores (RD-003) y regla de retiro del jugador.
- **Campañas QR, diferidas (RD-008):** Q17, Q22 y CP-2, y las pruebas exclusivas del cartel QR.
- **Aportes directos, diferidos (RD-006):** las partes de Q11-S (b) y Q11-O sobre aportes directos (tramo K2 de E02).
- **«Cercanos», diferido (RD-009):** la parte de CP-1 sobre la ubicación aproximada.

La [propuesta E02, §3](../expedientes/LIVE-FASE02-E02-alcance-piloto.md#3-validaciones-concretas) relaciona estos pendientes con los tramos del piloto y añade tres consultas propuestas (CP-1 a CP-3), que siguen siendo propuestas de Claude. Con RD-006 a RD-010, sus validaciones para aportes directos y campañas quedan diferidas, y las del contenido exclusivo (K1) pasan a aplicar. Ni E02 ni este estado resuelven los pendientes. El [expediente E04](../expedientes/LIVE-FASE02-E04-validaciones-piloto.md) adapta las preguntas del piloto en borradores para asesoría jurídica y para proveedores, con su matriz y los datos faltantes. Tampoco resuelve los pendientes, y ninguna consulta está enviada ni autorizada para su envío.

Las pruebas técnicas del punto 6 corresponden a FASE-03. Los datos que piden los borradores (país de constitución, capital, franjas de atención y cambios de monedas) son datos y decisiones de FASE-02. La [ficha del promotor, v1.1](../expedientes/LIVE-FASE02-E01-ficha-promotor.md) registra las respuestas recibidas, los ordena por ámbito y separa lo que depende de profesionales o proveedores.

## 8. Siguiente paso

Se sigue el [plan por fases](PLAN-POR-FASES.md): una fase activa y una entrega activa.

1. **Auditar y publicar LIVE-FASE03-E01 v1.2.** ChatGPT audita el paquete; el usuario lo aplica, hace commit y push, y se verifica el SHA publicado.
2. **Prueba física en Android** del experimento, siguiendo su [README](../../experimentos/directo-movil/README.md#contexto-seguro-y-prueba-física-en-android). Está pendiente y no se presupone su resultado.
3. **Siguientes entregas de FASE-03, solo con un encargo explícito del usuario**, para el resto del [borrador de LIVE-002](../expedientes/LIVE-002-alcance-borrador.md): multistream, chat y regalos externos, sesiones largas, reconexión, paso a exclusivo, grabación y detección y corte. No se activan FASE-04 ni fases posteriores.
4. **Retomar FASE-02** con su propio encargo. Los borradores de [E04](../expedientes/LIVE-FASE02-E04-validaciones-piloto.md) esperan revisión y adaptación, y enviar una consulta requiere una autorización expresa del usuario. FASE-02 debe resolverse antes de cualquier operación real del piloto. Las preguntas de lo diferido siguen en el [borrador de expedientes LIVE-005 y LIVE-006](../expedientes/LIVE-005-006-borrador.md).

Enviar consultas o contactar a terceros requiere el encargo de la fase correspondiente.

## 9. Repositorio

- **Ramas.** Rama histórica de publicación: `claude/new-session-tzsjwj`. Según el encargo R02, también es la rama predeterminada. Los commits `95bc81c` (LIVE-FASE01-E01), `bc5f146` (LIVE-FASE02-E01 v1.0), `65378a4` (LIVE-FASE02-E01 v1.1), `14926d2` (LIVE-FASE02-E02 v1.1), `8128802` (LIVE-FASE02-E03 v1.0) y `4cd3ce4` (LIVE-FASE02-E04 v1.1) forman parte de ella. E01 v1.1, E02 (v1.0 y v1.1), E03 v1.0, E04 (v1.0 y v1.1) y FASE03-E01 v1.0 se prepararon en una sesión de Claude con la rama local `claude/sweet-archimedes-tmwqr7`, situada en `bc5f146`; E02, E03, E04 y FASE03-E01, sobre exportaciones aisladas de `65378a4`, `14926d2`, `8128802` y `4cd3ce4`, fuera de ese checkout. No se presupone que esa rama exista en GitHub. No se cambian ahora la rama predeterminada, el nombre de rama, los permisos de GitHub, los correos ni la identidad Git.
- **Publicación manual.** Desde LIVE-FASE01-E01, Claude entrega un parche y un paquete para auditoría; el usuario aplica, hace commit y push. Claude no hace commit, push ni modificaciones remotas ([plan, §3](PLAN-POR-FASES.md#3-flujo-de-entrega-y-publicación)). Las entregas anteriores, hasta `7184f7c`, se publicaron desde la sesión de Claude con las instrucciones vigentes entonces; ese historial no se reescribe. LIVE-FASE01-E01 se publicó manualmente en `95bc81c`. LIVE-FASE02-E01 v1.0 y v1.1 están publicadas en `bc5f146` y `65378a4`; LIVE-FASE02-E02 v1.1, en `14926d2`; LIVE-FASE02-E03 v1.0, en `8128802`, y LIVE-FASE02-E04 v1.1, en `4cd3ce4`: commits con la autoría del usuario.
- Carpetas: producto en `docs/producto/` (definición v0.33 y registro de decisiones), encargos en `docs/encargos/`, investigación en `docs/investigacion/`, expedientes en `docs/expedientes/`, estado en `docs/estado/` y el experimento técnico en `experimentos/directo-movil/`.
