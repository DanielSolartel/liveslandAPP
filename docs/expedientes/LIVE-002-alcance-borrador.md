# Borrador de alcance de LIVE-002 (prueba técnica móvil)

| Campo | Valor |
| --- | --- |
| Estado | **Preparado, no ejecutado.** No se crearon cuentas, claves ni emisiones |
| Origen | Encargo [LIVE-001-R02](../encargos/LIVE-001-R02-cierre-documental-v1.0.md), §7 |
| Relación | Complementa el borrador de LIVE-002 incluido en la [v0.33, §8](../producto/proyecto-live-definicion-v0.33.md#8-investigación-de-multistream-para-claude--live-002), que sigue vigente y sujeto al resultado de LIVE-001 |
| Conclusiones de partida | [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md), §2.1: multistream en conjunto con evidencia insuficiente; cierre de emisiones externas y captura en Android como ruta condicionada |
| Fecha | 16-10-2026 |

## 1. Condiciones de la prueba

- Contenido neutral: sin desnudos, contenido sexual ni casino.
- Saldo ficticio, sin cobros, recargas, apuestas ni pagos reales.
- Solo cuentas autorizadas por sus titulares para la prueba, con las condiciones de cada destino respetadas.
- Evidencias sin credenciales: no se guardan ni publican claves de emisión, contraseñas ni tokens.
- Probar Bigo primero es un **orden de prueba**, no una decisión de producto ni la alternativa 6 de la v1.1.

## 2. Qué se comprueba

| # | Prueba | Criterio de aceptación | Pregunta o requisito relacionado |
| --- | --- | --- | --- |
| 1 | Captura web desde Android con la página en primer plano y salida hacia Bigo (clave de emisión) | Emisión estable; se registra el comportamiento con la página oculta y con la pantalla bloqueada | Multistream desde un celular (v0.33) |
| 2 | TikTok: comprobar si la cuenta obtiene clave de emisión y si puede usarse desde un servidor de terceros | Resultado documentado, positivo o negativo | Q13 |
| 3 | BuzzCast: comprobar si admite ingesta externa; si no se puede comprobar, dejar preparada la consulta a su soporte, que solo se envía si el encargo LIVE-002 lo autoriza | Resultado documentado | Q13 |
| 4 | Chat y regalos de cada destino consultados en multiventana desde el mismo teléfono | Se documenta qué se ve, con qué retraso y qué no es posible | Consulta de chat y regalos (v0.33) |
| 5 | Sesiones de 60 y 120 minutos en al menos dos teléfonos identificados (modelo y versión de sistema) | Registro de batería, temperatura, latencia y cambio de red (Wi-Fi y datos) | Más de 8 h diarias con al menos un directo |
| 6 | Desconexión del creador y reconexión en 1 minuto | Los contadores se pausan y el directo se reanuda o se cierra según la regla | Reconexión (v0.33) |
| 7 | Paso a sala exclusiva: el contenido exclusivo entra por una entrada sin salidas y se cierran las emisiones externas | Ninguna trama hacia los destinos después del instante T, verificado en el proceso, el socket y los bytes enviados | Cierre de emisiones externas (v0.33) |
| 8 | Grabación: `recording.mode` (automatic y off) y borrado por API | Se confirma qué se graba en cada modo y que el borrado por API elimina la grabación | Grabación opcional del creador; grabación técnica (R02-05) |
| 9 | Cartel con video en vivo continuo | Continuidad durante toda la tarea simulada; cortes registrados | Prueba de cartel (v0.33) |
| 10 | Detección y corte con contenido neutral | Tiempo entre la alerta y el corte; registro del escalado | Q10; administración única |

## 3. Fuera de alcance

- Cobros, apuestas, recargas o pagos reales.
- Contenido para adultos o del casino en cualquier destino.
- Contacto con TikTok, BIGO o BuzzCast fuera del uso normal de las cuentas autorizadas, salvo que el encargo LIVE-002 lo autorice.
- Elegir proveedor o arquitectura de producción.
