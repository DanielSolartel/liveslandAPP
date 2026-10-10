# LIVE-001-R01 — Registro de correcciones v1.0 → v1.1

| Campo | Valor |
| --- | --- |
| Informe corregido | `docs/investigacion/LIVE-001-resultado-v1.0.md` (se conserva sin cambios; commit `99603150aff28fc6ee0edd6d6cc391ea1e44a116`) |
| Revisión | `docs/investigacion/LIVE-001-resultado-v1.1.md` |
| Fecha | 10-10-2026 |
| Rama | `claude/new-session-tzsjwj` |

**Acceso real.** Solo se usó un buscador web; ningún documento se leyó íntegro. El cupo de búsquedas se agotó durante la verificación, y las revisiones escépticas de los bloques C, D, E y F no tuvieron búsquedas propias. El detalle está en la v1.1, §0.2 y §11.

## Correcciones que cambian la evaluación

| # | Tema | v1.0 | v1.1 | Detalle en la v1.1 |
| --- | --- | --- | --- | --- |
| 1 | Sin retiro al jugador | Incompatible según la fuente, pendiente de lectura | **Incompatibilidad documentada sobre réplicas** (Ac. 08/2020, arts. 1.4.2, 1.5.2, 1.5.4). Base corregida: la regla «a solicitud del jugador» solo apareció en una copia de 2016. El medio de retiro puede no ser bancario. Cotejo con el Diario Oficial pendiente | R01A-04/06, R01B-02/04 |
| 2 | Ganancias para regalos, intervalos, publicaciones y suscripciones | Incompatibilidad documentada | **Evidencia insuficiente**: inferencia jurídica de riesgo alto. El art. 1.5.9 solo cubre cuentas de juego entre jugadores; la única salida no bancaria documentada es el art. 1.8.1. Consulta Q1 | R01A-05, R01B-03/05 |
| 3 | Monedas compradas en el casino | No comprobado | Evidencia insuficiente (inferencia de riesgo alto: art. 1.5.10; la lista del 1.5.5 es abierta) | R01A-07, R01B-06 |
| 4 | Monedas publicitarias en el casino | Condicionado (bono con tope) | Evidencia insuficiente. Solo cabrían como bono del concesionario, y el bono convertido es **premio retirable**. Tope de estado desconocido | R01A-08, R01B-07 |
| 5 | Acuerdo 01/2026 | Sin análisis | Según réplica y prensa, solo modifica el art. 1.3.12. Acuerdo 02/2026 y proyecto 307313 sin identificar. Acuerdo 02/2022 confirmado | R01A-01/02/14, §3.1 |
| 6 | Derechos de explotación | «15 % de los ingresos»; US$36.500/mes | Fórmula legal exacta (15 % de IB − premios con retorno ≥ 83 %, o 17 % de IB). Fijo de COP 1.419.983.955 por año como referencia 2026, pagado por adelantado. Mensual solo contable. Conversión a US$ retirada del texto de decisión | R01C-01/02/03/11, §5.1–5.2 |
| 7 | Ruta B | «Cualquier ruta de casino» supera la referencia | Sin cifra: la ruta B no es más barata ni más cara hasta tener cotización. El socio puede trasladar costos | R01C-05 |
| 8 | Fiscalidad 2026 | IVA caído; consumo 16 % [NC] | IVA no vigente en 2026 (inferencia; C-079/26). Consumo del 16 % sobre GGR hasta el 31-12-2026, con control constitucional no verificado | R01C-07/08 |
| 9 | Proveedores de pago | «Ninguno acepta…»; Stripe, Payoneer y Wise excluyen | Stripe: adulto prohibido. Stripe-casino y Payoneer: prohibidos salvo aprobación discrecional (evidencia insuficiente). Wise, Bold, especialistas en adulto y Paxum: pendientes. «No se identificó aceptación pública entre los candidatos investigados» | R01D-01 a 12, §4.4 |
| 10 | Retiros de creadores | Condicionado en CO, US y ES | CO: ruta condicionada (operadora colombiana y banco). US, ES y VE: evidencia insuficiente | R01D-12, §4.5 |
| 11 | Moderación y una sola persona | Incompatibilidad documentada; 2–4 personas; brecha «mínima» de 200–620 h | Evidencia insuficiente: bloqueo contractual. Mastercard (extractos) no fija plantilla. La restricción es la guardia (186,7 h sin cubrir a 12 h y 546,7 h a 24 h, con 40 h semanales). Unidad laboral sin auxilio, con el auxilio como partida aparte | R01E-01/02/08/10, §5.4 |
| 12 | Multistream | Parcialmente | No comprobado en conjunto. Bigo: viable bajo condiciones. TikTok y BuzzCast: no comprobados. Chat y regalos sin API encontrada. Contenido sexual o casino hacia los destinos: incompatibilidad documentada | R01F-01 a 11 |
| 13 | Costo de video | US$1.100–1.700 | Por arquitectura y proveedor (A: WHIP; B: RTMP/SRT; C: propio). Egress RTMP sin cotizar. La referencia de US$3.000 no puede evaluarse sin fijar egress, f, retención y moderación | R01F-06/12–18, §5.3, §5.5 |
| 14 | App en tiendas | Incompatible según la fuente | Incompatibilidad documentada (Google Play; Apple 1.1.4) | R01G-02 |
| 15 | Verificación de edad | Condicionado | Decreto 0769/2026 confirmado por prensa; texto pendiente (evidencia insuficiente) | R01G-01 |

## Correcciones de fuente o redacción

- **F02 y F03.** Las tarifas están en la ley y en el reglamento. Se rechazaron las correcciones del verificador que quitaban F03: el 15 % y el 83 % constan en los arts. 1.1.5 y 1.1.10.
- **Fuentes sustituidas o divididas:**
  - F04 se sustituye por los arts. 1.4.2 y 1.5.5.
  - F13 por la C-079/26.
  - F14 por la DIAN.
  - F16 por los decretos.
  - F25 se divide en tres (AN 5196, SPME 9.4.1 solo índice, comunicado de 2021).
  - F58 se sustituye por la página de AWS.
  - F84 por la Ley 2101/2021.
- **Fuentes reetiquetadas:**
  - F17 pasa a [Supuesto].
  - F28 tiene alcance por entidad.
  - F35 (Wise, Reino Unido) y F36 (PayPal, Malasia) son políticas regionales.
  - F37 (Paxum) es secundaria y se elimina su tarifa.
- **Ocupación media.** Pasa a sensibilidad hipotética y sale de las conclusiones.
- **Preguntas de decisión.** P1 se divide en P1a (retiro) y P1b (regalos). P2 queda en COP. P3 añade el uso de monedas en el casino. P5 usa las lecturas A y B con guardia. P7 advierte que el bono convertido es premio retirable.
- **Alternativas.** La «ruta mejor respaldada» de la v1.0 deja de presentarse como preferente: separar el casino es una alternativa no elegida (v1.1, §7).

## Pendientes principales

- Texto íntegro del Acuerdo 01/2026 y cotejo con el Diario Oficial.
- Res. 20161200025334 consolidada (patrimonio y garantías).
- Sección 9.4.1 de Mastercard y requisitos de Visa.
- Wise, Bold y la lista vigente de Payoneer.
- Clave de TikTok para software de terceros y documentación de BIGO para móvil.
- Certificado de la TRM.
- Texto del Decreto 0769/2026.
- Dictámenes y respuestas escritas de LIVE-005 y LIVE-006: consultas Q1 a Q14 de la v1.1, §8.1.

La investigación no sustituye la validación profesional ni la aceptación escrita de los proveedores.
