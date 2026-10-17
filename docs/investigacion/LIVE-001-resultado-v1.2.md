# LIVE-001-resultado-v1.2 — Síntesis vigente de la investigación de viabilidad

| Campo | Valor |
| --- | --- |
| Encargo | LIVE-001-R02 — Cierre documental y consolidación de evidencia — v1.0 ([copia](../encargos/LIVE-001-R02-cierre-documental-v1.0.md)) |
| Base de requisitos | [Definición v0.33](../producto/proyecto-live-definicion-v0.33.md). Sus decisiones siguen vigentes |
| Estado | **Provisional** en las materias jurídicas y contractuales abiertas. LIVE-001 no está cerrado |
| Evidencia | Extractos de buscador del 10-10-2026 (R01) y auditoría de ChatGPT recogida en el encargo R02, fechado el 10-10-2026 (la fecha de consulta de ChatGPT no consta). Redacción: 16-10-2026 |

> Este documento sustituye a la v1.0 y a la v1.1 **solo** como fuente de las conclusiones vigentes. No es asesoría jurídica, contable ni financiera, ni sustituye la validación profesional o la aceptación escrita de proveedores. Separar el casino, permitir retiros al jugador o limitar usos del saldo son propuestas que el promotor **no ha elegido**.

## 0. Cómo leer esta síntesis

Las conclusiones vigentes son las de esta v1.2 (historial en §7). La v1.0 y la v1.1 no heredan validez: lo que aquí no se repite con su evidencia no se da por establecido. Lo que ninguna revisión reverificó figura como **evidencia insuficiente (no reverificado)** (§2.2).

**Procedencia.**

- **[LC]** Leído por Claude: solo archivos locales (definición v0.33, encargos e informes). En esta entrega Claude **no leyó directamente ninguna fuente externa**.
- **[AG]** Auditoría de ChatGPT, conocida solo por la paráfrasis del encargo R02, sin citas literales. **Claude no la ha cotejado**: el 16-10-2026 el entorno no alcanzó esos dominios y R02 prohíbe repetir búsquedas equivalentes.
- **[EB]** Extracto o texto amplio de un buscador en R01 (10-10-2026). No equivale a leer el documento.
- **[INT]** Interpretación de este informe o de la v1.1.
- **[RP] / [CC]** Revisión profesional o confirmación contractual pendiente.
- **[RC]** Requisito confirmado por el promotor en la v0.33.
- **[Supuesto]** Valor de cálculo sin fuente; editable.

**Categorías.**

- **Incompatibilidad documentada**: un texto recuperado impide el requisito tal como está definido; se indican su ámbito y si es provisional.
- **Ruta condicionada**: hay una vía documentada con condiciones identificadas.
- **Evidencia insuficiente**: depende de inferencias, fuentes secundarias o no cotejadas, o pruebas no hechas.

Una inferencia jurídica pendiente de dictamen nunca se clasifica como incompatibilidad.

## 1. Resumen

1. **Retiro del jugador.** Se mantiene, como **conclusión provisional**, que impedirlo es incompatible con el régimen colombiano estudiado (Ley 643/2001, art. 38; Acuerdo 08/2020 de Coljuegos, título 1, juegos por internet) si el casino de LIVE queda clasificado en él, en la ruta A (LIVE concesionaria) o en la B (socio autorizado). Faltan la clasificación del circuito completo, el cotejo con el Diario Oficial y la vigencia.
2. **Ganancias en regalos o contenido.** Conclusión **separada**: **evidencia insuficiente**. Los extractos no muestran prohibición literal ni figura que lo habilite. El riesgo alto en contra no demuestra prohibición, y la falta de prohibición literal no demuestra permiso. El uso pedido por el promotor sigue como requisito pendiente de viabilidad.
3. **Monedas publicitarias en el casino.** El bono del concesionario es una **hipótesis evaluada**, pendiente de confirmar para remunerar tareas publicitarias externas. No es una vía acreditada ni la única posibilidad jurídica.
4. **Stripe [AG].** Prohibición del contenido adulto y del casino en la política pública. Excepción general mediante preaprobación escrita en el contrato (SSA §1.2(a)(ix)). Ninguna aceptación acreditada para LIVE: evidencia insuficiente. Treasury, producto para empresas sin cuentas de consumidores, no prueba una billetera de consumidores.
5. **Payoneer [AG].** Prohibición de los servicios adultos y los juegos de azar en la lista pública. Su nota final permite preaprobar algunas actividades de la lista tras revisión discrecional; R02 no indica cuáles. Ninguna aceptación acreditada: evidencia insuficiente.
6. **Mastercard [AG].** Hay evidencia del cuerpo de la §9.4.1 de la SPME (04-08-2026). Sus controles no fijan plantilla ni demuestran que una automatización concreta cumpla. La administración única sigue en evidencia insuficiente por diseño, pruebas y condiciones del adquirente. Visa: sin evidencia reverificada.
7. **Edad [AG].** Según ChatGPT, el Decreto 0769/2026 (art. 2.2.31.2.6 lit. c) contempla una verificación acorde con el riesgo y minimización estricta de datos; los sujetos obligados no están identificados. Se mantiene la decisión del promotor de verificar la mayoría de edad al registrarse, sin incompatibilidad identificada.
8. **Grabación en Cloudflare.** La grabación técnica es una decisión pendiente de privacidad y arquitectura, no una incompatibilidad demostrada. El almacenamiento se contrata por bloques [AG]: como capacidad nueva aislada al mes, las publicadas a 12 h cuestan US$55 (no 54) y el cartel, US$15 (no 12) [AG], con los supuestos del 10 % y de 20 × 2 h [Supuesto]. Las publicadas se acumulan; con capacidad compartida, el incremento es de US$50–55 y US$10–15 (cálculo propio).
9. **Carga humana.** Las 20, 40 y 60 h semanales son **supuestos**: el promotor solo confirmó atención según su disponibilidad, sin horario fijo. La guardia es la mayor demanda solo en el cálculo que excluye la revisión de grabaciones publicadas y otros volúmenes no definidos; con esa revisión no hay dominancia general (§4).

## 2. Conclusiones por requisito decisivo

### 2.1 Requisitos revisados

| Requisito [RC] | Categoría | Evidencia | Qué falta |
| --- | --- | --- | --- |
| Impedir que el jugador retire sus ganancias | **Incompatibilidad documentada, provisional**, en el régimen estudiado y si el modelo queda clasificado en él | Ac. 08/2020, arts. 1.4.2 (orden de pago en ≤ 72 h, sin cobro), 1.5.2, 1.5.4 y 1.5.5 (medio no necesariamente bancario) [EB, réplicas]. Ruta B: definición de operador y copia no oficial del contrato C1747 [EB] | Clasificación del circuito; D.O. 51.452; anexo del Ac. 01/2026; Ac. 02/2026; proyecto 307313 |
| Usar ganancias en regalos, intervalos, publicaciones o suscripciones | **Evidencia insuficiente** | Art. 1.5.9: solo prohíbe transferir entre cuentas de jugadores distintos. Única aplicación no bancaria hallada: otros juegos autorizados (art. 1.8.1, número confirmado solo por buscador) [EB]. Riesgo alto en contra [INT] | Q1 |
| Monedas compradas usables en el casino | **Evidencia insuficiente** | Art. 1.5.10: pesos, sin monedas virtuales [EB]; encaje de las monedas LIVE, interpretable | Q3 |
| Monedas publicitarias usables en el casino | **Evidencia insuficiente** | Bono: hipótesis. Art. 1.1.3: ligado a partidas y premio al acreditarse [EB]. Tope (Res. 20250022644): estado desconocido | Q6; un concesionario |
| Remuneración de campañas en dinero; monedas publicitarias en regalos y acceso | **Evidencia insuficiente** | Fuera del régimen de juego salvo que la tarea promocione el casino (Res. 19054/2023) o dé acceso a un juego con premio (Ley 643, arts. 5 y 31): inferencia de la v1.1 (R01B-18) [INT] sobre extractos [EB] | Q22 |
| Casino real con tragamonedas y ruleta | **Ruta condicionada** | Concesión propia (A) o socio autorizado (B); art. 1.3.1 [EB] | Concesión o contrato B2B; certificación; retiro, si el modelo queda clasificado en el régimen |
| Casino desde el lanzamiento | **Evidencia insuficiente** | Plazos de concesión, certificación e integración en B sin investigar | Calendario y cotización de un operador; dictamen |
| Casino dentro del sitio de LIVE en la ruta B | **Evidencia insuficiente** | Ley 643, art. 38: registro «en el sitio o portal autorizado» [EB] | Q5 |
| Juegos rápidos y dados | Premio inmediato: **ruta condicionada**. Dados: **evidencia insuficiente** | Art. 1.3.12 modificado en 2026, según la réplica de Medellín [EB]; anexo del Ac. 01 sin leer (§3.1) | Anexo y D.O.; Q4 |
| Recargas de monedas, aportes directos y pagos a creadores en US, ES y VE | **Evidencia insuficiente** | Stripe y Payoneer: prohibición pública y excepción prevista de distinta base, sin aceptación [AG] (§3.2). Wise, Bold, adquirentes adultos y Paxum: no recuperados o no consultados en R01; solo evidencia de la v1.0 | Q11 |
| Pagos a creadores residentes en Colombia | **Evidencia insuficiente** | ACH o Bre-B desde una operadora colombiana: según F40, fuente secundaria de la v1.0 no reverificada | P6; aceptación del banco [CC] |
| Monedas y saldos de creadores frente al régimen de la SFC | **Evidencia insuficiente** | Conceptos de la SFC y de Supersociedades sobre captación [EB] (R01G-03), sin pronunciamiento sobre monedas de consumo | Q9 |
| Contenido sexual explícito en la web | **Evidencia insuficiente** | Ley 679/2001 y Decreto 1524/2002 no reverificados; solo se revisaron las condiciones de la SPME §9.4.1 [AG] | Q15; adquirente |
| Verificar la mayoría de edad al registrarse | **Evidencia insuficiente**, sin incompatibilidad identificada | Decisión del promotor [LC]; Decreto 0769/2026 [AG] | Cotejo; sujetos obligados; SIC; Q14 (método); Q18 (proveedor) |
| Administración única del piloto; chat según disponibilidad | **Evidencia insuficiente** | SPME §9.4.1 sin plantilla [AG]; horas no declaradas [LC] | LIVE-002; Q10; Visa; P5 |
| Multistream desde un celular (conjunto) | **Evidencia insuficiente** | Video a Bigo: **ruta condicionada** (guía oficial para PC) [EB]. TikTok y BuzzCast sin comprobar. Chat y regalos: sin API encontrada | LIVE-002; Q13 |
| Cierre de las emisiones externas al pasar a sala exclusiva; emisión web desde Android | **Ruta condicionada** | Solo se verifica nuestro lado: sin tramas después de T, sin API de los destinos (R01F-05). Captura con la página en primer plano (R01F-04) [EB] | LIVE-002 |
| Grabación opcional del creador y su publicación | **Evidencia insuficiente** | Decisión de la v0.33 [LC]. Revisión del contenido antes de publicarlo (SPME §9.4.1) [AG]; su aplicación a las grabaciones y el método [INT] | Q12 [CC]; Q21 [RP]; método de revisión |
| 5 creadores y 50 espectadores simultáneos en total; más de 8 h diarias (infraestructura) | **Ruta condicionada** [CC] | Tarifas de video por arquitectura [EB, AG] | Egress RTMP; Q12 |

**Límites documentados que no son requisitos del promotor** [EB]: la parte pública enviada a TikTok y Bigo no puede llevar contenido sexual ni promoción del casino (normas comunitarias, versiones 2023–2025), y una app de tienda no puede replicar el contenido explícito de la web (Google Play; Apple 1.1.4). La v0.33 ya pide una app «compatible con las tiendas». Son incompatibilidades documentadas, sujetas a la vigencia de esas políticas.

### 2.2 Requisitos no reverificados

Ninguna revisión los reverificó; todos quedan en **evidencia insuficiente (no reverificado)**. Análisis previo: v1.1, §6.3, §2.8 y §4.2 (e1).

- Retiros diarios de creadores con saldo mínimo [RC]: LIVE-006; Q19.
- Creadores del piloto en CO, US, ES y VE sin ampliar el territorio de jugadores [RC]: Q20 (P6, P8).
- Moderadores designados por cada creador [RC]: Q10.
- Tareas con QR en Bogotá y Medellín; cartel con video continuo [RC]: Q17; LIVE-002.
- Contenido solo con saldo interno; pausas, reconexión, devoluciones, expulsión, aportes parciales y excedente que quedan como regalo [RC]: Q16 (Ley 1480/2011).
- Anfitrión remunerado con un porcentaje de lo apostado (visión del promotor, fórmula pendiente): Q8.

## 3. Evidencia por tema

### 3.1 Casino

Solo se estudiaron el título 1 del Acuerdo 08/2020 y la Ley 643/2001, en réplicas de Medellín, Superservicios y SISJUR [EB], sin cotejo con el D.O. 51.452. La v0.33 deja abierta la clasificación del circuito completo [LC]; por eso el retiro obligatorio es provisional y no se extiende a «cualquier casino».

ChatGPT abrió la ficha oficial del Acuerdo 01 de 07-05-2026, publicada el 08-05-2026, pero no pudo leer su anexo; la ficha no permite afirmar el alcance de todos sus artículos [AG]. La réplica de Medellín solo anota un cambio en el art. 1.3.12 [EB], lo que no descarta otros. El Acuerdo 02/2026 y el proyecto 307313 siguen sin identificar.

Un bono por tareas ajenas al juego no encaja literalmente en el art. 1.1.3 [INT], y acreditado como crédito sería premio retirable. Que la remuneración en dinero quede fuera del régimen de juego es una inferencia pendiente de dictamen (Q22), y en cualquier caso no resuelve el uso de las monedas en el casino.

### 3.2 Pagos

**Stripe [AG].**

| Capa | Documento | Qué consta | Qué no acredita |
| --- | --- | --- | --- |
| Política pública | *Restricted Businesses*, actualización 22-09-2026 | Adulto y casino entre los **prohibidos**, apartado distinto del de restringidos | Que la aprobación prevista para restringidos alcance a los prohibidos |
| Contrato general | *Stripe Services Agreement*, modificación 28-09-2026, §1.2(a)(ix) | Excepción general mediante preaprobación escrita | Aprobación para LIVE, su casino o la combinación. Entidad y términos regionales sin identificar (/us/ redirigió al contrato general) |
| Producto | *Treasury for platforms requirements* (fecha no indicada) | Producto para empresas; sin cuentas financieras de consumidores; casino y adulto prohibidos | Una billetera de consumidores |

Cuenta de entidad colombiana: no confirmada. Global Payouts admite en vista previa cuentas receptoras en Colombia desde el 25-03-2026 [EB]: es cobertura, no admisión.

**Payoneer [AG].** Lista oficial actual, versión no consignada. R02 no indica qué actividades alcanza la nota final ni en qué condiciones, ni una autorización para este modelo. Lista pública, posible excepción y aceptación real (por producto, empresa, actividad y territorio, que no consta) son planos distintos. La cifra comercial de países no acredita cobertura.

**Otros.** Ningún candidato investigado mostró aceptación pública del modelo completo, lo que no prueba que no exista. Cada actividad se declara con su categoría real.

### 3.3 Moderación y administración única

**SPME de Mastercard, versión 04-08-2026, §9.4.1, páginas impresas 114–115 [AG]**, sin citas literales ni comprobación de vigencia a 16-10-2026. Contempla registro del comercio por el adquirente; acuerdos y consentimiento; verificación de creadores y personas representadas; revisión del contenido antes de publicarlo; control del directo para supervisarlo y retirarlo en tiempo real, y resolución de quejas en siete días hábiles.

Se aplica si LIVE acepta Mastercard mediante un adquirente [INT]. Los siete días hábiles deben garantizarse aunque el administrador no esté disponible [INT]. La apelación y el cese de la aceptación solo constan en fuentes de 2021 [EB].

### 3.4 Edad

**Decreto 0769/2026, art. 2.2.31.2.6 lit. c), compilación de MinTIC con fecha de corte no indicada [AG]**: verificación acorde con el riesgo y minimización estricta, bajo el régimen de datos y las instrucciones de la SIC. No selecciona proveedor, procedimiento biométrico universal ni retención indefinida.

Ámbitos:

- **Espectadores**: decisión del promotor de verificar al registrarse [LC].
- **Creadores y personas que aparecen**: verificación prevista en la SPME §9.4.1 [AG], exigible si LIVE acepta Mastercard mediante un adquirente [INT], y propuesta de la v0.33 [LC]; no es requisito del promotor. Método y aceptación pendientes.
- **Jugador del casino**: arts. 1.5.2 y 1.5.5 y SIPLAFT, a cargo del concesionario [EB].
- **Participantes de campañas**: solo una propuesta no elegida.

### 3.5 Video y grabación

**Cloudflare [AG].** *Start a live stream* (07-10-2026): `recording.mode=automatic` habilita la reproducción HLS/DASH y graba; con `off` no graba ni hay esa reproducción; `deleteRecordingAfterDays` admite de 30 a 1.096 días. *Pricing* (08-09-2026): almacenamiento prepagado en bloques de US$5 por 1.000 minutos al mes; anuncia la facturación de la entrega WebRTC desde el 15-10-2026, sin verificar si ya se aplica ni con qué tarifa.

La v0.33 no eligió grabar ni publicar todos los directos: es una opción no seleccionada, no una prohibición [LC]. Se distinguen la grabación técnica del proveedor, la grabación voluntaria del creador y su publicación para seguidores. La técnica obliga a decidir la retención por un tercero de video sexual explícito [RP] y su aceptación por el proveedor [CC].

## 4. Cálculos corregidos

Recalculados por Claude con un script. R02 solo trae US$55 y US$15 (R02-05) y la guardia sin cubrir (§5); el resto es cálculo propio sin contraste externo.

| Cálculo | Fórmula | Resultado | Límite |
| --- | --- | --- | --- |
| Publicadas a 12 h | 10 % [Supuesto] × 108.000 min = 10.800 → 11 bloques | **US$55** al mes (lineal: 54) | Aislado. Acumulativo: US$650 al mes 12 |
| Publicadas a 24 h | 21.600 → 22 bloques | US$110 (lineal: 108) | Aislado. Acumulativo: US$1.300 al mes 12 |
| Cartel | 20 × 2 h [Supuesto] = 2.400 min → 3 bloques | **US$15** (lineal: 12) | Aislado; compartido, US$10–15 |
| Capacidad compartida (ejemplo) | 3.600 + 10.800 + 2.400 = 16.800 → 17 bloques | US$85, frente a 90 por partidas | Se redondea el total de la cuenta |
| Retención técnica a 12 h | 1 día: 4 bloques; 30 días: 108 | US$20 / US$540 | 1 día exige borrado por API, sin probar; 30 días es el mínimo automático |
| Umbral de la referencia de US$3.000 (12 h; RTMP con relé y Cloudflare; sin moderación humana; f = fracción del tiempo con 3 destinos) | 2.678 + 324·f + S > 3.000; 2.678 = 1.080 (entrega) + 800 (KYC) + 648 (IA) + 150 (servidores) | Con S = 20 y sin otras grabaciones: **f > 151/162 ≈ 0,9321**. Con las publicadas en la cuenta: f > 0,7623 (mes 1), 0,5926 (mes 2); desde el mes 6, con f = 0 | KYC, IA y servidores: partidas de la v1.0 no reverificadas. Relé sin cotizar |
| Guardia sin cubrir (lectura B: detección automática aceptada [CC]) | 360 o 720 − 40 × 52 ÷ 12 [Supuesto] | 186,7 h (12 h/día) / 546,7 h (24 h/día) | Suponen todas las horas del administrador dentro de horas con directo |
| Guardia frente a trabajo con revisión de grabaciones, r = 1 [Supuesto] | S_B (bajo / central / alto) + O (mínimo del rango de la v1.1) + revisión. 12 h: 48 / 135 / 240 + 86,75 + 180. 24 h: 96 / 270 / 480 + 101,75 + 360 | 12 h: 314,75 < 360; 401,75 y 506,75 > 360. 24 h: 557,75 < 720; 731,75 y 941,75 > 720. Con O máximo, el sentido no cambia | Sin dominancia general. La guardia domina solo sin la revisión y sin otros volúmenes no definidos |

Horas con servicio, horas de trabajo, guardia y equivalentes de jornada (horas sin cubrir ÷ 162,75: 1,15 y 3,36) son magnitudes distintas; los equivalentes no son plantilla ni calendario de turnos.

**Sin cambio** (recalculadas por Claude y reproducidas por ChatGPT [AG] con las entradas de la v1.1):

- Fijo de la ruta A: 811 × COP 1.750.905 = COP 1.419.983.955 por año, pagadero por adelantado (referencia 2026; vigencia de la unidad y del contrato sin comprobar). Equivalente mensual solo contable, que no autoriza pagos mensuales: COP 118.331.996,25.
- Efectivo parcial de arranque: COP 2.049.183.794,55, con el 1 % sobre el fijo y la cobertura pendientes.
- Ocupación máxima hipotética: 50 × 12 h × 30 días = 1.080.000 minutos.
- Video a 12 / 24 h: Cloudflare US$1.080 / 2.160; IVS US$1.608–1.824 / 3.156–3.588; LiveKit US$2.225 / 4.600,4, sin egress.

Estas comprobaciones verifican la aritmética. **No validan** precios, presupuesto, operación, permisos ni factibilidad. La referencia de US$3.000 no es un límite de diseño, y el fijo de una concesión propia no es un costo inevitable de una asociación sin cotización.

## 5. Pendientes priorizados

1. **Reglas de retiro y bonos**: cotejo de los artículos citados en §2.1 con el D.O. 51.452; anexo del Ac. 01/2026; Ac. 02/2026 y proyecto 307313; estado de la Res. 20250022644.
2. **Clasificación jurídica del circuito completo** (Q2 ampliada).
3. **Aceptación de pagos**: Stripe (entidad, términos regionales, preaprobación por actividad y tramo); alcance de la nota de Payoneer; Wise, Bold y adquirentes adultos; banco de la operadora colombiana.
4. **Moderación**: condiciones escritas del adquirente (Q10), Visa, horas del promotor (P5) y pruebas de detección y corte.
5. **Edad**: cotejo del decreto, sujetos obligados, instrucciones de la SIC, método (Q14) y proveedor (Q18).
6. **Video**: egress RTMP, aceptación del contenido, facturación WebRTC, grabación técnica y borrado por API.
7. **Capital, impuestos y garantías**: provisionales hasta cotejar la Res. 20161200025334 consolidada, el control del DL 0240/2026 y una TRM certificada.
8. **Cotejo propio** de las fuentes leídas por ChatGPT cuando el entorno lo permita.

## 6. Preparación de los siguientes encargos

**LIVE-002: prueba técnica sin dinero real.** Alcance en su [borrador](../expedientes/LIVE-002-alcance-borrador.md): captura móvil, tres destinos, chat y regalos, sesiones largas, reconexión, sala exclusiva sin tramas después de T, grabación y cartel. Contenido neutral, saldo ficticio y cuentas autorizadas, sin cobros ni apuestas reales.

**LIVE-005 y LIVE-006.** El [borrador de expedientes](../expedientes/LIVE-005-006-borrador.md) reúne el circuito, las preguntas reformuladas, la evidencia por adjuntar y los datos que faltan. Está preparado y **no enviado**; no hubo contacto con terceros.

La arquitectura de saldos debe conservar el uso de ganancias que pidió el promotor como requisito pendiente de viabilidad. No se construirá producción alrededor de una alternativa no elegida.

## 7. Trazabilidad

- [Definición v0.33](../producto/proyecto-live-definicion-v0.33.md): base de requisitos (copia fiel; [SHA256SUMS](../producto/SHA256SUMS)).
- [Encargos LIVE-001, R01 y R02](../encargos/): instrucciones originales (copias fieles; [SHA256SUMS](../encargos/SHA256SUMS)).
- [v1.0](LIVE-001-resultado-v1.0.md) y [v1.1](LIVE-001-resultado-v1.1.md): históricos, sin cambios; la v1.1 conserva auditoría, matrices y fuentes.
- [Registro R01](LIVE-001-R01-registro-correcciones.md) y [registro R02](LIVE-001-R02-registro-correcciones.md): cambios entre versiones; el R02 detalla procedencia y accesos.
- [Borradores de LIVE-002, LIVE-005 y LIVE-006](../expedientes/): preparados, no enviados.
- [Estado del proyecto](../estado/ESTADO-PROYECTO.md): punto de entrada.
