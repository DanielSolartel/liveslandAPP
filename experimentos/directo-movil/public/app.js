// @ts-check
// Interfaz del experimento: emitir, mirar y finalizar. WebRTC sin STUN/TURN (solo candidatos locales).
import { contarPistasActivas, liberarMedios, solicitarMedios } from './medios.js';
import { CanalSenalizacion, crearSesion } from './senalizacion.js';

/** @typedef {import('./senalizacion.js').EventoSse} EventoSse */
/** @typedef {import('./senalizacion.js').EstadoCanal} EstadoCanal */

/**
 * @template {HTMLElement} T
 * @param {string} id
 * @param {{ new (): T, prototype: T }} tipo
 * @returns {T}
 */
function el(id, tipo) {
  const elemento = document.getElementById(id);
  if (!(elemento instanceof tipo)) throw new Error(`Falta el elemento #${id}`);
  return elemento;
}

const ui = {
  vistas: {
    inicio: el('vista-inicio', HTMLElement),
    emisor: el('vista-emisor', HTMLElement),
    espectador: el('vista-espectador', HTMLElement),
    final: el('vista-final', HTMLElement),
  },
  btnCrear: el('btn-crear', HTMLButtonElement),
  btnCopiar: el('btn-copiar', HTMLButtonElement),
  btnActivar: el('btn-activar', HTMLButtonElement),
  btnFinalizar: el('btn-finalizar', HTMLButtonElement),
  btnReproducir: el('btn-reproducir', HTMLButtonElement),
  btnSalir: el('btn-salir', HTMLButtonElement),
  btnNueva: el('btn-nueva', HTMLButtonElement),
  enlace: el('enlace-espectador', HTMLInputElement),
  videoLocal: el('video-local', HTMLVideoElement),
  videoRemoto: el('video-remoto', HTMLVideoElement),
  textoFinal: el('texto-final', HTMLElement),
  error: el('mensaje-error', HTMLElement),
  estado: {
    rol: el('estado-rol', HTMLElement),
    senal: el('estado-senal', HTMLElement),
    conexion: el('estado-conexion', HTMLElement),
    ice: el('estado-ice', HTMLElement),
    medios: el('estado-medios', HTMLElement),
  },
};

/** Sin servidores STUN/TURN: el experimento no depende de servicios externos. */
const CONFIG_RTC = /** @type {RTCConfiguration} */ ({ iceServers: [] });

const PATRON_SESION = /^[A-Za-z0-9_-]{22}$/;
const PATRON_TOKEN = /^[A-Za-z0-9_-]{43}$/;

/** @type {Record<string, string>} */
const MOTIVOS_FIN = {
  'finalizada-por-el-emisor': 'El emisor finalizó la emisión.',
  'salida-del-espectador': 'Has salido de la sesión.',
  expirada: 'La sesión de prueba caducó.',
  abandonada: 'La sesión se cerró por inactividad.',
  'servidor-detenido': 'El servidor local se detuvo.',
};

const estado = {
  /** @type {'emisor' | 'espectador' | null} */
  rol: null,
  /** @type {CanalSenalizacion | null} */
  canal: null,
  /** @type {RTCPeerConnection | null} */
  pc: null,
  /** @type {MediaStream | null} */
  streamLocal: null,
  /** @type {MediaStream | null} */
  streamRemoto: null,
  parPresente: false,
  terminado: false,
  /**
   * Identidad de la sesión en curso. Cambia al terminar una sesión y al empezar otra: las operaciones
   * pendientes de una generación anterior se descartan al resolverse.
   */
  generacion: 0,
  /** Último intento de captura; solo se acepta el resultado del último intento de la generación vigente. */
  intentoCaptura: 0,
  /** Capturas que llegaron para una sesión o un intento ya cerrados y se detuvieron al recibirse. */
  capturasDescartadas: 0,
  /** Resultado del aviso de fin o de salida enviado al servidor. */
  /** @type {'sin-aviso' | 'pendiente' | 'confirmado' | 'sin-confirmar'} */
  avisoCierre: 'sin-aviso',
  /** @type {RTCIceCandidateInit[]} */
  candidatosPendientes: [],
  /** Todos los flujos capturados en esta página, también los descartados, para comprobar que no quedan pistas. */
  /** @type {MediaStream[]} */
  historialLocal: [],
};

/** @param {keyof typeof ui.vistas} nombre */
function mostrar(nombre) {
  for (const [clave, vista] of Object.entries(ui.vistas)) vista.hidden = clave !== nombre;
}

/**
 * @param {keyof typeof ui.estado} campo
 * @param {string} texto
 */
function fijar(campo, texto) {
  ui.estado[campo].textContent = texto;
}

/** @param {string} mensaje */
function mostrarError(mensaje) {
  ui.error.textContent = mensaje;
  ui.error.hidden = false;
}

function limpiarError() {
  ui.error.textContent = '';
  ui.error.hidden = true;
}

/** @param {{ estadoHttp?: number, error?: string } | undefined} detalle */
function textoErrorCanal(detalle) {
  switch (detalle?.estadoHttp) {
    case 401:
    case 403:
      return 'El enlace no es válido para esta sesión.';
    case 404:
      return 'La sesión no existe o ya terminó.';
    case 409:
      return 'Ya hay otro participante conectado con este rol.';
    default:
      return 'Se perdió la conexión con el servidor local de señalización.';
  }
}

/**
 * @param {string} sesion
 * @param {string} token
 */
function abrirCanal(sesion, token) {
  // Cola propia de este canal: procesa sus eventos de uno en uno. Un evento cuyo canal ya no es el de la
  // sesión en curso se descarta, y una tarea que espera a la red no retiene los eventos de otra sesión.
  /** @type {Promise<void>} */
  let cola = Promise.resolve();
  const canal = new CanalSenalizacion({
    sesion,
    token,
    alEvento: (e) => {
      cola = cola
        .then(() => (estado.canal === canal ? manejarEvento(e) : undefined))
        .catch((error) => {
          if (estado.canal !== canal) return;
          mostrarError(`Error al procesar la señalización: ${error instanceof Error ? error.message : String(error)}`);
        });
    },
    alEstado: (e, detalle) => manejarEstadoCanal(canal, e, detalle),
  });
  estado.canal = canal;
  void canal.abrir();
}

/**
 * @param {CanalSenalizacion} canal
 * @param {EstadoCanal} e
 * @param {{ estadoHttp?: number, error?: string }} [detalle]
 */
function manejarEstadoCanal(canal, e, detalle) {
  if (estado.canal !== canal) return;
  fijar('senal', e);
  if (e === 'error' && !estado.terminado) {
    mostrarError(textoErrorCanal(detalle));
    cerrarPeer();
  }
}

/** @param {EventoSse} e */
async function manejarEvento({ evento, datos }) {
  const d = /** @type {Record<string, any>} */ (datos ?? {});
  if (evento === 'bienvenida') {
    estado.parPresente = Boolean(d.parPresente);
    if (estado.rol === 'emisor') {
      fijar('conexion', estado.parPresente ? 'espectador presente' : 'esperando espectador');
      if (estado.parPresente && estado.streamLocal) await iniciarOferta();
    } else {
      fijar('conexion', estado.parPresente ? 'esperando oferta del emisor' : 'esperando al emisor');
    }
  } else if (evento === 'par') {
    estado.parPresente = Boolean(d.presente);
    if (estado.parPresente) {
      if (estado.rol === 'emisor') {
        fijar('conexion', 'espectador presente');
        if (estado.streamLocal) await iniciarOferta();
      } else {
        fijar('conexion', 'esperando oferta del emisor');
      }
    } else {
      cerrarPeer();
      fijar('conexion', estado.rol === 'emisor' ? 'esperando espectador' : 'el emisor se desconectó');
    }
  } else if (evento === 'senal') {
    await manejarSenal(d);
  } else if (evento === 'fin') {
    const motivo = String(d.motivo);
    terminar(
      estado.rol === 'emisor' && motivo === 'finalizada-por-el-emisor'
        ? 'Emisión finalizada.'
        : (MOTIVOS_FIN[motivo] ?? 'La sesión terminó.'),
    );
  }
}

function crearPeer() {
  const pc = new RTCPeerConnection(CONFIG_RTC);
  estado.pc = pc;
  estado.candidatosPendientes = [];
  pc.onicecandidate = (e) => {
    if (!e.candidate || estado.pc !== pc || !estado.canal) return;
    const c = e.candidate.toJSON();
    void estado.canal.enviar({
      tipo: 'candidato',
      candidato: {
        candidate: c.candidate ?? '',
        sdpMid: c.sdpMid ?? null,
        sdpMLineIndex: c.sdpMLineIndex ?? null,
        usernameFragment: c.usernameFragment ?? null,
      },
    });
  };
  pc.onconnectionstatechange = () => {
    if (estado.pc !== pc) return;
    fijar('conexion', pc.connectionState);
    if (pc.connectionState === 'failed') {
      mostrarError(
        'La conexión WebRTC falló. Sin STUN/TURN solo funciona en el mismo equipo o en una red local sin aislamiento.',
      );
    }
  };
  pc.oniceconnectionstatechange = () => {
    if (estado.pc === pc) fijar('ice', pc.iceConnectionState);
  };
  if (estado.rol === 'espectador') pc.ontrack = recibirPista;
  fijar('conexion', pc.connectionState);
  fijar('ice', pc.iceConnectionState);
  return pc;
}

function cerrarPeer() {
  const pc = estado.pc;
  estado.pc = null;
  estado.candidatosPendientes = [];
  if (pc) {
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onconnectionstatechange = null;
    pc.oniceconnectionstatechange = null;
    pc.close();
    fijar('conexion', 'cerrada');
    fijar('ice', '—');
  }
  if (estado.streamRemoto) {
    for (const pista of estado.streamRemoto.getTracks()) pista.stop();
    estado.streamRemoto = null;
  }
  ui.videoRemoto.srcObject = null;
}

/** @param {RTCPeerConnection} pc */
async function aplicarCandidatosPendientes(pc) {
  const pendientes = estado.candidatosPendientes;
  estado.candidatosPendientes = [];
  for (const candidato of pendientes) await pc.addIceCandidate(candidato).catch(() => {});
}

/** @param {Record<string, any>} senal */
async function manejarSenal(senal) {
  const canal = estado.canal;
  if (senal.tipo === 'oferta' && estado.rol === 'espectador' && canal) {
    cerrarPeer();
    const pc = crearPeer();
    // Si la conexión se cierra o se sustituye durante una espera, la tarea termina sin tocar la sesión en curso.
    const vigente = () => estado.pc === pc && estado.canal === canal;
    await pc.setRemoteDescription({ type: 'offer', sdp: senal.sdp });
    if (!vigente()) return;
    await aplicarCandidatosPendientes(pc);
    if (!vigente()) return;
    const respuesta = await pc.createAnswer();
    if (!vigente()) return;
    await pc.setLocalDescription(respuesta);
    if (!vigente()) return;
    const r = await canal.enviar({ tipo: 'respuesta', sdp: pc.localDescription?.sdp });
    if (!r.ok && vigente()) mostrarError(`No se pudo enviar la respuesta (${r.error ?? r.estadoHttp}).`);
  } else if (senal.tipo === 'respuesta' && estado.rol === 'emisor' && estado.pc) {
    const pc = estado.pc;
    await pc.setRemoteDescription({ type: 'answer', sdp: senal.sdp });
    if (estado.pc === pc) await aplicarCandidatosPendientes(pc);
  } else if (senal.tipo === 'candidato' && estado.pc) {
    if (estado.pc.remoteDescription) await estado.pc.addIceCandidate(senal.candidato).catch(() => {});
    else estado.candidatosPendientes.push(senal.candidato);
  }
}

// ---------- Emisor ----------

async function crearSesionEmisor() {
  limpiarError();
  ui.btnCrear.disabled = true;
  const r = await crearSesion();
  ui.btnCrear.disabled = false;
  if (!r.ok) {
    mostrarError(
      r.estadoHttp === 503
        ? 'Se alcanzó el máximo de sesiones de prueba. Espera a que caduquen o reinicia el servidor.'
        : 'No se pudo crear la sesión en el servidor local.',
    );
    return;
  }
  estado.rol = 'emisor';
  estado.terminado = false;
  ui.enlace.value = `${location.origin}/?s=${encodeURIComponent(r.sesion)}#${r.tokenEspectador}`;
  ui.btnActivar.disabled = false;
  fijar('rol', 'emisor');
  fijar('medios', 'cámara y micrófono sin activar');
  mostrar('emisor');
  abrirCanal(r.sesion, r.tokenEmisor);
}

async function activarMedios() {
  // La captura queda ligada a la sesión y al intento en que se pidió. Si al resolverse ya no son los
  // vigentes (la sesión terminó o empezó otra), el flujo se detiene y la interfaz no cambia.
  const generacion = estado.generacion;
  const intento = ++estado.intentoCaptura;
  const vigente = () => estado.generacion === generacion && estado.intentoCaptura === intento;
  limpiarError();
  ui.btnActivar.disabled = true;
  fijar('medios', 'solicitando permiso…');
  const r = await solicitarMedios({ isSecureContext: window.isSecureContext, mediaDevices: navigator.mediaDevices });
  if (!vigente()) {
    if (r.ok) {
      estado.historialLocal.push(r.stream);
      liberarMedios(r.stream);
      estado.capturasDescartadas += 1;
    }
    return;
  }
  if (!r.ok) {
    ui.btnActivar.disabled = false;
    fijar('medios', `sin captura (${r.codigo})`);
    mostrarError(r.mensaje);
    return;
  }
  estado.streamLocal = r.stream;
  estado.historialLocal.push(r.stream);
  ui.videoLocal.muted = true;
  ui.videoLocal.srcObject = r.stream;
  void ui.videoLocal.play().catch(() => {});
  fijar('medios', 'cámara y micrófono activos (vista previa silenciada)');
  if (estado.parPresente) await iniciarOferta();
}

async function iniciarOferta() {
  const stream = estado.streamLocal;
  const canal = estado.canal;
  if (!stream || !canal) return;
  cerrarPeer();
  const pc = crearPeer();
  const vigente = () => estado.pc === pc && estado.canal === canal;
  for (const pista of stream.getTracks()) pc.addTrack(pista, stream);
  const oferta = await pc.createOffer();
  if (!vigente()) return;
  await pc.setLocalDescription(oferta);
  if (!vigente()) return;
  const r = await canal.enviar({ tipo: 'oferta', sdp: pc.localDescription?.sdp });
  if (!r.ok && vigente()) mostrarError(`No se pudo enviar la oferta (${r.error ?? r.estadoHttp}).`);
}

function finalizarEmision() {
  if (estado.rol !== 'emisor' || estado.terminado) return;
  ui.btnFinalizar.disabled = true;
  // El cierre local no espera a la red: se lanza el aviso y se liberan los medios en el acto.
  const aviso = estado.canal?.enviar({ tipo: 'fin' });
  terminar('Emisión finalizada.');
  if (aviso) void seguirAvisoCierre(aviso, 'fin');
}

function nuevaSesion() {
  estado.generacion += 1;
  limpiarError();
  estado.rol = null;
  estado.terminado = false;
  estado.parPresente = false;
  estado.avisoCierre = 'sin-aviso';
  ui.enlace.value = '';
  ui.btnFinalizar.disabled = false;
  ui.btnActivar.disabled = false;
  for (const campo of /** @type {(keyof typeof ui.estado)[]} */ (Object.keys(ui.estado))) fijar(campo, '—');
  history.replaceState(null, '', '/');
  mostrar('inicio');
}

// ---------- Espectador ----------

/**
 * @param {string} sesion
 * @param {string} token
 */
function iniciarEspectador(sesion, token) {
  estado.rol = 'espectador';
  fijar('rol', 'espectador');
  mostrar('espectador');
  if (!PATRON_SESION.test(sesion) || !PATRON_TOKEN.test(token)) {
    fijar('senal', 'no iniciada');
    mostrarError('El enlace del espectador está incompleto o no es válido.');
    return;
  }
  fijar('medios', 'esperando medios del emisor');
  abrirCanal(sesion, token);
}

/** @param {RTCTrackEvent} e */
function recibirPista(e) {
  const stream = e.streams[0] ?? estado.streamRemoto ?? new MediaStream();
  if (!e.streams[0]) stream.addTrack(e.track);
  estado.streamRemoto = stream;
  if (ui.videoRemoto.srcObject !== stream) ui.videoRemoto.srcObject = stream;
  fijar('medios', `recibiendo: ${stream.getTracks().map((p) => p.kind).join(' + ')}`);
  void intentarReproducir();
}

async function intentarReproducir() {
  try {
    await ui.videoRemoto.play();
    ui.btnReproducir.hidden = true;
    fijar('medios', 'reproduciendo audio y video del emisor');
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      ui.btnReproducir.hidden = false;
      fijar('medios', 'el navegador requiere una acción para reproducir');
    }
  }
}

function salirEspectador() {
  if (estado.rol !== 'espectador' || estado.terminado) return;
  ui.btnSalir.disabled = true;
  const aviso = estado.canal?.enviar({ tipo: 'salir' });
  terminar('Has salido de la sesión.');
  if (aviso) void seguirAvisoCierre(aviso, 'salir');
}

// ---------- Fin y limpieza ----------

/**
 * Muestra el resultado del aviso de fin o de salida, enviado con el límite de `CanalSenalizacion.enviar`.
 * Una respuesta que llega cuando ya empezó otra sesión se ignora.
 * @param {Promise<{ ok: boolean, estadoHttp: number, error?: string }>} aviso
 * @param {'fin' | 'salir'} tipo
 */
async function seguirAvisoCierre(aviso, tipo) {
  const generacion = estado.generacion;
  estado.avisoCierre = 'pendiente';
  fijar('senal', 'cerrada; avisando al servidor…');
  const r = await aviso;
  if (estado.generacion !== generacion) return;
  if (r.ok) {
    estado.avisoCierre = 'confirmado';
    fijar('senal', tipo === 'fin' ? 'cerrada; el servidor eliminó la sesión' : 'cerrada; el servidor registró la salida');
    return;
  }
  const motivo = r.error ?? `HTTP ${r.estadoHttp}`;
  estado.avisoCierre = 'sin-confirmar';
  fijar('senal', `cerrada; aviso sin confirmar (${motivo})`);
  mostrarError(
    tipo === 'fin'
      ? `La captura ya está detenida en este dispositivo, pero el servidor no confirmó el fin de la sesión (${motivo}). ` +
          'Puede que el espectador no reciba el aviso; el servidor elimina la sesión cuando queda sin participantes o cuando caduca.'
      : `Has salido en este dispositivo, pero el servidor no confirmó la salida (${motivo}).`,
  );
}

/** @param {string} texto */
function terminar(texto) {
  if (estado.terminado) return;
  estado.terminado = true;
  // Invalida las capturas, negociaciones y avisos pendientes de esta sesión.
  estado.generacion += 1;
  cerrarPeer();
  const detenidas = liberarMedios(estado.streamLocal);
  estado.streamLocal = null;
  ui.videoLocal.srcObject = null;
  const canal = estado.canal;
  estado.canal = null;
  canal?.cerrar();
  estado.parPresente = false;
  ui.btnReproducir.hidden = true;
  fijar('senal', 'cerrada');
  fijar('conexion', 'cerrada');
  if (estado.rol === 'emisor') {
    fijar('medios', `captura liberada (pistas detenidas: ${detenidas})`);
  } else {
    fijar('medios', 'sin medios');
  }
  ui.textoFinal.textContent = texto;
  ui.btnNueva.hidden = estado.rol !== 'emisor';
  mostrar('final');
}

window.addEventListener('pagehide', () => {
  cerrarPeer();
  liberarMedios(estado.streamLocal);
  estado.canal?.cerrar();
});

// Diagnóstico para pruebas automatizadas y manuales: no expone tokens.
/** @type {any} */ (window).directoDiagnostico = async () => {
  const pc = estado.pc;
  const medidas = {
    video: { bytesRecibidos: 0, framesDecodificados: 0, bytesEnviados: 0 },
    audio: { bytesRecibidos: 0, paquetesRecibidos: 0, bytesEnviados: 0 },
  };
  if (pc) {
    const informe = await pc.getStats();
    informe.forEach((/** @type {any} */ r) => {
      const tipo = r.kind === 'video' ? 'video' : r.kind === 'audio' ? 'audio' : null;
      if (!tipo) return;
      if (r.type === 'inbound-rtp') {
        medidas[tipo].bytesRecibidos += r.bytesReceived ?? 0;
        if (tipo === 'video') medidas.video.framesDecodificados += r.framesDecoded ?? 0;
        if (tipo === 'audio') medidas.audio.paquetesRecibidos += r.packetsReceived ?? 0;
      } else if (r.type === 'outbound-rtp') {
        medidas[tipo].bytesEnviados += r.bytesSent ?? 0;
      }
    });
  }
  return {
    rol: estado.rol,
    terminado: estado.terminado,
    senal: ui.estado.senal.textContent,
    conexion: pc ? pc.connectionState : 'sin-conexion',
    flujosLocalesCreados: estado.historialLocal.length,
    pistasLocalesActivas: contarPistasActivas(estado.historialLocal),
    capturasDescartadas: estado.capturasDescartadas,
    avisoCierre: estado.avisoCierre,
    pistasRemotas: estado.streamRemoto ? estado.streamRemoto.getTracks().length : 0,
    videoRemoto: {
      ancho: ui.videoRemoto.videoWidth,
      alto: ui.videoRemoto.videoHeight,
      pausado: ui.videoRemoto.paused,
      tiempo: ui.videoRemoto.currentTime,
      silenciado: ui.videoRemoto.muted,
    },
    vistaPreviaSilenciada: ui.videoLocal.muted,
    medidas,
  };
};

ui.btnCrear.addEventListener('click', () => void crearSesionEmisor());
ui.btnActivar.addEventListener('click', () => void activarMedios());
ui.btnFinalizar.addEventListener('click', () => void finalizarEmision());
ui.btnNueva.addEventListener('click', nuevaSesion);
ui.btnSalir.addEventListener('click', () => void salirEspectador());
ui.btnReproducir.addEventListener('click', () => void intentarReproducir());
ui.btnCopiar.addEventListener('click', () => {
  ui.enlace.select();
  void navigator.clipboard?.writeText(ui.enlace.value).catch(() => {});
});

const sesionUrl = new URLSearchParams(location.search).get('s');
if (sesionUrl !== null) {
  iniciarEspectador(sesionUrl, location.hash.slice(1));
} else {
  mostrar('inicio');
}
