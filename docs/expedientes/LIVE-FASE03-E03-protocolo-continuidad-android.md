# LIVE-FASE03-E03 — Protocolo de continuidad en Android (CONT) — v1.1

| Campo | Valor |
| --- | --- |
| ID | LIVE-FASE03-E03 |
| Versión | 1.1. Ajusta la v1.0, no publicada, a las correcciones de la revisión E03-R01 (qué confirma el espectador, la bienvenida y la vigencia de una confirmación). Los casos no cambian |
| Fase | FASE-03, prueba técnica móvil ([plan](../estado/PLAN-POR-FASES.md)) |
| Fecha | 25-11-2026 (UTC) |
| Base | `90b32ccc85ac9854808f0090d3c1663a4c1b7ab2` |
| Diseño de la entrega | [Diseño e implementación de continuidad](LIVE-FASE03-E03-diseno-continuidad.md) |
| Antecedente | [Protocolo E02](LIVE-FASE03-E02-protocolo-android.md) y [resultados E02](LIVE-FASE03-E02-resultados-android.md), que no se modifican |
| Estado | **Preparado. Pendiente de auditoría, publicación y autorización de ejecución.** Los doce casos están **NO EJECUTADOS**: no se ha hecho ninguna prueba física de E03 |

Este protocolo prepara una **segunda validación física** en Android del [experimento `directo-movil`](../../experimentos/directo-movil/README.md), centrada en la continuidad. Comprueba cómo se comportan la cronología de continuidad, los estados visibles por componente y la recuperación manual dentro de la misma sesión, añadidas en E03. Un teléfono emite y un espectador en Windows recibe, como en E02. La ejecución corresponde al promotor después de la auditoría, la publicación y la autorización correspondientes.

**Qué no hace este protocolo.** No valida la regla de reconexión de 1 minuto del producto, que E03 no implementa. No prueba contadores, devoluciones ni dinero. Tampoco atribuye causas a los hallazgos de E02: AND-09-H02 sigue con causa indeterminada, y no se atribuye al temporizador de 60 s del servidor sin evidencia.

## 1. Alcance y reglas

- **Qué se prueba:** continuidad en primer plano durante 5 min. Comportamiento con Chrome en segundo plano y con la pantalla bloqueada. Interrupción temporal de la Wi-Fi e interrupción controlada de la señalización. Recuperación manual en la misma sesión y finalización durante una recuperación pendiente. Privacidad y limpieza.
- **Qué no se prueba:** multistream, chat, regalos, monedas, grabación, cuentas, sesiones largas, cambio a otra red Wi-Fi distinta, STUN/TURN ni la aplicación de producción.
- **Seguridad:** las mismas reglas que el protocolo E02 (§1):
  - servidor solo en `127.0.0.1`, alcanzado desde el teléfono con `adb reverse`;
  - sin túneles públicos;
  - sin desactivar cortafuegos, antivirus ni protecciones del navegador.
- **Contenido neutral:** cámara hacia un objeto o una pared, sin personas, rostros, documentos ni pantallas con datos personales; audio en silencio, ruido ambiente o un tono.
- **Enlaces y credenciales:** el enlace del espectador contiene un token. **No lo publiques** ni lo captures en pantallas que vayas a compartir. La cronología y el informe no lo contienen.
- **Carácter exploratorio:** los casos de segundo plano y bloqueo (CONT-02 a CONT-07) son **exploratorios** respecto de las restricciones de Android y de Chrome. No tienen un resultado esperado fijo. Que Chrome no mantenga la cámara con la pantalla apagada **no implica por sí solo** un fallo de la instrumentación ni del experimento: se registra lo observado.
- **Honestidad del registro:** anota solo lo observado. Un caso que no se ejecutó queda en NO EJECUTADA, y uno que no se pudo hacer, en BLOQUEADA con su motivo. No se inventan resultados físicos.
- **Una interrupción a la vez:** no encadenes interrupciones. Antes de cada caso, comprueba que el estado inicial es válido (§4.5).
- **Si se pierde la página o la sesión:** antes de nada, conserva las evidencias disponibles: cronologías e informes de ambos participantes y lo observado. Después, si hace falta, crea otra sesión y regístrala **por separado**, con su propio número de sesión. Una sesión nueva **no cuenta como recuperación** de la anterior.

## 2. Requisitos previos

Los del protocolo E02, §2 (Windows 11 y PowerShell 5.1, Node.js 22 o superior, `adb`, depuración USB y misma red sin aislamiento), con el código de E03:

```powershell
cd <carpeta del repositorio>
git rev-parse HEAD
cd experimentos\directo-movil
npm.cmd ci
npm.cmd run comprobar
```

Anota el SHA del commit probado: debe ser el de la publicación de E03 que se valida. Si `comprobar` falla, no sigas y registra CONT-01 como BLOQUEADA.

Material adicional: un reloj o cronómetro para medir 15, 30, 60 y 90 s, y la posibilidad de desconectar y volver a conectar la **misma** Wi-Fi en el teléfono.

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
| Chrome para Android (versión, en `chrome://version`) | |
| Ajustes de batería de Chrome en el teléfono (optimización o restricciones), si se conocen | |
| Red Wi-Fi y si hay aislamiento de clientes | |
| Versión de `adb` | |

## 4. Procedimiento

### 4.1 Conexión, servidor y aperturas

Igual que el protocolo E02: conexión USB y `adb reverse` (§4.1 de E02), y aperturas del emisor en `http://localhost:8787/` en Chrome para Android y del espectador en Windows (§4.2 de E02).

### 4.2 Elementos de la página que usa este protocolo

- **Estado:** además de Señalización, Conexión, ICE y Medios, la página muestra por separado:
  - **Sesión:** el estado según la página;
  - **Participante:** si el otro está presente, ausente con su motivo (`salida` o `desconexion`) o desconocido sin señalización;
  - **Pistas** y **Reproducción** (esta, en el espectador);
  - **Continuidad:** uno de nueve estados con su motivo (sin sesión, esperando participante, conectando, conectada, interrupción detectada, recuperación en curso, recuperación técnica confirmada, no recuperada que requiere intervención, finalizada).
- **Continuidad → «Reintentar conexión»:** solo actúa cuando lo pulsas. No hay reintentos automáticos.
  - Reabre la señalización de **la misma sesión** con las credenciales que la página tiene en memoria y renegocia la conexión con las pistas existentes, sin volver a pedir cámara y micrófono.
  - Comprueba que los medios avanzan. El emisor solo puede confirmar que **envía**; el espectador, que **recibe** audio y video y que se **decodifican fotogramas de video** (la decodificación del audio no se mide). Que se vea y se oiga lo confirma la persona.
  - Una confirmación solo vale si la conexión, la señalización y las pistas siguieron bien durante toda la comprobación. Si después hay otra interrupción u otra conexión, el resultado se muestra como antecedente («ya no describe el estado actual»): anótalo así.
  - La señalización solo cuenta como recuperada cuando llega la bienvenida del servidor.
  - Si no puede confirmarlo, lo dice: no recuperada, sin progreso o no verificada.
- **Cronología de continuidad → «Generar cronología» y «Copiar cronología»:** registro en memoria de esta página, con hasta 256 eventos y tiempos relativos al inicio del registro de cada dispositivo. Los relojes del teléfono y del equipo **no están sincronizados**: no compares los tiempos de un dispositivo con los del otro. Si Chrome recarga o descarta la página, la cronología se pierde.
- **Informe de diagnóstico:** sin cambios respecto de E02 (esquema 2).

### 4.3 Evidencias de cada caso

En cada caso guarda, **fuera del repositorio** (por ejemplo, en `$env:USERPROFILE\live-pruebas\cont\`):

- informe **antes** de la acción: `CONT-xx-antes-emisor.json` y `CONT-xx-antes-espectador.json`;
- informe **después**: `CONT-xx-despues-emisor.json` y `CONT-xx-despues-espectador.json`;
- cronología de ambos al terminar el caso: `CONT-xx-cronologia-emisor.json` y `CONT-xx-cronologia-espectador.json`;
- notas de lo observado físicamente, con la hora aproximada de cada paso.

Si el teléfono no permite copiar, el documento queda seleccionado para copiarlo a mano. Para llevarlo al equipo usa un canal propio, como en E02.

### 4.4 Qué observar físicamente

- En el espectador: si el video se congela o se detiene, si el audio se corta, cuándo vuelven y si hace falta pulsar «Reproducir».
- En el teléfono: el indicador de cámara y micrófono del sistema y lo que muestra la página al volver. Anota si es la misma vista del emisor o la pantalla inicial, y si el enlace del espectador sigue siendo el mismo.
- En ambos: el estado de **Continuidad** y su motivo, y si aparece un mensaje de error.

### 4.5 Restauración entre casos

Antes de empezar cada caso, comprueba el **estado inicial válido**:

- **Emisión:** en el teléfono, la emisión está activa con la sesión del caso anterior (o una nueva, registrada como tal) y Continuidad muestra «conectada» o «recuperación técnica confirmada».
- **Espectador:** recibe audio y video.

Si no es así, sigue estos pasos:

1. Intenta una vez «Reintentar conexión» en el participante afectado y anota el resultado.
2. Si no se recupera, conserva las evidencias, finaliza la emisión, crea otra sesión y registra en la tabla de §5 que el caso siguiente empieza con una sesión nueva.
3. Entre casos de segundo plano o bloqueo, espera al menos 30 s con la emisión estable antes de la siguiente interrupción.

## 5. Casos de prueba y plantilla de resultados

**Estados:** SUPERADA, FALLIDA, BLOQUEADA o NO EJECUTADA, con el significado del protocolo E02. En los casos exploratorios (CONT-02 a CONT-07), SUPERADA significa solo «ejecutada y registrada con sus evidencias», y no valida ni rechaza la continuidad.

**Todos los casos están NO EJECUTADOS.**

### CONT-01 — Emisión en primer plano durante 5 minutos

- **Precondiciones:** §2 y §4.1 cumplidos; sesión nueva; captura activa; espectador recibiendo.
- **Secuencia:**
  1. Generar informes «antes» de ambos.
  2. Mantener Chrome en primer plano en el teléfono, con la pantalla encendida, durante 5 min sin tocar nada.
  3. Generar informes «después» y cronologías de ambos.
- **Observaciones físicas:** cortes de audio o video en el espectador durante los 5 min; indicador de cámara activo.
- **Resultado esperado:** Continuidad «conectada» en ambos durante todo el caso; bytes y fotogramas que crecen entre los informes «antes» y «después»; ningún evento de recuperación en las cronologías.
- **Criterio de aprobación:** se cumple el resultado esperado. Un corte observado se registra como hallazgo con su hora.
- **Limitaciones:** 5 min no son las sesiones de 60 y 120 min de LIVE-002, que siguen pendientes.

### CONT-02 — Chrome en segundo plano durante 15 s

- **Precondiciones:** estado inicial válido (§4.5).
- **Secuencia:**
  1. Generar informes «antes».
  2. En el teléfono, cambiar a otra aplicación (por ejemplo, Ajustes) y cronometrar 15 s.
  3. Volver a Chrome.
  4. Esperar 10 s sin tocar nada. Si Continuidad no vuelve a «conectada», pulsar «Reintentar conexión» una vez en el participante afectado y esperar su resultado.
  5. Generar informes «después» y cronologías.
- **Observaciones físicas:** qué ocurre en el espectador durante y después de los 15 s, y qué muestra la página del teléfono al volver.
- **Resultado esperado:** ninguno fijo (exploratorio). Se registra si hubo interrupción, de qué componente (pistas silenciadas, transporte, señalización) y si se recuperó sola o con el reintento.
- **Criterio de aprobación:** ejecutado y registrado con informes y cronologías de ambos. La cronología del emisor debe contener `visibilidad` `hidden` y `visible`, o explicar por qué no.
- **Fallos y limitaciones:** si la página se recargó (cronología sin los eventos anteriores, vista inicial), la sesión anterior no se puede recuperar desde esa página. Regístralo.

### CONT-03 — Chrome en segundo plano durante 30 s

Igual que CONT-02 con 30 s. Permite comparar con AND-09-H01 (unos 30 s en E02) sin presuponer el mismo resultado.

### CONT-04 — Chrome en segundo plano durante 60 s

Igual que CONT-02 con 60 s. Permite comparar con AND-09-H02 (pérdida de la emisión tras unos 60 s en E02), **cuya causa sigue indeterminada**. Anota especialmente:

- si al volver aparece la vista del emisor o la pantalla inicial;
- si la cronología conserva los eventos anteriores (el documento sobrevivió) o empieza de nuevo (`pagina/inicio` reciente, tal vez `descartada-previamente`);
- qué muestra el espectador en **Participante** (`desconexion` o no);
- si «Reintentar conexión» recupera la **misma** sesión, con el mismo enlace del espectador.

### CONT-05 — Chrome en segundo plano durante 90 s

Igual que CONT-04 con 90 s.

### CONT-06 — Bloqueo de pantalla durante 30 s

- **Precondiciones:** estado inicial válido (§4.5).
- **Secuencia:**
  1. Generar informes «antes».
  2. Bloquear la pantalla del teléfono con el botón de encendido y cronometrar 30 s.
  3. Desbloquear y volver a Chrome si hace falta.
  4. Esperar 10 s; si no se recupera, un «Reintentar conexión» en el participante afectado.
  5. Generar informes «después» y cronologías.
- **Observaciones físicas:** imagen y sonido en el espectador durante el bloqueo y al desbloquear.
- **Resultado esperado:** ninguno fijo (exploratorio). No se espera que la cámara siga activa con la pantalla bloqueada; se registra si las pistas quedaron silenciadas (`captura/mute`) o terminaron (`captura/ended`).
- **Criterio de aprobación:** ejecutado y registrado con sus evidencias. Permite comparar con AND-10-H01 sin presuponer el mismo resultado.
- **Fallos y limitaciones:** si una pista terminó, la página pide volver a activar la captura. Regístralo antes de hacerlo.

### CONT-07 — Bloqueo de pantalla durante 60 s

Igual que CONT-06 con 60 s.

### CONT-08 — Interrupción temporal de la Wi-Fi y restauración de la misma red

- **Precondiciones:** estado inicial válido. El cable USB sigue conectado: la señalización va por `adb reverse` y no depende de la Wi-Fi; los medios, sí.
- **Secuencia:**
  1. Generar informes «antes».
  2. En el teléfono, desactivar la Wi-Fi unos 20 s, con los datos móviles desactivados, y volver a activarla en **la misma red**.
  3. Esperar a que el teléfono reconecte la Wi-Fi y 15 s más.
  4. Si Continuidad no muestra «conectada», pulsar «Reintentar conexión» en el emisor y esperar su resultado.
  5. Generar informes «después» y cronologías.
- **Observaciones físicas:** imagen y sonido en el espectador; eventos `red/offline` y `red/online` en la cronología del teléfono.
- **Resultado esperado:** la señalización por USB no tendría por qué perderse; el transporte WebRTC puede pasar a `disconnected` o `failed`. Si el reintento recupera la misma sesión, el resultado del emisor debe ser «envío confirmado» y el espectador debe ver y oír de nuevo.
- **Criterio de aprobación:** SUPERADA si los estados por componente describen lo ocurrido (señalización frente a transporte) y el resultado del reintento coincide con lo observado (no declara recuperación si el espectador no recibe). Que la recuperación funcione no es requisito de aprobación. Si no se recupera, el caso se registra con su resultado.
- **Fallos y limitaciones:** es distinto de OBS-WIFI-01 de E02, que cambió a **otra** red; aquí se restaura la misma. Sin STUN ni TURN, en otra red no se espera conexión.

### CONT-09 — Interrupción controlada de la señalización sin destruir la sesión del servidor

- **Precondiciones:** estado inicial válido.
- **Secuencia:**
  1. Generar informes «antes».
  2. En Windows, retirar el túnel del teléfono: `adb reverse --remove tcp:8787`. El servidor sigue en marcha y no se toca la sesión.
  3. Esperar 10 s y anotar lo que muestran ambos participantes.
  4. Restaurar el túnel: `adb reverse tcp:8787 tcp:8787` y comprobar con `adb reverse --list`.
  5. Pulsar «Reintentar conexión» en el teléfono.
  6. Si responde que el servidor aún conserva el canal anterior (rol ocupado), esperar 15 s y reintentar una vez más.
  7. Generar informes «después» y cronologías.
- **Observaciones físicas:**
  - en el teléfono, el estado de **Señalización** y el mensaje;
  - en el espectador, el estado de **Participante**;
  - si el video del espectador sigue durante la interrupción.
- **Resultado esperado:**
  - El teléfono muestra la señalización interrumpida y «no recuperada: requiere intervención», **sin finalizar la sesión**.
  - Tras restaurar el túnel, el reintento recupera la misma sesión: mismo enlace del espectador, `flujosLocalesCreados` sin cambios y resultado «envío confirmado».
  - El espectador vuelve a ver y oír.
- **Criterio de aprobación:** se cumple el resultado esperado. El resultado «rol ocupado» seguido de una recuperación tras la espera es aceptable y se registra con sus tiempos.
- **Fallos y limitaciones:** retirar el túnel no garantiza que el servidor detecte al instante el cierre del canal anterior. Si lo detecta más tarde, el reintento responde «rol ocupado»: es el comportamiento previsto, no una expulsión.

### CONT-10 — Recuperación manual dentro de la misma sesión

- **Precondiciones:** una interrupción registrada en CONT-02 a CONT-09 que dejó Continuidad en «no recuperada» o «interrupción detectada»; si ninguna lo hizo, este caso se registra como NO EJECUTADA con ese motivo.
- **Secuencia:** con la interrupción presente, pulsar «Reintentar conexión», primero en el participante afectado. Generar informes «después» y cronologías.
- **Resultado esperado:**
  - el resultado del reintento coincide con lo observado;
  - la sesión es la misma: mismo enlace del espectador, sin «Nueva sesión» y sin otra captura (`flujosLocalesCreados` sin cambios);
  - el botón queda deshabilitado mientras el reintento está en curso.
- **Criterio de aprobación:** ninguna declaración de recuperación sin que el espectador vea y oiga, y la misma sesión conservada cuando hay recuperación.

### CONT-11 — Finalización durante una recuperación pendiente

- **Precondiciones:** estado inicial válido.
- **Secuencia:**
  1. Provocar una interrupción de señalización como en CONT-09, pasos 2 y 3, **sin** restaurar el túnel.
  2. Pulsar «Reintentar conexión» en el teléfono.
  3. Mientras Continuidad muestra «recuperación en curso», pulsar «Finalizar emisión».
  4. Restaurar el túnel y esperar 15 s.
  5. Generar informes «después» y cronologías.
- **Observaciones físicas:** el indicador de cámara y micrófono debe apagarse al finalizar, sin esperar a la red.
- **Resultado esperado:**
  - vista final en el teléfono y captura liberada (`recursosLiberados` `si`);
  - la emisión no se reactiva al restaurar el túnel;
  - la cronología contiene `recuperacion/cancelada`;
  - el aviso de fin al servidor puede constar como «sin confirmar»: es correcto y se registra.
- **Criterio de aprobación:** se cumple el resultado esperado.

### CONT-12 — Privacidad, liberación de recursos y limpieza del entorno

- **Secuencia:**
  1. Reunir todas las cronologías e informes de los casos anteriores.
  2. Comprobar que no contienen enlaces, tokens, identificadores de sesión, SDP, candidatos ICE, direcciones IP, nombres de red ni identificadores de dispositivo.
  3. Seguir §6 (cierre y limpieza) y comprobar que el indicador de cámara está apagado y que no queda el servidor ni el túnel.
- **Resultado esperado:** documentos JSON válidos sin datos sensibles; `adb reverse --list` vacío; sin proceso del servidor.
- **Criterio de aprobación:** se cumple el resultado esperado.
- **Limitación:** como en E02, conviene un inventario independiente de los temporales (en E02 no se hizo para AND-13).

### Tabla de resultados

| ID | Resultado observado | Evidencia | Estado |
| --- | --- | --- | --- |
| CONT-01 | | | NO EJECUTADA |
| CONT-02 | | | NO EJECUTADA |
| CONT-03 | | | NO EJECUTADA |
| CONT-04 | | | NO EJECUTADA |
| CONT-05 | | | NO EJECUTADA |
| CONT-06 | | | NO EJECUTADA |
| CONT-07 | | | NO EJECUTADA |
| CONT-08 | | | NO EJECUTADA |
| CONT-09 | | | NO EJECUTADA |
| CONT-10 | | | NO EJECUTADA |
| CONT-11 | | | NO EJECUTADA |
| CONT-12 | | | NO EJECUTADA |

**Sesiones usadas.** Si un caso empezó con una sesión nueva, anótalo aquí:

| Caso | Sesión local nueva | Motivo |
| --- | --- | --- |
| | | |

**Registro de hallazgos.** Cada problema se anota aparte, con el ID del caso, lo que ocurrió, las evidencias y su gravedad (bloquea, degrada o cosmético). No se corrige durante la prueba ni se le atribuye una causa sin evidencia.

| N.º | Caso | Descripción | Evidencia | Gravedad |
| --- | --- | --- | --- | --- |
| | | | | |

## 6. Cierre y limpieza

Igual que el protocolo E02, §6:

1. Finalizar la emisión.
2. Detener el servidor con `Ctrl+C`.
3. Retirar el túnel: `adb reverse --remove tcp:8787` y comprobar con `adb reverse --list`.
4. Restablecer los permisos y ajustes del teléfono.
5. Cerrar las pestañas con el enlace.
6. Conservar solo las evidencias en la carpeta de pruebas.

## 7. Problemas frecuentes específicos de E03

| Síntoma | Causa probable | Qué hacer |
| --- | --- | --- |
| «Reintentar conexión» está deshabilitado | Hay un reintento en curso, la sesión terminó o la página no tiene credenciales (recargada) | Esperar el resultado; si la página se recargó, la sesión anterior no se recupera desde ella |
| Resultado «el servidor aún conserva el canal anterior» | El servidor no ha detectado aún el cierre del flujo anterior (rol ocupado, 409) | Esperar unos segundos y reintentar una vez; no forzar ni cerrar el servidor |
| Resultado «la sesión ya no existe» | La sesión caducó o fue finalizada | No se puede recuperar: registrar y, si hace falta, crear otra sesión por separado |
| Resultado «conexión establecida, pero sin estadísticas» o «los medios no avanzan» | Sin `getStats` disponible o sin progreso de medios | Registrar tal cual: no es una recuperación confirmada |
| La cronología empieza de cero | Chrome recargó o descartó la página | Registrarlo: la cronología vive en memoria y no sobrevive a una recarga |
| La captura terminó tras el bloqueo | Android o Chrome cerró la cámara o el micrófono | Registrar el evento `captura/ended` y reactivar la captura solo por acción explícita |

## 8. Limitaciones

- Sin STUN ni TURN, la conexión de medios depende de la red local.
- Los casos exploratorios no tienen resultado esperado fijo y sus conclusiones valen para el teléfono, la versión de Android y la de Chrome probados.
- La cronología no sobrevive a una recarga o a un descarte de la página; los indicadores de descarte solo constan si el navegador los proporciona.
- Este protocolo no especifica la regla del minuto de reconexión del producto: aporta evidencia para especificarla después (véase el [diseño](LIVE-FASE03-E03-diseno-continuidad.md#11-evidencia-para-la-regla-futura-del-minuto-de-reconexión)).
