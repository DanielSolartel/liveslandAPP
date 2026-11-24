# LIVE-FASE03-E02 — Protocolo de validación física en Android — v1.3

| Campo | Valor |
| --- | --- |
| ID | LIVE-FASE03-E02 |
| Versión | 1.3. Corrige la v1.0, la v1.1 y la v1.2, no publicadas, tras las revisiones E02-R01 (esquema 2 del informe), E02-R02 (copia al portapapeles) y E02-R03 (portabilidad de una prueba de navegador); el protocolo no cambia de contenido en esta última |
| Fase | FASE-03, prueba técnica móvil ([plan](../estado/PLAN-POR-FASES.md)) |
| Fecha | 23-11-2026 |
| Base | `7eae89e0b083b26ba3a44f1e22304e32e47c32a5` |
| Issue asociado | [#2, validación del primer directo móvil en Android](https://github.com/DanielSolartel/liveslandAPP/issues/2) |
| Estado | **Preparado. Pendiente de auditoría y publicación manual.** Los trece casos están **NO EJECUTADOS**: no se ha hecho ninguna prueba en Android ni entre equipos físicos |

Este protocolo permite que una persona repita, con un teléfono Android real y un equipo con Windows 11, la primera transmisión del [experimento `directo-movil`](../../experimentos/directo-movil/README.md) y la documente. Un teléfono emite y un espectador en Windows recibe. Es una prueba técnica con contenido neutral: sin cuentas, grabación, monedas ni cobros.

**No cierra el Issue #2.** Ese issue pide resultados físicos que solo existen cuando alguien ejecute y registre estos casos, y su cierre depende de la auditoría y de la decisión del usuario.

## 1. Alcance y reglas

- **Qué se prueba:** captura real de cámara y micrófono en Chrome para Android, recepción de audio y video en Windows por WebRTC, permisos concedidos y denegados, finalización con liberación de cámara y micrófono, nueva sesión y exportación de informes.
- **Qué no se prueba:** multistream, chat, regalos, monedas, grabación, cuentas, sesiones largas, reconexión, cortes de red ni la aplicación de producción.
- **Seguridad:**
  - No abras túneles públicos ni expongas el servidor a Internet.
  - No desactives el cortafuegos, el antivirus ni protecciones del navegador, ni instales certificados en equipos que no sean de prueba.
  - El servidor escucha solo en `127.0.0.1`. El teléfono lo alcanza por `adb reverse`, a través del cable USB.
- **Contenido neutral:** apunta la cámara a un objeto o una pared, sin personas, rostros, documentos ni pantallas con datos personales. Para el audio, usa silencio, ruido ambiente o un tono. No hables de datos personales.
- **Enlaces:** el enlace del espectador contiene un token. Vale solo mientras exista la sesión (máximo 30 min) y contra tu servidor local, pero **no lo publiques** ni lo captures en pantallas que vayas a compartir.
- **Honestidad del registro:** anota solo lo observado. Un caso que no se ejecutó se queda en NO EJECUTADA, y uno que no se pudo hacer, en BLOQUEADA con su motivo.

## 2. Requisitos previos (Windows 11 y PowerShell 5.1)

Material: un teléfono Android con Chrome, un cable USB de datos, un equipo con Windows 11 y una red Wi-Fi o LAN a la que se conecten **ambos**.

1. **Versión de PowerShell.** Abre Windows PowerShell (no es necesario ser administrador) y ejecuta:

   ```powershell
   $PSVersionTable.PSVersion
   ```

   Debe mostrar la versión mayor 5 y la menor 1. En PowerShell 5.1 se encadenan comandos con `;`, no con `&&`.
2. **Node.js y npm.** El experimento exige Node.js 22 o superior:

   ```powershell
   node --version
   npm.cmd --version
   ```

   Si Windows responde que no puede cargar `npm.ps1` porque la ejecución de scripts está deshabilitada, **no cambies la política de ejecución**: usa `npm.cmd` en lugar de `npm` en todos los comandos de este protocolo.
3. **Código.** Trabaja con el código publicado que vas a validar y anota su SHA de commit (§3):

   ```powershell
   cd <carpeta del repositorio>
   git rev-parse HEAD
   cd experimentos\directo-movil
   npm.cmd ci
   npm.cmd run comprobar
   ```

   `npm ci` instala desde el lockfile y `comprobar` ejecuta tipos y pruebas unitarias. Si fallan, no sigas: registra AND-01 como BLOQUEADA.
4. **Navegador del espectador:** Chrome o Edge actualizados en Windows. Anota su versión.
5. **Android Platform Tools (`adb`).**
   - Descarga «SDK Platform-Tools para Windows» desde el sitio oficial de Android Developers y descomprímelo, por ejemplo, en `C:\Android\platform-tools`.
   - Para la sesión actual de PowerShell:

     ```powershell
     $env:Path += ";C:\Android\platform-tools"
     adb version
     ```

   - `adb version` debe mostrar la versión instalada. Si no, revisa la ruta.
6. **Depuración USB en el teléfono:**
   - Activa las opciones de desarrollador (en Ajustes, toca varias veces el número de compilación; el nombre exacto del menú depende del fabricante).
   - Dentro de ellas, activa «Depuración USB».
   - Desactiva los datos móviles y cualquier VPN, para que el teléfono use la Wi-Fi.

## 3. Datos del entorno (se rellenan al ejecutar)

| Dato | Valor |
| --- | --- |
| Fecha y hora de inicio | |
| Persona que ejecuta | |
| SHA del commit probado | |
| Windows 11 (versión y compilación) | |
| PowerShell | |
| Node.js y npm | |
| Navegador del espectador y versión | |
| Teléfono (marca y modelo) | |
| Versión de Android | |
| Chrome para Android (versión) | |
| Red (Wi-Fi o LAN) y si hay aislamiento de clientes | |
| Versión de `adb` | |

## 4. Procedimiento

### 4.1 Conexión USB y `adb reverse`

1. Conecta el teléfono por USB. Si pregunta qué hacer con la conexión, deja «Cargar solo» o «Transferencia de archivos». Si aparece la pregunta «¿Permitir la depuración USB?», acéptala y, si quieres, marca «Permitir siempre desde este equipo».
2. Verifica:

   ```powershell
   adb devices
   ```

   Debe aparecer tu dispositivo con el estado `device`. Con `unauthorized`, acepta la autorización en el teléfono. Con `offline` o sin dispositivo, desconecta y vuelve a conectar el cable, o ejecuta `adb kill-server; adb start-server; adb devices`.
3. Arranca el servidor en una ventana de PowerShell, que quedará ocupada:

   ```powershell
   cd <carpeta del repositorio>\experimentos\directo-movil
   npm.cmd start
   ```

   Debe decir que escucha en `http://127.0.0.1:8787/`. Si el puerto está ocupado, usa otro con `$env:DIRECTO_PUERTO = "8788"` antes de arrancar, y sustituye 8787 en los pasos siguientes.
4. En **otra** ventana de PowerShell, comprueba el servidor y crea el túnel USB:

   ```powershell
   (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8787/).StatusCode
   adb reverse tcp:8787 tcp:8787
   adb reverse --list
   ```

   El primer comando debe mostrar `200`, y la lista debe incluir `tcp:8787`.

### 4.2 Aperturas

- **Emisor (teléfono):** en Chrome para Android abre `http://localhost:8787/`. Es un contexto seguro. No abras `http://<IP de la red>:8787`: no sirve para la cámara y el servidor no lo atiende.
- **Espectador (Windows):** abre en Chrome o Edge la dirección del enlace que genere el emisor. Hace falta llevar ese enlace del teléfono al equipo. Usa un canal propio (por ejemplo, un mensaje a ti mismo o un portapapeles compartido). El enlace tiene la forma `http://localhost:8787/?s=…#…`. Si `localhost` no conecta en Windows, sustituye `localhost` por `127.0.0.1`; apunta al mismo servidor.
- **Medios y red:** la señalización viaja por el USB, pero **el audio y el video van por la red**. Teléfono y equipo deben estar en la misma red, sin aislamiento de clientes. Si Windows pregunta si Chrome o Edge pueden comunicarse en la red, permítelo **solo en redes privadas**, no desactives el cortafuegos, y verifica que la red está como «Privada»:

  ```powershell
  Get-NetConnectionProfile
  ```

  Sin STUN ni TURN, la conexión solo se espera en el mismo equipo o en una red local sin aislamiento. Si falla, **se registra como resultado**, no se «arregla» con túneles ni cambios de seguridad.

### 4.3 Informes de diagnóstico

Cada página tiene la sección «Informe de diagnóstico», con «Generar informe» y «Copiar informe». Se puede usar antes de crear la sesión, durante la emisión y después de finalizar, en el emisor y en el espectador.

- El informe es un JSON (esquema 2) con la familia y la versión del navegador, la plataforma, el contexto seguro, las APIs disponibles, el estado de captura y reproducción, las pistas activas, los ajustes audiovisuales, los estados WebRTC e ICE, las métricas agregadas, la finalización y los errores por categoría. Lo que no está disponible consta como `null` y en `noDisponible`. El informe describe el instante en que lo pediste: espera como máximo 2 s a las estadísticas, y si la conexión o la sesión cambian mientras tanto, o no llegan, las métricas constan como no disponibles (`metricas.motivo` `descartadas`, `tiempo-agotado` o `error`). En ese caso, genera otro informe.
- **No incluye** enlaces, tokens, identificadores de sesión, SDP, candidatos ICE, direcciones IP, nombres de red, datos de dispositivos, el agente de usuario completo, mensajes de error ni contenido capturado. Del navegador solo salen la familia, la versión mayor y la plataforma, de listas cerradas; si no se reconocen, constan como no disponibles. No se envía a ningún servidor.
- «Copiar informe» solo copia si lo pulsas, y mientras copia queda deshabilitado (solo hay una copia a la vez). Si generas otro informe durante la copia, el portapapeles conserva el informe de cuando pulsaste, así que vuelve a copiar cuando el botón se rehabilite. Si el botón no se rehabilita, el navegador no resolvió la copia: copia el informe a mano desde el cuadro de texto o recarga la página. Si el navegador no permite copiar, el informe queda seleccionado en el cuadro de texto para copiarlo a mano y la página no dice que se copió.
- Para llevar el informe del teléfono al equipo usa un canal propio. Guárdalos como `AND-xx-emisor.json` y `AND-xx-espectador.json` **fuera del repositorio**, por ejemplo en `$env:USERPROFILE\live-pruebas\`.
- Un informe sin errores no equivale a una prueba aprobada. Cada caso se juzga con su resultado esperado.

## 5. Casos de prueba y plantilla de resultados

**Estados:** SUPERADA, FALLIDA, BLOQUEADA o NO EJECUTADA.
- SUPERADA: se ejecutó y el resultado observado coincide con el esperado.
- FALLIDA: se ejecutó y no coincide.
- BLOQUEADA: no se pudo ejecutar, con el motivo.
- NO EJECUTADA: no se ha intentado.
- En los dos casos exploratorios (AND-09 y AND-10) no hay criterio de aprobación: SUPERADA significa solo «ejecutada y registrada», y no valida ni rechaza el experimento.

**Todos los casos están NO EJECUTADOS.** La columna «Resultado observado» y la «Evidencia» se rellenan al ejecutarlos, con el nombre del archivo de informe y, si procede, una captura sin enlaces ni tokens.

| ID | Pasos | Resultado esperado | Resultado observado | Evidencia | Estado |
| --- | --- | --- | --- | --- | --- |
| AND-01 | Cumplir §2 y §4.1: PowerShell 5.1, Node 22 o superior, `npm.cmd ci` y `comprobar`, `adb devices` con estado `device`, servidor arrancado y `adb reverse --list` con `tcp:8787` | Todo responde como se describe; `comprobar` sin errores | | | NO EJECUTADA |
| AND-02 | En Chrome del teléfono, abrir `http://localhost:8787/` y pulsar «Generar informe» sin crear sesión | La página carga. El informe indica `rol` nulo, `contextoSeguro` verdadero y `getUserMedia` y `rtcPeerConnection` verdaderos | | AND-02-emisor.json | NO EJECUTADA |
| AND-03 | Crear sesión. Pulsar «Activar cámara y micrófono» y **denegar** el permiso. Generar informe. Después, en los ajustes del sitio de Chrome, restablecer el permiso de `localhost` | Mensaje de permiso denegado, botón de activar habilitado para reintentar, sin indicador de cámara. Informe: captura `sin-captura`, último error `permiso-denegado`, 0 pistas activas, categoría `captura-permiso-denegado` | | AND-03-emisor.json | NO EJECUTADA |
| AND-04 | Pulsar «Activar cámara y micrófono» y **conceder** el permiso. Apuntar a contenido neutral. Generar informe | Vista previa local silenciada y con imagen real. Indicador de cámara y micrófono del sistema activo. Informe: captura `activa`, 2 pistas activas, ajustes reales de video (ancho, alto, fotogramas por segundo) y de audio (frecuencia y canales), `silenciada` falsa | | AND-04-emisor.json y foto o captura del indicador | NO EJECUTADA |
| AND-05 | Llevar el enlace al equipo Windows y abrirlo en Chrome o Edge. Pulsar «Reproducir audio y video» si aparece | El espectador ve y oye el contenido neutral del teléfono y `connectionState` llega a `connected`. Informes de ambos con `webrtc.conexion` `connected` y 2 pistas remotas activas en el espectador | | AND-05-emisor.json y AND-05-espectador.json | NO EJECUTADA |
| AND-06 | Generar el informe de ambos, esperar unos 10 s y generar otro | Las métricas están disponibles. Bytes enviados por el emisor y recibidos por el espectador mayores que 0, y crecen entre los dos informes. En el espectador, fotogramas decodificados y paquetes de audio recibidos mayores que 0 | | AND-06a y AND-06b de cada participante | NO EJECUTADA |
| AND-07 | Pulsar «Finalizar emisión» en el teléfono. Generar informe de ambos | El teléfono muestra la vista final y el indicador de cámara y micrófono se apaga. El espectador recibe el aviso de fin. Informes: `recursosLiberados` `si`, 0 pistas activas y conexión cerrada. Si el aviso al servidor no se confirma, la página lo indica | | AND-07-emisor.json, AND-07-espectador.json y evidencia del indicador | NO EJECUTADA |
| AND-08 | Pulsar «Nueva sesión» en el teléfono, crear sesión y activar de nuevo. Abrir el enlace nuevo en Windows. Generar informe. El enlace anterior no debe servir | Solo hay 2 pistas activas (las de la captura nueva) y `flujosLocalesCreados` aumenta en 1 respecto del informe de AND-07, sin recargar la página. Conexión `connected`. El enlace anterior se rechaza | | AND-08-emisor.json y AND-08-espectador.json | NO EJECUTADA |
| AND-09 | **Exploratoria.** Con la emisión activa, pasar Chrome a segundo plano (otra aplicación) unos 30 s y volver. Generar informe de ambos y anotar lo que se observó en el espectador durante ese tiempo | Sin criterio de aprobación. Se registra: si el video o el audio se detuvieron, el estado de la conexión, si las pistas locales quedaron silenciadas (`silenciada`), si siguen activas y si la sesión se recuperó | | AND-09-emisor.json y AND-09-espectador.json | NO EJECUTADA |
| AND-10 | **Exploratoria.** Con la emisión activa, bloquear la pantalla unos 30 s y desbloquear. Mismos registros que AND-09 | Sin criterio de aprobación. Se registra el mismo conjunto de observaciones | | AND-10-emisor.json y AND-10-espectador.json | NO EJECUTADA |
| AND-11 | Con un espectador conectado, pulsar «Salir» en Windows. Generar informe de ambos | El espectador ve la vista final y no quedan pistas remotas ni conexión. El emisor detecta que el espectador se fue y **sigue con la captura activa** | | AND-11-emisor.json y AND-11-espectador.json | NO EJECUTADA |
| AND-12 | Reunir los informes de ambos participantes de los casos anteriores, nombrados según §4.3 | Cada informe es un JSON válido, sin enlaces, tokens, SDP, direcciones IP ni identificadores de dispositivo | | Carpeta de informes fuera del repositorio | NO EJECUTADA |
| AND-13 | Seguir §6: finalizar la emisión, detener el servidor, retirar `adb reverse` y limpiar | `adb reverse --list` sin entradas, servidor detenido, sin procesos ni archivos temporales | | Salida de los comandos | NO EJECUTADA |

**Registro de hallazgos.** Cada problema se anota aparte, con el ID del caso, lo que ocurrió, el informe relacionado y su gravedad (bloquea, degrada o cosmético). No se corrige durante la prueba.

| N.º | Caso | Descripción | Evidencia | Gravedad |
| --- | --- | --- | --- | --- |
| | | | | |

## 6. Cierre y limpieza

1. Finaliza la emisión en el teléfono si sigue activa. Comprueba que el indicador de cámara y micrófono está apagado.
2. En la ventana del servidor, pulsa `Ctrl+C`. Debe mostrar que cierra sesiones y servidor.
3. Retira el túnel y comprueba:

   ```powershell
   adb reverse --remove tcp:8787
   adb reverse --list
   ```

   La lista debe quedar vacía. Para quitar todos los túneles: `adb reverse --remove-all`.
4. Opcional: `adb kill-server`, y desactiva la «Depuración USB» y las opciones de desarrollador en el teléfono. Restablece el permiso de cámara y micrófono del sitio `localhost` en Chrome para Android, y reactiva los datos móviles.
5. Cierra las pestañas de Windows y del teléfono con el enlace. Conserva los informes solo en la carpeta de pruebas y borra lo que no necesites.
6. Verifica que no queda un proceso del servidor: `Get-Process node -ErrorAction SilentlyContinue`.

## 7. Problemas frecuentes

| Síntoma | Causa probable | Qué hacer |
| --- | --- | --- |
| `adb` no se reconoce | `platform-tools` no está en la ruta de la sesión | Repetir `$env:Path += ";C:\Android\platform-tools"` o usar la ruta completa |
| `adb devices` vacío | Cable solo de carga, depuración USB desactivada o controlador ausente | Probar otro cable y puerto; comprobar la depuración USB; reconectar |
| `unauthorized` | No se aceptó la autorización en el teléfono | Aceptar el aviso; si no aparece, retirar autorizaciones USB en las opciones de desarrollador y reconectar |
| `offline` | Conexión adb colgada | `adb kill-server; adb start-server; adb devices` |
| `npm` falla por `npm.ps1` | Política de ejecución de PowerShell | Usar `npm.cmd`; no cambiar la política |
| El teléfono no abre `http://localhost:8787/` | Servidor parado, puerto distinto o `adb reverse` ausente | Revisar `adb reverse --list`, el puerto y el servidor |
| La cámara no se ofrece en el teléfono | Se abrió por `http://<IP>` o hay un bloqueo de permisos | Usar `http://localhost:8787/`; revisar los permisos del sitio |
| El permiso quedó bloqueado tras denegarlo | Chrome recuerda la decisión | Restablecer el permiso en los ajustes del sitio |
| El espectador no abre el enlace en Windows | Se copió mal el fragmento `#…` o se usó `localhost` con IPv6 | Copiar el enlace completo; probar `127.0.0.1` en lugar de `localhost` |
| La conexión queda en `connecting` o pasa a `failed` | Red con aislamiento de clientes, Wi-Fi distinta, VPN, cortafuegos o nombres mDNS que no se resuelven. No hay STUN ni TURN | Verificar la misma red sin aislamiento y sin VPN, y la red privada en Windows. Si persiste, **registrarlo como FALLIDA o BLOQUEADA**, sin túneles públicos |
| Imagen pero sin audio, o al revés | Permiso parcial, micrófono en uso por otra aplicación o silenciado | Revisar el informe (`pistas.locales`, `silenciada`) y el permiso del micrófono |
| Métricas `null` | Aún no hay conexión, el navegador no ofrece `getStats`, las estadísticas tardaron más de 2 s o la conexión cambió al pedirlas | Revisar `metricas.motivo` en el informe y generar otro |
| El indicador de cámara sigue encendido tras finalizar | Otra aplicación usa la cámara o una pista quedó activa | Revisar `finalizacion.recursosLiberados` y `pistas.localesActivas`; registrar como hallazgo |

## 8. Ruta alternativa: HTTPS en la red local (documentada, no validada)

El [README del experimento](../../experimentos/directo-movil/README.md#contexto-seguro-y-prueba-física-en-android) describe una ruta B: abrir `https://<nombre o IP del equipo>:8787/` desde el teléfono con un certificado de una CA local que el teléfono acepte.

- Exige generar el certificado **fuera del repositorio**, arrancar con `DIRECTO_HOST`, `DIRECTO_TLS_CERT` y `DIRECTO_TLS_KEY`, y que Chrome para Android confíe en esa CA.
- **No se ha ejecutado ni validado en Android.** No sustituye a la ruta de este protocolo.
- Si algún día se prueba, instala la CA solo en dispositivos de prueba, retírala al terminar y no desactives comprobaciones de certificados del navegador. Se documentará en su propio encargo.

## 9. Limitaciones

- El protocolo no garantiza que la conexión funcione en una red concreta: sin STUN ni TURN depende de la red local.
- Los casos exploratorios no tienen resultado esperado fijo.
- La detección de que la cámara y el micrófono se liberaron depende del indicador del sistema, que varía según el teléfono. El informe solo refleja lo que Chrome comunica a la página.
- Los comandos de Windows se redactaron para PowerShell 5.1 y **no se han ejecutado en esta preparación**.
