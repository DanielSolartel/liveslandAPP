# LIVE-FASE03-E02 — Resultados y auditoría de validación física Android

| Campo | Valor |
|---|---|
| Entrega validada | LIVE-FASE03-E02 v1.3 |
| Estado del documento | Expediente de resultados, versión 1.0 del cierre documental. Auditoría favorable con reservas (ChatGPT); **el promotor aceptó el dictamen y las reservas**. **Preparado; pendiente de auditoría y de publicación manual.** No está publicado |
| Fecha | Auditoría de resultados: 24-11-2026 (America/Bogota). Preparación del cierre documental: 25-11-2026 |
| Ejecución física | 23 y 24-11-2026 (UTC: 24-11-2026) |
| Base de E02 | `7eae89e0b083b26ba3a44f1e22304e32e47c32a5` |
| Base del cierre documental | `eb67ae1fd9d347d062905410d9b0d54c69763264` |
| Commit físico probado | `eb67ae1fd9d347d062905410d9b0d54c69763264`, publicación de E02 v1.3 (23-11-2026) |
| Issue | [#2](https://github.com/DanielSolartel/liveslandAPP/issues/2), abierto según el estado validado del encargo. Esta entrega no lo cierra ni lo modifica |
| Fase | FASE-03 activa; FASE-02 en espera de validaciones externas, no cerrada; FASE-04 y posteriores no autorizadas |
| Ejecutores | Promotor: pruebas físicas y comandos Windows. Claude: pruebas automatizadas Linux de la entrega. ChatGPT: revisión y auditoría de evidencias. |

## 0. Estado documental y aceptación del promotor

El cierre documental de E02 **no equivale al cierre de FASE-03**. FASE-03 sigue activa; FASE-02 está en espera de validaciones externas y no está cerrada; FASE-04 y las fases posteriores no están autorizadas; y LIVE-FASE03-E03 tampoco está autorizada.

| Etapa | Estado | Fuente |
| --- | --- | --- |
| Preparación histórica | v1.0 a v1.2 no publicadas; v1.3 preparada el 23-11-2026 sobre `7eae89e`. El [protocolo](LIVE-FASE03-E02-protocolo-android.md) conserva ese estado de preparación | Plan v1.7 y estado del proyecto en `eb67ae1` |
| Publicación de la versión validada | **Publicada.** E02 v1.3 está en `eb67ae1` (23-11-2026), con padre único `7eae89e` y 18 rutas (12 modificadas y 6 nuevas) | Git; comprobado por Claude en la preparación de este cierre (§10) |
| Ejecución física | **Ejecutada** el 23 y 24-11-2026: 13 de 13 casos del protocolo (11 funcionales y 2 exploratorios) | §4 |
| Auditoría de resultados | **Realizada** por ChatGPT: dictamen favorable para cierre documental, con reservas explícitas y sin hallazgos bloqueantes confirmados para E02 | §6 y §8 |
| Aceptación del promotor | **El promotor aceptó el dictamen y las reservas** y autorizó exclusivamente este cierre documental (§0.1) | Encargo de cierre documental |
| Preparación del cierre documental | **Preparada**: este expediente, el manifiesto de evidencias y la reconciliación de documentos | Esta entrega |
| Publicación del cierre | **Pendiente**: auditoría de ChatGPT, y aplicación, commit y push manuales del promotor, con verificación del SHA publicado | — |
| Issue #2 | **Abierto.** Su cierre lo decide el promotor después de la publicación verificada; esta entrega no lo cierra | — |

### 0.1 Aceptación y alcance

El promotor aceptó el dictamen de la auditoría y las reservas de §0.2, y autorizó exclusivamente la preparación de este cierre documental. La fecha de la aceptación no consta en los documentos de entrada; consta en el encargo. No autoriza LIVE-FASE03-E03, no cierra FASE-02 ni FASE-03, no declara solucionados los problemas de continuidad y no modifica ninguna decisión previa del promotor.

**Las pruebas exploratorias AND-09 y AND-10 no se presentan como validación de continuidad audiovisual en segundo plano.** Solo muestran lo observado y sus límites. Tampoco se afirma que la publicación de este cierre haya ocurrido.

### 0.2 Reservas y hallazgos aceptados

| ID | Reserva o hallazgo | Detalle |
| --- | --- | --- |
| AND-08-H01 | Primer intento fallido por discrepancia del contador histórico; segundo intento satisfactorio; causa original indeterminada; no se elimina el primer resultado | §4 y §6 |
| AND-09-H01 | Interrupción de audio y congelación de video durante unos 30 s en segundo plano, con recuperación automática | §6 |
| AND-09-H02 | Pérdida de sesión tras unos 60 s fuera de Chrome; hubo que crear otra sesión. Los JSON de AND-09 son de esa nueva sesión, no del instante del fallo | §4 y §6 |
| AND-10-H01 | Interrupción audiovisual durante el bloqueo de pantalla, con recuperación automática al desbloquear | §5 y §6 |
| OBS-WIFI-01 | Pérdida de conexión al cambiar de Wi-Fi; recuperación mediante finalización manual y nueva sesión. No se afirma reconexión automática | §6 |
| RES-AND-11 | Texto visual del emisor no comprobado; criterios funcionales respaldados por los informes | §4 y §6 |
| OBS-REPRODUCCION | La reproducción requirió un gesto del usuario; comportamiento previsto | §6 |
| Evidencia visual de AND-04 y AND-07 | Las fotografías específicas del indicador de privacidad no se localizaron para la auditoría | §4 |
| Inventario de AND-13 | No se hizo un inventario independiente de todos los temporales | §4 |
| Cinco JSON | No reverificados independientemente fuera del PC del promotor | §7 |
| E2E en Linux | La ejecución predeterminada falló por la ausencia del navegador esperado; la satisfactoria usó `DIRECTO_CHROMIUM` explícito | §2 |
| Versión de Chrome | Chrome 157 en la primera jornada y 158 en la segunda, sin asumir la causa del cambio | §3 |

## 1. Alcance y fuentes

Se audita el experimento neutral de un emisor y un espectador, cámara y micrófono reales, señalización USB mediante `adb reverse`, medios WebRTC por LAN sin STUN/TURN. No se valida producción, Internet, sesiones largas, reconexión robusta, multistream, chat, regalos, transición a exclusivo, pagos, cuentas, grabación o viabilidad jurídica. Las observaciones sobre segundo plano, bloqueo y cambio de Wi-Fi no amplían el alcance autorizado.

Fuentes: [protocolo v1.3, de preparación e histórico](LIVE-FASE03-E02-protocolo-android.md) (publicado en `eb67ae1`), [commit](https://github.com/DanielSolartel/liveslandAPP/commit/eb67ae1fd9d347d062905410d9b0d54c69763264), [Issue #2](https://github.com/DanielSolartel/liveslandAPP/issues/2), [plan v1.7](https://github.com/DanielSolartel/liveslandAPP/blob/eb67ae1fd9d347d062905410d9b0d54c69763264/docs/estado/PLAN-POR-FASES.md), ZIP E02 v1.3, registros originales Windows aportados por el promotor, informes de diagnóstico y confirmaciones de ejecución en la conversación. Los JSON se conservan fuera del repositorio y no se incorporan a él; parte de los archivos se reconstruyó a partir de los campos y valores compartidos por el usuario, no se presenta como copia byte a byte del portapapeles original. Las huellas identifican los archivos efectivamente archivados. El manifiesto con sus 26 huellas es [LIVE-FASE03-E02-evidencias.sha256](LIVE-FASE03-E02-evidencias.sha256).

## 2. Integridad y verificación automatizada

- ZIP v1.3 SHA-256: `246e5444e0a409ba2d5ee54f4a3bd307acabe8cd550ab067ef5bafd21a4c5a16`.
- Parche SHA-256: `2fb2475f4243b3116741eac3cc89c5d07605521a034f3116bce8c0a06cc2b786`.
- Manifiesto interno: 30/30 sumas correctas, recalculadas en auditoría.
- 18/18 rutas modificadas o añadidas en la entrega: identificadores Git de las copias finales recalculados y coincidentes con los 18 blobs consultados en GitHub para el commit probado. Anexo `LIVE-FASE03-E02-blobs-publicados.txt`, que se conserva en el paquete de cierre y **no** se incorpora al repositorio: los identificadores se obtienen con `git rev-parse eb67ae1:<ruta>` y cinco de las dieciocho rutas se modifican en este cierre, de modo que una lista fija podría confundirse con el estado actual. En la preparación de este cierre, Claude comprobó que los 18 identificadores del anexo coinciden con los de `eb67ae1` en Git y que las 18 rutas son las que ese commit cambia respecto de su padre (§10). No se repitió aquí una comparación de todos los demás blobs o una prueba de aplicación del parche sobre la base.
- Windows: registro v1.3 demuestra `npm ci`, comprobación de tipos, 73/73 unitarias y 8/8 E2E con Edge; 18/18 SHA-256 de los archivos auditados tras las pruebas. Linux: informe y registros del ZIP muestran tipos correctos, 73/73 unitarias y 8/8 E2E con `DIRECTO_CHROMIUM` explícito. La ejecución E2E Linux predeterminada falló por no disponer del ejecutable esperado (8/8 fallidas en esa ejecución); se conserva el antecedente. No se reejecutó toda la batería en la presente auditoría.
- Al iniciar la segunda jornada y cerrar AND-13, la salida del promotor muestra HEAD exacto y árbol de trabajo limpio. El Issue #2 sigue abierto; no se hicieron cambios remotos en esta auditoría.

## 3. Entorno físico

| Dato | Valor registrado |
|---|---|
| Teléfono | Redmi Note 14 Pro, Android 14 (SDK 34), HyperOS 1.0, según registro de ejecución |
| Navegador del emisor | Chrome 157 el día 23; Chrome 158 el día 24 (versión mayor del JSON). No se asume el motivo del cambio. |
| Espectador físico | Chrome 158, Windows 11 |
| Node / npm | v24.15.0 / 11.12.1 |
| PowerShell | 5.1; la compilación de PowerShell no se usa como compilación del SO. Compilación exacta de Windows no consolidada. |
| ADB | Android Platform Tools 37.0.3, ADB 1.0.41, según registro de ejecución |
| Red | LAN/Wi-Fi común para las emisiones correctas, sin aislamiento impeditivo observado. Servidor en 127.0.0.1:8787; USB reverse para señalización. Cambio de Wi-Fi durante la reanudación, fuera de casos obligatorios. |
| Captura reportada | 480 × 640, 30 FPS nominales; audio mono, 48 kHz; cámara frontal |

No se registran nombres de redes, identificadores del dispositivo, IP de la LAN, enlaces de sesión, tokens, SDP ni capturas con información personal. No se extrapola a otros teléfonos o navegadores.

## 4. Resultado de los trece casos

Estados del protocolo: SUPERADA, FALLIDA, BLOQUEADA, NO EJECUTADA. En exploratorios, SUPERADA significa únicamente ejecutada y registrada. El dictamen de SUPERADA con reserva es una aceptación documental, no un nuevo estado del protocolo. Se conserva el primer intento FALLIDA de AND-08.

| ID | Observación y evidencia | Estado (propuesto por la auditoría; aceptado por el promotor) |
|---|---|---|
| AND-01 | Preparación Windows, Node >=22, tipos y pruebas correctos, ADB `device`, servidor y reverse operativos; registro PowerShell. | SUPERADA |
| AND-02 | `rol: null`, contexto seguro y APIs de captura/WebRTC disponibles. `AND-02-emisor.json`; capturas de pantalla de página inicial. | SUPERADA |
| AND-03 | Permiso denegado, captura sin-captura, 0 pistas, categoría correcta; el ejecutor confirma reintento disponible e indicador apagado. `AND-03-emisor.json`. | SUPERADA |
| AND-04 | Captura activa, 2 pistas vivas sin silenciar, ajustes reales, vista previa silenciada. El ejecutor confirma imagen e indicador activo. `AND-04-emisor.json`; fotografía específica del indicador no localizada para esta auditoría. | SUPERADA, reserva de evidencia visual |
| AND-05 | Ambos conectados, audio y video confirmados por el ejecutor, 2 pistas remotas. El espectador necesitó gesto de reproducción, luego reprodujo. Ambos `AND-05-*.json`. | SUPERADA |
| AND-06 | Cuatro informes: bytes positivos y crecientes en audio/video de ambos roles, fotogramas decodificados y paquetes de audio positivos. Intervalos reales 71,995 s emisor y 61,336 s espectador, no simultáneos. `AND-06a-*.json`, `AND-06b-*.json`. | SUPERADA |
| AND-07 | Sesión terminada en ambos, 0 pistas y recursos liberados, cierre confirmado por emisor. Vista final, indicador apagado y aviso remoto confirmados por ejecutor; foto específica no localizada. Ambos `AND-07-*.json`. | SUPERADA, reserva de evidencia visual |
| AND-08 | Intento 1: dos pistas y transporte correcto, enlace antiguo rechazado, contador quedó en 1; sin recarga manual según ejecutor: FALLIDA. Intento 2: historial 1→1→1→2 y dos pistas locales, conexión, rechazo del enlace previo y recepción confirmados sin recarga; cinco informes únicos. Evidencia adicional previa a AND-10 con Chrome 158. `AND-08-intento1-*.json`, `AND-08-intento2-*.json`. | SUPERADA en repetición; preservar fallo inicial |
| AND-09 | En segundo plano ~30 s, imagen congelada y audio interrumpido, indicador de privacidad activo y recuperación automática al volver. Ausencia posterior ~60 s: desconexión, pantalla inicial al regresar, nueva sesión necesaria. Los dos `AND-09-*.json` son de la nueva sesión, no del fallo ni de la recuperación de la sesión original. | SUPERADA (exploratoria); reserva de trazabilidad |
| AND-10 | Bloqueo ~30 s: imagen congelada, audio interrumpido; recuperación automática al desbloquear. Comparación con `AND-10-base-*.json`: contador 2→2, dos pistas locales y remotas, mismos errores históricos, transporte posterior conectado. `AND-10-*.json`. No hay telemetría durante el bloqueo. | SUPERADA (exploratoria) |
| AND-11 | Espectador pulsó Salir y mostró vista final, 0 pistas, sin conexión, recursos liberados, aviso confirmado; emisor mantiene señalización y captura activa con 2 pistas, sin peer. No se comprobó el texto de interfaz del emisor. El criterio funcional de detección y captura activa es compatible con el código de manejo de presencia. Ambos `AND-11-*.json`. | SUPERADA propuesta, reserva visual |
| AND-12 | Auditoría local: 26/26 JSON conformes, 0 incidencias. Repetición independiente sobre los 21 disponibles: 21/21 válidos y hashes coincidentes; 5 no disponibles en el entorno auditor, no faltan en el PC según su salida. | SUPERADA |
| AND-13 | Finalización e indicador apagado confirmados, SIGINT cierra sesiones/servidor, reverse vacío, 8787 libre, repositorio limpio, 26 JSON preservados. PID 20796 no coincide con comando del experimento; no se detiene. Permisos restablecidos, depuración USB desactivada y datos móviles reactivados. No se realizó inventario independiente de todos los temporales; JSON final complementario no requerido. | SUPERADA propuesta, reserva de inventario |

Balance: 11 casos funcionales superados (incluida la repetición y las reservas), 2 exploratorios ejecutados y registrados, ningún caso funcional sin ejecución. No equivale a trece aprobaciones de continuidad audiovisual. El promotor aceptó las reservas (§0).

## 5. Mediciones y su interpretación

AND-06: el intervalo emisor de 71,995 s incrementó bytes de video en 13.799.968 (1,533 Mbps) y audio en 185.440 (20,61 kbps); 1.529 fotogramas codificados (21,24 FPS). El intervalo espectador de 61,336 s incrementó bytes de video en 11.820.914 (1,542 Mbps), audio en 160.731 (20,96 kbps), fotogramas decodificados en 1.318 (21,49 FPS). No aumentaron sus contadores de pérdidas de paquetes o fotogramas descartados en ese intervalo. RTT de los cuatro informes 5–12 ms; jitter de audio del espectador 4 ms en ambas lecturas. RTT no equivale a latencia de extremo a extremo audiovisual; los intervalos no son simultáneos y no permiten conciliar directamente los contadores de ambas máquinas. Los 30 FPS nominales de captura no se garantizan como FPS efectivos. No se impuso umbral de bitrate/FPS en el caso.

AND-10: antes y después del bloqueo, el emisor conserva 2 capturas históricas y 2 pistas activas. Los contadores del espectador aumentaron de 7 a 72 paquetes de video perdidos y de 2 a 16 de audio, en intervalos que incluyen tiempo fuera del bloqueo; no se imputan todas esas pérdidas al bloqueo. Los errores históricos se mantienen en 1 por rol (fallo WebRTC previo al cambiar Wi-Fi y gesto de reproducción); no hay nuevos errores registrados entre esos informes. No se conoce la evolución de ICE durante el bloqueo.

## 6. Hallazgos y observaciones

| ID | Descripción, evidencia y clasificación |
|---|---|
| AND-08-H01 | Degrada la confianza en continuidad del diagnóstico: contador quedó en 1 en primer intento; no reproducido en la repetición controlada ni en la sesión previa a AND-10. `AND-08-intento1-emisor.json` y secuencia del intento 2. No se determina causa; recarga automática o reinicialización es hipótesis, no hecho. No justifica por sí solo un parche. |
| AND-09-H01 | Degrada continuidad de emisión: video congelado y audio interrumpido durante segundo plano ~30 s. Recuperación automática observada. Fuente: observación del ejecutor; no hay informes durante la interrupción. No bloquea E02. |
| AND-09-H02 | Degrada continuidad: después de ~60 s en segundo plano se perdió la sesión observada; Chrome mostró pantalla inicial y se creó otra sesión. JSON de la nueva sesión; falta informe del estado de fallo. No se identifica si hubo reinicialización del documento, cierre del transporte, expiración o suspensión. No bloquea E02. |
| AND-10-H01 | Degrada continuidad: durante bloqueo ~30 s, video congelado y audio interrumpido; recuperación automática al desbloquear. Base y JSON posteriores conservan contador y conexión activa. No bloquea E02. |
| OBS-WIFI-01 | Degrada continuidad: cambio de Wi-Fi provocó pérdida de conexión; se finalizó manualmente y se creó nueva sesión sin recarga. `AND-10-base-emisor.json` registra `webrtc-conexion-fallida` y contador 2. Observación no controlada, fuera del alcance obligatorio. No se afirma reconexión automática. |
| RES-AND-11 | Evidencia visual no comprobada en emisor; no es defecto confirmado. El código procesa ausencia del par, cierra peer y fija «esperando espectador» (`app.js` 225–237), consistente con el informe y el aviso confirmado del espectador. |
| OBS-REPRODUCCION | Autoplay requirió gesto; resuelto por el usuario. Categoría histórica `reproduccion-requiere-gesto`, comportamiento previsto en protocolo, no defecto confirmado. |

No hay hallazgos confirmados que bloqueen la validación local de E02. Los problemas de continuidad son relevantes para FASE-03 y para producción, no se eliminan ni se dan por solucionados. No se prueban reconexión robusta ni continuidad con pantalla apagada.

## 7. Auditoría de evidencias y privacidad

La salida del auditor local identifica 26 archivos y sus SHA-256 ([manifiesto `LIVE-FASE03-E02-evidencias.sha256`](LIVE-FASE03-E02-evidencias.sha256), incorporado sin modificar; SHA-256 del propio archivo `624f5b20db0514e562b87da909c60e9e31f06aacffd24f91803345f2d32d1b7e`). El auditor se usa solo para esta colección: esquema 2, claves cerradas, categorías, roles, fechas, valores permitidos, nulidad y coherencia de campos; no es una validación general de todos los informes posibles ni una prueba de ausencia de cualquier canal encubierto. SHA-256 del auditor utilizado: `a7f690264b8cc72e002c9977b2bd923392a3489af027ca21ef7a8835fb55c6ac`.

Verificación independiente: ocho ZIP de evidencias (AND-06 a AND-11, incluida la base de AND-10) contienen 21 JSON; todos pasan el mismo auditor y sus SHA-256 coinciden con el manifiesto local. La ejecución sobre esa colección reducida informa cinco faltantes, esperados en ese entorno: AND-02-emisor, AND-03-emisor, AND-04-emisor, AND-05-emisor y AND-05-espectador. No se recalcularon aquí sus cinco hashes a partir de los bytes; sus resultados se sustentan en el auditor local del usuario. Los 26 archivos siguen en el equipo del promotor fuera de Git. No se requiere subirlos públicamente y esta entrega no incorpora los JSON, videos ni capturas privadas. Las reservas de evidencia visual y de AND-09 no se pueden reconstruir retroactivamente.

## 8. Dictamen sobre el Issue #2

| Criterio del Issue | Evaluación |
|---|---|
| Procedimiento reproducible | Cumple: protocolo versionado y ejecutado en Windows/Android. |
| Resultados documentados | Cumple sustancialmente; este expediente los integra y debe publicarse manualmente, conservando las reservas. |
| Problemas registrados | Cumple: hallazgos y observaciones con trazabilidad y gravedad. |
| Limitaciones identificadas | Cumple: red local, restricciones de segundo plano, bloqueo, cambio de Wi-Fi y alcance no validado. |

Dictamen favorable condicionado a la aceptación explícita de las reservas por el promotor y a la publicación manual verificada de la documentación de resultados. La aceptación consta (§0); la publicación manual verificada sigue pendiente. No hay requisito en el Issue de resolver todos los problemas de continuidad antes de cerrarlo. No se autoriza el cierre remoto en esta auditoría. Se mantiene el protocolo v1.3 como documento histórico de preparación; la nueva acta de resultados distingue preparación y ejecución.

## 9. Estado del siguiente paso

1. **Este cierre documental de E02.** Entrega exclusivamente documental, basada en `eb67ae1`: añade este expediente y el manifiesto de huellas (sin JSON ni capturas privadas) y reconcilia estado, plan y README, así como la referencia al protocolo y el README del experimento, sin reescribir la historia de las entregas. Corrige la mención histórica de E01 v1.0 como activa en la fila de FASE-03 del plan. No modifica código, dependencias, requisitos, decisiones del promotor ni criterios de fases. Claude prepara el parche, el inventario y las verificaciones; ChatGPT audita; el promotor aplica, hace commit y push; ChatGPT comprueba la publicación. **Aún no está publicada.**
2. **Issue #2.** Después de la publicación verificada, el promotor puede decidir su cierre si acepta la auditoría. Esta entrega no lo cierra ni lo modifica.
3. **FASE-03 permanece activa**; no se abre simultáneamente otra entrega. Los demás objetivos de FASE-03 del plan se mantienen pendientes.
4. **Propuesta posterior, no autorizada.** LIVE-FASE03-E03, prueba acotada de continuidad y recuperación de emisión local. Definir antes alcance, criterios y base publicada. Empezar por reproducir interrupciones controladas y distinguir ciclo de vida de página, señalización, conexión WebRTC y captura, con diagnóstico temporal de categorías cerradas y sin identificadores sensibles; no prometer recuperación transparente ni cámara en segundo plano. Probar degradación/recuperación y comportamiento visible sin cambios de seguridad; evaluar opciones web/nativa solo con datos. No autoriza multistream, producción, STUN/TURN público, cobros, cuentas, ni otra fase. Los demás objetivos FASE-03 del plan se mantienen pendientes.

Esta entrega no hace commit, push, cierre de Issue ni modificación del remoto. La publicación es manual.

## 10. Verificaciones propias de la preparación del cierre

Hechas por Claude sobre un clon de lectura de la rama `claude/new-session-tzsjwj`; no se repitieron las pruebas automatizadas ni las físicas.

| Verificación | Resultado |
| --- | --- |
| HEAD y árbol de trabajo al empezar | `eb67ae1fd9d347d062905410d9b0d54c69763264`; árbol limpio |
| Padre del commit base | `7eae89e0b083b26ba3a44f1e22304e32e47c32a5` (único) |
| Rutas que cambia `eb67ae1` | 18: 12 modificadas y 6 nuevas; coinciden con las del anexo de blobs |
| Identificadores de los 18 blobs del anexo | 18 de 18 coinciden con `git rev-parse eb67ae1:<ruta>` |
| Cita de código de RES-AND-11 (`public/app.js`, líneas 225 a 237) | Coincide: ante la ausencia del par se cierra la conexión y el emisor pasa a «esperando espectador» |
| ZIP de auditoría y manifiesto interno | SHA-256 del ZIP `89d2d4b9593a1e0a85a5ccf14621cba7b878d4effa3f2b4d5982fd4895c30598`; los tres archivos coinciden con su `SHA256SUMS` |
| Manifiesto de evidencias | 26 líneas; incorporado sin modificar |

**No verificado por Claude:** el estado del Issue #2 (sin acceso a la API); los resultados de las pruebas automatizadas de Linux y Windows (constan en las fuentes); el contenido de los 26 JSON y de las capturas, que están fuera del repositorio y no se le entregaron; las huellas de los cinco JSON no disponibles para la auditoría independiente; y las observaciones físicas, que son las del promotor.
