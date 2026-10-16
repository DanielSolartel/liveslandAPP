# LIVE-001-R02 — Registro de correcciones v1.1 → v1.2

| Campo | Valor |
| --- | --- |
| Encargo | [LIVE-001-R02 v1.0](../encargos/LIVE-001-R02-cierre-documental-v1.0.md) |
| Resultado | [LIVE-001-resultado-v1.2](LIVE-001-resultado-v1.2.md): síntesis vigente, provisional |
| Rama | `claude/new-session-tzsjwj` (según R02, también la predeterminada; no se cambió ni se creó otra) |
| Base revisada | `8f04389db77932f4b6da11641c0efeb7cc57aa3e`, con el árbol limpio y la rama local igual a la remota |
| Commits de esta entrega | `5821bc069f3030f742170c549128cc5baf7c9bf6` (copias de los originales) → `c897cf9e3896920929f0086deabbd7fc8eacec5a` (borrador de v1.2, registro, estado y README) → commits con las correcciones de la revisión crítica y de la revisión adversarial final; el SHA final se informa en la entrega. Todos son de esta misma sesión de Claude; no hay trabajo ajeno posterior a la base |
| Históricos | v1.0, v1.1 y registro R01 sin cambios (`git diff 8f04389` vacío sobre los tres) |
| Fecha | 16-10-2026. La evidencia externa procede del 10-10-2026 |

## Procedencia de la evidencia de esta entrega

- **Leído por Claude:** solo archivos locales.
  - Definición v0.33; encargos LIVE-001, R01 y R02; informes v1.0 y v1.1; registro R01.
  - Un flujo de agentes apoyó la lectura. Ocho agentes de mapeo, uno por hallazgo, declararon haber leído completos el encargo R02, la v1.0, la v1.1, el registro R01 y la v0.33. Otro extrajo de la v0.33 las decisiones y las propuestas. Un crítico revisó los mapeos y el borrador `c897cf9`.
- **No leído por Claude:** ninguna fuente externa. El 16-10-2026, hacia las 18:26 UTC:
  - Claude probó una vez con `curl` cada una de las 9 URL que cita R02: ninguna conectó (código 000), y el proxy registró el rechazo del `CONNECT` con 403.
  - Con el lector web probó 2 de ellas (`stripe.com/legal/ssa` y la página *Start a live stream* de Cloudflare): `ENOTFOUND`.
  - No se repitieron búsquedas equivalentes. `stripe.com` y `normograma.mintic.gov.co` no figuran entre los dominios que la v1.1 (§0.2) pidió permitir.
- **Aporte de la auditoría de ChatGPT** (encargo R02, sin texto completo de la auditoría). Cada dato [AG] es una paráfrasis de estas líneas del encargo:
  - Stripe: líneas 43–45;
  - Payoneer: 53;
  - Mastercard: 61–63;
  - MinTIC: 71–73;
  - Cloudflare: 81–82;
  - Acuerdo 01/2026: 112.

  Todo queda **pendiente de cotejo propio**. R02 no consigna la fecha de consulta de ChatGPT, la versión de la lista de Payoneer, la fecha de *Treasury* ni la fecha de corte de la compilación de MinTIC, y no trae citas literales. Las comprobaciones de GitHub de R02 §1 son de ChatGPT, no de Claude.
- **Cálculos:** recalculados por Claude con un script local. Coinciden con las cifras que R02 §5 atribuye a ChatGPT.

## Correcciones

| ID | Ubicación afectada | Cambio aplicado | Evidencia | Estado | Motivo de lo pendiente |
| --- | --- | --- | --- | --- | --- |
| **R02-01** Stripe | v1.1: §1 punto 6; R01D-01, 02, 03, 10 y 12; §2.8; §4.4 (filas de Stripe); §4.5; §6.3; §8.1 Q11; §11.1; §12.3 (P01–P07). Registro R01: fila 9 y pendientes | v1.2 §1.4, §2.1 y §3.2: se separan política pública, contrato general y producto (tabla de tres capas). Se retiran «sin excepción publicada» y la «incompatibilidad documentada» del adulto. Fórmula única con Payoneer: prohibición pública, excepción discrecional de base distinta, ninguna aceptación acreditada, evidencia insuficiente. Se evita «salvo preaprobación». Treasury no es billetera ni custodia de consumidores. Global Payouts hacia Colombia queda como cobertura en vista previa, no como admisión. Expediente: Q11-S | [AG] *Restricted Businesses* (22-09-2026); SSA §1.2(a)(ix) (28-09-2026); *Treasury requirements* (sin fecha indicada). [EB] P01–P06 de R01 | Aplicada con límite | Cotejo propio bloqueado. Entidad y términos regionales sin identificar (/us/ redirigió al contrato general). Ninguna preaprobación consta (LIVE-006) |
| **R02-02** Payoneer | v1.1: §1 punto 6; R01D-02, 04, 05, 10 y 12; §2.8; §4.4; §6.3; Q11; §11.1; §12.3 (P08, P12 y P14). Registro R01: fila 9 y pendientes | v1.2 §1.5, §2.1 y §3.2: la lista vigente pasa a ser la base. Se distinguen lista pública, posible excepción («algunas actividades»; R02 no indica cuáles ni en qué condiciones) y aceptación real. No se equipara la nota con la cláusula del SSA de Stripe. El PDF sin fecha queda como antecedente. La cifra «190+ countries» no acredita cobertura. Expediente: Q11-P | [AG] *Prohibited transaction list* (versión no consignada). [EB] términos por entidad de R01 | Aplicada con límite | Cotejo propio, versión de la lista, alcance de la nota y aceptación concreta (LIVE-006) |
| **R02-03** Mastercard | v1.1: §1 punto 7; R01E-01, 02, 04, 05, 06, 10 y 11; R01G-04; §2.8; §3.3; §5.4; §6.3; Q10; §11.1; §12.4 (M01–M03, M14 y M15); §12.6 X08. Registro R01: fila 11, línea 40 (F25 dividida con «SPME 9.4.1 solo índice») y pendientes | v1.2 §1.6 y §3.3: la evidencia del índice y de las paráfrasis de 2021 se sustituye por la SPME de 04-08-2026, §9.4.1, pp. impresas 114–115, sin citas literales. Sus controles no fijan plantilla ni acreditan una automatización. La administración única sigue en evidencia insuficiente por diseño, pruebas y adquirente. La apelación y el cese de la aceptación solo constan en 2021. Visa, aparte. Expediente: Q10 nueva (cómo se acreditan los controles; automatización; guardia; moderadores; grabaciones; Visa) | [AG] SPME §9.4.1. [EB] índice, AN 5196 y comunicado de 2021 como antecedentes | Aplicada con límite | Cotejo propio; vigencia a 16-10-2026; Visa; condición del adquirente (Q10); pruebas (LIVE-002); horas del promotor (P5) |
| **R02-04** Edad | v1.1: §0.2 (dominio no incluido entre los que se pidió permitir); §1 punto 10; R01G-01; §2.8; §3.3; §4.4; §6.3; §8.1 Q14; §9 (fila «§2 fila 20»); §11.1; §12.6. Registro R01: fila 15 y pendientes | v1.2 §1.7, §2.1 y §3.4: el decreto pasa de prensa a la compilación de MinTIC leída por ChatGPT (art. 2.2.31.2.6 lit. c), que «contempla» verificación acorde con el riesgo y minimización estricta. Sujetos obligados, sin identificar. Se mantiene la decisión del promotor. Se separan espectadores, creadores y personas que aparecen (condición de la red, no requisito del promotor), jugador del casino y participantes de campañas. Expediente: Q14 reformulada sin «método exigido» y Q18 para proveedores | [AG] compilación de MinTIC (fecha de corte no indicada). [LC] v0.33. [EB] reglas del casino | Aplicada con límite | Cotejo propio; sujetos obligados; vigencia; instrucciones de la SIC; método y proveedor (Q14 y Q18) |
| **R02-05** Cloudflare | v1.1: R01F-14, 17 y 18; §5.3; §5.5; §5.6; §10; §11.1; §12.5 (V23 y V41). v1.0 §7.3 y §8.6 (históricos) | v1.2 §1.8, §2.1, §3.5 y §4: se separan grabación técnica, grabación del creador y publicación. «Choca con la v0.33» pasa a «decisión pendiente de privacidad y arquitectura». Bloques: US$55 en lugar de 54 y US$15 en lugar de 12 como capacidad nueva aislada; acumulación de las publicadas; con capacidad compartida se redondea el total. Umbral f > 151/162 ≈ 0,9321 sin otras grabaciones, más bajo con ellas. Retención de 1 día condicionada al borrado por API. La grabación opcional del creador pasa a evidencia insuficiente (revisión previa, aceptación, dictamen de datos). Expediente: Q12 | [AG] *Start a live stream* (07-10-2026) y *Pricing* (08-09-2026). [LC] v0.33 sobre la grabación | Aplicada con límite | Cotejo propio; facturación WebRTC desde el 15-10-2026; egress; aceptación del contenido (Q12); dictamen de datos; pruebas (LIVE-002) |
| **R02-06** Carga humana | v1.1: §1 punto 7; R01E-05 y 10; §5.4; §5.5; §6.3; §7 (7a y 7b); §8.2 P5; §10. Registro R01: fila 11 | v1.2 §1.9 y §4: las 20/40/60 h son supuestos también en el resumen; se cita la confirmación de la v0.33 (según disponibilidad, sin horario fijo). Se separan horas con servicio, trabajo, guardia y equivalentes de jornada. 186,7 y 546,7 h son resultados del escenario (40 × 52 ÷ 12; meses de 30 días). La revisión de grabaciones (r = 1, supuesto) se muestra en los dos sentidos: con parámetros bajos domina la guardia; con centrales y altos, el trabajo. Sin dominancia general. Expediente: P5 sin cifras supuestas | [LC] v0.33 y v1.1. Recálculo propio. [AG] cifras reproducidas | Aplicada con límite | Horas que declare el promotor; proporción y método de revisión; condición del adquirente; si la guardia es tiempo de trabajo [RP] |
| **R02-07** Casino | v1.1: §1 puntos 1–4 (líneas 83–104); R01A-04, 06, 08 y 14; R01B-02, 03, 04, 05, 07, 12, 15 y 23; §3.1–3.2; §4.1 (diagrama, línea 469); §4.2 (b1, e2 y g); §6.1; §6.3; §7 (alternativas 0 y 4); §8.1 Q2 y Q6; §8.2 P1a y P7; §11.1; §12.1 N05. Registro R01: líneas 16, 17, 19, 20 y 54 | v1.2 §1.1–1.3, §2.1 y §3.1: el retiro se acota al régimen estudiado y al modelo que se clasifique en él, como conclusión provisional; no se extiende a «cualquier casino». Las ganancias en regalos o contenido no se tratan como permitidas ni como prohibidas. El bono es una hipótesis evaluada, no una vía acreditada ni la única; los veredictos de R01A-08 y R01B-07 quedan en evidencia insuficiente. «Solo modifica el 1.3.12» se limita a la réplica. La ficha del Ac. 01 es aporte de ChatGPT, con el anexo sin leer. La fila del casino se divide: tragamonedas y ruleta (ruta condicionada), «desde el lanzamiento» y casino en el sitio de LIVE en la ruta B (evidencia insuficiente). Expediente: Q2 ampliada a la clasificación, Q6 con «otra figura admisible», P7 reformulada; P1a se formula tras Q2 | [EB] réplicas del Ac. 08/2020. [AG] ficha 307323 (publicada el 08-05-2026). [LC] v0.33 (clasificación abierta) | Aplicada con límite | Clasificación del circuito; cotejo con el D.O. 51.452; anexo y D.O. del Ac. 01/2026; Ac. 02/2026 y proyecto 307313; Q1, Q2 y Q6 |
| **R02-08** Documento vigente | v1.1: §0.1, §6, §13; repositorio | Nueva v1.2 autosuficiente para las conclusiones decisivas, con historial enlazado y tabla de requisitos no reverificados (§2.2). Pagos a creadores en Colombia pasan a evidencia insuficiente (F40, fuente secundaria no reverificada). Copias fieles de la definición v0.33 y de los encargos LIVE-001, R01 y R02, con SHA-256. Nuevos `docs/estado/ESTADO-PROYECTO.md`, `README.md` y `docs/expedientes/LIVE-005-006-borrador.md` (preparado, no enviado) | [LC] archivos subidos a la sesión; `cmp` y `sha256sum -c` | Aplicada | Originales ausentes: ver [ESTADO-PROYECTO](../estado/ESTADO-PROYECTO.md#5-documentos-originales) |

**Extensión de la v1.2.**

- 3.116 palabras de texto. Método: tokens separados por espacios que contienen al menos una letra o una cifra, sin contar los destinos de los enlaces.
- `wc -w` da entre 3.458 y 3.483 según la configuración regional, porque también cuenta los separadores de tabla.

## Cálculos que cambian

| Cálculo | v1.1 | v1.2 |
| --- | --- | --- |
| Grabaciones publicadas, 12 h | US$54 | US$55 (11 bloques) como capacidad nueva aislada; acumulativo (US$650 al mes 12) |
| Pruebas de cartel | ≈ US$12 | US$15 (3 bloques) aislado; US$10–15 compartido |
| Capacidad compartida | Partidas redondeadas por separado | Total de la cuenta: 16.800 min → 17 bloques = US$85, frente a 90 |
| Umbral de f para superar US$3.000 (12 h, retención de 1 día) | f ≥ 0,932 | f > 151/162 ≈ 0,9321 sin otras grabaciones. Con las publicadas en la misma cuenta: 0,7623 (mes 1), 0,5926 (mes 2); desde el mes 6 se supera con f = 0 |
| Guardia frente a trabajo | La guardia domina en todas las combinaciones | Sin revisión de grabaciones, domina la guardia. Con revisión a r = 1: a 12 h, 314,75 < 360 (bajo), 401,75 y 506,75 > 360 (central y alto); a 24 h, 557,75 < 720, 731,75 y 941,75 > 720 |

El resto de cifras de la v1.1 no cambia. Son comprobaciones aritméticas, no validación de precios, presupuesto ni factibilidad.
