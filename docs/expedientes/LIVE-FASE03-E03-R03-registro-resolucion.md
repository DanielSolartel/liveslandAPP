# LIVE-FASE03-E03 — Registro de resolución de la revisión E03-R03 — v1.3

| Campo | Valor |
| --- | --- |
| Revisión | E03-R03, auditoría independiente de ChatGPT sobre `LIVE-FASE03-E03-v1.2.zip` (no publicada). R01 y R02 quedaron conformes y no se reabren |
| Base | `90b32ccc85ac9854808f0090d3c1663a4c1b7ab2` |
| Material de la auditoría | `LIVE-FASE03-E03-R03-sondas.zip`, SHA-256 `eb660a567ee313bc9ccd169701e1e45cb1bf28b6d15ffb3c4c768b0a6e2029a6`. Su `SHA256SUMS` interno coincide en 3 de 3. Contiene una sonda descriptiva con los dobles de la v1.2 y un servidor HTTP/SSE de prueba; la sonda no se incorpora al repositorio |
| Resultado | Un defecto (E03-R03-01) confirmado y corregido; una precisión documental reconciliada |
| Diseño | [Diseño e implementación, v1.3](LIVE-FASE03-E03-diseno-continuidad.md) |
| Revisiones anteriores | [E03-R01](LIVE-FASE03-E03-R01-registro-resolucion.md) y [E03-R02](LIVE-FASE03-E03-R02-registro-resolucion.md) |

## E03-R03-01 — Recuperación confirmada con la señalización ya interrumpida

- **Reproducción (sonda de la auditoría):**
  1. Emisión conectada con progreso simulado.
  2. `addIceCandidate` retenido en la negociación vigente.
  3. Reintento manual.
  4. EOF del flujo de eventos, sin `fin`.
- **Evidencia anterior (v1.2):** el canal ya había comunicado `interrumpida`, pero la página seguía mostrando `conectada`. El reintento publicaba `confirmada / envio-confirmado`, y la cronología registraba el éxito **antes** que la interrupción ya observada.
- **Causa:** los cambios de estado del canal se procesaban en la misma cola que las señales. Con la cola ocupada por una operación WebRTC (acotada a 4 s desde R02, pero más larga que la comprobación de progreso), la interrupción no invalidaba a tiempo `canalConfirmado` ni la época de interrupciones.
- **Corrección:**
  - Los cambios de estado del canal vigente se aplican **en el orden en que el canal los observa**, sin pasar por la cola. Son conectada, interrumpida, error y cerrada.
    - Su tratamiento (`manejarEstadoCanal`) es síncrono y no espera a la red.
    - Invalida la confirmación y la época, registra el evento en su orden causal y conserva los medios (interrupción ordinaria, no cierre).
    - Descarta los estados de un canal que ya no es el vigente.
  - Las señales (ofertas, respuestas, candidatos) siguen serializadas, y el `fin` conserva su prioridad de R02.
  - Un canal interrumpido, con error o cerrado ya no se puede confirmar: una bienvenida que quedó encolada detrás de una negociación se ignora (`bienvenida-tardia` en la cronología).
  - Si la señalización se pierde durante la comprobación previa del reintento, este no renegocia sobre un canal interrumpido. Publica «interrupción durante la comprobación» y un reintento nuevo reabre el canal y exige evidencia nueva de progreso. Aplica a los dos roles.
- **Regresiones** (`pruebas/unidad/revision-r03.test.js`, 8):
  1. EOF durante la comprobación con un candidato retenido (emisor; la sonda).
  2. Error de lectura del flujo con la cola ocupada.
  3. EOF con la cola ocupada en el espectador.
  4. La interrupción ordinaria no termina la sesión ni cierra medios (comprobado en 1 a 3).
  5. Bienvenida antigua encolada que no reconfirma un canal interrumpido.
  6. Callback tardío de un canal abandonado que no invalida el vigente.
  7. Recuperación posterior legítima con lecturas nuevas de la conexión nueva.
  8. Prioridad del fin y liberación de recursos con la cola ocupada.
  9. Investigación de la ausencia del espectador con la cola ocupada.

  En los casos 1 a 3 se comprueba **antes de liberar el candidato** que la interrupción ya consta y que no hay éxito, y que en la cronología la interrupción precede al resultado.
- **Resultado:**
  - Sobre la v1.2 fallan 5 de 8; pasan el callback tardío, la prioridad del fin y la investigación, que la v1.2 ya cumplía.
  - Sobre la v1.3 pasan 8 de 8.
  - Sonda contra la v1.3: canal `interrumpida`, resultado `no-confirmada / interrupcion-durante-comprobacion`, y en la cronología la interrupción (n.º 16) precede al fallo (n.º 17).

**Ausencia del participante durante una comprobación (revisada, sin defecto confirmado).** El evento `par` sigue en la cola de señales.

- Con la cola ocupada, una ausencia del espectador se procesa al liberarse la cola, como máximo a los 4 s por el límite de R02. Entonces cierra la conexión, marca una interrupción y la confirmación pasa a ser antecedente.
- El criterio vigente de confirmación (R01-02) no incluye la presencia del otro participante: el emisor solo afirma que **envía**. No se reprodujo un incumplimiento, así que **no se cambia**.
- La prueba de investigación comprueba que, una vez procesada la ausencia, no queda una confirmación vigente.

## Precisión documental: `operacionRtcMs` y `addIceCandidate`

El comentario de `operacionRtcMs` (`public/continuidad.js`) decía que el agotamiento de cualquier operación nativa liberaba la conexión. Ahora distingue los dos casos:

- en `createOffer`, `createAnswer`, `setLocalDescription` y `setRemoteDescription`, la negociación se abandona y su conexión se libera;
- en `addIceCandidate`, solo se ignora ese candidato y la negociación sigue.

La política no cambia: un candidato aislado no invalida una negociación, y la recuperación queda acotada por sus propias esperas. El diseño y el registro de R02 se corrigen en el mismo sentido.

## Conservación

- **Pruebas:** siguen pasando las 166 pruebas de la v1.2, sin adaptaciones, y las 14 E2E. Entre ellas, las 27 de R01 y las 11 de R02.
- **Comportamiento conservado:** prioridad del fin, límites por operación, aislamiento entre generaciones, aceptación de ofertas por identificador, época de interrupciones, 409 por código, bienvenida obligatoria, autorización por token y rol, rechazo de canales ocupados, caducidad, liberación de recursos y finalización irreversible.
- **Formatos:** el esquema 2 del informe de E02 no cambia; la cronología añade solo el detalle `bienvenida-tardia`.

## Limitaciones conservadas

- No se ejecutó nada en Windows ni en Android. CONT-01 a CONT-12 siguen **NO EJECUTADOS**, y las limitaciones físicas de Chrome no se han resuelto ni medido.
- No se exige que el navegador ejecute temporizadores mientras JavaScript está suspendido: durante una suspensión real, los cambios se aplican al reanudarse.
- El límite de 4 s por operación no está medido en Android.
- Siguen sin autorizarse la sustitución de canales, la persistencia de credenciales y la regla de reconexión de un minuto.

**Estado de las fases:** FASE-02 en espera, FASE-03 activa y FASE-04 no autorizada.
