# LIVE-FASE03-E03 — Diseño e implementación: continuidad y recuperación controlada — v1.3

| Campo | Valor |
| --- | --- |
| ID | LIVE-FASE03-E03, opción A autorizada por el promotor |
| Versión | 1.3. Corrige la v1.0, la v1.1 y la v1.2, no publicadas, tras las revisiones E03-R01 (§17 y [registro](LIVE-FASE03-E03-R01-registro-resolucion.md)), E03-R02 (§18 y [registro](LIVE-FASE03-E03-R02-registro-resolucion.md)) y E03-R03 (§19 y [registro](LIVE-FASE03-E03-R03-registro-resolucion.md)) |
| Fase | FASE-03, prueba técnica móvil ([plan](../estado/PLAN-POR-FASES.md)) |
| Fecha | 25-11-2026 (UTC; 24-11-2026 en Colombia) |
| Base | `90b32ccc85ac9854808f0090d3c1663a4c1b7ab2` (cierre documental de E02) |
| Experimento | [`experimentos/directo-movil/`](../../experimentos/directo-movil/README.md) |
| Protocolo físico | [Protocolo CONT](LIVE-FASE03-E03-protocolo-continuidad-android.md), con los doce casos NO EJECUTADOS |
| Estado | **Preparado. Pendiente de auditoría y publicación manual.** Verificado solo con pruebas automatizadas en Linux (Cloud). Sin pruebas en Windows ni en Android para E03 |

Este expediente describe qué cambia E03 en el experimento de directo móvil, por qué y con qué garantías. **Separa las decisiones técnicas propuestas por Claude (§13) de los requisitos del producto ya confirmados por el promotor (§12).** Ninguna decisión técnica de este documento es una decisión del producto.

## 1. Motivación y límites

La validación física de E02 ([resultados](LIVE-FASE03-E02-resultados-android.md)) dejó hallazgos de continuidad sin resolver:

| Hallazgo | Resumen |
| --- | --- |
| AND-08-H01 | Discrepancia del contador histórico de capturas en el primer intento de nueva sesión; no reproducida; causa indeterminada |
| AND-09-H01 | Unos 30 s en segundo plano: audio interrumpido y video congelado, con recuperación automática |
| AND-09-H02 | Tras unos 60 s fuera de Chrome se perdió la emisión original; los JSON disponibles son de la sesión nueva |
| AND-10-H01 | Interrupción audiovisual con la pantalla bloqueada; recuperación automática al desbloquear |
| OBS-WIFI-01 | Pérdida de la conexión WebRTC al cambiar de Wi-Fi; finalización manual y sesión nueva; no se demostró la pérdida de la sesión del servidor |
| RES-AND-11 | Aviso visual del emisor no comprobado |

E03 **no** atribuye causas a esos hallazgos. En particular, **no atribuye AND-09-H02 al temporizador de 60 s del servidor**: no hay evidencia de ello, y los JSON de E02 son de la sesión nueva. E03 añade la instrumentación y la recuperación manual necesarias para que una segunda validación física pueda distinguir qué componente se pierde.

E03 sigue siendo un experimento local y neutral, con un emisor y un espectador. No implementa contadores económicos, devoluciones ni la política del minuto de reconexión, no es de producción y no incluye nada de lo prohibido por el encargo: STUN/TURN, multistream, PWA, aplicación nativa, persistencia de tokens, chat, regalos, monedas ni grabación.

## 2. Arquitectura inicial (base `90b32cc`)

- **Servidor** (`src/`), que no cambió en E02:
  - sesiones en memoria con un token por rol, comparado en tiempo constante;
  - SSE para recibir y POST para enviar, con 409 si el rol ya tiene canal;
  - límites de tamaño y de señales por minuto (300), máximo de 16 sesiones;
  - limpieza a los 60 s sin participantes y vida máxima de 30 min.
- **Cliente** (`public/app.js`):
  - un único `estado` con `generacion` (cambia al terminar o empezar una sesión), `intentoCaptura` e identidad de conexión (`estado.pc === pc`);
  - una cola de eventos por canal, para descartar los eventos de un canal antiguo;
  - un límite de 3 s en cada POST;
  - finalización sin esperar a la red;
  - un informe instantáneo (esquema 2) con lista permitida.
- **Comportamientos relevantes de la base:**
  1. Un error o una interrupción del flujo SSE cerraban la conexión WebRTC local.
  2. Un EOF inesperado del flujo se comunicaba como `cerrada`, igual que un cierre normal.
  3. No había ninguna forma de reabrir la señalización: solo «Nueva sesión».
  4. Oferta, respuesta y candidatos no llevaban identificador de negociación. Una respuesta tardía se aplicaba a la conexión vigente, y un candidato que llegara antes que su oferta se perdía o se aplicaba a la conexión anterior.
  5. Al pulsar «Salir», el flujo SSE se cerraba a la vez que salía el aviso: si el servidor procesaba antes el cierre, el emisor veía una desconexión y no una salida.
  6. `pagehide` liberaba medios y conexiones sin marcar la sesión como terminada.

## 3. Arquitectura resultante

| Pieza | Cambio | Justificación |
| --- | --- | --- |
| `public/cronologia.js` (nuevo) | Registro circular de 256 eventos, en memoria, con listas cerradas, reloj monotónico inyectable y exportación por lista permitida (esquema `live-directo-movil/cronologia-continuidad/1`) | Separa la cronología del informe de E02 y permite probarla sin DOM |
| `public/continuidad.js` (nuevo) | Funciones puras: estado de continuidad por componentes, resumen de pistas, evaluación del progreso de medios y temporizadores técnicos | La máquina de estados y la confirmación de recuperación se prueban de forma aislada y exhaustiva |
| `public/senalizacion.js` | Cierre intencional frente a interrupción; `cerrada` solo tras un `fin` del servidor; límite de apertura de 5 s; categorías de lista cerrada (`categoriaCanal`); un objeto canal se abre una sola vez y no entrega nada tras `cerrar()` | Una pérdida inesperada no se confunde con un cierre pedido; ningún callback de un canal antiguo afecta al vigente |
| `public/app.js` | Cronología, estados por componente, botón «Reintentar conexión», reapertura de la señalización con las credenciales en memoria, identificador de negociación, cola de candidatos salientes, solicitud de oferta, comprobación de progreso, `pagehide` terminal y cierre del canal tras el aviso de salida | Componentes B, C y D del encargo |
| `public/index.html` | Sección «Continuidad» (botón y resultado), filas Sesión, Participante, Pistas, Reproducción y Continuidad, y sección «Cronología de continuidad» | Estados visibles y exportación |
| `src/validacion.js` | `neg` opcional (entero de 1 a 2³¹−1) en oferta, respuesta y candidato; tipo `solicitud-oferta` solo para el espectador y sin datos | Correlación de negociaciones y renegociación pedida por el espectador sin que este ofrezca |
| `src/servidor.js` | `par` ausente con `motivo` (`salida` o `desconexion`); dos módulos públicos más en la lista cerrada | El emisor distingue la salida voluntaria; los módulos nuevos se sirven por lista cerrada, con las mismas cabeceras |
| `src/sesiones.js` | Sin cambios | Las garantías de sesión, caducidad y límites se conservan intactas |
| `public/medios.js`, `public/estilos.css` | Sin cambios | El informe de E02 (esquema 2) y su lista permitida no cambian |

No se añadieron dependencias ni se cambiaron `package.json`, `package-lock.json`, `tsconfig.json` ni la versión mínima de Node (22). Los módulos nuevos no usan APIs exclusivas de un sistema operativo, y los comandos de Windows del README siguen siendo válidos. En Windows no se ejecutaron.

## 4. Máquina de estados de continuidad

El estado visible se **deriva** en cada cambio a partir de seis componentes observados por separado (`derivarContinuidad`, en `public/continuidad.js`). Que un componente se pierda no implica que se pierdan los demás:

| Componente | Valores | Fuente |
| --- | --- | --- |
| Sesión según la página | `sin-sesion`, `vigente`, `finalizada`, `inexistente`, `no-autorizada` | Creación, respuestas del servidor, fin |
| Señalización | `sin-canal`, `conectando`, `conectada`, `interrumpida`, `error`, `cerrada` (con su categoría) | `CanalSenalizacion` |
| Otro participante | `presente`, `ausente` (motivo `salida` o `desconexion`), `desconocido` sin señalización | Eventos `bienvenida` y `par` |
| Pistas (locales en el emisor y recibidas en el espectador) | `sin-pistas`, `activas`, `silenciadas`, `terminadas` | `readyState`, `muted`, eventos `mute`, `unmute` y `ended` |
| Transporte | `connectionState`, o `sin-conexion` | `RTCPeerConnection` vigente |
| Reproducción (espectador) | `sin-flujo`, `reproduciendo`, `pausada`, `requiere-gesto` | Elemento de video |

Estados, de lista cerrada, con su motivo:

| Estado | Cuándo |
| --- | --- |
| `sin-sesion` | Sin rol o sin sesión |
| `esperando-participante` | Señalización conectada y el otro ausente sin desconexión (también tras una **salida voluntaria**: motivo `participante-salio`) |
| `conectando` | Canal abriéndose, sin captura, negociación o transporte en curso, conexión sin medios recibidos todavía |
| `conectada` | Canal, otro participante, pistas y transporte bien |
| `interrupcion-detectada` | Algo que puede volver solo: transporte `disconnected`, pista silenciada, pista recibida terminada u otro participante desconectado de la señalización |
| `recuperacion-en-curso` | Hay un reintento en curso |
| `recuperacion-confirmada` | El último reintento confirmó el progreso de los medios y no hay interrupciones posteriores |
| `requiere-intervencion` | Algo que no se resuelve sin una acción: señalización perdida o con error (no hay reintentos automáticos), captura terminada, transporte `failed` o cerrado, o una sesión inexistente o no autorizada |
| `finalizada` | La sesión terminó en esta página (prevalece sobre todo) |

Reglas destacadas:

- **Ocultar la página no finaliza nada.** `visibilitychange`, `freeze`, `resume`, `online` y `offline` solo se registran.
- **Una interrupción no es un cierre.** Solo `finalizada` es terminal. Una sesión inexistente confirmada por el servidor (404) tras haber existido termina la sesión en la página (§9).
- **Una confirmación de recuperación no oculta una interrupción posterior.**

## 5. Contrato de recuperación y responsabilidad de cada rol

La recuperación **solo empieza al pulsar «Reintentar conexión»**. No hay bucles de reintento. Se conservan:

- la recuperación espontánea del transporte (ICE), que la página muestra pero no fuerza;
- la negociación normal cuando el otro participante entra en la señalización.

Comprobaciones comunes, en orden:

1. Que la sesión local siga vigente (no terminada, con credenciales en memoria).
2. Que no haya otro reintento en curso: como máximo uno por página, con el botón deshabilitado mientras dura.
3. El estado del canal, de las pistas y del otro participante.

**Emisor:**

1. Sin captura, el reintento falla con `sin-captura`. Si alguna pista local terminó, falla con `captura-terminada`, habilita «Activar cámara y micrófono» y **no** vuelve a capturar por sí mismo.
2. Si la señalización no está conectada, la reabre (§7) y espera la bienvenida. Si el espectador está presente, la bienvenida lanza una negociación nueva con las **mismas pistas**.
3. Si la señalización está conectada, el espectador presente y el transporte `connected`, primero comprueba el progreso. Si se confirma, termina; si no, renegocia.
4. Si el transporte no está conectado, crea una negociación nueva: cierra la conexión anterior, crea otra y añade las pistas existentes, sin `getUserMedia`.
5. Espera `connected` (como máximo 15 s) y comprueba el progreso del **envío** de audio y video.

**Espectador** (nunca ofrece):

1. Si la señalización no está conectada, la reabre. El servidor avisa al emisor (`par` presente) y el emisor renegocia.
2. Si la señalización está conectada y el transporte no, envía `solicitud-oferta` al emisor, que decide crear una oferta nueva (§6).
3. Espera una oferta nueva aplicada y respondida (como máximo 10 s), `connected`, y comprueba el progreso de la **recepción**: bytes de video y de audio, fotogramas de video decodificados y paquetes de audio (E03-R01-03). La decodificación del audio no se mide y no se afirma.

**Confirmación de recuperación.** No basta `connectionState === 'connected'`:

- se comparan lecturas sucesivas de `getStats()` **de la misma conexión vigente**, hasta 4 lecturas separadas 1 s, cada una acotada a 2 s (el límite de E02);
- **E03-R01-02:** el crecimiento de los contadores no basta. Antes y después de cada lectura, y otra vez justo antes de publicar el resultado, se exige:
  - el mismo intento y la misma conexión, en `connected`;
  - la señalización confirmada por la bienvenida;
  - pistas de audio y video vivas, y sin silenciar en la confirmación final;
  - ninguna interrupción observada desde que empezó la comprobación.

  Una «época de interrupciones» cuenta las interrupciones: transporte `disconnected`, `failed` o `closed`, pistas silenciadas o terminadas, señalización perdida y sustitución de la conexión. Si cambia, aunque el estado vuelva a `connected`, las lecturas no se aprovechan. El resultado es «interrupción durante la comprobación», no confirmado;
- si el intento deja de ser vigente (finalizar, salir, caducar), el resultado se descarta;
- **E03-R01-06:** un resultado publicado queda ligado a la conexión y a la época en que se comprobó.
  - Si después hay otra interrupción o conecta otra conexión, el estado de continuidad ya no muestra «recuperación técnica confirmada».
  - El mensaje se conserva como antecedente, señalado como «ya no describe el estado actual».
- el emisor solo puede afirmar «envío confirmado», no que el espectador vea y oiga: la página lo dice expresamente;
- el espectador afirma «recepción confirmada» y pide a la persona que confirme que se ve y se oye;
- sin estadísticas consta «recuperación no verificada»; con progreso parcial o nulo, «no confirmada». Nunca se inventan valores positivos.

Resultados posibles, con evento en la cronología:

| Resultado | Evento | Estado |
| --- | --- | --- |
| `exito` (`envio-confirmado` o `recepcion-confirmada`) | `recuperacion/exito` | `recuperacion-confirmada` |
| `sin-verificar` (`conectada-sin-verificar`) | `recuperacion/sin-verificar` | `conectada`, motivo «el último reintento no confirmó la recuperación» |
| `fallo` (`sin-progreso`, `parcial`, `interrupcion-durante-comprobacion`, `esperando-participante`, `captura-terminada`, `sin-captura`, `rol-ocupado`, `par-ausente`, `conflicto`, `no-autorizado`, `limite-senales`, `red`, `transporte-no-conectado`, `error-negociacion`) | `recuperacion/fallo` | Según los componentes |
| `agotada` (`tiempo-agotado`, `transporte-no-conectado`) | `recuperacion/agotada` | Según los componentes |
| Cancelada por finalizar, salir, caducar o `pagehide` | `recuperacion/cancelada` | `finalizada` |

**Misma sesión.** En una recuperación correcta se conservan:

- la sesión, los roles y las credenciales;
- el enlace del espectador;
- la captura;
- la caducidad original: el reintento no la alarga y el servidor no cambia `expiraEn`.

Una sesión nueva no cuenta como recuperación. Si la página se reinicializó y perdió las credenciales en memoria, no se recupera nada.

## 6. Contrato de señalización (E03)

Compatible con el anterior. Los campos nuevos son opcionales en el servidor, y lo existente no cambia.

| Señal | Rol | Campos | Notas |
| --- | --- | --- | --- |
| `oferta` | emisor | `sdp`, `neg` opcional | El emisor sigue siendo el único que ofrece |
| `respuesta` | espectador | `sdp`, `neg` opcional | La página del espectador repite el `neg` de la oferta |
| `candidato` | ambos | `candidato`, `neg` opcional | Sale con el `neg` de su negociación |
| `solicitud-oferta` | espectador | ninguno | **Nueva.** El emisor decide crear una oferta; un emisor que la envía recibe 403 |
| `fin`, `salir` | emisor y espectador, respectivamente | ninguno | Sin cambios |

- **`neg`:** entero de 1 a 2³¹−1, validado por el servidor (400 `negociacion-invalida` si no lo es).
  - **Semántica (E03-R01-01).** Dentro de una página del emisor, `neg` crece de uno en uno y **no da la vuelta**: al llegar a 2³¹−1, la página no crea más negociaciones y pide una sesión nueva. Ninguna comparación de orden se invierte (`siguienteNegociacion`).
  - **Aceptación en el espectador** (`ofertaAceptable`), **antes de tocar la conexión vigente**:
    - acepta una oferta con `neg` mayor que el de la última aceptada;
    - descarta, sin cerrar nada ni responder, las ofertas repetidas (`neg` igual), las atrasadas (`neg` menor) y las que no traen `neg` después de haber aceptado una correlacionada;
    - acepta las ofertas sin `neg` mientras no haya ninguna correlacionada, por compatibilidad con el contrato de E01/E02 (cada una sustituye a la anterior, como entonces).
  - **Correlación.** Respuestas y candidatos se correlacionan con la negociación aceptada vigente. La página del espectador pertenece a una sola sesión, así que el estado de correlación no se comparte entre sesiones.
  - Solo correlaciona señales de una negociación. **No autentica ni autoriza nada:** la autorización sigue siendo el token del rol.
  - No se exporta en el informe ni en la cronología.
  - En las señales `fin`, `salir` y `solicitud-oferta` no se reenvía.
- **Evento `par`:** `{ presente: false, motivo: 'salida' }` cuando el servidor registró un `salir`. `{ presente: false, motivo: 'desconexion' }` cuando el flujo se cerró sin salida registrada; el servidor no afirma con ello si fue la red, una página cerrada o un fin no confirmado.
- **Atención de `solicitud-oferta` en el emisor:** solo con captura utilizable y espectador presente; como máximo una oferta por cada 2 s; se ignora si hay una negociación pendiente de menos de 10 s. Cada solicitud ignorada se registra con su motivo.

## 7. Reapertura de la señalización

- Reutiliza solo las credenciales de **la sesión vigente** en memoria; no se guardan en el navegador.
- Antes de crear el canal nuevo, se cierra el anterior de forma intencional. Como máximo hay un canal vigente por página, y un canal antiguo no entrega eventos ni estados.
- **Errores tratados:**

  | Respuesta | Tratamiento |
  | --- | --- |
  | 401 / 403 | `no-autorizado` |
  | 404 | `sesion-inexistente` |
  | 409 con código `rol-ya-conectado` | `rol-ocupado` (E03-R01-04) |
  | 409 con código `par-ausente` (envío sin el otro participante) | `par-ausente` |
  | Otro 409 | `conflicto` (el código recibido no se copia) |
  | 429 | `limite-senales` |
  | Error de red | `red` |
  | Sin respuesta en 5 s | `tiempo-agotado` |
  | Sin bienvenida en 5 s, aunque haya HTTP 200 | Se cancela la apertura y no queda como canal utilizable (E03-R01-05) |

- **Bienvenida (E03-R01-05).** Una respuesta HTTP 200 no confirma la señalización: el canal cuenta como confirmado solo cuando se procesa la bienvenida del servidor. Hasta entonces, el estado visible es «conectando». La bienvenida se reconoce **antes** de lanzar la negociación que dispara, de modo que una negociación lenta o retenida no hace caducar la espera de bienvenida.
- **409 (rol ocupado):** solo el código `rol-ya-conectado`. El servidor conserva el canal anterior hasta detectar su cierre. Puede tardar si la conexión quedó semiabierta, por ejemplo tras perder la red. Dentro de un mismo reintento manual se reabre hasta 3 veces, separadas 1 s, y después se informa. **El servidor sigue rechazando el segundo canal:** no se expulsa ni se sustituye a quien está registrado.
- Un canal que termina sin `fin` del servidor y sin `cerrar()` es `interrumpida` (`fin-inesperado` o `flujo-interrumpido`), no `cerrada`.
- **Perder la señalización ya no cierra la conexión WebRTC propia:** los medios pueden seguir. Sí se mantiene el comportamiento de E01/E02 de liberar la conexión cuando el **otro** participante queda ausente (§13, D3).

## 8. Manejo de señales obsoletas

| Carrera | Garantía |
| --- | --- |
| Oferta anterior frente a nueva | Cada oferta del emisor incrementa `neg`. **E03-R01-01:** el espectador acepta solo ofertas posteriores a la última aceptada y descarta antes de tocar nada las repetidas, las atrasadas y las que no traen identificador tras una correlacionada. Una oferta aceptada deja de procesarse si, mientras espera, cambian la conexión, el canal o la negociación |
| Respuesta tardía | El emisor solo aplica una respuesta con el `neg` vigente, a la conexión vigente y en `have-local-offer`. Una respuesta de otra negociación, sin `neg` o repetida se descarta y se cuenta |
| Candidato ICE anterior | Se descarta si su `neg` no es el vigente |
| Candidato anterior a su descripción remota | **En el emisor:** los candidatos propios se retienen hasta que la oferta llegó al servidor, y el servidor reenvía en orden de llegada. **En el espectador**, lo mismo con la respuesta. Si aun así llega un candidato del `neg` vigente antes de la descripción remota, espera en una cola de como máximo 64 |
| Sustitución de conexión | `cerrarPeer` retira todos los manejadores, resuelve las esperas de esa conexión como `sustituida` y borra sus colas |
| Reapertura de canal | La cola de eventos de cada canal descarta lo que llega cuando ya no es el vigente |
| Finalización durante una negociación | `terminar` incrementa `generacion`; cada paso asíncrono comprueba la vigencia y una operación tardía no toca nada (pruebas en §15) |
| Fin del servidor con una negociación pendiente (E03-R02-01) | El `fin` del canal vigente se atiende fuera de la cola, en el acto: no espera a ninguna operación WebRTC. El resto de las señales siguen serializadas |
| Operación WebRTC nativa sin respuesta (E03-R02-02) | Cada operación de negociación está acotada a 4 s. Al agotarse se cancela de forma lógica y la cola sigue. En `createOffer`, `createAnswer`, `setLocalDescription` y `setRemoteDescription` se abandona la negociación y se libera su conexión. En `addIceCandidate` solo se ignora ese candidato (E03-R03, precisión) |
| Interrupción del canal con la cola ocupada (E03-R03-01) | Los cambios de estado del canal vigente se aplican en el orden observado, sin pasar por la cola. La interrupción invalida en el acto la confirmación y la época. Una bienvenida encolada de un canal ya interrumpido no lo reconfirma. Sin señalización confirmada, el reintento no renegocia |
| Continuación de una generación anterior (E03-R02-03) | Termina en silencio: no toca mensajes, resultados ni cronología de la sesión vigente, ni un reintento posterior |

No se confía en que cerrar una `RTCPeerConnection` cancele las señales ya enviadas o recibidas: la vigencia se comprueba en cada paso.

## 9. Garantías de cierre y de recursos

Al pulsar «Finalizar emisión», sin esperar a la red:

1. Se registra la finalización voluntaria y se lanza el aviso `fin`. **E03-R01-08:** si no hay canal vigente (por ejemplo, tras una reapertura agotada) pero la sesión conserva sus credenciales en memoria, el aviso se envía por POST con esa autorización, sin reabrir el flujo de eventos. Lo mismo vale para el aviso `salir`.
2. `terminar` hace lo siguiente:
   - incrementa `generacion`, lo que invalida capturas, negociaciones, avisos, estadísticas y recuperaciones pendientes;
   - cancela la recuperación en curso;
   - borra las credenciales en memoria, de modo que no puede haber reaperturas;
   - cierra la conexión y retira los oyentes de las pistas;
   - detiene las pistas locales;
   - cierra la señalización;
   - resuelve como `cancelada` todas las esperas acotadas, que limpian sus temporizadores.
3. Si el aviso no se confirma en 3 s, la página lo indica, como en E02.

Al pulsar «Salir», el espectador libera en el acto su conexión y sus pistas recibidas. **El canal se cierra cuando el servidor responde al aviso `salir`, o a más tardar a los 300 ms.** Así el servidor registra la salida antes de ver cerrarse el flujo y el emisor no la confunde con una desconexión. Antes, si el servidor procesaba primero el cierre, el emisor recibía una «desconexión» por una salida voluntaria. El canal del espectador no se reabre y la captura del emisor no se toca.

En `pagehide` se conserva la limpieza de E01/E02 y se completa: si hay una sesión activa, se termina y se liberan captura y conexiones. Una página que se descarga o entra en la caché de navegación no continúa la sesión. Ocultar la página no tiene ese efecto.

**Sesión inexistente.** Si al reabrir, el servidor confirma que la sesión ya no existe (404) después de haberla tenido, la página termina la sesión y libera la captura: es una condición terminal documentada. Un 404 al abrir por primera vez un enlace caducado mantiene el comportamiento de E02: mensaje de error y sin liberar nada, porque no hay nada abierto.

Invariantes comprobadas en las pruebas:

- un reintento vigente por página;
- como máximo una `RTCPeerConnection` vigente y un canal SSE vigente;
- ninguna pista local duplicada: una captura nueva solo por acción explícita. **E03-R01-07:** la captura anterior, incluida una pista superviviente, se libera **antes** de pedir la nueva. Si el permiso se deniega, no queda ninguna pista y la captura consta como fallida;
- ningún callback, respuesta o estadística obsoletos aplicados;
- ninguna emisión finalizada resucitada.

## 10. Límites temporales

| Valor | Origen | Motivo |
| --- | --- | --- |
| 3 s | E01, `LIMITE_ENVIO_MS` | Límite técnico de cada POST de señalización |
| 2 s | E02, `LIMITE_ESTADISTICAS_INFORME_MS` | Espera máxima de cada lectura de `getStats()`, también en la recuperación |
| 60 s | Servidor, `inactividadMs` | Limpieza de sesiones **sin participantes**. No es la regla del producto ni se ha demostrado relación con AND-09-H02 |
| 30 min | Servidor, `duracionMaxMs` | Vida máxima de una sesión experimental; el reintento no la alarga |
| 5 s | E03, `LIMITE_APERTURA_MS` y `bienvenidaMs` | Respuesta a la apertura SSE y bienvenida tras reabrir |
| 3 × 1 s | E03, `intentosRolOcupado` y `pausaRolOcupadoMs` | Reaperturas ante 409 dentro de un mismo reintento manual |
| 10 s | E03, `negociacionMs` | Espera de una oferta nueva en el espectador; antigüedad máxima de una negociación pendiente en el emisor |
| 15 s | E03, `conexionMs` | Espera de `connected` tras renegociar |
| 4 × 1 s | E03, `lecturasProgreso` e `intervaloProgresoMs` | Lecturas de progreso de medios |
| 2 s | E03, `intervaloMinOfertasMs` | Mínimo entre ofertas creadas por `solicitud-oferta` |
| 300 ms | E03, `ESPERA_CIERRE_TRAS_AVISO_MS` | Cierre del canal tras el aviso de salida |
| 64 | E03, `maxCandidatosEnCola` | Colas de candidatos entrantes y salientes |
| 4 s | E03-R02, `operacionRtcMs` | Cada operación WebRTC nativa de una negociación: `createOffer`, `createAnswer`, `setLocalDescription`, `setRemoteDescription` y `addIceCandidate` |

**Composición de límites de un reintento (E03-R02-02).** Peor caso por recorrido:

| Recorrido | Peor caso |
| --- | --- |
| Emisor, con reapertura | 43 s |
| Emisor, con señalización y conexión aparente | 48 s |
| Espectador, con reapertura | 53 s |
| Espectador, por solicitud de oferta | 50 s |

El desglose está en el [registro E03-R02](LIVE-FASE03-E03-R02-registro-resolucion.md#e03-r02-02--recuperación-sin-límite-efectivo-durante-la-negociación-bloqueante). Todo reintento termina por sí solo, sin exigir otra acción.

**Ninguno es el minuto de reconexión del producto.** Todos son técnicos y acotados, y ninguno crea reglas comerciales. Una prueba unitaria comprueba que ningún plazo técnico de E03 llega a 60 s.

## 11. Evidencia para la regla futura del minuto de reconexión

La v0.33 confirma: ante una desconexión temporal del creador se pausan los contadores, hay 1 minuto para reconectar y, sin reconexión, se finaliza y se aplican las devoluciones. **E03 no implementa esa regla.** Aporta los elementos para especificarla después; las respuestas siguen siendo decisiones pendientes:

| Pregunta pendiente | Qué aporta E03 |
| --- | --- |
| Cómo detectar una desconexión del creador | Separa señalización (`interrumpida`, `error` con categoría), presencia (`par` con `desconexion` frente a `salida`), transporte (`disconnected` frente a `failed`) y pistas (`mute`, `ended`). La cronología del espectador registra cuándo vio cada cosa |
| Cuándo empieza el plazo | Candidatos observables: el `par` ausente por `desconexion`, el transporte `failed` o `disconnected` prolongado, o pistas silenciadas. El protocolo CONT medirá en Android cuáles ocurren en cada escenario y en qué orden. **No se elige ninguno** |
| Cómo distinguir una interrupción audiovisual de una pérdida de sesión | Interrupción audiovisual: transporte o pistas afectados con la sesión vigente en el servidor. Pérdida de sesión: 404 al reabrir, o `fin` del servidor |
| Qué es una recuperación confirmada | Progreso medido de los medios en la misma conexión vigente, en el rol que lo puede medir, y confirmación humana de la percepción |
| Cómo resolver una recuperación concurrente con la expiración | En E03, la expiración del servidor prevalece: la sesión termina y el reintento se cancela sin resucitarla (probado). La regla del producto deberá decidir qué ocurre si la reconexión y el fin del minuto coinciden |

**Obstáculo que requiere una decisión futura, no tomada aquí.** Un canal semiabierto del creador ocupa el rol hasta que el servidor lo detecta, y el rechazo 409 se conserva. Para recuperar dentro de un minuto haría falta una regla de sustitución del canal propio (por ejemplo, el mismo token desde un canal nuevo), que hoy no existe por la garantía de no expulsar al conectado. Es una decisión de diseño y de seguridad que corresponde al promotor y a una entrega posterior; E03 no debilita la garantía.

## 12. Requisitos del producto confirmados por el promotor (no cambian)

- Desconexión temporal del creador: contadores en pausa, 1 minuto para reconectar y, sin reconexión, fin del directo y devoluciones (v0.33). **Sigue vigente y no se implementa en E03.**
- Contenido neutral, sin cobros, cuentas, grabación ni dinero real en las pruebas previas al piloto.
- FASE-03 activa bajo la excepción vigente; FASE-02 en espera y sin cerrar; FASE-04 y posteriores no autorizadas; E03 opción A autorizada como única entrega activa.

## 13. Decisiones técnicas propuestas y justificación

Son propuestas de Claude para el experimento, **no decisiones del producto**.

| ID | Decisión | Justificación |
| --- | --- | --- |
| D1 | Reconstrucción controlada de la conexión (conexión nueva y oferta nueva del emisor con las mismas pistas) | Usa la arquitectura existente, mantiene al emisor como único ofertante y no requiere ICE restart ni perfect negotiation |
| D2 | `neg` opcional y validado en el servidor | Correlación inequívoca de las señales; compatible con el contrato anterior; acotado y sin valor de autenticación |
| D3 | Conservar el cierre de la conexión local cuando el otro participante queda ausente | El participante ausente puede haber finalizado o salido sin que su aviso llegara; se conserva la garantía de liberar recursos de E01/E02. Consecuencia: una pérdida de solo señalización interrumpe los medios de ambos, y la recuperación los reconstruye en la misma sesión |
| D4 | No cerrar la conexión propia cuando se pierde la propia señalización | Si el servidor aún no detectó el cierre (semiabierto), los medios pueden seguir mientras se reintenta |
| D5 | `solicitud-oferta` del espectador en lugar de ofertas del espectador | El encargo exige que el emisor sea el único iniciador de ofertas |
| D6 | 409 reintentado como máximo 3 veces dentro de un reintento manual | Cubre el retraso habitual en detectar el cierre en local, sin reintentos infinitos ni expulsiones |
| D7 | Terminar la sesión en `pagehide` y ante un 404 tras haber existido | La página no puede continuar; se libera la cámara cuanto antes |
| D8 | Cierre del canal del espectador tras el aviso de salida (300 ms como máximo) | Evita que el emisor interprete una salida voluntaria como desconexión |
| D9 | Cronología separada del informe, con esquema propio | El encargo prohíbe cambiar silenciosamente el contrato del esquema 2. El informe sigue igual: una interrupción del canal consta en él como `error`, como en E02, y las categorías nuevas solo están en la cronología |
| D10 | Solo propiedades propias al sanear eventos | Encontrado por las pruebas: un objeto con valores heredados de su prototipo pasaba el saneamiento |
| D11 (R01-01) | Identificadores de negociación crecientes, sin vuelta; aceptación de ofertas solo posteriores | Una oferta atrasada o repetida no puede sustituir la conexión vigente; la compatibilidad sin identificador se limita a cuando aún no hay correlación |
| D12 (R01-02 y R01-06) | Época de interrupciones; comprobación de conexión, señalización y pistas en cada lectura y antes de publicar; resultado ligado a conexión y época | El progreso de los contadores no basta para confirmar, y una confirmación no describe otra conexión ni un estado posterior |
| D13 (R01-04) | Categorías 409 por código del servidor | Solo el rol ocupado justifica el reintento acotado; los demás conflictos se informan una vez |
| D14 (R01-05) | Canal confirmado solo con la bienvenida, reconocida antes de negociar | HTTP 200 no autentica la sesión ante el cliente; una negociación pendiente no debe agotar la bienvenida |
| D19 (R03-01) | Estados del canal fuera de la cola de señales, en su orden; canales terminados no reconfirmables | Una interrupción observada no puede quedar detrás de una operación WebRTC. Las señales siguen serializadas |
| D16 (R02-01) | Prioridad del `fin` del canal vigente sobre la cola de señales | Un evento terminal no puede quedar retenido detrás de una operación WebRTC; el resto se mantiene serializado |
| D17 (R02-02) | Límite por operación nativa y cancelación lógica | Las promesas nativas no se pueden cancelar; se acotan, se ignora su resultado tardío y se libera la conexión |
| D18 (R02-03) | Continuaciones de otra generación, en silencio | La cancelación ya se registró al terminar; nada antiguo se atribuye a la sesión nueva |
| D15 (R01-07 y R01-08) | Liberar la captura anterior antes de pedir otra; aviso de cierre por POST sin canal | Sin superposición de pistas locales; el cierre local sigue siendo inmediato y el aviso se intenta con la autorización vigente |

## 14. Alternativas evaluadas y no adoptadas

| Alternativa | Motivo |
| --- | --- |
| ICE restart (`restartIce`) sobre la conexión existente | Más complejo de coordinar con colas y señales tardías; la reconstrucción cubre el caso y no requiere negociación simultánea |
| Perfect negotiation (ambos pueden ofrecer) | Contradice la responsabilidad del emisor y añade colisiones de ofertas |
| Reintento automático de la señalización | El encargo exige una acción explícita del usuario y prohíbe bucles de reintento |
| Sustituir el canal registrado al reabrir (expulsar el semiabierto) | Debilitaría la garantía de no expulsar a un participante conectado; queda como decisión futura (§11) |
| Mantener la conexión del espectador cuando el emisor queda ausente | No se puede distinguir un fin no confirmado de una pérdida de red; habría que relajar pruebas de E01/E02 que garantizan la liberación de recursos |
| Ampliar las categorías del informe de E02 | Cambiaría el contrato del esquema 2; las categorías nuevas van a la cronología |
| Guardar la cronología o las credenciales en el navegador para sobrevivir a recargas | Prohibido por el encargo (persistencia de tokens o sesiones) |

## 15. Matriz de criterios de aceptación y pruebas

Pruebas unitarias en `experimentos/directo-movil/pruebas/unidad/` y de navegador en `pruebas/e2e/`. Los resultados exactos están en el resumen de la entrega y en el [README del experimento](../../experimentos/directo-movil/README.md#verificación-de-e03-v13-cloud-25-11-2026). Las regresiones de la revisión E03-R01 están en `revision-r01.test.js` y `revision-r01-funciones.test.js`, las de E03-R02, en `revision-r02.test.js`, y las de E03-R03, en `revision-r03.test.js`.

| Criterio | Pruebas asociadas |
| --- | --- |
| CA-01 Regresiones existentes | Las 73 unitarias y 8 E2E de la base siguen pasando; `e2e-arranque.test.js` cubre también el archivo E2E nuevo |
| CA-02 Cronología exportable, ordenada, versionada y acotada | `cronologia.test.js` (orden, tiempo relativo, 256 eventos, descartes, duplicados, inesperados, APIs ausentes, esquema propio); `recuperacion-cliente.test.js` (emisión normal); E2E «emisión normal y exportación» |
| CA-03 Separación de componentes | `continuidad.test.js` (señalización, presencia, pistas, transporte y reproducción); `recuperacion-cliente.test.js` (canal perdido con transporte conectado, salida frente a desconexión, silencio de pista); E2E de señalización |
| CA-04 Recuperación de la misma sesión con progreso de medios (R02-02: todo reintento termina por sí solo; un segundo reintento tras un agotamiento se confirma) | `recuperacion-cliente.test.js` (EOF y 409, reapertura tras errores, WebRTC `failed`, espectador por solicitud y por reapertura); E2E de recuperación del emisor, del espectador y tras la señalización, con fotogramas, bytes, paquetes y tiempo de reproducción crecientes |
| CA-05 Sin falsas declaraciones de recuperación (R03-01: ninguna confirmación tras una interrupción ya observada, con la cola ocupada, en ambos roles; bienvenida tardía ignorada) | `continuidad.test.js` (`evaluarProgreso`); `recuperacion-cliente.test.js` («sin progreso de medios o sin estadísticas», finalización durante conexión y estadísticas); `revision-r01.test.js`:<br>• R01-02: `failed` durante `getStats`, `disconnected` transitorio, pista silenciada o terminada, cambio de conexión, pérdida de señalización, finalización y caso correcto;<br>• R01-03: bytes de audio, contadores faltantes, detenidos, decrecientes y de un solo medio;<br>• R01-06: confirmación heredada |
| CA-06 Sin conexiones, canales ni capturas duplicadas | `recuperacion-cliente.test.js` (una conexión vigente, mismas pistas, contador de capturas sin cambios, reintento único, 409 sin expulsión); `revision-r01.test.js` (R01-01: la conexión vigente conserva su identidad ante ofertas descartadas; R01-05: la apertura sin bienvenida se cancela; R01-07: ninguna pista activa mientras se pide la captura nueva); E2E de autenticación y recursos (409 a un segundo canal, una captura) |
| CA-07 Finalización irreversible | `revision-r02.test.js`:<br>• R02-01: fin remoto durante `setRemoteDescription`, `createOffer`, `createAnswer` o `setLocalDescription` pendientes, comprobado antes de liberarlas; sin señales posteriores; sin esperas retenidas; fin atrasado de un canal abandonado sin efecto;<br>• R02-02: finalización durante una operación acotada;<br>• R02-03: aislamiento entre generaciones.<br>Además, `recuperacion-cliente.test.js` (durante la apertura SSE, la creación de la oferta, la aplicación de la respuesta, la espera de conexión, las estadísticas y una captura no resuelta); `revision-r01.test.js` (R01-02: finalización entre lecturas; R01-07: finalización durante una reactivación; R01-08: finalización sin canal, con la red recuperada y aún interrumpida); E2E «finalizar durante una recuperación pendiente» |
| CA-08 Sesiones expiradas o finalizadas no recuperables; autorización por rol | `servidor-continuidad.test.js` (caducada, finalizada, otro token, caducidad sin alargar); `recuperacion-cliente.test.js` (404 tras la caducidad, expiración durante el reintento); E2E (403 con otro token y 409) |
| CA-09 Privacidad y seguridad de E02 conservadas | `cronologia.test.js` (señuelos, anidados, prototipos); `recuperacion-cliente.test.js` (sin tokens, sesión, SDP, candidatos ni IP); `senalizacion-continuidad.test.js` (no se copian cuerpos de error no textuales); `servidor-continuidad.test.js` (módulos por lista cerrada con cabeceras); E2E (sin almacenamiento del navegador ni datos sensibles); las pruebas de E02 del informe siguen pasando |
| CA-10 Protocolo físico reproducible con resultados pendientes | [Protocolo CONT](LIVE-FASE03-E03-protocolo-continuidad-android.md), con los doce casos NO EJECUTADOS |
| CA-11 Regresiones de señalización y negociación obsoleta | `senalizacion-continuidad.test.js` (EOF, fin normal, fallo de lectura, cierre con eventos tardíos, apertura cancelada o agotada, HTTP 401/403/404/409/429/500 y red); `servidor-continuidad.test.js` (`neg`, `solicitud-oferta`, motivo de `par`); `recuperacion-cliente.test.js` (respuesta y candidatos obsoletos, anticipados, candidatos salientes tras la oferta, solicitudes repetidas); `revision-r01.test.js` (R01-01: ofertas atrasadas, duplicadas, sin identificador, posterior a una recuperación y tras reabrir; R01-04: 409 reales y desconocidos; R01-05: HTTP 200 sin bienvenida y bienvenida con negociación retenida); `revision-r01-funciones.test.js` (límite del contador) |
| CA-12 Alcance documental reconciliado | README, estado del proyecto, plan v1.9 y README del experimento; sin autorizar otras fases |

La **aceptación del paquete técnico** no equivale al cierre de E03: la publicación de la implementación no sustituye la validación física del protocolo CONT.

## 16. Limitaciones conocidas y aspectos no implementados

- **Solo verificación automatizada en Linux.** No se ejecutó nada de E03 en Windows ni en Android. Los medios sintéticos de Chromium **no son evidencia del comportamiento físico de Android**.
- **Interrupciones sintéticas.** Las pruebas de navegador provocan las interrupciones cerrando una `RTCPeerConnection` registrada por un script de inicio de la propia prueba, o cerrando en el servidor el flujo de eventos. Las unitarias usan dobles controlados. Ninguna reproduce un segundo plano, un bloqueo de pantalla o un cambio de red reales.
- **Canal semiabierto.** Tras una pérdida de red real, el servidor puede tardar en detectar el cierre del flujo anterior (latido cada 15 s), y el reintento responderá 409 hasta entonces. No se cambió la detección ni la regla de 409.
- **D3:** una pérdida de solo señalización del otro participante interrumpe los medios hasta que se reconstruye la conexión.
- **Cronología:** se pierde si Chrome recarga o descarta la página. `wasDiscarded`, `freeze` y `resume` solo constan si el navegador los ofrece. Los tiempos son relativos a cada dispositivo y no comparables entre ellos.
- **Progreso de medios:** confirma bytes, fotogramas y paquetes, no la calidad percibida; la percepción la confirma la persona.
- **AND-08-H01** (contador histórico) no se reprodujo ni se investigó más allá de conservar `flujosLocalesCreados` y la protección frente a capturas tardías; su causa sigue indeterminada.
- **Límite de negociaciones por página del emisor:** 2³¹−1, sin vuelta. Al alcanzarlo hace falta una sesión nueva; en la práctica es inalcanzable.
- **No implementado (fuera de alcance):** la regla del minuto de reconexión, pausa de contadores y devoluciones; ICE restart; sustitución de canales; STUN/TURN; reconexión automática; multistream; chat; regalos; grabación; persistencia; Windows y Android probados para E03.

## 17. Revisión E03-R01

La auditoría independiente de la v1.0 confirmó cuatro defectos (R01-01 a R01-04) y señaló cuatro riesgos (R01-05 a R01-08).

- **Defectos confirmados.** Los cuatro se reprodujeron con las sondas de la auditoría y con regresiones con aserciones, que fallan sobre la v1.0 y pasan sobre la v1.1.
- **Riesgos.** R01-05, R01-06 y R01-07 se reprodujeron con pruebas controladas y se corrigieron. R01-08 no se reproduce como fallo observable en la v1.0: el canal agotado conserva allí su objeto y el aviso de fin sale por él. Sí se presentaría con la corrección de R01-05, que cancela la apertura no confirmada, así que se corrige y queda cubierto por regresiones.

Detalle, evidencias y limitaciones en el [registro de resolución E03-R01](LIVE-FASE03-E03-R01-registro-resolucion.md).

**Decisión futura, no autorizada.** Sigue sin autorizarse:

- la sustitución o expulsión de un canal ocupado;
- la toma de posesión automática de canales y la renovación de credenciales;
- la persistencia de sesión;
- la política de reconexión de un minuto del producto.

La garantía de no sustituir un canal ocupado se conserva (§11).

## 18. Revisión E03-R02

La auditoría independiente de la v1.1 confirmó tres defectos. Los tres se reprodujeron con las sondas de la auditoría y con 11 regresiones: 9 fallan sobre la v1.1 y las 11 pasan sobre la v1.2. Las otras dos comprueban garantías que la v1.1 ya cumplía.

- **R02-01:** prioridad del `fin` frente a una negociación pendiente.
- **R02-02:** límite efectivo de la negociación en un reintento.
- **R02-03:** aislamiento entre generaciones.

La causa común era la duración y la vigencia de las operaciones asíncronas. Detalle, límites resultantes, garantías y riesgos residuales en el [registro de resolución E03-R02](LIVE-FASE03-E03-R02-registro-resolucion.md). Las ocho correcciones de E03-R01 se conservan.

## 19. Revisión E03-R03

La auditoría de la v1.2 dejó conformes R01 y R02 y confirmó un defecto, R03-01: una recuperación se confirmaba con la señalización ya interrumpida.

- **Causa:** los cambios de estado del canal esperaban en la cola de señales detrás de una operación WebRTC.
- **Corrección:** los estados del canal vigente se aplican en su orden, fuera de la cola; los canales terminados no se reconfirman; y el reintento no renegocia sin señalización confirmada.
- **Regresiones:** 8, de las que 5 fallan sobre la v1.2 y 8 pasan sobre la v1.3.
- **Precisión documental:** también se reconcilió la descripción del agotamiento de `addIceCandidate`.

Detalle en el [registro E03-R03](LIVE-FASE03-E03-R03-registro-resolucion.md).
