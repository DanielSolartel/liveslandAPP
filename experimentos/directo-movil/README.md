# Experimento: primer directo técnico (LIVE-FASE03-E01)

Experimento web de **emisión interna**: un emisor captura cámara y micrófono y un espectador recibe su audio y su video por **WebRTC**, con señalización local mínima. Es una parte de la prueba técnica de FASE-03 ([plan](../../docs/estado/PLAN-POR-FASES.md)).

**No es la aplicación de producción** ni su arquitectura. Tampoco elige proveedor. Usa contenido neutral, sin cuentas, grabación, monedas ni cobros.

Entregas: E01 creó la emisión interna, E02 añadió el informe de diagnóstico y la validación física en Android, y **LIVE-FASE03-E03** añade una cronología de continuidad, estados visibles por componente y una recuperación manual controlada dentro de la misma sesión ([diseño](../../docs/expedientes/LIVE-FASE03-E03-diseno-continuidad.md)). E03 v1.3, corregida tras las revisiones E03-R01, E03-R02 y E03-R03 ([registro R01](../../docs/expedientes/LIVE-FASE03-E03-R01-registro-resolucion.md), [registro R02](../../docs/expedientes/LIVE-FASE03-E03-R02-registro-resolucion.md) y [registro R03](../../docs/expedientes/LIVE-FASE03-E03-R03-registro-resolucion.md)), está preparada y pendiente de auditoría y publicación; su validación física ([protocolo CONT](../../docs/expedientes/LIVE-FASE03-E03-protocolo-continuidad-android.md)) no se ha ejecutado.

## Qué hace

1. **Crear sesión.** El emisor crea una sesión temporal en memoria. Recibe un enlace para el espectador con un identificador y un token impredecibles; el token va en el fragmento `#`, que no se envía al servidor.
2. **Activar captura.** El emisor pulsa «Activar cámara y micrófono» y ve su vista previa local silenciada.
3. **Mirar.** El espectador abre el enlace en otro navegador o contexto y recibe audio y video del emisor por una `RTCPeerConnection` real. Si el navegador exige un gesto para reproducir, aparece el botón «Reproducir audio y video».
4. **Ver el estado.** Se muestran la señalización, `connectionState`, `iceConnectionState`, los medios y los errores (permiso denegado, API ausente, contexto inseguro, enlace no válido, sesión terminada, fallo de conexión).
5. **Finalizar o salir.** «Finalizar emisión» detiene en el acto las pistas de captura y cierra la conexión WebRTC y el canal de señalización, sin esperar a la red. A la vez avisa al servidor, que elimina la sesión y avisa al espectador. «Salir» cierra solo al espectador y avisa al servidor del mismo modo.
   - El aviso al servidor tiene un límite de 3 s. Si no llega confirmación, la página lo indica (`aviso sin confirmar`) y no la da por hecha.
   - «Nueva sesión» empieza de cero, sin pistas antiguas. Si una captura llega cuando su sesión ya terminó, sus pistas se detienen y no se usan. Las respuestas pendientes de una sesión terminada tampoco afectan a la siguiente.
6. **Informe de diagnóstico.** La sección «Informe de diagnóstico» genera, y a petición copia, un JSON para registrar las pruebas en cualquier momento (antes de activar la captura, durante la emisión y después de finalizar), como emisor y como espectador. Ver [Informe de diagnóstico](#informe-de-diagnóstico).
7. **Continuidad (E03).** El estado muestra por separado la sesión, la señalización, el otro participante, las pistas, la conexión WebRTC y la reproducción, y un estado de continuidad derivado de ellos. Si algo se interrumpe, «Reintentar conexión» intenta recuperar **la misma sesión**, solo cuando se pulsa. Ver [Continuidad, recuperación manual y cronología](#continuidad-recuperación-manual-y-cronología-e03).
8. **Cronología de continuidad (E03).** «Generar cronología» y «Copiar cronología» exportan los eventos de continuidad de la página (hasta 256), sin datos sensibles.

Un emisor y un espectador por sesión es el alcance de este experimento, **no una reducción del piloto** (5 creadores y 50 espectadores simultáneos en total).

## Requisitos y dependencias

- Node.js 22 o superior. No hay dependencias de ejecución: el servidor usa solo `node:http`, `node:https` y `node:crypto`.
- Dependencias de desarrollo, con versión fija en `package-lock.json`:

| Paquete | Para qué |
| --- | --- |
| `typescript` 5.9.3 | Validar los tipos del JavaScript (JSDoc y `checkJs`), sin compilación |
| `@types/node` 22.20.5 | Tipos de Node para esa validación |
| `playwright-core` 1.56.1 | Prueba del recorrido en un navegador real. No descarga navegadores por sí solo |

## Comandos

**Cloud o Linux (bash), desde `experimentos/directo-movil/`:**

```bash
npm ci                    # instalación reproducible desde package-lock.json
npm run comprobar         # tipos + pruebas unitarias
npm run prueba:e2e        # recorrido en Chromium con medios sintéticos
npm start                 # http://127.0.0.1:8787/
DIRECTO_PUERTO=8788 npm start
```

**Windows (PowerShell), desde `experimentos\directo-movil\`:**

```powershell
npm ci
npm run comprobar
npm start                                  # http://127.0.0.1:8787/
$env:DIRECTO_PUERTO = "8788"; npm start
# Prueba en navegador: con Chrome o Edge instalados...
$env:DIRECTO_CANAL = "chrome"; npm run prueba:e2e
# ...o descargando el Chromium de esta versión de Playwright:
npx playwright-core install chromium; npm run prueba:e2e
```

**Variables de entorno:**

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `DIRECTO_HOST` | `127.0.0.1` | Fuera de loopback solo se admite con HTTPS |
| `DIRECTO_PUERTO` | `8787` | Puerto local |
| `DIRECTO_TLS_CERT`, `DIRECTO_TLS_KEY` | — | Certificado y clave PEM para HTTPS. Deben estar **fuera del repositorio** |
| `DIRECTO_CHROMIUM`, `DIRECTO_CANAL` | — | Navegador para `prueba:e2e`: ruta del ejecutable o canal (`chrome`, `msedge`) |

**Si el Chromium predeterminado no está disponible.** `prueba:e2e` busca el navegador de la revisión que fija `playwright-core` 1.56.1 (Chromium revisión 1194). Si el equipo trae otra, la prueba falla al arrancar, con un mensaje como `Executable doesn't exist at …/chromium-1194/…`, y la batería termina sola. **No actualices dependencias para adaptar el experimento.** Indica el navegador instalado con `DIRECTO_CHROMIUM` (ruta del ejecutable) o `DIRECTO_CANAL`, y registra la ruta, la versión y el motivo:

```bash
DIRECTO_CHROMIUM=/opt/pw-browsers/chromium npm run prueba:e2e      # Cloud, que trae otra revisión
```

```powershell
$env:DIRECTO_CANAL = "msedge"; npm.cmd run prueba:e2e              # Edge instalado (o "chrome")
$env:DIRECTO_CHROMIUM = "<ruta de chrome.exe>"; npm.cmd run prueba:e2e
```

La versión del navegador se consulta en `chrome://version`. En PowerShell, si `npm` falla porque `npm.ps1` no puede ejecutarse, usa `npm.cmd`; no cambies la política de ejecución.

**Uso manual en un solo equipo:** arranca con `npm start` y abre `http://127.0.0.1:8787/`. Crea la sesión, activa la captura y abre el enlace del espectador en otro navegador o en una ventana privada.

## Seguridad y límites del servidor

- **Escucha:** por defecto solo en `127.0.0.1`. Si `DIRECTO_HOST` no es loopback y falta HTTPS, el arranque se rechaza. No se abren túneles ni se publica nada automáticamente.
- **Sesiones:** en memoria. Identificador de 16 bytes y un token por rol de 32 bytes, comparados en tiempo constante. Los tokens viajan en la cabecera `Authorization`, también en el flujo de eventos, que es SSE leído con `fetch`.
- **Rechazos:**
  - el token de otra sesión: 403;
  - una señal no permitida para el rol: 403 (por ejemplo, el espectador enviando una oferta);
  - un segundo canal para el mismo rol: 409;
  - JSON inválido o tipos desconocidos: 400;
  - un tipo de contenido distinto de JSON: 415;
  - cuerpos de más de 64 KiB: 413;
  - más de 300 señales por minuto en una sesión: 429.
- **Saneamiento:** solo se reenvían campos conocidos de `oferta`, `respuesta` y `candidato`. Desde E03, estas tres señales admiten un identificador de negociación opcional, `neg` (entero de 1 a 2³¹−1; otro valor recibe 400). Sirve solo para correlacionar señales y no autentica nada. El emisor lo incrementa sin dar la vuelta, y el espectador solo acepta ofertas posteriores a la última aceptada: las repetidas, las atrasadas y las que no traen `neg` tras una correlacionada se descartan sin tocar la conexión vigente (E03-R01-01). El espectador puede enviar `solicitud-oferta`, sin datos, para que el emisor renegocie; el espectador sigue sin poder ofrecer (403).
- **Ausencia del otro participante (E03):** el evento `par` ausente lleva `motivo`: `salida` (salida registrada) o `desconexion` (el flujo se cerró sin salida registrada; no afirma la causa).
- **Recursos:**
  - máximo 16 sesiones;
  - una vida máxima de 30 min por sesión;
  - se limpian las sesiones que pasan 60 s sin participantes;
  - el fin del emisor y la detención del servidor cierran sesiones y flujos.
- **Archivos públicos:** solo los de `public/`, por lista cerrada, con cabeceras CSP, `nosniff`, `no-referrer` y `Permissions-Policy` de cámara y micrófono.
- **Temporizadores técnicos de E03:** apertura del flujo de eventos (5 s), bienvenida tras reabrir (5 s), hasta 3 reaperturas ante 409 separadas 1 s, oferta nueva en el espectador (10 s), conexión tras renegociar (15 s), hasta 4 lecturas de progreso separadas 1 s, 2 s entre ofertas pedidas por el espectador y 4 s por cada operación WebRTC nativa de una negociación (E03-R02). Todo reintento termina por sí solo: el peor caso es de 53 s en el espectador. Detalle y motivos en el [diseño, §10](../../docs/expedientes/LIVE-FASE03-E03-diseno-continuidad.md#10-límites-temporales). Ninguno es la regla de reconexión del producto.
- **Límite de envío del cliente:** cada POST de señalización se cancela a los 3 s (`LIMITE_ENVIO_MS`, en `public/senalizacion.js`) y se informa como `tiempo-agotado`. Es un límite técnico para que ninguna tarea quede esperando a la red, **no la regla de reconexión de 1 minuto** del producto, que este experimento no implementa.
- **Conectividad:** sin STUN ni TURN (`iceServers: []`), solo candidatos locales. Funciona en el mismo equipo o en una red local sin aislamiento entre clientes. **No se promete conexión entre redes arbitrarias ni tras NAT.** Los nombres mDNS (`.local`) que Chrome usa para ocultar IP locales pueden impedir la conexión en algunas redes.

## Contexto seguro y prueba física en Android

Los navegadores solo permiten cámara y micrófono en un **contexto seguro**. Abrir `http://<IP de la LAN>:8787` desde el teléfono **no sirve**: el servidor tampoco lo permite sin HTTPS. Hay dos rutas reproducibles. La ruta A se usó en la validación física de E02 ([resultados](../../docs/expedientes/LIVE-FASE03-E02-resultados-android.md)); la ruta B no se ha ejecutado:

- **A. Loopback con `adb reverse`.** Es la recomendada para empezar.
  1. Activa la depuración USB en el teléfono y conéctalo al equipo, con Android Platform Tools instalado.
  2. En el equipo, ejecuta `npm start` y `adb reverse tcp:8787 tcp:8787`.
  3. En el Chrome del teléfono, abre `http://localhost:8787/`: es un contexto seguro.
  4. El espectador abre el enlace en el equipo, en `http://127.0.0.1:8787/…`. El enlace se genera en el teléfono y hay que llevarlo al equipo por un canal propio: contiene un token, así que no lo publiques.

  La señalización viaja por USB, pero **los medios van por la red**: teléfono y equipo deben estar en la misma Wi-Fi o LAN, sin aislamiento de clientes.
- **B. HTTPS de confianza en la LAN.**
  1. Genera fuera del repositorio un certificado para el nombre o la IP del equipo con una CA local que el teléfono acepte (por ejemplo, mkcert, instalando su CA en Android).
  2. Arranca con `DIRECTO_HOST=0.0.0.0`, `DIRECTO_TLS_CERT` y `DIRECTO_TLS_KEY`.
  3. Abre `https://<nombre o IP>:8787/`.

  Que Chrome para Android acepte esa CA es un requisito **por comprobar** en cada equipo.

**Prueba manual en Android.** El procedimiento paso a paso para Windows 11 y PowerShell 5.1, la plantilla de resultados y los problemas frecuentes están en el [protocolo LIVE-FASE03-E02](../../docs/expedientes/LIVE-FASE03-E02-protocolo-android.md), que conserva su estado de preparación (v1.3). Sus trece casos se ejecutaron el 23 y 24-11-2026; los resultados, las reservas y los hallazgos están en el [expediente de resultados](../../docs/expedientes/LIVE-FASE03-E02-resultados-android.md). Al repetir la prueba, registra:

- el modelo, la versión de Android y la de Chrome, y la red usada;
- la concesión o denegación del permiso;
- si la vista previa está silenciada;
- la recepción de audio y video en el equipo y el estado `connected`;
- si al finalizar se apaga el indicador de cámara del sistema;
- el comportamiento con la página oculta y con la pantalla bloqueada (LIVE-002, prueba 1).

La validación física en Android se hizo por la ruta A, con las reservas del [expediente de resultados](../../docs/expedientes/LIVE-FASE03-E02-resultados-android.md). La señalización viajó por USB con `adb reverse` y el audio y el video por WebRTC en red local entre Android y Windows. Resultados con reserva que **no están resueltos**: en segundo plano (unos 30 s) el audio se interrumpió y el video se congeló, con recuperación automática; con la pantalla bloqueada hubo interrupción audiovisual, recuperada al desbloquear. Dos observaciones distintas: (1) al cambiar de Wi-Fi se perdió la **conexión WebRTC**; se finalizó la emisión manualmente y se creó una sesión nueva, sin que se demostrara pérdida de la sesión en el servidor y sin afirmar reconexión automática (OBS-WIFI-01); (2) tras unos 60 s fuera de Chrome se perdió la emisión original, Chrome volvió a la pantalla inicial y hubo que crear otra sesión, con causa técnica indeterminada (AND-09-H02). La ruta B (HTTPS de confianza en la LAN) está documentada, pero **no está validada**.

**Segunda validación física (E03).** El [protocolo CONT](../../docs/expedientes/LIVE-FASE03-E03-protocolo-continuidad-android.md) prepara doce casos de continuidad: primer plano durante 5 min, segundo plano de 15 a 90 s, bloqueo de pantalla, interrupción de la misma Wi-Fi y de la señalización, recuperación manual, finalización durante una recuperación, y privacidad y limpieza. Todos están **NO EJECUTADOS**.

## Continuidad, recuperación manual y cronología (E03)

**Estados por componente.** La sección «Estado» muestra la sesión según la página, la señalización, el otro participante (presente, ausente con su motivo o desconocido sin señalización), las pistas, la conexión, ICE, la reproducción y un estado de **Continuidad**:

- sin sesión, esperando participante o conectando;
- conectada;
- interrupción detectada, recuperación en curso o recuperación técnica confirmada;
- no recuperada (requiere intervención);
- finalizada.

Cada estado aparece con su motivo. Perder un componente no se presenta como la pérdida de los demás:

- **Ocultar o congelar la página no finaliza nada.**
- **Una salida voluntaria del espectador no es un fallo:** el emisor queda esperando participante.
- **Una interrupción no es un cierre definitivo.**

**«Reintentar conexión».** Solo actúa al pulsarlo. No hay reintentos automáticos de la señalización; la recuperación espontánea del transporte se muestra, pero no se fuerza.

- **Qué hace.** Reabre la señalización de **la misma sesión** con las credenciales que la página tiene en memoria. Después renegocia la conexión con las pistas existentes, **sin volver a pedir cámara y micrófono** ni aumentar `flujosLocalesCreados`.
- **Cómo confirma.** Comprueba con lecturas sucesivas de `getStats()` de la misma conexión que los medios avanzan.
  - El emisor solo confirma que **envía**: no puede saber si el espectador ve y oye.
  - El espectador confirma que **recibe** audio y video (bytes y paquetes de audio, bytes de video) y que se **decodifican fotogramas de video**; la decodificación del audio no se mide (E03-R01-03). La percepción la confirma la persona.
  - Sin estadísticas consta «no verificada», y sin progreso, «no confirmada».
- **Garantías.**
  - Un solo reintento a la vez.
  - El espectador nunca ofrece: si su conexión falló, pide al emisor una negociación nueva.
  - Si el servidor aún conserva el canal anterior del rol (409 `rol-ya-conectado`), se reintenta hasta 3 veces y se informa; no se expulsa a nadie. Otros 409 (por ejemplo, `par-ausente`) se informan una vez con su propia categoría (E03-R01-04).
  - La señalización solo cuenta como recuperada al procesar la bienvenida del servidor; una respuesta HTTP 200 sin bienvenida se cancela al agotar la espera (E03-R01-05).
  - Una confirmación exige que la conexión, la señalización y las pistas sigan aptas y sin interrupciones durante toda la comprobación y al publicarla (E03-R01-02). Solo vale para la conexión que la produjo: tras otra interrupción o con otra conexión se muestra como antecedente (E03-R01-06).
  - Al reactivar la captura, la anterior se libera antes de pedir la nueva (E03-R01-07).
  - El aviso de fin o de salida se envía aunque no haya canal vigente (E03-R01-08).
  - Un fin del servidor termina la sesión en el acto, aunque haya una negociación pendiente (E03-R02-01).
  - Una operación WebRTC que no responde agota el reintento, que se puede repetir (E03-R02-02).
  - Una operación de una sesión anterior no toca la sesión nueva (E03-R02-03).
  - Una interrupción de la señalización se refleja en el acto, aunque haya una operación WebRTC pendiente, e invalida la comprobación en curso. Una bienvenida atrasada no reconfirma un canal interrumpido (E03-R03-01).
  - Una sesión caducada o finalizada no se recupera: si el servidor confirma que ya no existe, la página libera la captura y termina.
  - Finalizar o salir durante un reintento lo cancela, y ninguna operación tardía reactiva la emisión.
  - El reintento no alarga la caducidad de la sesión.

**Cronología de continuidad** (esquema `live-directo-movil/cronologia-continuidad/1`, independiente del informe, que conserva su esquema 2).

- **Contenido.** Registra, cuando las APIs existen:
  - visibilidad, `pagehide`, `pageshow`, `freeze` y `resume`, y el indicador de descarte si el navegador lo da;
  - `online` y `offline`, que son indicios, no confirmaciones;
  - la captura, con `mute`, `unmute`, `ended`, la liberación y las capturas tardías;
  - la señalización: apertura, reapertura, interrupción con su categoría, presencia y señales obsoletas;
  - WebRTC: conexión, ICE, `signalingState`, pistas recibidas y resultado de la negociación;
  - la recuperación y la finalización.
- **Formato.** Cada evento lleva un número de secuencia, el tiempo en milisegundos desde el inicio del registro (reloj monotónico), el número local de sesión de la página (1, 2…, que no es el identificador del servidor) y valores de listas cerradas.
- **Límite.** Conserva como máximo **256 eventos** en un búfer circular y cuenta los descartados.
- **Lo que no contiene** (se construye por lista permitida): tokens, identificadores de sesión, enlaces, SDP, candidatos, IP, nombres de red, datos de dispositivos, agentes de usuario, mensajes de error ni contenido audiovisual.
- **Dónde vive.** En la memoria de la página: no se guarda en el navegador ni se envía al servidor, y **se pierde si Chrome recarga o descarta la página**.
- **Relojes.** Los tiempos de un dispositivo no son comparables con los del otro, porque sus relojes no están sincronizados.
- **Copia.** Con las mismas garantías que el informe. Solo hay una escritura al portapapeles a la vez, de cualquiera de los dos documentos, y no se afirma la copia de un contenido obsoleto. Si la copia falla, queda la alternativa manual.

## Informe de diagnóstico

Cada página tiene los botones «Generar informe» y «Copiar informe». El informe es un JSON (esquema `live-directo-movil/informe-diagnostico/2`), pensado para anotar las pruebas físicas sin copiar a mano los estados de la página. Se puede generar antes de activar la captura, durante la emisión y después de finalizar, como emisor y como espectador. Generarlo no pide permisos, ni inicia capturas, ni crea sesiones, ni cambia la conexión. El esquema 2 sustituye el campo `navegador.agente` (cadena) por `navegador.familia` y `navegador.version`, y `navegador.plataforma` pasa a ser un valor de lista cerrada.

- **Contenido (lista de campos permitidos):**
  - la versión del esquema y la hora de generación;
  - el rol, la familia del navegador (`chrome`, `chrome-sin-interfaz`, `edge`, `firefox`, `safari`, `opera` o `samsung`), su versión mayor (un entero de hasta tres cifras), la plataforma (`android`, `ios`, `chromeos`, `windows`, `macos` o `linux`), el contexto seguro y las APIs disponibles;
  - el estado de la captura y de la reproducción;
  - las pistas activas locales y remotas, con ajustes audiovisuales (resolución, fotogramas por segundo, orientación de la cámara, frecuencia de muestreo y canales);
  - los estados WebRTC e ICE;
  - métricas agregadas de envío y recepción;
  - la finalización y la liberación de recursos;
  - las categorías de error.

  Lo que no se puede saber consta como `null` y en la lista `noDisponible`; no se inventa. Un navegador, una versión o una plataforma que no se reconocen constan así, sin conservar la cadena original.
- **Instantánea:** el informe describe un único instante, el de la solicitud (`generadoEn`). Todo el estado se lee de una vez y solo después se esperan las estadísticas WebRTC, con un máximo de 2 s. Si la conexión o la sesión cambian mientras se esperan, o si no llegan a tiempo o fallan, las métricas constan como no disponibles (`metricas.disponible` falso, con `motivo` `descartadas`, `tiempo-agotado` o `error`). Si se pide otro informe antes de que termine el anterior, solo vale el último: el anterior no se muestra ni se copia.
- **Excluido:** tokens, identificadores de sesión, enlaces y URL, SDP, candidatos ICE, direcciones IP y nombres de red, identificadores, etiquetas y grupos de dispositivos, mensajes de error sin sanear y el contenido de la cámara y el micrófono. **Tampoco se exporta el agente de usuario ni la plataforma tal como los comunica el navegador**: se analizan en la página y solo salen la familia, la versión y la plataforma de las listas cerradas. No se piden valores de alta entropía de `userAgentData`. El informe se arma copiando solo los campos de una lista explícita (`construirInforme`, en `public/medios.js`), no serializando objetos del navegador.
- **Copia:** solo ocurre al pulsar «Copiar informe». Si el portapapeles no está disponible o falla, el informe queda seleccionado en el cuadro de texto para copiarlo a mano y la página no dice que se copió. No se envía a ningún servidor.
  - **Una sola copia a la vez.** Mientras una escritura al portapapeles está pendiente, el botón «Copiar informe» queda deshabilitado y la página indica «Copiando el informe…». Así dos escrituras no pueden terminar en orden inverso. Generar informes sigue disponible.
  - **Copia superada.** Si mientras se copia un informe se genera otro, al terminar la escritura la página no cambia el mensaje, la selección ni el foco del informe reciente y no afirma que este se copió. El portapapeles contiene el informe de cuando se pulsó; para copiar el reciente, vuelve a pulsar «Copiar informe» cuando el botón se rehabilite.
  - **Escritura que no termina.** Si el navegador no resuelve la escritura nunca, no se cancela ni se simula su cancelación, ni se permite otra: el botón de copia sigue deshabilitado, pero los informes se siguen generando y se pueden copiar a mano desde el cuadro de texto. Recargar la página restablece el botón.

## Verificación de E01 v1.2 (Cloud, 18-10-2026; histórica)

**Entorno:** Linux x86_64, Node.js 22.22.0, npm 10.9.4, Chromium 141.0.7390.37 (Playwright 1.56.1, revisión 1194; canal `chromium` sin interfaz).

La prueba de arranque (`pruebas/unidad/e2e-arranque.test.js`) lanza su proceso hijo con `--test-reporter=tap`: sus comprobaciones no dependen del formato por defecto de cada versión de Node. Según la auditoría de ChatGPT, con Node 24.19.0 ese formato por defecto era `spec` (líneas como `ℹ fail 7`), y con este ajuste `npm run comprobar` da tipos correctos y 37 de 37 pruebas. En Cloud no hay Node 24 instalado.

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instalación desde el lockfile, sin dependencias de ejecución |
| `npm run tipos` | Sin errores |
| `npm run prueba` | 37 pruebas superadas. Las 26 de la v1.0 cubren validación de señales, almacén de sesiones, servidor HTTP (aislamiento entre sesiones, roles, mensajes inválidos, tamaños, límites, desconexión, abandono, caducidad, fin y parada), lector SSE y módulo de medios (contexto inseguro, API ausente, errores de permiso y dispositivo, liberación de pistas). Las 11 nuevas cubren la lógica del cliente con **dobles controlados** (R01-01 y R01-02), el límite de envío y la terminación de la batería del navegador cuando este no arranca (R01-03) |
| `npm run prueba:e2e` | 7 pruebas superadas en Chromium con **dispositivos sintéticos** (`--use-fake-device-for-media-stream`) |
| `DIRECTO_CHROMIUM=/ruta/inexistente npm run prueba:e2e` | Termina solo, en menos de 1 s, con código 1: las 7 pruebas fallan con el motivo («No se pudo arrancar el navegador de la prueba…»), ninguna se da por superada y no quedan servidores abiertos |
| `npm start` | Escucha en `127.0.0.1` y no responde desde la IP del contenedor. Rechaza `DIRECTO_HOST=0.0.0.0` sin HTTPS, un puerto inválido y un solo archivo TLS. Arranca en HTTPS con un certificado temporal generado y borrado fuera del repositorio |

Las 7 pruebas de `npm run prueba:e2e` comprueban:

1. **Recorrido completo**, con dos contextos de navegador aislados:
   - el espectador queda en `connected`, con más de 10 fotogramas de video decodificados y más de 10 paquetes de audio recibidos (`getStats`), el video remoto con dimensiones y avanzando, y bytes enviados por el emisor;
   - al finalizar quedan 0 pistas de captura activas y se cierran la conexión y la sesión del servidor;
   - una nueva sesión solo tiene activas sus 2 pistas nuevas, y el enlace anterior queda rechazado.
2. **Permiso denegado**, mediante el protocolo de depuración de Chromium: se muestra el mensaje y no queda ninguna pista.
3. **API ausente**, simulada eliminando `navigator.mediaDevices`: se muestra el mensaje.
4. **Token ajeno:** un enlace con el token de otra sesión es rechazado.
5. **Fin con el aviso retenido y WebRTC conectado.** La petición `fin` se intercepta sin respuesta:
   - la vista final aparece en menos de 1,5 s, sin pistas activas ni conexión, y el espectador detecta la desconexión;
   - a los 3 s el navegador cancela la petición y la página indica que el fin no se confirmó, mientras la sesión sigue en el servidor;
   - después, una sesión nueva captura y finaliza con normalidad.
6. **Salida del espectador con el aviso retenido y WebRTC conectado:** la página cierra sin esperar y el emisor detecta la salida. Tampoco se da la salida por confirmada, y el emisor finaliza con normalidad.
7. **Captura pendiente de una sesión anterior.** Se retrasa la captura sintética y se cuentan las pistas de todos los flujos entregados a la página:
   - la captura de A llega cuando B ya existe: se detiene y B sigue sin captura;
   - B activa y finaliza su propia captura sin dejar pistas activas;
   - una captura que llega tras finalizar no cambia la vista final.

**Medios sintéticos:** la cámara y el micrófono de las pruebas son los dispositivos simulados de Chromium, no dispositivos físicos. La recepción se verificó por WebRTC real entre dos contextos del mismo navegador y del mismo equipo.

**Dobles controlados:** `pruebas/unidad/cliente.test.js` ejecuta `public/app.js` en Node contra el servidor real, con los dobles de `navegador-simulado.js`:
- un DOM mínimo generado desde `index.html`;
- una captura que la prueba resuelve o rechaza cuando quiere;
- una `RTCPeerConnection` simulada;
- peticiones POST retenidas.

Esas pruebas cubren la lógica del cliente (fin y salida con la petición retenida, respuesta tardía, capturas y negociaciones de una sesión anterior). No sustituyen al navegador, a WebRTC ni a los dispositivos, y no necesitan Chromium.

## Verificación de E02 v1.3 (Cloud, 23-11-2026)

**Entorno:** Linux x86_64, Node.js 22.23.5, npm 10.9.9. Navegador: Chrome for Testing 158.0.8127.36, en `/opt/pw-browsers/chromium`. Se usó `DIRECTO_CHROMIUM` porque el Chromium predeterminado de esta versión de Playwright (revisión 1194, véase la verificación histórica anterior) no está instalado en ese entorno, que trae la revisión 1243. Las dependencias no se actualizaron. Esta verificación **no sustituye** a la histórica: son ejecuciones distintas, con otras versiones.

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instalación desde el lockfile |
| `npm run tipos` | Sin errores |
| `npm run prueba` | 73 pruebas superadas: las 70 de la v1.2 (37 anteriores, 12 de `informe.test.js` y 21 de `informe-cliente.test.js`) y 3 nuevas de `comparacion-portapapeles.test.js` (revisión E02-R03) |
| `npm run prueba:e2e`, sin `DIRECTO_CHROMIUM` | Falla al arrancar el navegador, con el motivo, y la batería termina sola: no se da por superada |
| `DIRECTO_CHROMIUM=/opt/pw-browsers/chromium npm run prueba:e2e` | 8 pruebas superadas: las 7 anteriores, con sus comprobaciones de transporte WebRTC, y 1 nueva del informe |
| `git diff --check` | Sin avisos |

**Pruebas del informe:**
- `informe.test.js`, funciones puras:
  - la lista permitida de campos y la exclusión de valores señuelo (identificadores de dispositivo, direcciones IP, candidatos, huellas DTLS, mensajes de error);
  - los datos no disponibles, las métricas y las categorías de error;
  - la liberación de recursos y la copia al portapapeles.
- `informe-cliente.test.js`, con la página simulada y el servidor real:
  - el informe antes, durante y después de la emisión, y para los dos roles;
  - tokens e identificadores de sesión ausentes;
  - generar o copiar no cambia sesiones, pistas, conexiones ni capturas;
  - copia solo por acción explícita, y alternativa manual cuando el portapapeles falla o no existe.
- Regresiones de la revisión E02-R03 (`comparacion-portapapeles.test.js`): la comparación original falla ante CRLF y la corregida acepta la equivalencia LF/CRLF; se rechazan 16 alteraciones (un carácter, un valor, un campo menos, truncado, espacios o saltos añadidos, un CR suelto, mayúsculas); solo se normaliza CRLF, sin recortar.
- Regresiones de la revisión E02-R02, que fallan sobre la v1.1 y pasan en la v1.2: copias superadas que terminan bien o se rechazan, una sola escritura pendiente, copia normal y rechazo vigente con alternativa manual, escritura que no termina y copia superada mientras se esperaban las estadísticas.
- Regresiones de la revisión E02-R01, que fallan sobre la v1.0 y pasan desde la v1.1:
  - la finalización o el cambio de conexión mientras `getStats()` está pendiente;
  - las estadísticas de una sesión anterior;
  - dos solicitudes que se resuelven en orden inverso, también con la copia;
  - un `getStats()` que no se resuelve o que rechaza;
  - valores señuelo en el agente de usuario y en la plataforma.
- `pruebas/e2e/recorrido.test.js`, con Chromium, medios sintéticos y WebRTC real: informes del emisor y del espectador durante la transmisión y después de finalizar, copia real al portapapeles y ausencia de datos sensibles, con familia, versión y plataforma reconocidas.

**Windows, comunicado por ChatGPT y no ejecutado en esta verificación (v1.2, antes de la corrección R03):** Según el encargo E02-R03, el usuario ejecutó la v1.2 en Windows 11 el 23-11-2026, con Node.js 24.15.0, npm 11.12.1 y Microsoft Edge 158: `npm ci` correcto, tipos correctos, 70 de 70 pruebas unitarias (incluidas las seis regresiones de E02-R02-01) y **7 de 8** pruebas de navegador, sin commits ni push y con HEAD en `7eae89e`. La que falló fue la prueba del informe, en la comparación del portapapeles: Windows devuelve saltos CRLF y el cuadro de texto, LF (2714 caracteres frente a 2603, 111 CR de diferencia, idénticos tras normalizar CRLF a LF). No hubo pérdida de información ni fallo del transporte WebRTC. La v1.3 corrige solo la comparación de esa prueba (`pruebas/e2e/comparacion-portapapeles.js`): admite únicamente la diferencia CRLF/LF y compara el resto de forma estricta. **Las ocho pruebas de navegador no se dan por superadas en Windows hasta que el usuario repita la batería con la v1.3.** En Linux (esta verificación) el portapapeles devuelve LF y las ocho pasan, y una emulación de CRLF sobre Chromium reproduce el fallo de la comparación original y comprueba que la corregida pasa.

Además, el usuario comunicó una diferencia de SHA-256 en `README.md` al validar la integridad local. Según ChatGPT, se debe a la conversión automática de saltos de línea de Git (`core.autocrlf=true` en la configuración del sistema de Windows): 16 de 16 archivos comparados, 16 diferencias solo CRLF/LF y 0 de contenido, con HEAD intacto. ChatGPT la resuelve con la configuración local del repositorio y una nueva comprobación de SHA-256; esta entrega no cambia ningún archivo para ello. Consta como antecedente comunicado.

**Antecedentes anteriores comunicados por ChatGPT, no ejecutados en esta verificación:** según el encargo de E02, el 19-10-2026 en Windows con Node.js 24.15.0 se obtuvieron tipos correctos, 37 de 37 pruebas unitarias y 7 de 7 pruebas de navegador en Microsoft Edge con medios sintéticos, y se aprobó E01 v1.2. No se dispone del ZIP histórico ni de manifiestos o actas de esa auditoría, y no se reproducen aquí.

## Verificación de E03 v1.3 (Cloud, 25-11-2026)

**Entorno:** el de la v1.0, que se describe más abajo. Esta verificación es la vigente.

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instalación desde el lockfile |
| `npm run comprobar` | Tipos sin errores y **174 pruebas unitarias superadas**: las 166 de la v1.2 y 8 de la revisión E03-R03 (`revision-r03.test.js`). Ninguna prueba existente se adaptó |
| `npm run prueba:e2e`, sin `DIRECTO_CHROMIUM` | Falla al arrancar el navegador (revisión 1194 ausente): 0 de 14 |
| `DIRECTO_CHROMIUM=/opt/pw-browsers/chromium npm run prueba:e2e` | **14 pruebas superadas** |
| Repeticiones | Unitarias y E2E repetidas; pruebas de concurrencia (`recuperacion-cliente` y `revision-r01` a `revision-r03`), 3 veces |

Las regresiones de E03-R03, sobre el código de la v1.2, **fallan en 5 de 8 casos**; sobre la v1.3 pasan 8 de 8. **No incluye Windows ni Android.**

## Verificación de E03 v1.2 (Cloud, 25-11-2026; histórica)

**Entorno:** el de la v1.0, que se describe más abajo.

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instalación desde el lockfile |
| `npm run comprobar` | Tipos sin errores y **166 pruebas unitarias superadas**: las 155 de la v1.1 y 11 de la revisión E03-R02 (`revision-r02.test.js`). Ninguna prueba existente se adaptó en esta revisión |
| `npm run prueba:e2e`, sin `DIRECTO_CHROMIUM` | Falla al arrancar el navegador (revisión 1194 ausente): 0 de 14 |
| `DIRECTO_CHROMIUM=/opt/pw-browsers/chromium npm run prueba:e2e` | **14 pruebas superadas** |
| Repeticiones | Unitarias y E2E repetidas; pruebas de concurrencia (`recuperacion-cliente`, `revision-r01` y `revision-r02`), 3 veces |

Las regresiones de E03-R02, ejecutadas sobre el código de la v1.1 con los mismos dobles, **fallan en 9 de 11 casos**; sobre la v1.2 pasan 11 de 11. **No incluye Windows ni Android.**

## Verificación de E03 v1.1 (Cloud, 25-11-2026; histórica)

**Entorno:** el de la v1.0, que se describe más abajo.

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instalación desde el lockfile |
| `npm run comprobar` | Tipos sin errores y **155 pruebas unitarias superadas**: las 128 de la v1.0 y 27 de la revisión E03-R01 (`revision-r01.test.js`, 24, y `revision-r01-funciones.test.js`, 3). Dos pruebas de la v1.0 se adaptaron por cambios de semántica pedidos por la revisión, sin relajar su propósito ([registro](../../docs/expedientes/LIVE-FASE03-E03-R01-registro-resolucion.md#pruebas-de-la-v10-adaptadas)) |
| `npm run prueba:e2e`, sin `DIRECTO_CHROMIUM` | Falla al arrancar el navegador (revisión 1194 ausente) y la batería termina sola: 0 de 14 |
| `DIRECTO_CHROMIUM=/opt/pw-browsers/chromium npm run prueba:e2e` | **14 pruebas superadas** |
| Repeticiones | Unitarias, 155/155 dos veces; E2E, 14/14 dos veces; pruebas de concurrencia (`recuperacion-cliente.test.js` y `revision-r01.test.js`), 44/44 tres veces |

Las regresiones de E03-R01, ejecutadas sobre el código de la v1.0 con los mismos dobles, **fallan en 19 de 25 casos** (el archivo de funciones cuenta como uno, porque esas funciones no existen en la v1.0). Sobre la v1.1 pasan 27 de 27. **No incluye Windows ni Android.**

## Verificación de E03 v1.0 (Cloud, 25-11-2026; histórica)

**Entorno:** Linux x86_64, Node.js 22.23.5, npm 10.9.9. Navegador: Google Chrome for Testing 153.0.8010.12, en `/opt/pw-browsers/chromium`, con `DIRECTO_CHROMIUM`, porque la revisión predeterminada de Playwright 1.56.1 (1194) no está instalada en este entorno. Las dependencias no se actualizaron. Esta verificación es la vigente; las de E01 y E02 se conservan como históricas. **No incluye Windows ni Android.**

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instalación desde el lockfile |
| `npm run comprobar` | Tipos sin errores y **128 pruebas unitarias superadas**: las 73 de la base, un segundo caso de `e2e-arranque.test.js` (uno por archivo de la batería de navegador) y 54 nuevas: `cronologia.test.js` (7), `continuidad.test.js` (11), `senalizacion-continuidad.test.js` (9), `servidor-continuidad.test.js` (7) y `recuperacion-cliente.test.js` (20) |
| `npm run prueba:e2e`, sin `DIRECTO_CHROMIUM` | Falla al arrancar el navegador (`Executable doesn't exist at …/chromium-1194/…`) y la batería termina sola: 0 de 14, no se da por superada |
| `DIRECTO_CHROMIUM=/opt/pw-browsers/chromium npm run prueba:e2e` | **14 pruebas superadas**: las 8 de `recorrido.test.js` y 6 nuevas de `continuidad.test.js` |

Las pruebas nuevas de navegador (`pruebas/e2e/continuidad.test.js`) usan medios **sintéticos**:

- emisión normal y exportación de la cronología;
- interrupción WebRTC y recuperación del emisor;
- interrupción WebRTC y recuperación del espectador por solicitud de oferta;
- interrupción de la señalización y reapertura;
- finalización durante una recuperación pendiente;
- autenticación, privacidad y recursos.

Las interrupciones se provocan solo desde la prueba: un script de inicio de la propia prueba registra las `RTCPeerConnection` para cerrarlas, o se cierra en el servidor el flujo de eventos de un participante. La recuperación se da por buena solo con **progreso renovado** de fotogramas, bytes, paquetes de audio y tiempo de reproducción. **No son evidencia del comportamiento físico de Android.**

Adaptaciones de pruebas existentes, con su propósito intacto:

- `ayudas-cliente.js` e `informe-cliente.test.js`: la respuesta simulada del espectador repite el `neg` de la oferta, como la página real.
- `navegador-simulado.js`: modela `signalingState`, los eventos de pistas y de página, estadísticas que pueden avanzar (por defecto, las mismas que antes) y el corte del flujo de eventos.
- `e2e-arranque.test.js`: comprueba también el archivo E2E nuevo.

No se eliminó ningún caso ni se relajó ninguna aserción.

## Pendiente y fuera de alcance

- **Continuidad (E03):** la implementación está verificada solo con pruebas automatizadas en Linux. Su validación física en Android ([protocolo CONT](../../docs/expedientes/LIVE-FASE03-E03-protocolo-continuidad-android.md)) y en Windows está **pendiente**. Los problemas de continuidad de E02 **no se dan por resueltos**.
- **Estado de validación de este experimento:** la ruta A (loopback con `adb reverse`) está **validada físicamente con reservas** en Android y Windows ([resultados](../../docs/expedientes/LIVE-FASE03-E02-resultados-android.md)); la ruta B (HTTPS de confianza en la LAN) **no está validada**; y otros escenarios de red, la reconexión y la continuidad audiovisual en segundo plano o con la pantalla bloqueada **no se han validado sistemáticamente** (reservas AND-09-H01, AND-09-H02, AND-10-H01 y OBS-WIFI-01). También queda pendiente la reverificación independiente de la evidencia que no se pudo contrastar. Los comandos de Windows de la preparación de esta entrega no se ejecutaron en la sesión de preparación.
- **Pendiente de FASE-03**, según el [borrador de LIVE-002](../../docs/expedientes/LIVE-002-alcance-borrador.md):
  - multistream hacia BuzzCast, TikTok Live y Bigo Live desde un solo celular;
  - chat y regalos externos;
  - sesiones de 60 y 120 min en teléfonos identificados;
  - reconexión en 1 minuto con contadores pausados;
  - paso a sala exclusiva sin tramas hacia los destinos externos después del instante T;
  - grabación;
  - cartel;
  - detección y corte.

  Detener este experimento **no demuestra** que esos destinos hayan dejado de recibir tramas.
- **Fuera de alcance:** usuarios identificados, perfiles exclusivos, chat, regalos, monedas, contadores económicos, grabación de archivos, integraciones externas y controles de producción.

## Estructura

```
src/inicio.js          arranque y variables de entorno
src/servidor.js        archivos públicos, API de sesiones y señalización (SSE + POST)
src/sesiones.js        almacén en memoria: tokens, roles, límites y limpieza
src/validacion.js      validación y saneamiento de señales
public/                interfaz: index.html, app.js (WebRTC y recuperación), medios.js (captura e informe de diagnóstico),
                       senalizacion.js, cronologia.js (cronología de continuidad), continuidad.js (estados y progreso), estilos.css
pruebas/unidad/        pruebas con node:test; cliente.test.js, informe-cliente.test.js y recuperacion-cliente.test.js ejecutan
                       app.js con los dobles de navegador-simulado.js y las ayudas de ayudas-cliente.js; informe.test.js,
                       cronologia.test.js y continuidad.test.js prueban funciones puras
pruebas/e2e/           recorrido y continuidad en navegador con playwright-core; entorno.js arranca servidor y navegador para
                       continuidad.test.js; comparacion-portapapeles.js compara el informe copiado salvo CRLF/LF
```
