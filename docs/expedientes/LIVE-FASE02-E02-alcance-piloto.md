# LIVE-FASE02-E02 — Alcance y circuito del piloto de transmisiones — v1.1

| Campo | Valor |
| --- | --- |
| ID | LIVE-FASE02-E02 |
| Versión | 1.1 |
| Fase | FASE-02, viabilidad y decisiones del piloto ([plan](../estado/PLAN-POR-FASES.md)) |
| Fecha | 18-10-2026 |
| Base | `65378a49c17453aa768ca871819abe6748a03908` |
| Estado | Propuesta preparada. Pendiente de auditoría, publicación manual y decisión del promotor |

**Nota de revisión v1.1 (18-10-2026).** Corrige la v1.0, no publicada, tras la revisión R01 de ChatGPT. Los cambios afectan a cuatro puntos y no alteran la configuración propuesta:

- orden de las decisiones de grabación (M7, §3.1, §3.2 y §3.5);
- relación entre regalos, intervalos y comisión (§2.1);
- combinaciones de las preguntas B y C (M11, K1, K3 y §4);
- precisión sobre proveedores (§2 y §4).

Propone el alcance del primer piloto de transmisiones y su circuito económico. **No aprueba el alcance ni la viabilidad.** Su publicación tampoco lo hará: el promotor tendrá que decidir expresamente cada propuesta.

Punto de partida:

- **Decisión vigente** ([RD-001](../producto/REGISTRO-DECISIONES.md#rd-001-alcance-del-primer-piloto) y [RD-002](../producto/REGISTRO-DECISIONES.md#rd-002-juegos-con-monedas-futuros)): el piloto prioriza las transmisiones en vivo. Los juegos con monedas (LIVE-F08 y LIVE-F09) quedan diferidos y no son una opción de esta propuesta.
- Las demás funciones confirmadas de la [v0.33](../producto/proyecto-live-definicion-v0.33.md) se conservan. No está decidido cuáles entran obligatoriamente en el primer piloto.
- No se vuelven a preguntar las respuestas recibidas: territorio de los jugadores (RD-003), país de la operadora (RD-004) e importe para asesoría (RD-005).
- Capacidad: hasta 5 creadores y 50 espectadores simultáneos en total dentro de la plataforma, y más de 8 h diarias con al menos un directo. Son máximos y un mínimo, no una ocupación media ni un calendario, que siguen sin definir.
- No hay respuestas de terceros ni aceptación acreditada de proveedores. Las pruebas de FASE-03 no se han ejecutado.

Convenciones: **vigente** es un requisito de la v0.33 o del registro de decisiones; **propuesta** es una recomendación de Claude, no decidida; **pendiente** es una decisión o un dato abierto. **[AG]** marca una fuente leída por ChatGPT según la v1.2, pendiente de cotejo propio.

## 1. Matriz de alcance

Fuente de los requisitos vigentes, salvo otra indicación: [v0.33, §1, «Respuestas confirmadas»](../producto/proyecto-live-definicion-v0.33.md#respuestas-confirmadas) y [§2, «Funciones solicitadas»](../producto/proyecto-live-definicion-v0.33.md#2-funciones-solicitadas). Los controles son parte de la operación: no se proponen como recorte para ahorrar, y sus condiciones jurídicas y contractuales no están resueltas. Los controles no marcados como vigentes son propuestas.

| Recorrido | Requisito vigente | Propuesta para el piloto | Controles necesarios | Pendiente y dependencias |
| --- | --- | --- | --- | --- |
| **M1. Directos, chat y moderación** (LIVE-F01; LIVE-F10 en parte) | Un creador por transmisión; creadores por invitación y revisión previa. Espectadores ven, chatean y envían regalos. Pausa con 1 minuto para reconectar; sin reconexión, cierre y devoluciones. Creador y moderadores designados moderan el chat y expulsan, con supervisión general de la plataforma | **Incluir.** Es el núcleo del piloto | Verificación de la mayoría de edad del espectador al registrarse (vigente). Reportes y bloqueo; capacidad de la plataforma de interrumpir directos; verificación de creadores y de las personas que aparezcan; consentimiento documentado; registro de nombramientos y acciones de moderación. Estos controles son propuestas de la v0.33 que se recomienda adoptar | Adopción de esos controles; método y proveedor de edad; horas del promotor (P5). Q10, Q14, Q15, Q18; prueba de detección y corte (LIVE-002) |
| **M2. Multistream móvil y paso a exclusivo** (LIVE-F02, LIVE-F03) | En el piloto, emisión a BuzzCast, TikTok Live y Bigo Live desde un solo celular, sin computador, con consulta de chat y regalos externos. Al pasar a sala exclusiva se finalizan las emisiones externas ([v0.33, «Multistream y acceso exclusivo»](../producto/proyecto-live-definicion-v0.33.md#multistream-y-acceso-exclusivo)) | **Incluir** con el requisito completo, condicionado a FASE-03 y a Q13. Si un destino o una capacidad no tiene vía autorizada, vuelve al promotor como decisión; no se presupone la alternativa «solo video o por fases», que sigue sin aprobar | La parte pública enviada a TikTok y Bigo no puede llevar contenido sexual (límite documentado en la [v1.2, §2.1](../investigacion/LIVE-001-resultado-v1.2.md#21-requisitos-revisados)). Cierre comprobable desde nuestro lado al pasar a exclusivo | Soporte autorizado por destino y capacidad. Q13; pruebas de LIVE-002 |
| **M3. Regalos y salas por intervalos** (LIVE-F05; regalos de LIVE-F06) | Regalos con monedas. Sala con contador individual y pausas; primer intervalo gratuito opcional; renovación manual o automática autorizada por el espectador. Los intervalos se pagan con regalos: un regalo específico o la suma de regalos hasta el precio. Aportes parciales y excedentes según la v0.33. Devoluciones por cierre y por expulsión (§2) ([v0.33, «Salas por intervalos y contenido exclusivo»](../producto/proyecto-live-definicion-v0.33.md#salas-por-intervalos-y-contenido-exclusivo)) | **Incluir.** Forman el circuito económico mínimo y el paso a exclusivo | Autorización expresa y cancelable de la renovación automática. Registro del origen, la operación y el destino de cada movimiento (propuesta de la v0.33). Tratamiento de eventos repetidos, regalos simultáneos, saldo insuficiente y desconexiones, que la v0.33, §5, propone como escenarios de aceptación | Duraciones y precios de cada creador; fórmula de financiación de la devolución por cierre; financiación y liquidación de la devolución por expulsión; comisión. Q9, Q16 |
| **M4. Recargas, ingresos y retiros de creadores** (LIVE-F06) | Recarga de dinero para comprar monedas; Colombia es el primer mercado de recargas y retiros. Solicitudes diarias de retiro con saldo mínimo por definir. Creadores residentes en Colombia, EE. UU., España y Venezuela ([v0.33, «Solicitudes de retiro del creador»](../producto/proyecto-live-definicion-v0.33.md#solicitudes-de-retiro-del-creador)) | **Incluir** las recargas en Colombia y los retiros de creadores de las cuatro residencias vigentes, sujetos a la aceptación de proveedores | Verificación de identidad y de la cuenta de cobro del creador. Reserva del importe solicitado frente a solicitudes concurrentes, y reintentos sin pagos duplicados (propuesta de la v0.33). Conciliación con los cobros del proveedor | Equivalencias, moneda, comisión, saldo mínimo y plazo de liquidación. País de la operadora (P6; preferencia, RD-004). Países de los espectadores: sin decidir. Q9, Q11, Q19, Q20 |
| **M5. Aportes directos en dinero** (LIVE-F07) | Pago independiente en dinero, separado de las monedas, con comisión menor que la de los regalos y abono al banco del creador ([v0.33, «Pagos y aportes»](../producto/proyecto-live-definicion-v0.33.md#pagos-y-aportes)) | **Postergar**, conservando el requisito: pregunta A (§4) | Si se incluye: confirmación del pago, devoluciones y disputas en su propio flujo | Decisión A; proveedor, moneda y porcentaje. Q9, Q11 |
| **M6. Perfiles con fotos y videos, compras y suscripciones** (LIVE-F04) | Perfil exclusivo con fotos y videos. Suscripción mensual con catálogo elegido por el creador y renovación manual o automática elegida por el usuario. Compra individual sin vencimiento mientras siga disponible. Precios de cada creador; pago solo con saldo interno | **Incluir** el perfil del creador (presentación, seguidores y directos) y **postergar** las compras y suscripciones de contenido exclusivo: pregunta B (§4) | Si se incluye: revisión del contenido antes de publicarlo y consentimiento de las personas que aparecen (condiciones de la SPME [AG], pendientes de Q10); autorización de renovaciones; retirada de contenido | Decisión B. Si se incluye, sus ingresos se retiran por la misma solicitud de M4 (C6). Q10 (d), Q16, Q21 |
| **M7. Grabación** (LIVE-F01, LIVE-F04) | Grabación opcional activada por el creador y publicable en su perfil; pagar un intervalo no da acceso a la grabación. La grabación técnica del proveedor es una decisión distinta y pendiente | La pregunta B decide solo la **publicación** en el perfil: con B1 se posterga la publicación de grabaciones. Esta propuesta **no delimita** si, con B1, el creador podrá activar la captura durante el piloto. Grabación técnica: el promotor decide después de recibir las respuestas de Q12 y Q21 (§3.5) | Aviso de grabación; revisión antes de publicar; conservación y borrado | Captura por el creador con B1; decisión sobre la grabación técnica. Q12, Q21; volúmenes |
| **M8. Mensajes y comunidad** (LIVE-F12; seguimiento) | Seguir a creadores. Mensajes privados de texto gratuitos, que solo los seguidores del creador pueden iniciar, con avisos ([v0.33, «Directos, perfiles y comunicación privada»](../producto/proyecto-live-definicion-v0.33.md#directos-perfiles-y-comunicación-privada--alcance-inicial)) | **Incluir.** No genera movimientos económicos | Bloqueo y reporte de conversaciones; la misma verificación de edad previa al uso | Límites, conservación y moderación de los mensajes. CP-1 |
| **M9. Descubrimiento y avisos** (LIVE-F13, LIVE-F14) | Inicio con directos activos recomendados; categorías, búsqueda por nombre y filtros de país o ciudad e idioma. «Cercanos» con indicador y permiso, aparición inicial activada y opción de ocultarse. Avisos de directos seguidos, mensajes privados y pagos, retiros y suscripciones, activables en conjunto | **Incluir** el inicio, las recomendaciones, categorías, búsqueda, filtros y los avisos de las funciones incluidas. **Postergar «Cercanos»**: con 5 creadores aporta poco y trata la ubicación de creadores de contenido adulto | Permiso del navegador o del celular para avisos y ubicación; ocultación en «Cercanos» si se incluye | Pesos y fórmula de las recomendaciones; decisión sobre «Cercanos». CP-1 |
| **M10. Administración y soporte** (LIVE-F10, LIVE-F15) | Solo el usuario del proyecto administra y revisa reportes. Tickets y chat dentro de la plataforma; atención humana según su disponibilidad, sin horario fijo. Protección de pagos, saldos, cuentas y contenido exclusivo | **Incluir** | Registro de las acciones administrativas y de las operaciones. Atención de quejas en el plazo que exija el adquirente (siete días hábiles según la SPME [AG]), aunque el administrador no esté disponible. Protección de cuentas | Horas y franjas (P5); herramientas. Q10 |
| **M11. Campañas QR y su remuneración** (LIVE-F11) | Tareas en Bogotá y Medellín; pago base más bono por captación, en dinero o monedas a elección del participante. Monedas publicitarias usables en regalos, intervalos, publicaciones y suscripciones; su uso en los juegos se difiere con ellos. Cartel con video en vivo continuo; materiales a cargo del participante ([v0.33, «Promoción remunerada»](../producto/proyecto-live-definicion-v0.33.md#promoción-remunerada-mediante-tareas-físicas--live-f11)) | **Postergar** el módulo completo: pregunta C (§4). Si se incluye, sus monedas solo se usan en las funciones habilitadas en el piloto (K3) | Si se incluye: verificación de tareas y captaciones, prevención de fraude y revisión del video continuo | Decisión C; importes y duraciones. Q17, Q22, CP-2 |

**Fuera del piloto por decisión vigente:** LIVE-F08 y LIVE-F09 (juegos y anfitriones), con sus apuestas, premios, ganancias y monedas en juegos (RD-001).

## 2. Circuito económico funcional

Los tramos describen funciones, no cuentas contables, conversiones ni movimientos autorizados ([v0.33, «Recorrido económico deseado»](../producto/proyecto-live-definicion-v0.33.md#recorrido-económico-deseado)). No se fijan comisiones, conversiones, mínimos, reservas ni reparto de contracargos.

### 2.1 Circuito recomendado

**Regalos, intervalos y comisión.** C2 es el único aporte de monedas durante el directo. C3 no es un cobro adicional: describe el efecto de acceso de los regalos de C2 que califican, sea un regalo específico o la suma de regalos. Cada regalo cuenta una sola vez como ingreso del creador y una sola vez como base de la comisión (C7), aunque habilite un intervalo.

El aporte parcial y el crédito excedente son valor ya aportado en C2. El excedente se aplica a los siguientes intervalos del mismo directo y, al cerrar, vence y permanece como regalo al creador. Ninguno de los dos es una nueva recarga ni un nuevo regalo. Su atribución y liquidación siguen pendientes.

| # | Tramo | Quién aporta | Qué consume | Ingreso o saldo que genera | Regla vigente o pendiente | Validación que falta |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | Recarga | Espectador: dinero (Colombia, primer mercado) | — | Monedas compradas del espectador; cobro del proveedor | Moneda y equivalencias, pendientes. No se fija paridad con otros saldos | Q11, Q9, CP-3 |
| C2 | Regalo | Espectador: monedas | Regalo al creador durante el directo, incluidos los que califican para acceso (C3) | Ingreso del creador y base de la comisión (C7), una sola vez por regalo | Vigente: el valor de los regalos es lo que más pesa en la popularidad. Comisión sin porcentaje | Q9 |
| C3 | Acceso por intervalos | Ningún aporte adicional: los regalos de C2 que califican, por regalo específico o por suma | Intervalo de una sala exclusiva | Derecho de acceso al intervalo. El ingreso y la comisión son los del regalo en C2 y no se cuentan de nuevo | Vigente: renovación manual o automática con autorización del espectador. Lo aportado que no alcanza el precio queda como regalo, ya contado en C2. El excedente se aplica a los siguientes intervalos del directo y, al cerrar, vence y permanece como regalo, también ya contado en C2. Atribución y liquidación, pendientes | Q16, Q9 |
| C4 | Devolución por cierre | Plataforma y creador, con fórmula pendiente | Tiempo pagado no consumido al cerrar el directo, incluido el cierre por no reconectar en 1 minuto | Monedas restituidas al espectador; ajuste del ingreso y de la comisión, por definir | Vigente: devolución proporcional en monedas, con financiación compartida entre plataforma y creador | Q16, Q9 |
| C5 | Devolución por expulsión | Pendiente: la financiación compartida del cierre no se extiende a este caso | Tiempo pagado restante del espectador expulsado | Restitución proporcional, salvo infracción comprobada por la plataforma tras revisar las pruebas | Vigente la regla; pendientes la forma de liquidación, la financiación, el proceso y los plazos | Q16 |
| C6 | Retiro del creador | Creador: solicitud diaria sobre sus ingresos de C2 y, si se incluye, de K1 | Saldo disponible por encima del mínimo, con importe por definir | Pago al banco del creador | Vigente: residencias en CO, US, ES y VE. Pendientes: plazo de entrega, moneda y comisiones | Q11, Q19, Q20, Q9 |
| C7 | Comisión de plataforma | Retención sobre el valor de cada regalo de C2, contado una sola vez aunque habilite C3, y, si se incluye, sobre K1 | — | Ingreso de la plataforma | Sin porcentaje fijado. Es distinta de impuestos y retenciones fiscales | Q11 (costos del proveedor), Q19 |
| C8 | Incidencias de pago | Según el caso: espectador, proveedor o plataforma | Cobros duplicados o fallidos, contracargos, pagos fallidos al creador | Por definir | Sin reglas confirmadas. La v0.33, §5, solo propone escenarios de aceptación | Q11, Q16, CP-3 |

### 2.2 Tramos condicionales, pendientes de decisión

| # | Tramo | Quién aporta | Qué consume | Ingreso o saldo que genera | Regla vigente | Validación que falta |
| --- | --- | --- | --- | --- | --- | --- |
| K1 | Compras y suscripciones (pregunta B) | Espectador: solo saldo interno | Publicaciones, paquetes o suscripción mensual | Ingreso del creador, que se retira por la misma solicitud de C6 sin otra política de retiros, y comisión (C7) | Renovación manual o automática elegida por el usuario; compra sin vencimiento mientras siga disponible; precios de cada creador | Q16, Q9, Q10 (d), Q21 |
| K2 | Aporte directo (pregunta A) | Espectador: dinero por un pago independiente, sin monedas | — | Abono al banco del creador; comisión menor que la de los regalos, sin porcentaje | Flujo separado de las monedas y de los retiros diarios | Q11, Q9, Q19, Q20 |
| K3 | Remuneración y bonos QR (pregunta C) | Plataforma: dinero o monedas, a elección del participante | Tareas y captaciones válidas | Pago base y bono. En el piloto, las monedas publicitarias solo se usan en las funciones habilitadas: regalos (C2), que también dan acceso a intervalos (C3), y publicaciones y suscripciones solo si se incluye K1 | Vigente para la visión completa: uso en regalos, intervalos, publicaciones, suscripciones y juegos. Los usos no habilitados en el piloto se conservan para su etapa. Convertir monedas publicitarias en dinero quedó fuera del alcance confirmado | Q22, Q17, CP-2 |

Límites del circuito:

- El piloto no incluye apuestas, premios, ganancias ni saldos de juegos (RD-001).
- El uso interno sin retiro pedido para las ganancias de los juegos futuros no se aplica a las monedas compradas, a las devoluciones ni a otros derechos del espectador. Esos derechos, como un eventual reembolso de monedas no consumidas, no están definidos en la v0.33 (CP-3).
- No se ha acreditado aceptación de proveedores para estos tramos: siguen en evidencia insuficiente según la [v1.2, §2.1](../investigacion/LIVE-001-resultado-v1.2.md#21-requisitos-revisados). Esto no equivale a una negativa del mercado.

## 3. Validaciones concretas

Relaciona los tramos con las preguntas del [borrador LIVE-005 y LIVE-006](LIVE-005-006-borrador.md), que no se modifica ni se renumera. El objeto se adapta al piloto sin juegos. Ninguna consulta está lista para envío: dependen de la configuración que decida el promotor (§4) y de su propio encargo. Una dependencia indica qué falta, no un bloqueo demostrado.

Prioridad: **1**, condiciona el circuito recomendado; **2**, condiciona un componente; **3**, solo si se incluye un tramo condicional.

### 3.1 Validación jurídica

| Objeto en el piloto | ID | Profesional | Dato que falta | Prioridad |
| --- | --- | --- | --- | --- |
| Clasificación del circuito sin juegos (C1–C8 y los tramos condicionales que se incluyan): si queda en algún régimen de juego, financiero u otro | Q2 (a) | Abogado de juego | Circuito decidido (§4) | 1 |
| Monedas con devolución en monedas y saldos de creadores pendientes de pago: captación, depósito electrónico o recaudo para terceros | Q9 | Abogado financiero | Circuito decidido; equivalencias | 1 |
| Saldo interno, renovación automática, pausas, reconexión, aporte parcial, excedente y devoluciones por cierre y por expulsión | Q16 | Abogado de consumo | Políticas de incidencias (C8) | 1 |
| Contenido sexual explícito entre adultos en un servicio web | Q15 | Abogado de datos y menores | — | 1 |
| Verificación de edad al registrarse: sujetos obligados, métodos y conservación, y su relación con la verificación de creadores y de personas que aparecen, sin la parte del jugador | Q14 (a)–(d) | Abogado de datos y menores | — | 1 |
| Escenarios de captura, conservación y publicación, con las personas que aparecen: captura activada por el creador, grabación técnica del proveedor y publicación en el perfil | Q21 | Abogado de datos | Comportamientos del proveedor (Q12) cuando existan; mientras tanto, se evalúan como escenarios. No requiere una decisión previa del promotor (§3.5) | 2 |
| Tributos y retenciones de los pagos a creadores en CO, US, ES y VE, con solicitudes diarias | Q19 | Tributarista | País de la operadora (P6) | 2 |
| Sanciones o restricciones para pagar a creadores residentes en Venezuela | Q20 (primera parte) | Abogado de comercio internacional | P6 | 2 |
| Permisos de publicidad exterior y de imágenes de transeúntes en Bogotá y Medellín | Q17 | Abogado; consulta municipal | Decisión C | 3 |
| Remuneración de campañas fuera del régimen de juego, en una plataforma sin juegos durante el piloto | Q22 | Abogado de juego y publicidad | Decisión C | 3 |

### 3.2 Aceptación contractual

| Objeto en el piloto | ID | Proveedor | Dato que falta | Prioridad |
| --- | --- | --- | --- | --- |
| Cobro de monedas en Colombia y pago a creadores, declarando la actividad real del piloto: contenido sexual explícito entre adultos y monedas de consumo, sin juegos. Cómo declarar los juegos previstos después forma parte de la consulta | Q11-S, Q11-P, Q11-O | Stripe, Payoneer, Wise, Bold, adquirentes adultos, bancos colombianos | P6; entidad contratante | 1 |
| Moderación: acreditación de controles, detección automática o vigilancia humana, moderadores designados, quejas en siete días hábiles y Visa | Q10 (a)–(c), (e) | Adquirentes o procesadores de contenido adulto | P5; diseño de moderación | 1 |
| Aceptación escrita del contenido explícito por el proveedor de video. Si graba o conserva por defecto y en qué condiciones, retención y borrado. Facturación WebRTC | Q12 | Cloudflare, AWS IVS, LiveKit, alojamiento propio | Volúmenes | 1 |
| Proveedor de verificación de edad: método, datos, conservación, precio y aceptación del sector | Q18 | Proveedores de verificación | Respuesta a Q14 | 1 |
| Clave de emisión sin PC, chat y regalos, ingesta en BuzzCast y cierre de la emisión | Q13 | TikTok, BIGO, BuzzCast | Resultados de LIVE-002 | 2 |
| Grabaciones publicadas | Q10 (d) | Adquirentes o procesadores de contenido adulto | Decisión B | 3 |
| Aportes directos: pago independiente y abono al banco del creador | Q11-S (b), Q11-O | Procesadores y bancos | Decisión A | 3 |

### 3.3 Prueba técnica (FASE-03, no ejecutada)

El [borrador de LIVE-002](LIVE-002-alcance-borrador.md), pausado hasta FASE-03, cubre captura móvil, tres destinos, chat y regalos, sesiones largas, reconexión, sala exclusiva sin tramas después de T, grabación, cartel y detección y corte. Usa contenido neutral, saldos ficticios y cuentas autorizadas. Ninguna prueba está superada. Un resultado negativo vuelve al promotor como decisión, no como recorte automático.

### 3.4 Consultas propuestas

Vacíos que no cubren las Q existentes. Son propuestas de Claude, sin ID Q y no preparadas para envío.

| ID | Objeto | Profesional | Prioridad |
| --- | --- | --- | --- |
| CP-1 | Datos personales del piloto que no cubren Q14 ni Q21: mensajes privados, ubicación aproximada para «Cercanos», historial e intereses para las recomendaciones (Ley 1581/2012) | Abogado de datos | 2 |
| CP-2 | Relación con los participantes de campañas: naturaleza del pago base y los bonos, retenciones y materiales a su cargo sin reembolso | Abogado laboral y tributarista | 3 |
| CP-3 | Monedas compradas no consumidas (vigencia, reembolso o retracto) e incidencias de pago (cobros duplicados y contracargos) | Abogado de consumo | 1 |

### 3.5 Orden de las decisiones de grabación

1. Q12 aclara los comportamientos y las condiciones de cada proveedor de video: si graba o conserva por defecto, retención y borrado.
2. Q21 evalúa los escenarios de captura, conservación y publicación, incluida la grabación técnica, con lo que Q12 haya aclarado.
3. Las dos consultas pueden avanzar en paralelo e iterarse. Una respuesta nueva de Q12 se incorpora a Q21 sin bloquearla, y Q21 no espera una decisión previa.
4. Con esas respuestas, el promotor decide la grabación técnica y, si corresponde, el alcance de la captura del creador. Esta propuesta no fija ese alcance.

No se pide un sí o un no antes de esas respuestas, como establece la [ficha E01, §2](LIVE-FASE02-E01-ficha-promotor.md#2-pendientes).

## 4. Decisiones mínimas del promotor

Tres preguntas que cambian el circuito. Las demás propuestas de §1, como adoptar los controles recomendados o postergar «Cercanos», se aprueban o corrigen al decidir la configuración. Responder A, B o C no las aprueba tácitamente: requieren una decisión expresa. «Sin definir» es una respuesta válida. No se piden documentos ni datos bancarios.

**A. ¿Incluye los aportes directos en dinero (LIVE-F07) en el primer piloto?**

- **A1 (recomendada): postergarlos**, conservando el requisito. Impacto: elimina del piloto el flujo de pago independiente y reduce los tramos que deben validarse. Que así se necesiten menos proveedores o menos costo es una hipótesis, pendiente de aceptación y cotización. Los creadores cobran solo por regalos y acceso.
- **A2: incluirlos.** Impacto: añade un segundo flujo de dinero (K2), con confirmación, devoluciones y disputas propias, y amplía Q9, Q11, Q19 y Q20.

**B. ¿Incluye el contenido exclusivo del perfil (compras, suscripciones y publicación de grabaciones, LIVE-F04) en el primer piloto?**

- **B1 (recomendada): postergarlo.** El piloto conserva el perfil del creador y las salas exclusivas en directo. Impacto: sin revisión previa de publicaciones ni renovaciones mensuales, y menos carga para el administrador único. Los creadores tienen menos fuentes de ingreso. B1 posterga la publicación de grabaciones, no decide sobre la captura activada por el creador (M7).
- **B2: incluirlo con sus reglas vigentes.** Impacto: añade K1, revisión previa del contenido, consentimiento de las personas que aparecen y almacenamiento, y activa Q10 (d), Q16 y Q21 para ese contenido. Sus ingresos se retiran por la misma solicitud de C6.

**C. ¿Incluye las campañas QR remuneradas (LIVE-F11) en el primer piloto?**

- **C1 (recomendada): postergarlas.** La captación del piloto se apoya en la invitación de creadores y en los destinos externos. Impacto: sin pagos a participantes, sin permisos de publicidad exterior y con menos fraude que revisar.
- **C2: incluirlas con sus reglas vigentes**, con remuneración en dinero o monedas a elección del participante. Impacto: añade K3, Q17, Q22, CP-2 y la prueba del cartel en FASE-03.

**Combinaciones de B y C.** En el piloto, las monedas solo se usan en las funciones habilitadas. Ninguna combinación amplía el alcance aprobado ni convierte monedas publicitarias en dinero. Los usos de la visión completa siguen vigentes para su etapa. La pregunta A no altera estos usos, porque el aporte directo es dinero, no monedas.

| Combinación | Usos de monedas en el piloto | Ingresos del creador que se retiran por C6 |
| --- | --- | --- |
| B1 + C1 | Monedas compradas: regalos (C2), que también dan acceso a intervalos (C3) | Regalos (C2) |
| B1 + C2 | Monedas compradas y publicitarias: regalos (C2) e intervalos (C3). Las publicitarias no habilitan compras ni suscripciones, que siguen postergadas | Regalos (C2) |
| B2 + C1 | Monedas compradas: regalos (C2), intervalos (C3), compras y suscripciones (K1) | Regalos (C2) y K1 |
| B2 + C2 | Monedas compradas y publicitarias: regalos (C2), intervalos (C3), compras y suscripciones (K1) | Regalos (C2) y K1 |

Las respuestas fijarán el circuito sobre el que se prepararían las consultas de prioridad 1, mediante otra entrega con su propio encargo.
