# Estado del proyecto LIVE

Actualizado el 16-10-2026, encargo LIVE-001-R02. Es el punto de entrada para saber qué está vigente, qué es historial y qué falta.

## 1. Etapa actual

- **Definición e investigación.** La aplicación **no está implementada**: no hay código, infraestructura, cuentas de pago ni publicación web.
- **LIVE-001 sigue abierto.** Su síntesis vigente es [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md), **provisional** en las materias jurídicas y contractuales.
- El alcance de LIVE-002 y los expedientes de LIVE-005 y LIVE-006 están en borrador, **preparados y no enviados**. No ha habido contacto con terceros.
- «LIVE» es un identificador provisional, no el nombre comercial.

## 2. Requisito base y origen

| Documento | Versión y fecha | Origen | SHA-256 |
| --- | --- | --- | --- |
| [Definición del proyecto](../producto/proyecto-live-definicion-v0.33.md) | v0.33, 09-10-2026 | Copia byte a byte del archivo subido a la sesión de Claude Code el 10-10-2026 (`0b0f0522-proyecto-live-definicion-v0.33.md`) | `163c247e8fbfd32d608c7e5bc650c1c8d27a313b4aa416cc3d135c17c3ded569` |

La v0.33 es la base de requisitos y **sus decisiones siguen vigentes**. Los informes de investigación no la modifican. Según la propia v0.33 (§5), los requisitos cambian mediante un registro de decisiones del promotor, no mediante ediciones implícitas. Donde la v0.33 menciona un «techo mensual de US$3.000» (sexta ronda y v0.7) es registro histórico: la v0.11 lo convirtió en referencia.

## 3. Resultados y síntesis vigente

| Documento | Papel | Estado |
| --- | --- | --- |
| [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md) | **Síntesis vigente** de conclusiones, evidencia, cálculos y pendientes | Provisional |
| [Registro R02](../investigacion/LIVE-001-R02-registro-correcciones.md) | Correcciones v1.1 → v1.2, procedencia y accesos de R02 | Vigente |
| [Borrador LIVE-005 y LIVE-006](../expedientes/LIVE-005-006-borrador.md) | Circuito, preguntas, evidencia por adjuntar y datos que faltan | Preparado, no enviado |
| [Borrador de alcance de LIVE-002](../expedientes/LIVE-002-alcance-borrador.md) | Prueba técnica móvil sin dinero real | Preparado, no ejecutado |
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
- Cloudflare: 81–82;
- Acuerdo 01/2026: 112;
- cálculos reproducidos: 140–151.

## 4. Decisiones del promotor (v0.33)

Resumen de la v0.33, §1, tabla «Respuestas confirmadas» y párrafo de la v0.24. La columna de viabilidad remite a la [v1.2, §2](../investigacion/LIVE-001-resultado-v1.2.md#2-conclusiones-por-requisito-decisivo) y **no modifica la decisión**.

| Tema | Decisión confirmada | Viabilidad según la v1.2 |
| --- | --- | --- |
| Mercado y canal | Colombia como primer mercado de recargas y retiros. Web primero; app compatible con las tiendas después, sin equivalencia presupuesta con la web. La empresa aún no existe | App posterior: alcance por definir; replicar en tiendas el contenido explícito no es posible (límite documentado) |
| Contenido | Se admiten desnudos y contenido sexual explícito | Evidencia insuficiente: normas de contenido no reverificadas (Q15) |
| Edad | Los espectadores verifican su mayoría de edad durante el registro, antes de usar la plataforma. No basta una declaración. Método y proveedor sin elegir | Evidencia insuficiente, sin incompatibilidad identificada |
| Casino | Imprescindible desde el lanzamiento con usuarios reales. Dados y juegos rápidos, tragamonedas y ruleta. Con anfitrión social o sin él | Tragamonedas, ruleta y premio inmediato: ruta condicionada (concesión o socio). Dados, «desde el lanzamiento» y casino dentro del sitio de LIVE en la ruta B: evidencia insuficiente |
| Ganancias del jugador | Uso interno sin retiro a su banco: nuevas apuestas, regalos, intervalos, publicaciones y suscripciones | Sin retiro: **incompatibilidad documentada provisional** en el régimen estudiado, si el modelo queda clasificado en él (clasificación pendiente, Q2). Uso en regalos o contenido: evidencia insuficiente |
| Anfitrión | Papel social; el juego funciona automáticamente. Remuneración deseada: porcentaje de lo apostado, con fórmula pendiente (visión del promotor, no decisión cerrada) | No reverificado |
| Monedas y pagos | Recargas de dinero para monedas. Suscripciones y publicaciones solo con saldo interno. Aportes directos en dinero por un pago independiente | Monedas en el casino y pagos: evidencia insuficiente |
| Creadores | Creadores del piloto: alta por invitación y revisión previa; residentes en Colombia, EE. UU., España y Venezuela. Solicitudes diarias de retiro con saldo mínimo por definir | Pagos: evidencia insuficiente. Retiros diarios y residencias: no reverificados |
| Directos y salas | Un creador por transmisión. Contador individual con pausas. 1 minuto para reconectar. Devoluciones proporcionales en monedas al cerrar, con financiación compartida. Devolución al expulsar salvo infracción comprobada. Grabación opcional activada por el creador y publicable en su perfil | Grabación del creador: evidencia insuficiente. Reglas de consumo: no reverificadas |
| Multistream | BuzzCast, TikTok Live y Bigo Live. En el piloto, desde un solo celular, sin computador, con consulta de chat y regalos. Al pasar a sala exclusiva se finalizan las emisiones externas | Conjunto: evidencia insuficiente. Cierre de emisiones y captura en Android: ruta condicionada (LIVE-002) |
| Piloto | Hasta 5 creadores y 50 espectadores simultáneos en total dentro de la plataforma, no por sala. Más de 8 h diarias con al menos un directo | Infraestructura: ruta condicionada |
| Administración | Durante el piloto, solo el usuario del proyecto administra y revisa reportes. Tickets y chat de soporte; atención humana según su disponibilidad, sin horario fijo. Cada creador y sus moderadores designados moderan su sala, además de la supervisión general de la plataforma | Administración única: evidencia insuficiente |
| Promoción | Tareas físicas con QR en Bogotá y Medellín; pago base más bono por captación, en dinero o monedas, a elección del participante. Monedas publicitarias usables en regalos, casino, intervalos, publicaciones y suscripciones. Cartel con video en vivo continuo | Remuneración y monedas en regalos y acceso: evidencia insuficiente (Q22). Monedas en el casino: evidencia insuficiente (Q6) |
| Presupuesto | US$3.000 mensuales aparte de Claude como referencia anterior, no como límite de diseño. Capital inicial sin definir | — |

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
- Encargos LIVE-002, LIVE-003 y LIVE-004 como archivos independientes. Solo existen como borradores sin número de versión dentro de la v0.33 (§8 a §10), sujetos al resultado de LIVE-001.
- Encargos LIVE-005, LIVE-006 y LIVE-007. No existen: fueron propuestos en la v1.0 (§11). Para LIVE-005 y LIVE-006 solo hay el borrador de expedientes.
- Texto completo de la auditoría de ChatGPT y de su revisión preliminar de R01. Solo se conoce su resumen dentro de los encargos R01 y R02.

## 6. Propuestas no aprobadas por el promotor

**Ninguna está elegida** y no deben usarse como base de diseño.

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
- posponer el casino o hacerlo social;
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

La arquitectura de saldos debe conservar el uso de ganancias que pidió el promotor como requisito pendiente de viabilidad.

## 7. Pendientes principales

Detalle y orden en la [v1.2, §5](../investigacion/LIVE-001-resultado-v1.2.md#5-pendientes-priorizados).

1. Texto y vigencia de las reglas de retiro y bonos: cotejo con el Diario Oficial y anexo del Acuerdo 01/2026.
2. Clasificación jurídica del circuito completo de la v0.33.
3. Aceptación de proveedores de pago para cada tramo.
4. Condiciones del adquirente sobre moderación y horas que quiera declarar el promotor (P5).
5. Método y proveedor de verificación de edad.
6. Egress de video, aceptación del contenido y decisión sobre la grabación técnica del proveedor, que sería consecuencia de usar Cloudflare con HLS/DASH (no es una propuesta de los informes).
7. Capital, impuestos y garantías de una concesión propia, que siguen provisionales.
8. Cotejo propio de las fuentes leídas por ChatGPT. Requiere ampliar el acceso de red del entorno.

## 8. Siguiente encargo

Recomendación de esta revisión. No es una decisión: la elige el promotor.

1. **Revisión del borrador de expedientes** por el promotor, completando los datos de su §5 (P2, P5, P6, P7, P8, volúmenes y grabación técnica).
2. **LIVE-005: consulta jurídica.** Encargar la revisión profesional de Q1–Q9, Q14–Q17 y Q19–Q22 (Q2 ampliada a la clasificación). Atiende las prioridades 1 y 2.
3. **LIVE-006: proveedores.** Pagos, video, verificación de edad y adquirente (Q10–Q13 y Q18), con cada actividad declarada con su categoría real.
4. **LIVE-002: prueba técnica móvil.** Puede ir en paralelo con contenido neutral, saldo ficticio y cuentas autorizadas, sin cobros ni apuestas reales. Su alcance está en el [borrador de LIVE-002](../expedientes/LIVE-002-alcance-borrador.md).

Enviar consultas o contactar a terceros requiere un encargo posterior.

## 9. Repositorio

- Rama de trabajo: `claude/new-session-tzsjwj`. Según el encargo R02, también es la rama predeterminada; esta entrega no la cambió ni creó otra.
- Carpetas: producto en `docs/producto/`, encargos en `docs/encargos/`, investigación en `docs/investigacion/`, expedientes en `docs/expedientes/` y estado en `docs/estado/`.
