// @ts-check
// Servidor local del experimento: archivos estáticos y señalización mínima (SSE para recibir, POST para enviar).
import http from 'node:http';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AlmacenSesiones, rolContrario } from './sesiones.js';
import { LIMITES, PATRON_ID_SESION, PATRON_TOKEN, validarSenal } from './validacion.js';

/** @typedef {import('./validacion.js').Rol} Rol */
/** @typedef {import('./sesiones.js').Sesion} Sesion */
/** @typedef {import('./sesiones.js').Canal} Canal */

/**
 * @typedef {object} OpcionesServidor
 * @property {import('./sesiones.js').OpcionesAlmacen} [sesiones]
 * @property {number} [barridoMs] Intervalo de limpieza de sesiones.
 * @property {number} [latidoMs] Intervalo de comentarios de mantenimiento en los flujos SSE.
 * @property {{ cert: Buffer | string, key: Buffer | string }} [tls]
 */

const DIR_PUBLICO = fileURLToPath(new URL('../public/', import.meta.url));

/** @type {Record<string, [string, string]>} */
const ARCHIVOS_PUBLICOS = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/medios.js': ['medios.js', 'text/javascript; charset=utf-8'],
  '/senalizacion.js': ['senalizacion.js', 'text/javascript; charset=utf-8'],
  '/estilos.css': ['estilos.css', 'text/css; charset=utf-8'],
};

export const CABECERAS_SEGURIDAD = Object.freeze({
  'Content-Security-Policy':
    "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; media-src 'self' blob:; " +
    "connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(self), microphone=(self)',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cache-Control': 'no-store',
});

/** @returns {Map<string, { cuerpo: Buffer, tipo: string }>} */
function cargarEstaticos() {
  const mapa = new Map();
  for (const [ruta, [archivo, tipo]] of Object.entries(ARCHIVOS_PUBLICOS)) {
    mapa.set(ruta, { cuerpo: readFileSync(DIR_PUBLICO + archivo), tipo });
  }
  return mapa;
}

/**
 * @param {http.ServerResponse} res
 * @param {number} estado
 * @param {unknown} cuerpo
 * @param {Record<string, string>} [extra]
 */
function responderJson(res, estado, cuerpo, extra = {}) {
  if (res.headersSent) {
    res.end();
    return;
  }
  const texto = JSON.stringify(cuerpo);
  res.writeHead(estado, {
    ...CABECERAS_SEGURIDAD,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(texto),
    ...extra,
  });
  res.end(texto);
}

/**
 * Lee el cuerpo sin superar el límite. Si lo supera, deja de acumular y lo descarta.
 * @param {http.IncomingMessage} req
 * @param {number} max
 * @returns {Promise<{ ok: true, texto: string } | { ok: false }>}
 */
function leerCuerpo(req, max) {
  return new Promise((resolve, reject) => {
    /** @type {Buffer[]} */
    const partes = [];
    let total = 0;
    let excedido = false;
    req.on('data', (/** @type {Buffer} */ parte) => {
      if (excedido) return;
      total += parte.length;
      if (total > max) {
        excedido = true;
        partes.length = 0;
        resolve({ ok: false });
        return;
      }
      partes.push(parte);
    });
    req.on('end', () => {
      if (!excedido) resolve({ ok: true, texto: Buffer.concat(partes).toString('utf8') });
    });
    req.on('error', reject);
  });
}

/** @param {http.IncomingMessage} req */
function tokenDe(req) {
  const cabecera = req.headers.authorization;
  if (typeof cabecera !== 'string' || !cabecera.startsWith('Bearer ')) return null;
  const token = cabecera.slice('Bearer '.length).trim();
  return PATRON_TOKEN.test(token) ? token : null;
}

/**
 * @param {http.ServerResponse} res
 * @param {number} latidoMs
 * @returns {Canal & { detener: () => void }}
 */
function crearCanalSse(res, latidoMs) {
  const latido = setInterval(() => {
    if (!res.writableEnded) res.write(': latido\n\n');
  }, latidoMs);
  latido.unref();
  return {
    enviar(evento, datos) {
      if (!res.writableEnded) res.write(`event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`);
    },
    cerrar() {
      clearInterval(latido);
      if (!res.writableEnded) res.end();
    },
    detener() {
      clearInterval(latido);
    },
  };
}

/**
 * Crea el servidor del experimento. No escucha hasta llamar a `escuchar`.
 * @param {OpcionesServidor} [opciones]
 */
export function crearServidor(opciones = {}) {
  const almacen = new AlmacenSesiones(opciones.sesiones);
  const estaticos = cargarEstaticos();
  const latidoMs = opciones.latidoMs ?? 15_000;

  /**
   * Autentica la petición contra una sesión. Si falla, responde y devuelve `null`.
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {string} id
   * @returns {{ sesion: Sesion, rol: Rol } | null}
   */
  function autenticar(req, res, id) {
    if (!PATRON_ID_SESION.test(id)) {
      responderJson(res, 404, { error: 'sesion-inexistente' });
      return null;
    }
    const token = tokenDe(req);
    if (!token) {
      responderJson(res, 401, { error: 'token-requerido' });
      return null;
    }
    const sesion = almacen.obtener(id);
    if (!sesion) {
      responderJson(res, 404, { error: 'sesion-inexistente' });
      return null;
    }
    const rol = almacen.rolPorToken(sesion, token);
    if (!rol) {
      responderJson(res, 403, { error: 'token-no-valido-para-la-sesion' });
      return null;
    }
    return { sesion, rol };
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {string} id
   */
  function abrirEventos(req, res, id) {
    const acceso = autenticar(req, res, id);
    if (!acceso) return;
    const { sesion, rol } = acceso;
    if (sesion.canales[rol]) {
      responderJson(res, 409, { error: 'rol-ya-conectado' });
      return;
    }
    res.writeHead(200, {
      ...CABECERAS_SEGURIDAD,
      'Content-Type': 'text/event-stream; charset=utf-8',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(': conectado\n\n');
    const canal = crearCanalSse(res, latidoMs);
    almacen.conectar(sesion, rol, canal);
    const otro = sesion.canales[rolContrario(rol)];
    canal.enviar('bienvenida', { rol, sesion: sesion.id, parPresente: Boolean(otro), expiraEn: sesion.expiraEn });
    otro?.enviar('par', { presente: true });

    req.on('close', () => {
      canal.detener();
      if (almacen.desconectar(sesion, rol, canal)) {
        sesion.canales[rolContrario(rol)]?.enviar('par', { presente: false });
      }
    });
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {string} id
   */
  async function recibirSenal(req, res, id) {
    const acceso = autenticar(req, res, id);
    if (!acceso) return;
    const { sesion, rol } = acceso;

    const tipoContenido = req.headers['content-type'] ?? '';
    if (!tipoContenido.toLowerCase().startsWith('application/json')) {
      responderJson(res, 415, { error: 'se-espera-json' });
      return;
    }
    const declarado = Number(req.headers['content-length'] ?? 0);
    if (declarado > LIMITES.cuerpoMaxBytes) {
      responderJson(res, 413, { error: 'mensaje-demasiado-grande' }, { Connection: 'close' });
      return;
    }
    const cuerpo = await leerCuerpo(req, LIMITES.cuerpoMaxBytes);
    if (!cuerpo.ok) {
      responderJson(res, 413, { error: 'mensaje-demasiado-grande' }, { Connection: 'close' });
      return;
    }
    /** @type {unknown} */
    let valor;
    try {
      valor = JSON.parse(cuerpo.texto);
    } catch {
      responderJson(res, 400, { error: 'json-invalido' });
      return;
    }
    const resultado = validarSenal(rol, valor);
    if (!resultado.ok) {
      responderJson(res, resultado.estado, { error: resultado.error });
      return;
    }
    if (!almacen.registrarSenal(sesion)) {
      responderJson(res, 429, { error: 'demasiadas-senales' });
      return;
    }

    const senal = resultado.senal;
    if (senal.tipo === 'fin') {
      almacen.eliminar(sesion.id, 'finalizada-por-el-emisor');
      responderJson(res, 200, { ok: true });
      return;
    }
    if (senal.tipo === 'salir') {
      const canal = sesion.canales.espectador;
      if (canal && almacen.desconectar(sesion, 'espectador', canal)) {
        canal.enviar('fin', { motivo: 'salida-del-espectador' });
        canal.cerrar();
        sesion.canales.emisor?.enviar('par', { presente: false });
      }
      responderJson(res, 200, { ok: true });
      return;
    }
    const destino = sesion.canales[rolContrario(rol)];
    if (!destino) {
      responderJson(res, 409, { error: 'par-ausente' });
      return;
    }
    destino.enviar('senal', senal);
    responderJson(res, 200, { ok: true });
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async function atender(req, res) {
    const ruta = new URL(req.url ?? '/', 'http://localhost').pathname;
    const metodo = req.method ?? 'GET';

    if (ruta === '/api/sesiones') {
      if (metodo !== 'POST') return responderJson(res, 405, { error: 'metodo-no-permitido' }, { Allow: 'POST' });
      const creada = almacen.crear();
      if (!creada) return responderJson(res, 503, { error: 'limite-de-sesiones' });
      return responderJson(res, 201, creada);
    }

    const coincidencia = /^\/api\/sesiones\/([^/]+)\/(eventos|senales)$/.exec(ruta);
    if (coincidencia) {
      const [, id, recurso] = coincidencia;
      if (recurso === 'eventos') {
        if (metodo !== 'GET') return responderJson(res, 405, { error: 'metodo-no-permitido' }, { Allow: 'GET' });
        return abrirEventos(req, res, id);
      }
      if (metodo !== 'POST') return responderJson(res, 405, { error: 'metodo-no-permitido' }, { Allow: 'POST' });
      return recibirSenal(req, res, id);
    }

    if (ruta.startsWith('/api/')) return responderJson(res, 404, { error: 'ruta-inexistente' });

    const estatico = estaticos.get(ruta);
    if (!estatico) return responderJson(res, 404, { error: 'ruta-inexistente' });
    if (metodo !== 'GET' && metodo !== 'HEAD') {
      return responderJson(res, 405, { error: 'metodo-no-permitido' }, { Allow: 'GET, HEAD' });
    }
    res.writeHead(200, {
      ...CABECERAS_SEGURIDAD,
      'Content-Type': estatico.tipo,
      'Content-Length': estatico.cuerpo.length,
    });
    res.end(metodo === 'HEAD' ? undefined : estatico.cuerpo);
  }

  /** @type {http.RequestListener} */
  const manejador = (req, res) => {
    atender(req, res).catch(() => responderJson(res, 500, { error: 'error-interno' }));
  };
  const servidor = opciones.tls
    ? https.createServer({ cert: opciones.tls.cert, key: opciones.tls.key }, manejador)
    : http.createServer(manejador);

  const barrido = setInterval(() => almacen.barrer(), opciones.barridoMs ?? 5_000);
  barrido.unref();

  return {
    servidor,
    almacen,
    /**
     * @param {number} puerto
     * @param {string} host
     * @returns {Promise<import('node:net').AddressInfo>}
     */
    escuchar(puerto, host) {
      return new Promise((resolve, reject) => {
        servidor.once('error', reject);
        servidor.listen(puerto, host, () => {
          servidor.off('error', reject);
          resolve(/** @type {import('node:net').AddressInfo} */ (servidor.address()));
        });
      });
    },
    /** @returns {Promise<void>} */
    cerrar() {
      clearInterval(barrido);
      almacen.cerrarTodas();
      return new Promise((resolve) => {
        servidor.close(() => resolve());
        servidor.closeAllConnections();
      });
    },
  };
}
