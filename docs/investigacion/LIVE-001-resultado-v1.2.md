# LIVE-001-resultado-v1.2 — Síntesis vigente de la investigación de viabilidad

| Campo | Valor |
| --- | --- |
| Encargo | LIVE-001-R02 — Cierre documental y consolidación de evidencia — v1.0 ([copia](../encargos/LIVE-001-R02-cierre-documental-v1.0.md)) |
| Base de requisitos | [Definición v0.33](../producto/proyecto-live-definicion-v0.33.md). Sus decisiones siguen vigentes |
| Estado | **Provisional** en las materias jurídicas y contractuales abiertas. LIVE-001 no está cerrado |
| Fecha de la evidencia | Consultas web del 10-10-2026 (R01) y auditoría de ChatGPT entregada con R02 (10-10-2026). Redacción: 16-10-2026 |
| Historial | [v1.0](LIVE-001-resultado-v1.0.md), [v1.1](LIVE-001-resultado-v1.1.md) y [registro R01](LIVE-001-R01-registro-correcciones.md): se conservan sin cambios. Correcciones de esta versión: [registro R02](LIVE-001-R02-registro-correcciones.md) |

> Este documento sustituye a la v1.0 y a la v1.1 **solo** como fuente de las conclusiones vigentes. No es asesoría jurídica, contable ni financiera. No sustituye la validación profesional ni la aceptación escrita de proveedores. Separar el casino, permitir retiros al jugador o limitar usos del saldo son propuestas que el promotor **no ha elegido**.

## 0. Cómo leer esta síntesis

**Vigente, histórico y no comprobado.**

- Las conclusiones de esta v1.2 son las vigentes.
- La v1.0 y la v1.1 quedan como historial y como detalle de tablas, fuentes y cálculos. No heredan validez por estar archivadas: lo que no se repite aquí con su evidencia no se da por establecido.
- Lo que ninguna revisión comprobó figura como **evidencia insuficiente (no reverificado)**.

**Procedencia de la evidencia.**

| Etiqueta | Significado |
| --- | --- |
| **[LC]** | Leído por Claude: solo archivos locales (definición v0.33, encargos e informes) |
| **[AG]** | Aporte de la auditoría de ChatGPT descrito en el encargo R02. **Claude no lo ha cotejado**: el entorno siguió bloqueando esos dominios el 16-10-2026 (proxy `CONNECT 403`; lector web `ENOTFOUND`) y R02 prohíbe repetir búsquedas equivalentes |
| **[EB]** | Extracto o texto amplio devuelto por un buscador en R01 (10-10-2026). No equivale a leer el documento |
| **[INT]** | Interpretación de este informe |
| **[RP] / [CC]** | Revisión profesional o confirmación contractual pendiente |
| **[Supuesto]** | Valor de cálculo sin fuente; editable |

En esta entrega Claude **no leyó directamente ninguna fuente externa**.

**Categorías por requisito.**

- **Incompatibilidad documentada**: un texto recuperado impide el requisito tal como está definido. Se indica su ámbito y si es provisional.
- **Ruta condicionada**: hay una vía documentada con condiciones identificadas.
- **Evidencia insuficiente**: depende de inferencias, fuentes secundarias o no cotejadas, o pruebas no hechas.

Una inferencia jurídica pendiente de dictamen nunca se clasifica como incompatibilidad.

## 1. Resumen

1. **Retiro del jugador.** Con la evidencia de R01 se mantiene, como **conclusión provisional**, que impedir el retiro es incompatible con el régimen colombiano estudiado: Ley 643/2001, art. 38, y Acuerdo 08/2020 de Coljuegos, título 1, juegos operados por internet. La conclusión vale si el casino de LIVE queda clasificado en ese régimen, tanto en la ruta A (LIVE concesionaria) como en la B (socio autorizado). Siguen pendientes la clasificación del circuito completo, el cotejo con el Diario Oficial y la vigencia.
2. **Ganancias en regalos o contenido.** Es una conclusión **separada** de la anterior y queda en **evidencia insuficiente**. Los extractos no muestran una prohibición literal ni una figura que lo habilite. La inferencia de riesgo alto en contra no demuestra prohibición, y la falta de prohibición literal tampoco demuestra permiso. El uso que pidió el promotor se conserva como requisito pendiente de viabilidad.
3. **Monedas publicitarias en el casino.** La figura del bono del concesionario es una **hipótesis evaluada**, pendiente de confirmar para remunerar tareas publicitarias externas. No es una vía acreditada ni la única posibilidad jurídica.
4. **Stripe.** Hay tres capas distintas:
   - política pública: contenido adulto y casino entre los negocios prohibidos;
   - contrato general: cláusula de preaprobación escrita;
   - producto Treasury: solo para empresas, no billeteras de consumidores.

   No se acreditó ninguna aceptación aplicable a LIVE [AG].
5. **Payoneer.** Su lista actual prohíbe los servicios adultos y los juegos de azar. Una nota final permite preaprobar *algunas* actividades tras revisión discrecional, sin autorizar este modelo. No hay aceptación acreditada [AG].
6. **Mastercard.** Ya hay evidencia del cuerpo de la §9.4.1 de la SPME (04-08-2026) [AG]. Sus controles no fijan plantilla ni demuestran que una automatización concreta cumpla. La administración única sigue en evidencia insuficiente por diseño, pruebas y condiciones del adquirente. Visa no tiene evidencia.
7. **Edad.** El Decreto 0769/2026 pide una verificación acorde con el riesgo y minimización estricta de datos [AG]. Se mantiene la decisión del promotor de verificar la mayoría de edad al registrarse, sin incompatibilidad identificada.
8. **Grabación en Cloudflare.**
   - La grabación técnica del proveedor es una decisión pendiente de privacidad y arquitectura, no una incompatibilidad demostrada.
   - El almacenamiento se contrata por bloques. Las grabaciones publicadas a 12 h cuestan US$55 (no 54) y el cartel, US$15 (no 12).
9. **Carga humana.** Las 20, 40 y 60 h semanales son **supuestos**: el promotor solo confirmó atención según su disponibilidad, sin horario fijo. La guardia es la mayor demanda solo dentro del cálculo que excluye la revisión de grabaciones publicadas y otros volúmenes no definidos.

## 2. Conclusiones por requisito decisivo

| Requisito [RC] | Categoría | Evidencia y procedencia | Qué falta |
| --- | --- | --- | --- |
| Impedir que el jugador retire sus ganancias | **Incompatibilidad documentada, provisional**, en el régimen estudiado y si el modelo queda clasificado en él | Ac. 08/2020: art. 1.4.2 (orden de pago en ≤ 72 h, sin cobro, aviso de negativa), 1.5.2, 1.5.4 y 1.5.5 (el medio puede no ser bancario) [EB, réplicas]. En la ruta B, la obligación del socio se apoya en la definición de operador y en una copia no oficial del contrato C1747 [EB] | Clasificación del circuito; cotejo con el D.O. 51.452; anexo del Ac. 01/2026; Ac. 02/2026 y proyecto 307313 |
| Usar ganancias en regalos, intervalos, publicaciones o suscripciones | **Evidencia insuficiente** | Art. 1.5.9 solo prohíbe transferir entre cuentas de juego de jugadores distintos. Única aplicación no bancaria hallada en los extractos: compra de otros juegos autorizados (art. 1.8.1, número confirmado solo por buscador) [EB]. Riesgo alto en contra [INT] | Dictamen o consulta a Coljuegos (Q1) |
| Monedas compradas usables en el casino | **Evidencia insuficiente** | Art. 1.5.10: pesos; sin transacciones en monedas virtuales [EB]. Si las monedas LIVE son «moneda virtual» es interpretable | Q3 |
| Monedas publicitarias usables en el casino | **Evidencia insuficiente** | Bono del concesionario: hipótesis. El art. 1.1.3 lo liga a la participación en partidas y lo considera premio al acreditarse [EB]. Tope (Res. 20250022644): estado desconocido | Q6; confirmación de un concesionario |
| Casino real desde el lanzamiento: tragamonedas y ruleta | **Ruta condicionada** | Concesión propia (A) o socio autorizado (B); art. 1.3.1 [EB] | Concesión o contrato B2B; certificación; plazo; retiro obligatorio |
| Juegos rápidos y dados | Premio inmediato: **ruta condicionada**. Dados: **evidencia insuficiente** | Art. 1.3.12 modificado en 2026 según la réplica de Medellín [EB]. ChatGPT abrió la ficha del Ac. 01 (publicada el 08-05-2026), pero no pudo leer el anexo [AG] | Anexo y D.O.; Q4 |
| Recargas de monedas, aportes directos y pagos a creadores en US, ES y VE | **Evidencia insuficiente** | Stripe y Payoneer: lista pública prohibitiva y excepción discrecional, sin aceptación [AG]. Wise, Bold, adquirentes adultos y Paxum: no reverificados [EB] | LIVE-006 |
| Pagos a creadores residentes en Colombia | **Ruta condicionada** [CC] | Transferencia desde cuentas de una operadora colombiana [EB] | País de la operadora (P6); vinculación bancaria |
| Contenido sexual explícito en la web | **Evidencia insuficiente** (no reverificado) | Ley 679/2001 y Decreto 1524/2002 sin reverificar. Mastercard §9.4.1 exige registro, acuerdos, verificación y revisión previa [AG] | Dictamen; adquirente |
| Verificación de mayoría de edad al registrarse | **Evidencia insuficiente**, sin incompatibilidad identificada | Decisión del promotor (v0.33) [LC]. Decreto 0769/2026, art. 2.2.31.2.6 lit. c) [AG] | Cotejo; sujetos obligados; SIC; método y proveedor (Q14) |
| Un único administrador; chat según disponibilidad | **Evidencia insuficiente** | SPME §9.4.1 sin plantilla [AG]; horas del promotor no declaradas [LC] | Diseño, pruebas (LIVE-002), adquirente (Q10), Visa, P5 |
| Multistream desde un celular (conjunto) | **Evidencia insuficiente** | Video a Bigo: **ruta condicionada** (guía oficial de PC) [EB]. TikTok y BuzzCast: sin comprobar. Chat y regalos: sin API encontrada | LIVE-002; respuestas de los destinos |
| Parte pública hacia TikTok y Bigo con contenido sexual o promoción del casino | **Incompatibilidad documentada** | Normas comunitarias de ambos destinos (versiones 2023–2025) [EB] | Vigencia de las versiones |
| Grabación opcional del creador y su publicación | **Ruta condicionada** | Decisión de la v0.33 [LC]; almacenamiento por bloques [AG] | Aceptación del contenido por el proveedor (Q12) |
| App de tienda con el mismo contenido explícito | **Incompatibilidad documentada** | Políticas de Google Play y Apple 1.1.4 [EB] | Otro producto para tiendas |
| 5 creadores, 50 espectadores, más de 8 h al día | **Ruta condicionada** [CC] | Tarifas de video por arquitectura [EB, AG] | Egress RTMP; aceptación del contenido |

## 3. Evidencia por tema

### 3.1 Casino

**Ámbito.**

- Solo se estudió el título 1 del Acuerdo 08/2020 y la Ley 643/2001, en réplicas de Medellín, Superservicios y SISJUR [EB], sin cotejo con el D.O. 51.452.
- La v0.33 deja abierta la clasificación jurídica del circuito completo: dinero → monedas → apuestas → ganancias → regalos o contenido → creador → banco [LC]. Por eso el retiro obligatorio es provisional y no se extiende a «cualquier casino».

**Vigencia.**

- ChatGPT abrió la ficha oficial del Acuerdo 01 de 07-05-2026, publicada el 08-05-2026. No pudo leer el anexo por su tipo de respuesta, y la ficha no permite afirmar el alcance de todos sus artículos [AG].
- La réplica de Medellín anota un cambio en el art. 1.3.12 y no muestra notas de 2026 en los artículos de dinero [EB]. Esto no descarta otros cambios.
- El Acuerdo 02/2026 y el proyecto 307313 siguen sin identificar.

**Monedas publicitarias.** Un bono por tareas ajenas al juego no encaja literalmente en la definición del art. 1.1.3 [INT]. Si se acreditara como crédito, sería premio retirable. La remuneración en dinero ya prevista en la v0.33 queda fuera del régimen de juego, salvo que la tarea promocione el casino o dé acceso a un juego con premio [RP]. Esa vía no resuelve el uso de las monedas en el casino.

### 3.2 Pagos

**Stripe [AG].**

| Capa | Documento | Qué consta | Qué no acredita |
| --- | --- | --- | --- |
| Política pública | *Restricted Businesses*, actualización 22-09-2026 | Contenido adulto y casino en el apartado de **prohibidos**. El de restringidos es otro | Que la aprobación prevista para restringidos alcance a los prohibidos |
| Contrato general | *Stripe Services Agreement*, modificación 28-09-2026, §1.2(a)(ix) | Excepción general mediante preaprobación escrita | Que Stripe apruebe a LIVE, su casino o la combinación. Entidad y términos regionales: sin identificar (la ruta /us/ redirigió al contrato general) |
| Producto | *Treasury for platforms requirements* | Solo usos empresariales; sin cuentas de consumidores; casino y adulto prohibidos | Una billetera de espectadores o jugadores |

**Payoneer [AG].** La lista oficial actual enumera los servicios adultos y los juegos de azar. Su nota final permite preaprobar algunas actividades tras revisión discrecional, sin decir cuáles. Hay que distinguir tres planos:

- la lista pública;
- la posible excepción;
- la aceptación real por producto, empresa, actividad y territorio, que no consta.

La cifra comercial de países no acredita cobertura.

**Otros proveedores.** Wise, Bold, los adquirentes especializados en adulto y Paxum no se reverificaron. Entre los candidatos investigados no se identificó aceptación pública del modelo completo. Esto no prueba que no exista ningún proveedor. La aceptación de un tramo no legitima el circuito, y cada actividad debe declararse con su categoría real.

### 3.3 Moderación y administración única

**SPME de Mastercard, versión 04-08-2026, §9.4.1, páginas impresas 114–115 [AG].** Contempla:

- registro del comercio por el adquirente;
- acuerdos y consentimiento;
- verificación de creadores y personas representadas;
- revisión previa del contenido;
- control del directo para supervisarlo y retirarlo en tiempo real;
- resolución de quejas en siete días hábiles.

**Lo que no establece.** No fija un número de empleados ni prueba que una automatización concreta cumpla. Se aplica en la medida en que LIVE acepte Mastercard mediante un adquirente [INT]. Los siete días hábiles son un plazo de resolución que el procedimiento debe garantizar aunque el administrador no esté disponible [INT].

### 3.4 Edad

**Decreto 0769/2026, art. 2.2.31.2.6 lit. c), en la compilación de MinTIC [AG].** Pide verificación acorde con el riesgo y minimización estricta, bajo el régimen de datos y las instrucciones de la SIC. No selecciona proveedor, procedimiento biométrico universal ni retención indefinida.

Se distinguen cuatro ámbitos:

| Ámbito | Base |
| --- | --- |
| Espectadores | Decisión del promotor: verificar al registrarse [LC] |
| Creadores y personas que aparecen | Exigencia de la red (§9.4.1) [AG] y propuesta de la v0.33 [LC]. No es decisión del promotor |
| Jugador del casino | Arts. 1.5.2 y 1.5.5 y SIPLAFT, obligaciones del concesionario [EB] |
| Participantes de campañas | Propuesta no elegida |

### 3.5 Video y grabación

**Cloudflare [AG].**

- *Start a live stream* (07-10-2026): `recording.mode=automatic` habilita la reproducción HLS/DASH y graba; con `off` no graba ni hay esa reproducción. `deleteRecordingAfterDays` admite de 30 a 1.096 días.
- *Pricing* (08-09-2026): almacenamiento prepagado en bloques de US$5 por 1.000 minutos al mes. Anuncia facturación de la entrega WebRTC desde el 15-10-2026; no se verificó si ya se aplica ni con qué tarifa.

**Tres conceptos distintos.** La v0.33 dice que no se eligió grabar ni publicar todos los directos: es una opción no seleccionada, no una prohibición [LC].

1. Grabación técnica del proveedor.
2. Grabación voluntaria del creador.
3. Publicación de esa grabación para los seguidores.

La grabación técnica obliga a decidir la retención por un tercero de video sexual explícito [RP] y su aceptación por el proveedor [CC].

## 4. Cálculos corregidos

| Cálculo | Fórmula | Resultado | Límite |
| --- | --- | --- | --- |
| Grabaciones publicadas a 12 h | 10 % [Supuesto] × 108.000 min = 10.800 → 11 bloques | **US$55** al mes (lineal: 54) | Acumulativo; con capacidad compartida, incremento de US$50–55 |
| Ídem a 24 h | 21.600 → 22 bloques | US$110 | Ídem |
| Pruebas de cartel | 20 × 2 h [Supuesto] = 2.400 min → 3 bloques | **US$15** (lineal: 12) | Incremento compartido de US$10–15 |
| Capacidad compartida (ejemplo) | 3.600 + 10.800 + 2.400 = 16.800 → 17 bloques | US$85, frente a 90 redondeando cada partida | Redondear el total de la cuenta y calcular el incremento |
| Retención técnica a 12 h | 1 día: 3.600 → 4 bloques; 30 días: 108.000 → 108 | US$20 / US$540 | 1 día exige borrado por API, sin probar; 30 días es el mínimo del borrado automático |
| Umbral de la referencia de US$3.000 (12 h, arquitectura RTMP con Cloudflare, sin moderación humana) | 2.678 + 324·f + S > 3.000 | Con S = 20: **f > 0,9321**. Si las publicadas se guardan en la misma cuenta, baja a 0,7623 el mes 1 y desde el mes 6 se supera con f = 0 | Partidas de KYC, IA y servidores no reverificadas; egress sin cotizar |
| Guardia sin cubrir | 360 o 720 − 40 × 52 ÷ 12 [Supuesto] | 186,7 h (12 h/día) / 546,7 h (24 h/día) | Cotas mínimas del escenario: suponen que todas las horas del administrador caen en horas de directo |
| Guardia frente a trabajo (12 h, parámetros centrales) | 135 + 86,75 + 180 (revisión de grabaciones con r = 1 [Supuesto]) | 401,75 h > 360 h de guardia | Con la revisión, el trabajo supera a la guardia |

**Cuatro magnitudes que no deben mezclarse.**

- *Horas con servicio*: horas con algún directo.
- *Horas de trabajo*: síncronas, asíncronas y revisión.
- *Guardia*: estar localizable para intervenir.
- *Equivalentes de jornada*: horas sin cubrir ÷ 162,75. No son una plantilla ni un calendario de turnos.

**Cifras sin cambio, reproducidas por ChatGPT [AG] con las entradas de la v1.1:**

| Cálculo | Resultado |
| --- | --- |
| Fijo de la ruta A | 811 × COP 1.750.905 = COP 1.419.983.955 por año (referencia 2026) |
| Equivalente mensual contable | COP 118.331.996,25 |
| Efectivo parcial de arranque | COP 2.049.183.794,55 (1 % sobre el fijo y modalidad de cobertura pendientes) |
| Entrega en Cloudflare | US$1.080 / 2.160 |
| IVS | US$1.608–1.824 / 3.156–3.588 |
| LiveKit | US$2.225 / 4.600,4 (sin egress) |

Estas comprobaciones verifican la aritmética. **No validan** precios, presupuesto, operación, permisos ni factibilidad. La referencia de US$3.000 no es un límite de diseño. El fijo de una concesión propia no es un costo inevitable de una asociación sin cotización.

## 5. Pendientes priorizados

1. **Texto y vigencia de las reglas de retiro y bonos**:
   - cotejo de los arts. 1.1.3, 1.4.2, 1.5.2, 1.5.4, 1.5.5, 1.5.9, 1.5.10 y 1.8.1 con el D.O. 51.452;
   - anexo y publicación del Ac. 01/2026;
   - identificación del Ac. 02/2026 y del proyecto 307313;
   - estado de la Res. 20250022644.
2. **Clasificación jurídica del circuito completo** de la v0.33 (Q2 ampliada, LIVE-005).
3. **Aceptación de pagos** (LIVE-006):
   - Stripe: entidad, términos regionales y preaprobación por actividad y tramo;
   - Payoneer: alcance de la nota;
   - Wise, Bold y adquirentes adultos;
   - banco para la operadora colombiana.
4. **Moderación**: condiciones escritas del adquirente (Q10), Visa, horas declaradas por el promotor (P5) y pruebas de detección y corte.
5. **Edad**: cotejo del decreto, sujetos obligados, instrucciones de la SIC, método y proveedor (Q14).
6. **Video**:
   - egress RTMP;
   - aceptación del contenido;
   - facturación WebRTC;
   - decisión sobre la grabación técnica;
   - borrado por API.
7. **Capital, impuestos y garantías**: provisionales hasta cotejar la Res. 20161200025334 consolidada, el control del DL 0240/2026 y una TRM certificada.
8. **Cotejo propio** de las fuentes leídas por ChatGPT cuando el entorno permita el acceso.

## 6. Preparación de los siguientes encargos

**LIVE-002: prueba técnica, sin dinero real.**

- Captura web en Android, salida RTMP a destinos con clave (Bigo primero; TikTok solo si la cuenta obtiene clave) y multiventana.
- Paso a sala exclusiva comprobando que no salen tramas después de T.
- Reconexión en 1 minuto.
- Comportamiento de `recording.mode` y borrado por API.
- Detección y corte con contenido neutral, saldo ficticio y cuentas autorizadas.
- El diseño de prueba no autoriza cobros ni apuestas reales.

**LIVE-005: expediente de consulta jurídica (preparar, no enviar).**

- Descripción completa del circuito: diagrama de la v1.1, §4.1.
- Preguntas cerradas: Q1–Q9 y Q14 de la v1.1, §8.1, con Q2 ampliada a la clasificación y Q6 a «otra figura admisible».
- Réplicas y extractos que se adjuntan.
- Datos que faltan: país de la operadora, volúmenes y decisión sobre la grabación técnica.

**LIVE-006: expediente de proveedores (preparar, no enviar).**

- Preguntas Q10–Q13 de la v1.1, más la preaprobación de Stripe por entidad y tramo, el alcance de la nota de Payoneer y el método de verificación de edad.
- Por cada proveedor: producto, entidad, actividad declarada con su categoría real y territorio.

La arquitectura de saldos debe conservar el uso de ganancias que pidió el promotor como requisito pendiente de viabilidad. No se construirá producción alrededor de una alternativa no elegida.

## 7. Trazabilidad

| Documento | Papel |
| --- | --- |
| [Definición v0.33](../producto/proyecto-live-definicion-v0.33.md) | Base de requisitos (copia fiel; SHA-256 en [SHA256SUMS](../producto/SHA256SUMS)) |
| [Encargos LIVE-001, R01 y R02](../encargos/) | Instrucciones originales (copias fieles; [SHA256SUMS](../encargos/SHA256SUMS)) |
| [v1.0](LIVE-001-resultado-v1.0.md) | Informe inicial; histórico |
| [v1.1](LIVE-001-resultado-v1.1.md) | Verificación R01; histórico y detalle de auditoría, matrices y fuentes |
| [Registro R01](LIVE-001-R01-registro-correcciones.md) / [Registro R02](LIVE-001-R02-registro-correcciones.md) | Cambios entre versiones |
| [Estado del proyecto](../estado/ESTADO-PROYECTO.md) | Punto de entrada del proyecto |
