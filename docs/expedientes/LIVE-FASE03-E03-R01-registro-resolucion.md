# LIVE-FASE03-E03 — Registro de resolución de la revisión E03-R01 — v1.1

| Campo | Valor |
| --- | --- |
| Revisión | E03-R01, auditoría independiente de ChatGPT sobre `LIVE-FASE03-E03-v1.0.zip` (no publicada) |
| Base | `90b32ccc85ac9854808f0090d3c1663a4c1b7ab2` |
| Material de la auditoría | `LIVE-FASE03-E03-R01-sondas.zip`, SHA-256 `7460741ffe6a5cf4d845ddc596e71b1428410e6d12c3ea0ca98c00a69177c29b` (dos sondas descriptivas con los dobles de E03 y un servidor HTTP de prueba). Las sondas no se incorporan al repositorio |
| Resultado | Cuatro defectos confirmados y corregidos; tres riesgos reproducidos y corregidos; un riesgo no reproducido en la v1.0, cubierto de forma preventiva |
| Diseño | [Diseño e implementación, v1.1](LIVE-FASE03-E03-diseno-continuidad.md) |

**Método.**

1. Se ejecutaron las sondas contra la v1.0: reprodujeron los cuatro defectos.
2. Se escribieron regresiones con aserciones: `pruebas/unidad/revision-r01.test.js` (24) y `pruebas/unidad/revision-r01-funciones.test.js` (3).
3. Se ejecutaron contra el código de la v1.0, con los dobles ampliados: **fallan 19 de 25**. El archivo de funciones cuenta como un fallo, porque esas funciones no existen en la v1.0.
4. Se corrigió y se repitió: **27 de 27 pasan**. Las evidencias (salida de las sondas y de las regresiones en la v1.0 y en la v1.1) se entregan en el paquete.

Todo son pruebas con dobles controlados y medios sintéticos. **No son pruebas físicas ni con WebRTC real de Android.**

## E03-R01-01 — Oferta obsoleta que sustituía la conexión vigente (bloqueante)

- **Reproducción:** el espectador acepta la oferta 2, responde y conecta; después recibe la oferta 1.
- **Resultado anterior (v1.0):** cerraba la conexión 2, creaba otra y respondía a la oferta 1. Sonda: `DESPUES OFERTA OBSOLETA 2 true [respuesta 2, respuesta 1]`.
- **Corrección:**
  - `ofertaAceptable` (`public/continuidad.js`) decide antes de tocar la conexión:
    - acepta solo una oferta con identificador mayor que el de la última aceptada;
    - descarta, sin cerrar ni responder, las repetidas, las atrasadas y las que no traen identificador tras una correlacionada;
    - sin correlación previa acepta las ofertas sin identificador, por compatibilidad con E01/E02.
  - `siguienteNegociacion`: el contador del emisor crece de uno en uno y **no da la vuelta**. En el máximo (2³¹−1) no crea más negociaciones, así que ninguna comparación de orden se invierte.
  - Respuestas y candidatos siguen correlacionados con la negociación aceptada vigente.
- **Regresiones:**
  - oferta 1 atrasada tras la 2, oferta 2 repetida, oferta sin identificador tras una correlacionada;
  - oferta legítima posterior a una recuperación;
  - reapertura del canal seguida de ofertas y candidatos atrasados;
  - compatibilidad sin identificador;
  - límite del contador.

  En todas se comprueba que la conexión vigente conserva su identidad y que no se responde a ninguna oferta descartada.
- **Resultado posterior:** pasan. La sonda 1 contra la v1.1 agota su propia espera porque aguarda una respuesta a la oferta atrasada que ya no se envía: es el resultado correcto.
- **Limitación:** tras 2³¹−1 negociaciones en una misma página del emisor hace falta una sesión nueva; en la práctica es inalcanzable.

## E03-R01-02 — Recuperación confirmada con el transporte en `failed` (bloqueante)

- **Reproducción:** espectador conectado; en la segunda lectura de estadísticas de un reintento, el transporte pasa a `failed` mientras los contadores siguen creciendo.
- **Resultado anterior:** `confirmada / recepcion-confirmada`, y la interfaz afirmaba que la conexión estaba establecida.
- **Corrección:**
  - Se añade una **época de interrupciones**, que cuenta: transporte `disconnected`, `failed` o `closed`; pistas silenciadas o terminadas; señalización perdida; sustitución de la conexión.
  - `verificarProgreso` exige, antes y después de cada lectura, las condiciones siguientes. `reintentarConexion` las vuelve a exigir justo antes de publicar:
    - el mismo intento y la misma conexión, en `connected`;
    - la señalización confirmada por la bienvenida;
    - pistas de audio y video vivas, y sin silenciar en la confirmación final;
    - la época sin cambios.
  - Si algo falla, el resultado es «interrupción durante la comprobación», no confirmado. Las lecturas que atraviesan una interrupción no se aprovechan, aunque el estado vuelva a `connected`.
- **Regresiones:**
  - `failed` durante `getStats` (la sonda);
  - `disconnected` transitorio en el intervalo;
  - pista silenciada y pista terminada;
  - cambio de conexión durante las lecturas;
  - pérdida de la señalización;
  - finalización entre lecturas;
  - recuperación correcta sin incidentes.
- **Resultado posterior:** pasan. Notas:
  - En la sonda 2 contra la v1.1, a los 1,6 s el reintento sigue en curso, sin confirmación.
  - El cambio de conexión durante las lecturas **ya estaba cubierto en la v1.0**: la prueba también pasaba entonces, porque la lectura de una conexión sustituida se descartaba.
  - La finalización entre lecturas y el caso correcto también pasaban en la v1.0.
- **Limitación:** las estadísticas no prueban la calidad percibida; se mantiene la confirmación humana.

## E03-R01-03 — Progreso incompleto de audio

- **Reproducción:** `evaluarProgreso('espectador', …)` con los bytes de audio sin crecer.
- **Resultado anterior:** `recepcion-confirmada`.
- **Corrección:**
  - el espectador exige el crecimiento de los bytes de audio y de video, de los fotogramas de video decodificados y de los paquetes de audio;
  - un contador que decrece hace la comparación no válida (`no-verificable`);
  - el texto ya no afirma que se decodifique el audio: «llegan audio y video y se decodifican fotogramas de video».
- **Regresiones:**
  - la sonda;
  - contadores faltantes, detenidos y decrecientes;
  - progreso de un solo medio, en el espectador y en el emisor.
- **Resultado posterior:** pasan. La sonda contra la v1.1 da `parcial`.

## E03-R01-04 — Conflictos HTTP 409 confundidos

- **Reproducción:** `categoriaCanal({ estadoHttp: 409, error: 'par-ausente' })`.
- **Resultado anterior:** `rol-ocupado`, y el reintento acotado se aplicaba a cualquier 409.
- **Corrección:**
  - `rol-ya-conectado` se clasifica como `rol-ocupado`, `par-ausente` como `par-ausente` y cualquier otro 409 como `conflicto`, sin copiar el código recibido;
  - el reintento acotado se aplica solo a `rol-ocupado`;
  - hay textos y motivos de continuidad propios, y categorías nuevas en la cronología.
- **Regresiones:**
  - clasificación pura;
  - las dos respuestas 409 reales del servidor (segundo canal del mismo rol y oferta sin el otro participante);
  - un 409 desconocido en la reapertura, que se informa una vez sin reintentar y sin copiar su código a la cronología.
- **Resultado posterior:** pasan. La sonda contra la v1.1 da `par-ausente`.

## E03-R01-05 — Bienvenida pendiente tras HTTP 200 (riesgo; reproducido)

- **Reproducción:** una reapertura recibe HTTP 200 con el flujo abierto y sin bienvenida. En otra variante, la bienvenida llega pero la oferta que dispara queda retenida.
- **Resultado anterior (v1.0):**
  - Sin bienvenida: el reintento terminaba como `tiempo-agotado`, pero el canal seguía como `conectada` y utilizable, porque el cierre dependía de que siguiera en `conectando`.
  - Con la oferta retenida: la bienvenida se notificaba después de la negociación, así que su espera se agotaba aunque hubiera llegado.
- **Corrección:**
  - el canal solo cuenta como confirmado al procesar la bienvenida; con HTTP 200 sin ella, el estado es «conectando»;
  - la bienvenida se reconoce antes de lanzar la negociación;
  - al agotarse la espera, la apertura no confirmada se cancela y no queda como canal.
- **Regresiones:** las dos variantes.
- **Resultado posterior:** pasan.

## E03-R01-06 — Confirmación heredada por una conexión posterior (riesgo; reproducido)

- **Reproducción:** recuperación confirmada; el espectador sale y vuelve, y otra conexión conecta sin comprobación.
- **Resultado anterior:** el estado mostraba «recuperación técnica confirmada» para esa conexión distinta.
- **Corrección:**
  - el resultado se liga a la conexión y a la época en que se publicó;
  - si cambian, el estado de continuidad ya no lo usa;
  - el mensaje se conserva como antecedente, con el prefijo «ya no describe el estado actual».
- **Regresión:** el escenario descrito.
- **Resultado posterior:** pasa.

## E03-R01-07 — Capturas temporalmente superpuestas (riesgo; reproducido parcialmente)

- **Reproducción:** tras terminar la pista de video, con la de audio viva, se pulsa «Activar cámara y micrófono» y la captura nueva queda pendiente.
- **Resultado anterior:** durante la solicitud seguía activa la pista de audio anterior. No se observaron dos capturas completas activas a la vez, porque la anterior se liberaba al llegar la nueva, pero sí una pista local viva mientras se pedía otra captura.
- **Corrección:**
  - la captura anterior se libera **antes** de pedir la nueva;
  - si el permiso se deniega, no queda ninguna pista y se puede reintentar;
  - una captura tardía tras finalizar se descarta, como en E01/E02.
- **Regresión:** reactivación tras terminar una pista, permiso denegado y finalización durante la reactivación.
- **Resultado posterior:** pasa.
- **Limitación:** al reactivar, la emisión queda sin pistas hasta que se concede la captura nueva.

## E03-R01-08 — Finalización sin objeto canal (riesgo; no reproducido en la v1.0)

- **Reproducción:** finalizar después de una reapertura agotada, con la red recuperada y con la red aún interrumpida (aviso de fin retenido).
- **Resultado anterior:** **no se reproduce en la v1.0**, y las dos pruebas pasan allí. Tras una reapertura agotada, la v1.0 conservaba el objeto canal (precisamente el problema de R01-05), y el aviso de fin salía por él. Con la corrección de R01-05, que cancela la apertura no confirmada, sí quedaría `estado.canal = null` con credenciales en memoria.
- **Corrección:** `enviarAvisoCierre` envía el aviso por POST con la autorización vigente en memoria cuando no hay canal, sin reabrir el flujo de eventos. Se aplica a `fin` y a `salir`. El cierre local sigue siendo inmediato.
- **Regresiones:**
  - **Red recuperada:** fin confirmado, sesión eliminada y espectador avisado, sin aperturas SSE nuevas.
  - **Red interrumpida:** «sin confirmar», con el mensaje de E02; no se dice que el servidor eliminó la sesión, y la sesión sigue en el servidor.
- **Resultado posterior:** pasan.

## Pruebas de la v1.0 adaptadas

Adaptadas por cambios de semántica pedidos por la revisión, sin relajar su propósito:

- `continuidad.test.js`, «progreso del espectador»: los datos de prueba incluyen ahora los bytes de audio, que el espectador exige (R01-03).
- `senalizacion-continuidad.test.js`, «errores HTTP y de red»: un 409 con un código que no es `rol-ya-conectado` se espera como `conflicto` (R01-04). El rol ocupado se prueba con el código real del servidor en `revision-r01.test.js`.

El resto de las 128 unitarias y las 14 E2E de la v1.0 no cambian y pasan.

## Decisión futura registrada (no autorizada)

Se conserva la garantía de no sustituir automáticamente un canal ocupado. Siguen sin autorizarse:

- la expulsión del canal anterior y la toma de posesión automática de canales;
- la renovación de credenciales y la persistencia de sesión;
- la política de reconexión de un minuto del producto.

Evidencia del límite: con un canal semiabierto, la reapertura responde 409 `rol-ya-conectado` hasta que el servidor detecta el cierre (`recuperacion-cliente.test.js`, prueba del EOF con el canal aún registrado).

## Limitaciones pendientes

- Las limitaciones físicas de Chrome en Android (segundo plano, bloqueo, descarte) **no se han resuelto ni medido**.
- CONT-01 a CONT-12 siguen **NO EJECUTADOS**.
- No hay pruebas de E03 en Windows ni en Android.
- Estado de las fases: FASE-02 en espera, FASE-03 activa y FASE-04 no autorizada.
