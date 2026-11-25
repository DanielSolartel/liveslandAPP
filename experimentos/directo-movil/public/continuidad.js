// @ts-check
// Estados visibles de continuidad (LIVE-FASE03-E03). Funciones puras: a partir del estado observado de cada
// componente (sesión, señalización, otro participante, pistas, transporte WebRTC y reproducción) derivan un
// estado de continuidad de lista cerrada y su motivo, y evalúan si los medios avanzan entre dos lecturas de
// estadísticas. No deciden nada del producto: no hay contadores, plazos de reconexión ni devoluciones.
// Sin dependencias del DOM: se prueban en Node.

/**
 * Temporizadores técnicos de la recuperación manual (E03). Acotan cada espera para que ninguna tarea quede
 * pendiente indefinidamente. No son reglas del producto: el minuto de reconexión de la v0.33 no se implementa.
 */
export const LIMITES_RECUPERACION = Object.freeze({
  /** Espera de la bienvenida del servidor tras reabrir la señalización. */
  bienvenidaMs: 5000,
  /**
   * E03-R02-02: límite de cada operación WebRTC nativa de una negociación. Al agotarse, la operación se cancela
   * de forma lógica (su resultado tardío se ignora) y:
   * - en createOffer, createAnswer, setLocalDescription y setRemoteDescription, la negociación se abandona y su
   *   conexión se libera;
   * - en addIceCandidate, solo se ignora ese candidato y la negociación sigue: un candidato aislado no invalida
   *   la negociación, y la recuperación queda acotada por sus propias esperas (conexión y progreso).
   */
  operacionRtcMs: 4000,
  /** Intentos de reapertura, dentro de un mismo reintento, si el servidor responde 409 (rol ocupado). */
  intentosRolOcupado: 3,
  /** Pausa entre esos intentos. */
  pausaRolOcupadoMs: 1000,
  /** Espera de una negociación nueva (oferta aplicada y respuesta enviada) en el espectador. */
  negociacionMs: 10_000,
  /** Espera de `connectionState === 'connected'` tras renegociar. */
  conexionMs: 15_000,
  /** Separación entre lecturas sucesivas de estadísticas que comprueban el progreso de los medios. */
  intervaloProgresoMs: 1000,
  /**
   * Máximo de lecturas de estadísticas por comprobación. Justo después de conectar, los registros de recepción
   * pueden no existir aún; se comparan lecturas consecutivas hasta confirmar o agotar este número.
   */
  lecturasProgreso: 4,
  /** Intervalo mínimo entre ofertas que el emisor crea por una solicitud del espectador. */
  intervaloMinOfertasMs: 2000,
  /** Máximo de candidatos ICE en cola, entrantes o salientes, por conexión. */
  maxCandidatosEnCola: 64,
});

/** Estados de continuidad, del menos al más avanzado; `requiere-intervencion` y `finalizada` aparte. */
export const ESTADOS_CONTINUIDAD = Object.freeze([
  'sin-sesion',
  'esperando-participante',
  'conectando',
  'conectada',
  'interrupcion-detectada',
  'recuperacion-en-curso',
  'recuperacion-confirmada',
  'requiere-intervencion',
  'finalizada',
]);

/** Motivos que acompañan al estado. */
export const MOTIVOS_CONTINUIDAD = Object.freeze([
  'ninguno',
  'sesion-finalizada',
  'sin-sesion',
  'en-curso',
  'sesion-inexistente',
  'no-autorizado',
  'rol-ocupado',
  'conflicto-senalizacion',
  'limite-senales',
  'canal-tiempo-agotado',
  'canal-perdido',
  'canal-conectando',
  'participante-ausente',
  'participante-salio',
  'participante-desconectado',
  'sin-captura',
  'captura-terminada',
  'pista-silenciada',
  'pista-remota-terminada',
  'esperando-negociacion',
  'esperando-medios',
  'transporte-conectando',
  'transporte-desconectado',
  'transporte-fallido',
  'transporte-cerrado',
  'recuperacion-no-confirmada',
  'reproduccion-requiere-gesto',
]);

/** Textos visibles de cada estado. */
export const TEXTOS_ESTADO = Object.freeze({
  'sin-sesion': 'sin sesión',
  'esperando-participante': 'esperando participante',
  conectando: 'conectando',
  conectada: 'conectada',
  'interrupcion-detectada': 'interrupción detectada',
  'recuperacion-en-curso': 'recuperación en curso',
  'recuperacion-confirmada': 'recuperación técnica confirmada',
  'requiere-intervencion': 'no recuperada: requiere intervención',
  finalizada: 'finalizada',
});

/** Textos visibles de cada motivo. */
export const TEXTOS_MOTIVO = Object.freeze({
  ninguno: '',
  'sesion-finalizada': '',
  'sin-sesion': '',
  'en-curso': 'comprobando señalización, conexión y medios',
  'sesion-inexistente': 'el servidor no tiene esta sesión (finalizada, caducada o inexistente)',
  'no-autorizado': 'el servidor no acepta las credenciales de esta página',
  'rol-ocupado': 'el servidor aún tiene un canal abierto para este rol',
  'conflicto-senalizacion': 'el servidor rechazó la operación por un conflicto',
  'limite-senales': 'el servidor limitó las señales; espera un momento',
  'canal-tiempo-agotado': 'el servidor no respondió a tiempo',
  'canal-perdido': 'se perdió la señalización con el servidor',
  'canal-conectando': 'abriendo la señalización',
  'participante-ausente': 'el otro participante no está conectado',
  'participante-salio': 'el espectador salió',
  'participante-desconectado': 'el otro participante perdió la señalización',
  'sin-captura': 'cámara y micrófono sin activar',
  'captura-terminada': 'la captura terminó; hay que volver a activarla',
  'pista-silenciada': 'una pista está silenciada por el sistema o el navegador',
  'pista-remota-terminada': 'una pista recibida terminó',
  'esperando-negociacion': 'esperando la negociación WebRTC',
  'esperando-medios': 'conexión establecida; esperando medios',
  'transporte-conectando': 'estableciendo la conexión WebRTC',
  'transporte-desconectado': 'la conexión WebRTC está desconectada (puede recuperarse sola)',
  'transporte-fallido': 'la conexión WebRTC falló',
  'transporte-cerrado': 'la conexión WebRTC está cerrada',
  'recuperacion-no-confirmada': 'el último reintento no confirmó la recuperación',
  'reproduccion-requiere-gesto': 'el navegador requiere una acción para reproducir',
});

/**
 * @typedef {object} Componentes
 * @property {'emisor' | 'espectador' | null} rol
 * @property {'sin-sesion' | 'vigente' | 'finalizada' | 'inexistente' | 'no-autorizada'} sesion
 * @property {'sin-canal' | 'conectando' | 'conectada' | 'interrumpida' | 'error' | 'cerrada'} canal
 * @property {string | null} canalMotivo Categoría de `categoriaCanal` (senalizacion.js) o `null`.
 * @property {'presente' | 'ausente' | 'desconocido'} par
 * @property {'salida' | 'desconexion' | null} parMotivo
 * @property {'no-aplica' | 'sin-pistas' | 'activas' | 'silenciadas' | 'terminadas'} pistas Locales en el
 *   emisor y recibidas en el espectador.
 * @property {string} transporte `connectionState` de la conexión vigente, o `sin-conexion`.
 * @property {'no-aplica' | 'sin-flujo' | 'reproduciendo' | 'pausada' | 'requiere-gesto'} reproduccion
 * @property {'ninguna' | 'en-curso' | 'confirmada' | 'no-confirmada'} recuperacion
 */

/**
 * @param {string | null} categoria
 * @returns {string}
 */
function motivoCanal(categoria) {
  switch (categoria) {
    case 'sesion-inexistente':
    case 'no-autorizado':
    case 'rol-ocupado':
    case 'limite-senales':
      return categoria;
    case 'par-ausente':
      return 'participante-ausente';
    case 'conflicto':
      return 'conflicto-senalizacion';
    case 'tiempo-agotado':
      return 'canal-tiempo-agotado';
    default:
      return 'canal-perdido';
  }
}

/**
 * Deriva el estado de continuidad. Orden de prioridad: condición terminal o de sesión, recuperación en curso,
 * condiciones que no se resuelven sin una acción, señalización, presencia, captura y transporte.
 * Una salida voluntaria del espectador no es un fallo; una interrupción no es un cierre definitivo.
 * @param {Componentes} c
 * @returns {{ estado: string, motivo: string }}
 */
export function derivarContinuidad(c) {
  if (c.sesion === 'finalizada') return { estado: 'finalizada', motivo: 'sesion-finalizada' };
  if (c.rol === null || c.sesion === 'sin-sesion') return { estado: 'sin-sesion', motivo: 'sin-sesion' };
  if (c.recuperacion === 'en-curso') return { estado: 'recuperacion-en-curso', motivo: 'en-curso' };
  if (c.sesion === 'inexistente') return { estado: 'requiere-intervencion', motivo: 'sesion-inexistente' };
  if (c.sesion === 'no-autorizada') return { estado: 'requiere-intervencion', motivo: 'no-autorizado' };
  // Sin reintentos automáticos de la señalización: un canal perdido no vuelve solo.
  if (c.canal === 'error' || c.canal === 'interrumpida' || c.canal === 'cerrada') {
    return { estado: 'requiere-intervencion', motivo: motivoCanal(c.canalMotivo) };
  }
  if (c.rol === 'emisor' && c.pistas === 'terminadas') return { estado: 'requiere-intervencion', motivo: 'captura-terminada' };
  if (c.transporte === 'failed') return { estado: 'requiere-intervencion', motivo: 'transporte-fallido' };
  if (c.canal === 'conectando' || c.canal === 'sin-canal') return { estado: 'conectando', motivo: 'canal-conectando' };
  if (c.par === 'ausente') {
    if (c.parMotivo === 'desconexion') return { estado: 'interrupcion-detectada', motivo: 'participante-desconectado' };
    return { estado: 'esperando-participante', motivo: c.parMotivo === 'salida' ? 'participante-salio' : 'participante-ausente' };
  }
  if (c.par !== 'presente') return { estado: 'conectando', motivo: 'canal-conectando' };
  if (c.rol === 'emisor' && c.pistas === 'sin-pistas') return { estado: 'conectando', motivo: 'sin-captura' };
  if (c.transporte === 'closed') return { estado: 'requiere-intervencion', motivo: 'transporte-cerrado' };
  if (c.transporte === 'disconnected') return { estado: 'interrupcion-detectada', motivo: 'transporte-desconectado' };
  if (c.transporte === 'sin-conexion') return { estado: 'conectando', motivo: 'esperando-negociacion' };
  if (c.transporte !== 'connected') return { estado: 'conectando', motivo: 'transporte-conectando' };
  if (c.pistas === 'silenciadas') return { estado: 'interrupcion-detectada', motivo: 'pista-silenciada' };
  if (c.rol === 'espectador' && c.pistas === 'terminadas') {
    return { estado: 'interrupcion-detectada', motivo: 'pista-remota-terminada' };
  }
  if (c.rol === 'espectador' && c.pistas === 'sin-pistas') return { estado: 'conectando', motivo: 'esperando-medios' };
  if (c.recuperacion === 'no-confirmada') return { estado: 'conectada', motivo: 'recuperacion-no-confirmada' };
  if (c.recuperacion === 'confirmada') return { estado: 'recuperacion-confirmada', motivo: 'ninguno' };
  if (c.rol === 'espectador' && c.reproduccion === 'requiere-gesto') {
    return { estado: 'conectada', motivo: 'reproduccion-requiere-gesto' };
  }
  return { estado: 'conectada', motivo: 'ninguno' };
}

/**
 * Resume el estado de un conjunto de pistas.
 * @param {{ readyState?: string, muted?: boolean }[]} pistas
 * @returns {'sin-pistas' | 'activas' | 'silenciadas' | 'terminadas'}
 */
export function estadoPistas(pistas) {
  if (pistas.length === 0) return 'sin-pistas';
  if (pistas.some((p) => p.readyState === 'ended')) return 'terminadas';
  if (pistas.some((p) => p.muted === true)) return 'silenciadas';
  return 'activas';
}

/**
 * @param {Record<string, number | null> | null | undefined} grupo
 * @param {string} campo
 */
function valor(grupo, campo) {
  const v = grupo?.[campo];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Compara dos lecturas de estadísticas agregadas (`agregarEstadisticas` de medios.js) tomadas de la MISMA
 * conexión. El emisor solo puede confirmar que envía audio y video (bytes enviados de cada medio). El
 * espectador, que recibe audio y video (bytes y paquetes de audio, bytes de video) y que se decodifican
 * fotogramas de video; la decodificación del audio no se mide. Ninguno de los dos confirma que una persona
 * vea y oiga bien: eso es una observación física. Además, este resultado solo vale si la conexión siguió
 * conectada y sin interrupciones entre las lecturas, lo que comprueba quien llama (app.js).
 * - `envio-confirmado` / `recepcion-confirmada`: todos los contadores requeridos crecieron.
 * - `parcial`: crecieron algunos.
 * - `sin-progreso`: ninguno creció.
 * - `no-verificable`: faltan contadores necesarios, o alguno decreció (lecturas no comparables, E03-R01-03);
 *   no se inventa un resultado.
 * @param {'emisor' | 'espectador'} rol
 * @param {{ video: Record<string, number | null>, audio: Record<string, number | null> } | null} antes
 * @param {{ video: Record<string, number | null>, audio: Record<string, number | null> } | null} despues
 * @returns {'envio-confirmado' | 'recepcion-confirmada' | 'parcial' | 'sin-progreso' | 'no-verificable'}
 */
export function evaluarProgreso(rol, antes, despues) {
  if (!antes || !despues) return 'no-verificable';
  /** @type {[string, string][]} */
  const requeridos =
    rol === 'emisor'
      ? [
          ['video', 'bytesEnviados'],
          ['audio', 'bytesEnviados'],
        ]
      : [
          ['video', 'bytesRecibidos'],
          ['video', 'fotogramasDecodificados'],
          ['audio', 'bytesRecibidos'],
          ['audio', 'paquetesRecibidos'],
        ];
  let crecieron = 0;
  for (const [medio, campo] of requeridos) {
    const a = valor(/** @type {any} */ (antes)[medio], campo);
    const d = valor(/** @type {any} */ (despues)[medio], campo);
    if (a === null || d === null || d < a) return 'no-verificable';
    if (d > a) crecieron += 1;
  }
  if (crecieron === requeridos.length) return rol === 'emisor' ? 'envio-confirmado' : 'recepcion-confirmada';
  return crecieron > 0 ? 'parcial' : 'sin-progreso';
}

/** Mayor identificador de negociación (igual que `LIMITES.negociacionMax` del servidor). */
export const MAX_NEGOCIACION = 2 ** 31 - 1;

/**
 * Identificador de la negociación siguiente del emisor (E03-R01-01). Crece de uno en uno dentro de la página y
 * **no da la vuelta**: al llegar al máximo devuelve `null` y no se crean más negociaciones en esa página, para
 * que ninguna comparación de orden sea incorrecta.
 * @param {number} actual Último identificador usado (0 si ninguno).
 * @returns {number | null}
 */
export function siguienteNegociacion(actual) {
  if (!Number.isInteger(actual) || actual < 0 || actual >= MAX_NEGOCIACION) return null;
  return actual + 1;
}

/**
 * Decide si el espectador acepta una oferta (E03-R01-01). Las ofertas de una sesión llevan identificadores
 * crecientes del mismo emisor:
 * - con identificador mayor que el último aceptado: `aceptar`;
 * - igual: `duplicada`; menor: `obsoleta`. Ninguna de las dos toca la conexión vigente;
 * - sin identificador: solo se acepta mientras no se haya aceptado ninguna oferta correlacionada en la página
 *   (compatibilidad con el contrato de E01/E02); después es `sin-identificador` y se descarta.
 * @param {{ ultima: number | null }} vigente `ultima`: identificador de la última oferta aceptada, o `null`.
 * @param {unknown} neg Identificador recibido.
 * @returns {'aceptar' | 'duplicada' | 'obsoleta' | 'sin-identificador'}
 */
export function ofertaAceptable(vigente, neg) {
  const valido = typeof neg === 'number' && Number.isInteger(neg) && neg >= 1 && neg <= MAX_NEGOCIACION;
  if (!valido) return vigente.ultima === null ? 'aceptar' : 'sin-identificador';
  if (vigente.ultima === null) return 'aceptar';
  if (neg === vigente.ultima) return 'duplicada';
  return neg > vigente.ultima ? 'aceptar' : 'obsoleta';
}
