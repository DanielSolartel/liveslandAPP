# LIVE-FASE03-E03 — Registro de resolución de la revisión E03-R02 — v1.2

| Campo | Valor |
| --- | --- |
| Revisión | E03-R02, auditoría independiente de ChatGPT sobre `LIVE-FASE03-E03-v1.1.zip` (no publicada) |
| Base | `90b32ccc85ac9854808f0090d3c1663a4c1b7ab2` |
| Material de la auditoría | `LIVE-FASE03-E03-R02-sondas.zip`, SHA-256 `320ae70c2e8cd64d532de51ae5d4af11eacfd1705cb6f184eb767ffd6547f517`. Su `SHA256SUMS` interno coincide en 6 de 6. Contiene dos sondas descriptivas con los dobles de la v1.1 y un servidor HTTP/SSE de prueba; las sondas no se incorporan al repositorio |
| Resultado | Tres defectos confirmados y corregidos; las ocho correcciones de E03-R01 se conservan |
| Diseño | [Diseño e implementación, v1.2](LIVE-FASE03-E03-diseno-continuidad.md) |
| Revisión anterior | [Registro E03-R01](LIVE-FASE03-E03-R01-registro-resolucion.md) |

**Método.**

1. Se ejecutaron las sondas contra la v1.1 (copia temporal): reprodujeron los tres defectos.
2. Se escribieron 11 regresiones con aserciones en `pruebas/unidad/revision-r02.test.js`.
3. Se ejecutaron sobre el código de la v1.1, con los dobles ampliados: **fallan 9 de 11**. Las dos que pasan comprueban garantías que la v1.1 ya cumplía: un fin atrasado de un canal abandonado y una interrupción ordinaria que no es un cierre.
4. Tras la corrección, 11 de 11 pasan. Las sondas contra la v1.2 confirman el cambio. Las evidencias se entregan en el paquete.

Todo son pruebas con dobles controlados y servidor real o de prueba. **No son pruebas físicas ni con WebRTC real de Android.**

## Causa común

Dos problemas de duración y vigencia de las operaciones asíncronas:

1. **La cola de eventos de cada canal esperaba, sin límite, a las operaciones WebRTC nativas.** Afectaba a `setRemoteDescription`, `createAnswer`, `setLocalDescription` y `addIceCandidate`, y fuera de la cola, a `createOffer` y `setLocalDescription` del emisor.
   - Una promesa nativa sin resolver bloqueaba los eventos posteriores, incluido el `fin` del servidor (R02-01).
   - Bloqueaba también a la recuperación antes de empezar su espera de conexión acotada (R02-02).
2. **El reintento distinguía mal entre una continuación de una generación anterior y un descarte de la generación vigente.** Tras «Nueva sesión», la continuación antigua escribía su mensaje y su evento en la sesión nueva (R02-03).

## E03-R02-01 — Finalización remota bloqueada por una negociación pendiente (bloqueante)

- **Reproducción:** el espectador recibe una oferta, `setRemoteDescription` queda retenida, y el servidor envía `fin` (`expirada`) y cierra el flujo.
- **Resultado anterior (v1.1):** la página no terminaba (`terminado: false`, conexión abierta, sin vista final) hasta liberar la promesa. Entonces enviaba la respuesta y después procesaba el fin.
- **Corrección:** el evento `fin` del canal **vigente** se atiende fuera de la cola, en el acto (`manejarFin`). `terminar` hace lo siguiente:
  - incrementa la generación;
  - cancela la recuperación y **todas las esperas lógicas, incluidas las operaciones nativas acotadas**;
  - cierra la conexión, libera la captura y cierra el canal.

  La continuación pendiente, al reanudarse, ya no es vigente y no envía nada. El resto de las señales siguen serializadas en la cola, en orden. Un `fin` de un canal que ya no es el vigente no se atiende.
- **Distinción de casos:**
  - el fin explícito, la caducidad, el abandono y la detención del servidor son terminales;
  - la salida voluntaria del espectador llega al espectador como fin de su participación y al emisor como `par` ausente con motivo `salida`;
  - una interrupción ordinaria del canal (EOF sin `fin`, error de lectura) **no** es terminal.
- **Regresiones:**
  - fin por caducidad durante `setRemoteDescription` retenida;
  - fin por detención del servidor durante `createOffer` lanzada por la entrada del espectador;
  - fin explícito del emisor durante `createAnswer` y durante `setLocalDescription`;
  - fin seguido de EOF;
  - operación pendiente durante toda la prueba, con 0 esperas lógicas retenidas;
  - fin y bienvenida atrasados de un canal abandonado, sin efecto;
  - EOF sin fin durante una negociación pendiente, que no cierra la sesión.

  En todas se comprueba el estado terminal **antes** de liberar la operación, y que tras liberarla no sale ninguna señal ni se reactiva nada.
- **Resultado posterior:** pasan. Sonda 01 contra la v1.2: la sesión termina antes de liberar la promesa y no sale ningún POST.

## E03-R02-02 — Recuperación sin límite efectivo durante la negociación (bloqueante)

- **Reproducción:** emisor conectado, transporte `failed`, «Reintentar conexión» y `createOffer` retenida.
- **Resultado anterior:** a los 16 s seguía `enCurso: true`, porque la espera de conexión, acotada a 15 s, no llegaba a empezar.
- **Corrección:**
  - **Límite por operación.** Cada operación nativa de negociación se acota con `LIMITES_RECUPERACION.operacionRtcMs` = **4 s**: `createOffer`, `createAnswer`, `setLocalDescription`, `setRemoteDescription` y cada `addIceCandidate`. Las esperas se registran para que `terminar` las cancele con su temporizador.
  - **Al agotarse:** la operación se cancela **lógicamente**, sin afirmar que la promesa nativa se canceló, porque su API no lo permite. Su resultado tardío se ignora. En `createOffer`, `createAnswer`, `setLocalDescription` y `setRemoteDescription`, la conexión de esa negociación se libera y se marca como agotada. En `addIceCandidate` solo se ignora ese candidato y la negociación sigue (precisión de E03-R03). El reintento publica «negociación agotada» por sí solo, rehabilita el botón y admite un reintento nuevo.
  - **Cola no bloqueada:** en el espectador, una negociación agotada libera la cola de la señalización para las señales siguientes.
- **Límites resultantes**, como composición finita de las etapas. Cada etapa tiene su propio límite; el total es su suma en el peor caso:

  | Etapa | Límite |
  | --- | --- |
  | Reapertura | hasta 3 intentos × 5 s de bienvenida + 2 pausas × 1 s = 17 s |
  | Cada operación WebRTC nativa | 4 s |
  | Cada POST | 3 s |
  | Espera de una negociación nueva (espectador) | 10 s |
  | Espera de conexión | 15 s |
  | Comprobación de progreso | 1 lectura de hasta 2 s + 3 × (1 s + 2 s) = 11 s |

  | Recorrido | Peor caso |
  | --- | --- |
  | Emisor, con reapertura | 17 + 15 + 11 = **43 s**. La negociación lanzada por la bienvenida (4 + 4 + 3 s) transcurre dentro de la espera de conexión, que termina antes si se agota |
  | Emisor, con señalización y conexión aparente | comprobación previa 11 + negociación 4 + 4 + 3 + conexión 15 + comprobación 11 = **48 s** |
  | Espectador, con reapertura | 17 + 10 + 15 + 11 = **53 s** |
  | Espectador, por solicitud | 11 + 3 + 10 + 15 + 11 = **50 s** |

  Son límites técnicos. **No son la regla de reconexión de un minuto del producto**, que sigue sin implementarse.
- **Regresiones:**
  - `createOffer` o `setLocalDescription` sin resolver en el reintento del emisor: termina solo por agotamiento, sin esperas retenidas y con la conexión liberada;
  - resolución tardía sin efecto;
  - segundo reintento válido y confirmado;
  - `setRemoteDescription` o `createAnswer` sin resolver en el espectador: agotamiento, respuesta tardía no enviada y cola de señalización desbloqueada;
  - finalización durante una operación acotada: 0 esperas y sin publicación tardía del agotamiento.
- **Resultado posterior:** pasan. Sonda 02 contra la v1.2: a los 16 s, `enCurso: false`, `no-confirmada` y `negociacion-agotada`.

## E03-R02-03 — Operación antigua que contaminaba la sesión nueva

- **Reproducción:**
  1. Sesión 1 con un reintento y `createOffer` retenida.
  2. Finalizar, «Nueva sesión» y crear la sesión 2.
  3. Liberar la operación antigua.
- **Resultado anterior:** la sesión 2 mostraba «Reintento descartado…» y la cronología registraba `recuperacion/descartada` con `sesionLocal = 2`. No se reproducía la reactivación de la captura ni de la emisión.
- **Corrección:**
  - Si la generación de un reintento ya no es la vigente, su continuación termina en silencio: no actualiza mensajes, resultados ni cronología, y no toca un reintento posterior (solo libera la referencia si sigue siendo la suya). La cancelación ya quedó registrada al terminar, con su `sesionLocal` original.
  - Guardas equivalentes en la creación de sesión, cuyo resultado tardío no se aplica si cambió la sesión, y en la reproducción remota, que no toca la interfaz tras terminar.
  - Los avisos de cierre y las estadísticas ya comprobaban la generación.
- **Regresiones:**
  - Operación antigua liberada con la sesión 2 sin reintento: sin cambios de mensaje, sin eventos nuevos, misma conexión y misma sesión vigente. La operación antigua se rechaza, porque su conexión está cerrada.
  - Operación antigua liberada **mientras la sesión 2 tiene su propio reintento en curso**: el reintento de la sesión 2 sigue vigente, su mensaje no cambia, no aparecen eventos de la sesión 1 y el reintento termina confirmado.
- **Resultado posterior:** pasan. Sonda 03 contra la v1.2: el mensaje de la sesión 2 sigue vacío y no hay `descartada` en la sesión 2.

## Garantías resultantes

- **Prioridad terminal:**
  - un `fin` auténtico del canal vigente termina la sesión sin esperar a ninguna operación WebRTC;
  - ninguna señal de negociación de esa sesión sale después;
  - ningún `fin` de un canal abandonado termina una sesión vigente;
  - una pérdida temporal del canal no es un cierre.
- **Aislamiento entre generaciones:** una operación de una generación anterior no modifica la interfaz, los estados, los resultados ni la cronología de la generación vigente, ni cancela o sustituye un reintento legítimo posterior.
- **Límite efectivo:** cada etapa de un reintento está acotada. Al terminar la sesión no quedan esperas lógicas ni sus temporizadores; el diagnóstico `esperasPendientes` queda en 0.

## Conservación de E03-R01

Siguen pasando las 27 regresiones de R01 y las 128 pruebas de la v1.0, sin adaptaciones nuevas, junto con las 14 E2E. Se conservan:

- la aceptación de ofertas por identificador;
- la época de interrupciones;
- los bytes de audio;
- los 409 por código;
- la bienvenida obligatoria;
- la confirmación ligada a su conexión;
- la liberación de la captura previa;
- el aviso de cierre sin canal.

La cronología mantiene su esquema y su lista permitida, con un único detalle nuevo: `negociacion-agotada`. El informe de E02 (esquema 2) no cambia.

## Riesgos residuales

- **Cola ocupada por candidatos lentos.** Con muchos candidatos acumulados y operaciones lentas, la cola podría tardar hasta 4 s por candidato en procesar señales ordinarias (máximo de 64 en cola). El `fin` no se ve afectado, porque tiene prioridad, y la recuperación tampoco, porque sus esperas tienen sus propios límites.
- **Límite de 4 s por operación.** Es un valor técnico sin medición en Android; un teléfono lento podría agotar una operación legítima. En ese caso el resultado es «negociación agotada» y se puede reintentar.
- **Promesas nativas tras el agotamiento.** Pueden resolverse después; se ignoran, pero no se cancelan.
- **Interrupciones sintéticas.** Las limitaciones físicas de Chrome en Android **no se han resuelto ni medido**.

## Comprobaciones no realizadas

- Windows y Android.
- CONT-01 a CONT-12, que siguen **NO EJECUTADOS**.
- La E2E con la revisión 1194 de Chromium, no instalada; se usó `DIRECTO_CHROMIUM`.
- Interrupciones físicas reales.

**Estado de las fases:** FASE-02 en espera, FASE-03 activa y FASE-04 no autorizada.
