# Estado del proyecto LIVE

Actualizado el 16-10-2026, encargo LIVE-001-R02. Es el punto de entrada para saber qué está vigente, qué es historial y qué falta.

## 1. Etapa actual

- **Definición e investigación.** La aplicación **no está implementada**: no hay código, infraestructura, cuentas de pago ni publicación web.
- **LIVE-001 sigue abierto.** Su síntesis vigente es [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md), **provisional** en las materias jurídicas y contractuales.
- «LIVE» es un identificador provisional, no el nombre comercial.

## 2. Requisito base y origen

| Documento | Versión y fecha | Origen | SHA-256 |
| --- | --- | --- | --- |
| [Definición del proyecto](../producto/proyecto-live-definicion-v0.33.md) | v0.33, 09-10-2026 | Copia byte a byte del archivo subido a la sesión de Claude Code el 10-10-2026 (`0b0f0522-proyecto-live-definicion-v0.33.md`) | `163c247e8fbfd32d608c7e5bc650c1c8d27a313b4aa416cc3d135c17c3ded569` |

La v0.33 es la base de requisitos y **sus decisiones siguen vigentes**. Los informes de investigación no la modifican. Según la propia v0.33 (§5), los requisitos cambian mediante un registro de decisiones del promotor, no mediante ediciones implícitas.

## 3. Resultados y síntesis vigente

| Documento | Papel | Estado |
| --- | --- | --- |
| [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md) | **Síntesis vigente** de conclusiones, evidencia, cálculos y pendientes | Provisional |
| [Registro R02](../investigacion/LIVE-001-R02-registro-correcciones.md) | Correcciones v1.1 → v1.2 | Vigente |
| [LIVE-001-resultado-v1.1](../investigacion/LIVE-001-resultado-v1.1.md) | Verificación R01: auditoría detallada, matrices y fuentes | Histórico |
| [Registro R01](../investigacion/LIVE-001-R01-registro-correcciones.md) | Correcciones v1.0 → v1.1 | Histórico |
| [LIVE-001-resultado-v1.0](../investigacion/LIVE-001-resultado-v1.0.md) | Informe inicial de viabilidad | Histórico |

**Límite de la evidencia.** Ningún documento externo se leyó íntegro desde el entorno de Claude. Las fuentes oficiales citadas en la v1.2 proceden de tres vías:

- extractos de buscador obtenidos en R01;
- la auditoría de ChatGPT descrita en el encargo R02, pendiente de cotejo propio;
- archivos locales.

## 4. Decisiones del promotor (v0.33)

Resumen. La fuente es la v0.33, §1, tabla «Respuestas confirmadas» y párrafo de la v0.24.

| Tema | Decisión confirmada |
| --- | --- |
| Mercado y canal | Colombia como primer mercado de recargas y retiros. Web primero; app compatible con las tiendas después |
| Contenido | Se admiten desnudos y contenido sexual explícito |
| Edad | Los espectadores verifican su mayoría de edad durante el registro, antes de usar la plataforma. No basta una declaración. Método y proveedor sin elegir |
| Casino | Imprescindible desde el lanzamiento con usuarios reales. Dados y juegos rápidos, tragamonedas y ruleta. Con anfitrión social o sin él |
| Ganancias del jugador | Uso interno sin retiro a su banco: nuevas apuestas, regalos, intervalos, publicaciones y suscripciones |
| Monedas y pagos | Recargas de dinero para monedas. Suscripciones y publicaciones solo con saldo interno. Aportes directos en dinero por un pago independiente |
| Creadores | Alta por invitación y revisión previa. Residentes en Colombia, EE. UU., España y Venezuela. Solicitudes diarias de retiro con saldo mínimo por definir |
| Directos y salas | Un creador por transmisión. Contador individual con pausas. 1 minuto para reconectar. Devoluciones proporcionales en monedas al cerrar, con financiación compartida. Devolución al expulsar salvo infracción comprobada. Grabación opcional activada por el creador y publicable en su perfil |
| Multistream | BuzzCast, TikTok Live y Bigo Live desde un solo celular, sin computador, con consulta de chat y regalos. Al pasar a sala exclusiva se finalizan las emisiones externas |
| Piloto | Hasta 5 creadores y 50 espectadores en total. Más de 8 h diarias con al menos un directo |
| Administración | Solo el usuario del proyecto administra y revisa reportes. Tickets y chat de soporte; atención humana según su disponibilidad, sin horario fijo. Cada creador y sus moderadores designados moderan su sala |
| Promoción | Tareas físicas con QR en Bogotá y Medellín; pago en dinero o monedas, a elección del participante. Monedas publicitarias usables en regalos, casino, intervalos, publicaciones y suscripciones. Cartel con video en vivo continuo |
| Presupuesto | US$3.000 mensuales aparte de Claude como referencia anterior, no como límite de diseño. Capital inicial sin definir. La empresa aún no existe |

## 5. Documentos originales

| Documento | Ubicación en el repositorio | Origen | SHA-256 |
| --- | --- | --- | --- |
| Definición v0.33 | [docs/producto/proyecto-live-definicion-v0.33.md](../producto/proyecto-live-definicion-v0.33.md) | Archivo subido a la sesión (10-10-2026) | `163c247e…c3ded569` ([SHA256SUMS](../producto/SHA256SUMS)) |
| Encargo LIVE-001 v1.0 | [docs/encargos/LIVE-001-investigacion-viabilidad-v1.0.md](../encargos/LIVE-001-investigacion-viabilidad-v1.0.md) | Archivo subido (10-10-2026). Su texto coincide con el incluido en la v0.33, §7 | `2de412a6…1baa8d97` |
| Encargo LIVE-001-R01 v1.0 | [docs/encargos/LIVE-001-R01-verificacion-informe-v1.0.md](../encargos/LIVE-001-R01-verificacion-informe-v1.0.md) | Archivo subido (10-10-2026) | `bc3f70dc…cada41c4` |
| Encargo LIVE-001-R02 v1.0 | [docs/encargos/LIVE-001-R02-cierre-documental-v1.0.md](../encargos/LIVE-001-R02-cierre-documental-v1.0.md) | Archivo subido (16-10-2026) | `15054aac…e8090183` |

Las sumas completas están en `SHA256SUMS` de cada carpeta. Las copias se comprobaron con `cmp` contra los archivos subidos.

**Originales ausentes:**

- Versiones v0.1 a v0.32 de la definición. Solo constan en el registro de cambios de la v0.33 (§11).
- Encargos LIVE-002, LIVE-003 y LIVE-004 como archivos independientes. Solo existen como borradores dentro de la v0.33 (§8 a §10), sujetos al resultado de LIVE-001.
- Encargos LIVE-005, LIVE-006 y LIVE-007. No existen: fueron propuestos en la v1.0 (§11).
- Texto completo de la auditoría de ChatGPT y de su revisión preliminar de R01. Solo se conoce su resumen dentro de los encargos R01 y R02.

## 6. Propuestas no aprobadas por el promotor

Aparecen en la v1.0 y la v1.1 como opciones. **Ninguna está elegida** y no deben usarse como base de diseño:

- separar el casino en otro dominio de saldos;
- permitir retiros al jugador;
- impedir que las ganancias se usen en regalos o contenido;
- monedas segregadas sin uso en el casino;
- posponer el casino o hacerlo social;
- multistream solo de video o por fases;
- limitar horas de directo o concurrencia;
- aplazar a los creadores residentes en Venezuela;
- app de tienda como otro producto;
- remuneración de campaña solo en dinero;
- bono del concesionario para monedas publicitarias;
- grabación técnica de todos los directos;
- separar marca, dominio o sociedad entre contenido adulto y juego.

La arquitectura de saldos debe conservar el uso de ganancias que pidió el promotor como requisito pendiente de viabilidad.

## 7. Pendientes principales

Detalle y orden en la [v1.2, §5](../investigacion/LIVE-001-resultado-v1.2.md#5-pendientes-priorizados).

1. Texto y vigencia de las reglas de retiro y bonos: cotejo con el Diario Oficial y anexo del Acuerdo 01/2026.
2. Clasificación jurídica del circuito completo de la v0.33.
3. Aceptación de proveedores de pago para cada tramo.
4. Condiciones del adquirente sobre moderación y horas que quiera declarar el promotor (P5).
5. Método y proveedor de verificación de edad.
6. Egress de video, aceptación del contenido y decisión sobre la grabación técnica.
7. Capital, impuestos y garantías de una concesión propia, que siguen provisionales.
8. Cotejo propio de las fuentes leídas por ChatGPT. Requiere ampliar el acceso de red del entorno.

## 8. Siguiente encargo

Recomendación de esta revisión. No es una decisión: la elige el promotor.

1. **LIVE-005: expediente de consulta jurídica.** Prepararlo sin enviarlo: descripción del circuito, preguntas cerradas Q1–Q9 y Q14 (Q2 ampliada a la clasificación), evidencia que se adjunta y datos que faltan. Atiende las prioridades 1 y 2.
2. **LIVE-006: expediente de proveedores.** Pagos, video, verificación de edad y adquirente, con la actividad declarada con su categoría real. Prepararlo sin contactar.
3. **LIVE-002: prueba técnica móvil.** Puede ir en paralelo con contenido neutral, saldo ficticio y cuentas autorizadas, sin cobros ni apuestas reales. Su alcance está en la [v1.2, §6](../investigacion/LIVE-001-resultado-v1.2.md#6-preparación-de-los-siguientes-encargos).

## 9. Repositorio

- Rama de trabajo: `claude/new-session-tzsjwj`. Según el encargo R02, también es la rama predeterminada; esta entrega no la cambió ni creó otra.
- Documentación de producto en `docs/producto/`, encargos en `docs/encargos/`, investigación en `docs/investigacion/` y estado en `docs/estado/`.
