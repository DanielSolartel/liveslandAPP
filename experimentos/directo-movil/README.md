# Experimento: primer directo técnico (LIVE-FASE03-E01)

Experimento web de **emisión interna**: un emisor captura cámara y micrófono y un espectador recibe su audio y su video por **WebRTC**, con señalización local mínima. Es una parte de la prueba técnica de FASE-03 ([plan](../../docs/estado/PLAN-POR-FASES.md)).

**No es la aplicación de producción** ni su arquitectura. Tampoco elige proveedor. Usa contenido neutral, sin cuentas, grabación, monedas ni cobros.

## Qué hace

1. **Crear sesión.** El emisor crea una sesión temporal en memoria. Recibe un enlace para el espectador con un identificador y un token impredecibles; el token va en el fragmento `#`, que no se envía al servidor.
2. **Activar captura.** El emisor pulsa «Activar cámara y micrófono» y ve su vista previa local silenciada.
3. **Mirar.** El espectador abre el enlace en otro navegador o contexto y recibe audio y video del emisor por una `RTCPeerConnection` real. Si el navegador exige un gesto para reproducir, aparece el botón «Reproducir audio y video».
4. **Ver el estado.** Se muestran la señalización, `connectionState`, `iceConnectionState`, los medios y los errores (permiso denegado, API ausente, contexto inseguro, enlace no válido, sesión terminada, fallo de conexión).
5. **Finalizar o salir.** «Finalizar emisión» detiene en el acto las pistas de captura y cierra la conexión WebRTC y el canal de señalización, sin esperar a la red. A la vez avisa al servidor, que elimina la sesión y avisa al espectador. «Salir» cierra solo al espectador y avisa al servidor del mismo modo.
   - El aviso al servidor tiene un límite de 3 s. Si no llega confirmación, la página lo indica (`aviso sin confirmar`) y no la da por hecha.
   - «Nueva sesión» empieza de cero, sin pistas antiguas. Si una captura llega cuando su sesión ya terminó, sus pistas se detienen y no se usan. Las respuestas pendientes de una sesión terminada tampoco afectan a la siguiente.

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
- **Saneamiento:** solo se reenvían campos conocidos de `oferta`, `respuesta` y `candidato`.
- **Recursos:**
  - máximo 16 sesiones;
  - una vida máxima de 30 min por sesión;
  - se limpian las sesiones que pasan 60 s sin participantes;
  - el fin del emisor y la detención del servidor cierran sesiones y flujos.
- **Archivos públicos:** solo los de `public/`, por lista cerrada, con cabeceras CSP, `nosniff`, `no-referrer` y `Permissions-Policy` de cámara y micrófono.
- **Límite de envío del cliente:** cada POST de señalización se cancela a los 3 s (`LIMITE_ENVIO_MS`, en `public/senalizacion.js`) y se informa como `tiempo-agotado`. Es un límite técnico para que ninguna tarea quede esperando a la red, **no la regla de reconexión de 1 minuto** del producto, que este experimento no implementa.
- **Conectividad:** sin STUN ni TURN (`iceServers: []`), solo candidatos locales. Funciona en el mismo equipo o en una red local sin aislamiento entre clientes. **No se promete conexión entre redes arbitrarias ni tras NAT.** Los nombres mDNS (`.local`) que Chrome usa para ocultar IP locales pueden impedir la conexión en algunas redes.

## Contexto seguro y prueba física en Android

Los navegadores solo permiten cámara y micrófono en un **contexto seguro**. Abrir `http://<IP de la LAN>:8787` desde el teléfono **no sirve**: el servidor tampoco lo permite sin HTTPS. Hay dos rutas reproducibles, y ninguna se ha ejecutado todavía:

- **A. Loopback con `adb reverse`.** Es la recomendada para empezar.
  1. Activa la depuración USB en el teléfono y conéctalo al equipo, con Android Platform Tools instalado.
  2. En el equipo, ejecuta `npm start` y `adb reverse tcp:8787 tcp:8787`.
  3. En el Chrome del teléfono, abre `http://localhost:8787/`: es un contexto seguro.
  4. El espectador abre el enlace en el equipo, en `http://127.0.0.1:8787/…`.

  La señalización viaja por USB, pero **los medios van por la red**: teléfono y equipo deben estar en la misma Wi-Fi o LAN, sin aislamiento de clientes.
- **B. HTTPS de confianza en la LAN.**
  1. Genera fuera del repositorio un certificado para el nombre o la IP del equipo con una CA local que el teléfono acepte (por ejemplo, mkcert, instalando su CA en Android).
  2. Arranca con `DIRECTO_HOST=0.0.0.0`, `DIRECTO_TLS_CERT` y `DIRECTO_TLS_KEY`.
  3. Abre `https://<nombre o IP>:8787/`.

  Que Chrome para Android acepte esa CA es un requisito **por comprobar** en cada equipo.

**Prueba manual siguiente en Android (pendiente).** Registra:

- el modelo, la versión de Android y la de Chrome, y la red usada;
- la concesión o denegación del permiso;
- si la vista previa está silenciada;
- la recepción de audio y video en el equipo y el estado `connected`;
- si al finalizar se apaga el indicador de cámara del sistema;
- el comportamiento con la página oculta y con la pantalla bloqueada (LIVE-002, prueba 1).

No se ha hecho ninguna prueba en Android.

## Verificación realizada (Cloud, 18-10-2026, v1.2)

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

## Pendiente y fuera de alcance

- **Pendiente de este experimento:** la prueba física en Android (rutas A o B) y la prueba entre dos equipos de una LAN. En Windows no se ejecutó ningún comando.
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
public/                interfaz: index.html, app.js (WebRTC), medios.js, senalizacion.js, estilos.css
pruebas/unidad/        pruebas con node:test; cliente.test.js ejecuta app.js con los dobles de navegador-simulado.js
pruebas/e2e/           recorrido en navegador con playwright-core
```
