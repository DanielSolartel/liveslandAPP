// @ts-check
// Informe de diagnóstico (public/medios.js): lista permitida de campos, exclusión de datos sensibles con
// valores SEÑUELO, datos no disponibles y copia al portapapeles. Funciones puras, sin navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORIAS_ERROR,
  ESQUEMA_INFORME,
  agregarEstadisticas,
  construirInforme,
  copiarTexto,
  serializarInforme,
} from '../../public/medios.js';
import { SENUELOS } from './navegador-simulado.js';

const AHORA = new Date('2026-11-23T12:00:00.000Z');

/**
 * Rutas de claves del informe; los elementos de una lista se escriben `[]`.
 * @param {unknown} valor
 * @param {string} [prefijo]
 * @param {Set<string>} [salida]
 */
function rutas(valor, prefijo = '', salida = new Set()) {
  if (Array.isArray(valor)) {
    for (const v of valor) rutas(v, `${prefijo}[]`, salida);
  } else if (valor !== null && typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) {
      const ruta = prefijo === '' ? k : `${prefijo}.${k}`;
      salida.add(ruta);
      rutas(v, ruta, salida);
    }
  }
  return salida;
}

/** Datos brutos completos, con campos que el informe no admite mezclados a todos los niveles. */
function datosBrutos() {
  return {
    rol: 'emisor',
    terminado: false,
    canal: 'conectada',
    avisoCierre: 'sin-aviso',
    captura: 'activa',
    codigoCaptura: null,
    errores: ['captura-permiso-denegado', SENUELOS.error],
    vistaPreviaSilenciada: true,
    flujosLocalesCreados: 1,
    pistasLocalesActivas: 2,
    pistasRemotasActivas: 1,
    capturasDescartadas: 0,
    pistasLocales: [
      {
        tipo: 'video',
        estado: 'live',
        silenciada: false,
        id: SENUELOS.dispositivo,
        label: SENUELOS.etiqueta,
        ajustes: { width: 1280, height: 720, frameRate: 29.97, facingMode: 'user', deviceId: SENUELOS.dispositivo, groupId: SENUELOS.grupo },
      },
      {
        tipo: 'audio',
        estado: 'live',
        silenciada: false,
        ajustes: { sampleRate: 48000, channelCount: 2, deviceId: SENUELOS.dispositivo, groupId: SENUELOS.grupo, label: SENUELOS.etiqueta },
      },
    ],
    pistasRemotas: [{ tipo: 'video', estado: 'live', silenciada: false, id: SENUELOS.dispositivo }],
    conexionAbierta: true,
    conexion: 'connected',
    ice: 'connected',
    senalizacionRtc: 'stable',
    reproduccion: { estado: 'reproduciendo', ancho: 640, alto: 480, silenciado: false, url: 'http://127.0.0.1/?s=SENUELO#TOKEN' },
    estadisticas: {
      estado: 'ok',
      registros: [
        { type: 'inbound-rtp', kind: 'video', bytesReceived: 10, packetsReceived: 2, framesDecoded: 1, ssrc: 1 },
        { type: 'remote-candidate', ip: SENUELOS.ip, address: SENUELOS.ip, candidate: SENUELOS.candidato, networkType: SENUELOS.red },
        { type: 'certificate', fingerprint: SENUELOS.huella },
      ],
    },
    navegador: {
      agente: 'Mozilla/5.0 (Linux; Android 14; K) Chrome/158.0.0.0 Mobile Safari/537.36',
      plataforma: 'Linux armv81',
      plataformaDatos: 'Android',
      visibilidad: 'visible',
      contextoSeguro: true,
      ip: SENUELOS.ip,
      red: SENUELOS.red,
      apis: { getUserMedia: true, rtcPeerConnection: true, getStats: true, portapapeles: true, dispositivos: [SENUELOS.etiqueta] },
    },
    token: 'SENUELO-TOKEN',
    sesion: 'SENUELO-SESION',
    enlace: 'http://127.0.0.1:8787/?s=SENUELO-SESION#SENUELO-TOKEN',
    sdp: 'v=0\r\no=SENUELO',
  };
}

const CAMPOS_PERMITIDOS = [
  'esquema', 'generadoEn', 'rol',
  'navegador', 'navegador.familia', 'navegador.version', 'navegador.plataforma', 'navegador.visibilidad', 'navegador.contextoSeguro',
  'navegador.apis', 'navegador.apis.getUserMedia', 'navegador.apis.rtcPeerConnection', 'navegador.apis.getStats', 'navegador.apis.portapapeles',
  'sesion', 'sesion.canal', 'sesion.terminada',
  'captura', 'captura.estado', 'captura.ultimoError', 'captura.vistaPreviaSilenciada',
  'pistas', 'pistas.localesActivas', 'pistas.remotasActivas', 'pistas.flujosLocalesCreados',
  'pistas.locales', 'pistas.locales[].tipo', 'pistas.locales[].estado', 'pistas.locales[].silenciada', 'pistas.locales[].ajustes',
  'pistas.locales[].ajustes.ancho', 'pistas.locales[].ajustes.alto', 'pistas.locales[].ajustes.fotogramasPorSegundo',
  'pistas.locales[].ajustes.orientacionCamara', 'pistas.locales[].ajustes.frecuenciaMuestreo', 'pistas.locales[].ajustes.canales',
  'pistas.remotas', 'pistas.remotas[].tipo', 'pistas.remotas[].estado', 'pistas.remotas[].silenciada',
  'reproduccion', 'reproduccion.estado', 'reproduccion.ancho', 'reproduccion.alto', 'reproduccion.silenciado',
  'webrtc', 'webrtc.conexion', 'webrtc.ice', 'webrtc.senalizacion',
  'metricas', 'metricas.disponible', 'metricas.motivo', 'metricas.video', 'metricas.audio', 'metricas.rttMs',
  'metricas.video.bytesRecibidos', 'metricas.video.paquetesRecibidos', 'metricas.video.paquetesPerdidos',
  'metricas.video.fotogramasDecodificados', 'metricas.video.fotogramasDescartados', 'metricas.video.bytesEnviados',
  'metricas.video.paquetesEnviados', 'metricas.video.fotogramasCodificados',
  'metricas.audio.bytesRecibidos', 'metricas.audio.paquetesRecibidos', 'metricas.audio.paquetesPerdidos',
  'metricas.audio.jitterMs', 'metricas.audio.bytesEnviados', 'metricas.audio.paquetesEnviados',
  'finalizacion', 'finalizacion.terminada', 'finalizacion.avisoCierre', 'finalizacion.conexionAbierta',
  'finalizacion.recursosLiberados', 'finalizacion.capturasDescartadas',
  'errores', 'errores.total', 'errores.categorias',
  'noDisponible',
];

test('el informe solo contiene campos de la lista permitida y ningún valor señuelo', () => {
  const informe = construirInforme(datosBrutos(), AHORA);
  const texto = serializarInforme(informe);
  assert.deepEqual([...rutas(informe)].sort(), [...CAMPOS_PERMITIDOS].sort());
  for (const senuelo of [
    ...Object.values(SENUELOS),
    'SENUELO',
    'TOKEN',
    '203.0.113',
    'candidate',
    'v=0',
    'http://',
    'deviceId',
    'groupId',
    'fingerprint',
  ]) {
    assert.equal(texto.includes(senuelo), false, `el informe no debe contener «${senuelo}»`);
  }
  assert.equal(informe.esquema, ESQUEMA_INFORME);
  assert.equal(informe.generadoEn, '2026-11-23T12:00:00.000Z');
  // Lo permitido sí sale, saneado.
  assert.deepEqual(informe.pistas.locales[0], {
    tipo: 'video',
    estado: 'live',
    silenciada: false,
    ajustes: { ancho: 1280, alto: 720, fotogramasPorSegundo: 30, orientacionCamara: 'user' },
  });
  assert.deepEqual(informe.pistas.locales[1].ajustes, { frecuenciaMuestreo: 48000, canales: 2 });
  assert.deepEqual(informe.errores, { total: 2, categorias: ['captura-permiso-denegado', 'desconocida'] });
  assert.equal(JSON.parse(texto).metricas.video.bytesRecibidos, 10);
});

test('sin datos, todo consta como no disponible y no se inventa ningún valor', () => {
  for (const entrada of [undefined, {}, null, 'texto', 42, []]) {
    const informe = construirInforme(entrada, AHORA);
    assert.equal(informe.rol, null);
    assert.equal(informe.navegador.familia, null);
    assert.equal(informe.navegador.version, null);
    assert.equal(informe.navegador.plataforma, null);
    assert.equal(informe.pistas.localesActivas, null);
    assert.deepEqual(informe.pistas.locales, []);
    assert.equal(informe.metricas.disponible, false);
    assert.equal(informe.metricas.video, null);
    assert.equal(informe.finalizacion.recursosLiberados, 'no-aplica');
    for (const ruta of ['rol', 'navegador.familia', 'navegador.version', 'navegador.plataforma', 'navegador.apis.getUserMedia', 'webrtc.conexion', 'metricas.video', 'pistas.localesActivas']) {
      assert.ok(informe.noDisponible.includes(ruta), `«${ruta}» debe constar como no disponible`);
    }
    assert.deepEqual([...rutas(informe)].filter((r) => !CAMPOS_PERMITIDOS.includes(r)), []);
  }
  assert.equal(construirInforme({}, new Date('no es una fecha')).generadoEn, null);
});

test('valores fuera de lista, de tipo erróneo o fuera de rango se descartan', () => {
  const informe = construirInforme(
    {
      ...datosBrutos(),
      rol: 'administrador',
      conexion: SENUELOS.error,
      ice: 7,
      canal: 'otro',
      captura: {},
      pistasLocalesActivas: -3,
      pistasRemotasActivas: Number.NaN,
      navegador: { agente: 'Agente\r\n\u0000 con ñ y control', plataforma: 'x'.repeat(500), visibilidad: 'oculta', contextoSeguro: 'sí', apis: {} },
      pistasLocales: [{ tipo: 'texto', estado: 'raro', silenciada: 'no', ajustes: { width: -1, height: '720', frameRate: Infinity } }],
    },
    AHORA,
  );
  assert.equal(informe.rol, null);
  assert.equal(informe.webrtc.conexion, null);
  assert.equal(informe.webrtc.ice, null);
  assert.equal(informe.sesion.canal, null);
  assert.equal(informe.captura.estado, null);
  assert.equal(informe.pistas.localesActivas, null);
  assert.equal(informe.pistas.remotasActivas, null);
  assert.equal(informe.navegador.familia, null);
  assert.equal(informe.navegador.plataforma, null);
  assert.equal(informe.navegador.visibilidad, null);
  assert.equal(informe.navegador.contextoSeguro, null);
  assert.deepEqual(informe.pistas.locales, [{ tipo: null, estado: null, silenciada: null, ajustes: null }]);
  assert.equal(serializarInforme(informe).includes(SENUELOS.error), false);
});

test('métricas: suma por medio, deja en null lo que ningún registro aporta e ignora valores no válidos', () => {
  const vacias = agregarEstadisticas([]);
  assert.equal(vacias.video.bytesRecibidos, null);
  assert.equal(vacias.audio.jitterMs, null);
  assert.equal(vacias.rttMs, null);
  for (const invalido of [null, undefined, 5, {}]) assert.equal(agregarEstadisticas(/** @type {any} */ (invalido)).rttMs, null);

  const m = agregarEstadisticas([
    { type: 'inbound-rtp', kind: 'video', bytesReceived: 100, packetsReceived: 4, packetsLost: -2, framesDecoded: 3 },
    { type: 'inbound-rtp', kind: 'video', bytesReceived: 50, packetsReceived: 1, packetsLost: 2, framesDecoded: 2, framesDropped: 1 },
    { type: 'inbound-rtp', kind: 'audio', bytesReceived: 20, jitter: 0.002 },
    { type: 'inbound-rtp', kind: 'audio', bytesReceived: 'mucho', jitter: 0.007 },
    { type: 'outbound-rtp', kind: 'video', bytesSent: 70, framesEncoded: 9 },
    { type: 'candidate-pair', state: 'in-progress', nominated: true, currentRoundTripTime: 9 },
    { type: 'candidate-pair', state: 'succeeded', nominated: true, currentRoundTripTime: 0.0345 },
    { type: 'inbound-rtp', kind: 'texto', bytesReceived: 999 },
    null,
  ]);
  assert.equal(m.video.bytesRecibidos, 150);
  assert.equal(m.video.paquetesRecibidos, 5);
  assert.equal(m.video.paquetesPerdidos, 2, 'el valor negativo se ignora');
  assert.equal(m.video.fotogramasDecodificados, 5);
  assert.equal(m.video.fotogramasDescartados, 1);
  assert.equal(m.video.bytesEnviados, 70);
  assert.equal(m.video.fotogramasCodificados, 9);
  assert.equal(m.video.paquetesEnviados, null);
  assert.equal(m.audio.bytesRecibidos, 20);
  assert.equal(m.audio.jitterMs, 7, 'el jitter es el máximo, en ms');
  assert.equal(m.audio.bytesEnviados, null);
  assert.equal(m.rttMs, 34.5);
});

test('métricas y APIs no disponibles constan con su motivo y sin copiar el error', () => {
  for (const [estadisticas, motivo] of /** @type {[any, string][]} */ ([
    [{ estado: 'sin-conexion' }, 'sin-conexion'],
    [{ estado: 'api-ausente' }, 'api-ausente'],
    [{ estado: 'error', mensaje: SENUELOS.error }, 'error'],
    [{ estado: SENUELOS.error }, 'desconocido'],
    [undefined, 'desconocido'],
  ])) {
    const informe = construirInforme({ ...datosBrutos(), estadisticas }, AHORA);
    assert.equal(informe.metricas.disponible, false);
    assert.equal(informe.metricas.motivo, motivo);
    assert.equal(informe.metricas.video, null);
    assert.equal(informe.metricas.audio, null);
    assert.equal(informe.metricas.rttMs, null);
    assert.ok(informe.noDisponible.includes('metricas.video'));
    assert.equal(serializarInforme(informe).includes(SENUELOS.error), false);
  }
  const sinApis = construirInforme(
    { ...datosBrutos(), navegador: { contextoSeguro: false, apis: { getUserMedia: false, rtcPeerConnection: false, getStats: false, portapapeles: false } } },
    AHORA,
  );
  assert.equal(sinApis.navegador.contextoSeguro, false);
  assert.deepEqual(Object.values(sinApis.navegador.apis), [false, false, false, false]);
  assert.equal(sinApis.navegador.familia, null);
  assert.ok(sinApis.noDisponible.includes('navegador.familia'));
});

test('categorías de error: solo las conocidas, sin repetir y acotadas', () => {
  for (const conocida of ['captura-permiso-denegado', 'captura-no-soportado', 'canal-no-autorizado', 'webrtc-conexion-fallida']) {
    assert.ok(CATEGORIAS_ERROR.includes(conocida), conocida);
  }
  const informe = construirInforme(
    { errores: ['canal-perdido', 'canal-perdido', 'inventada', 42, SENUELOS.error, ...Array.from({ length: 40 }, () => 'otra')], codigoCaptura: SENUELOS.error },
    AHORA,
  );
  assert.deepEqual(informe.errores.categorias, ['canal-perdido', 'desconocida']);
  assert.equal(informe.errores.total, 2);
  assert.equal(informe.captura.ultimoError, 'desconocido');
  assert.equal(construirInforme({ codigoCaptura: 'permiso-denegado' }, AHORA).captura.ultimoError, 'permiso-denegado');
  assert.equal(construirInforme({}, AHORA).captura.ultimoError, 'ninguno');
});

test('liberación de recursos: solo se afirma tras terminar, sin pistas y sin conexión', () => {
  /** @param {Record<string, unknown>} d */
  const liberados = (d) => construirInforme(d, AHORA).finalizacion.recursosLiberados;
  const base = { terminado: true, pistasLocalesActivas: 0, pistasRemotasActivas: 0, conexionAbierta: false };
  assert.equal(liberados(base), 'si');
  assert.equal(liberados({ ...base, terminado: false }), 'no-aplica');
  assert.equal(liberados({ ...base, pistasLocalesActivas: 1 }), 'no');
  assert.equal(liberados({ ...base, pistasRemotasActivas: 2 }), 'no');
  assert.equal(liberados({ ...base, conexionAbierta: true }), 'no');
  assert.equal(liberados({ terminado: true }), 'no', 'sin datos no se afirma que se liberó');
});

test('copiarTexto: copia, rechazo y ausencia del portapapeles', async () => {
  /** @type {string[]} */
  const copiados = [];
  assert.deepEqual(await copiarTexto('hola', { writeText: async (t) => void copiados.push(t) }), { ok: true });
  assert.deepEqual(copiados, ['hola']);
  assert.deepEqual(
    await copiarTexto('hola', { writeText: () => Promise.reject(new DOMException(SENUELOS.error, 'NotAllowedError')) }),
    { ok: false, motivo: 'rechazado' },
  );
  assert.deepEqual(await copiarTexto('hola', { writeText: () => { throw new Error(SENUELOS.error); } }), { ok: false, motivo: 'rechazado' });
  assert.deepEqual(await copiarTexto('hola', undefined), { ok: false, motivo: 'no-disponible' });
  assert.deepEqual(await copiarTexto('hola', null), { ok: false, motivo: 'no-disponible' });
  assert.deepEqual(await copiarTexto('hola', /** @type {any} */ ({})), { ok: false, motivo: 'no-disponible' });
});

/** @param {unknown} agente @param {unknown} [plataforma] @param {unknown} [plataformaDatos] */
const navegadorDe = (agente, plataforma, plataformaDatos) =>
  construirInforme({ navegador: { agente, plataforma, plataformaDatos } }, AHORA).navegador;

test('E02-R01-02: el agente de usuario no se exporta; solo familia, versión y plataforma de listas cerradas', () => {
  // El caso reproducido en la auditoría: cadenas sensibles dentro del agente y de la plataforma.
  const informe = construirInforme(
    { navegador: { agente: 'Mozilla/5.0 Chrome/158.0.0.0 TOKEN-SENUELO http://203.0.113.7/identificador', plataforma: 'Android ID-SENUELO' } },
    AHORA,
  );
  assert.deepEqual([informe.navegador.familia, informe.navegador.version, informe.navegador.plataforma], ['chrome', 158, 'android']);
  const texto = serializarInforme(informe);
  for (const prohibido of ['SENUELO', 'TOKEN', '203.0.113', 'http', 'identificador', 'Mozilla', 'agente']) {
    assert.equal(texto.includes(prohibido), false, `el informe no debe contener «${prohibido}»`);
  }
  assert.equal('agente' in informe.navegador, false);
});

test('E02-R01-02: se reconocen Chrome en Android y Chrome y Edge en Windows, con su versión', () => {
  const chromeAndroid = 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Mobile Safari/537.36';
  const chromeWindows = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36';
  const edgeWindows = `${chromeWindows} Edg/158.0.3000.1`;
  const casos = /** @type {[string, string | undefined, string | undefined, [string, number, string]][]} */ ([
    [chromeAndroid, 'Linux armv81', undefined, ['chrome', 158, 'android']],
    [chromeAndroid, 'Linux armv81', 'Android', ['chrome', 158, 'android']],
    [chromeWindows, 'Win32', 'Windows', ['chrome', 158, 'windows']],
    [edgeWindows, 'Win32', 'Windows', ['edge', 158, 'windows']],
    [edgeWindows, undefined, undefined, ['edge', 158, 'windows']],
    ['Mozilla/5.0 (Windows NT 10.0) HeadlessChrome/158.0.0.0 Safari/537.36', 'Win32', undefined, ['chrome-sin-interfaz', 158, 'windows']],
    ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/158.0.0.0 Safari/537.36', 'Linux x86_64', 'Linux', ['chrome-sin-interfaz', 158, 'linux']],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/141.0.0.0 Safari/537.36', 'MacIntel', 'macOS', ['chrome', 141, 'macos']],
    ['Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0', 'Linux x86_64', undefined, ['firefox', 130, 'linux']],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', 'iPhone', undefined, ['safari', 17, 'ios']],
    ['Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/150.0.0.0 Mobile Safari/537.36 OPR/90.0.0.0', undefined, undefined, ['opera', 90, 'android']],
    ['Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36', undefined, undefined, ['samsung', 25, 'android']],
  ]);
  for (const [agente, plataforma, datos, esperado] of casos) {
    const n = navegadorDe(agente, plataforma, datos);
    assert.deepEqual([n.familia, n.version, n.plataforma], esperado, agente);
  }
});

test('E02-R01-02: lo que no se reconoce no se conserva y consta como no disponible', () => {
  for (const [agente, plataforma] of /** @type {[unknown, unknown][]} */ ([
    ['SENUELO-AGENTE-DESCONOCIDO', 'SENUELO-PLATAFORMA'],
    ['Chromebrowser/158 SENUELO', 'ID-SENUELO'],
    ['', ''],
    [undefined, undefined],
    [42, { toString: () => 'Android' }],
    [['Chrome/158'], ['Android']],
    ['x'.repeat(100_000), 'y'.repeat(100_000)],
  ])) {
    const informe = construirInforme({ navegador: { agente, plataforma, plataformaDatos: plataforma } }, AHORA);
    assert.deepEqual([informe.navegador.familia, informe.navegador.version, informe.navegador.plataforma], [null, null, null]);
    for (const ruta of ['navegador.familia', 'navegador.version', 'navegador.plataforma']) assert.ok(informe.noDisponible.includes(ruta), ruta);
    const texto = serializarInforme(informe);
    assert.equal(texto.includes('SENUELO'), false);
    assert.ok(texto.length < 5000, 'una cadena larga no se copia al informe');
  }
});

test('E02-R01-02: la versión es un entero acotado y la plataforma no se confunde por subcadenas', () => {
  assert.equal(navegadorDe('Chrome/99999999').version, null, 'versión fuera de rango');
  assert.equal(navegadorDe('Chrome/99999999').familia, 'chrome', 'la familia se reconoce aunque la versión no valga');
  assert.equal(navegadorDe('Chrome/7').version, 7);
  assert.equal(navegadorDe('Chrome/158.9.9 Chrome/1').version, 158);
  assert.equal(navegadorDe('Mozilla/5.0 (Darwin) Chrome/158.0.0.0').plataforma, null, '«Darwin» no es Windows');
  assert.equal(navegadorDe('Chrome/158', 'Linux armv81', 'Android').plataforma, 'android', 'Android prevalece sobre Linux');
  assert.equal(navegadorDe('Chrome/158', 'Linux x86_64').plataforma, 'linux');
  assert.equal(navegadorDe('Chrome/158', 'Linux armv81 Windows ID-SENUELO').plataforma, 'windows', 'solo valores de la lista cerrada');
  const informe = construirInforme({ navegador: { agente: 'Chrome/158 (iPhone)', plataforma: 'MacIntel' } }, AHORA);
  assert.equal(informe.navegador.plataforma, 'ios');
  assert.equal(JSON.parse(serializarInforme(informe)).navegador.familia, 'chrome');
});
