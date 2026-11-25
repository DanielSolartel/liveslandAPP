// @ts-check
// Estados visibles de continuidad (public/continuidad.js, E03): derivación por componentes y comprobación
// del progreso de los medios. Funciones puras.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  derivarContinuidad,
  ESTADOS_CONTINUIDAD,
  estadoPistas,
  evaluarProgreso,
  LIMITES_RECUPERACION,
  MOTIVOS_CONTINUIDAD,
  TEXTOS_ESTADO,
  TEXTOS_MOTIVO,
} from '../../public/continuidad.js';

/** @returns {import('../../public/continuidad.js').Componentes} */
function conectado(rol = /** @type {'emisor' | 'espectador'} */ ('emisor')) {
  return {
    rol,
    sesion: 'vigente',
    canal: 'conectada',
    canalMotivo: null,
    par: 'presente',
    parMotivo: null,
    pistas: 'activas',
    transporte: 'connected',
    reproduccion: rol === 'espectador' ? 'reproduciendo' : 'no-aplica',
    recuperacion: 'ninguna',
  };
}

/**
 * @param {Partial<import('../../public/continuidad.js').Componentes>} cambios
 * @param {'emisor' | 'espectador'} [rol]
 */
const derivar = (cambios, rol) => derivarContinuidad({ ...conectado(rol), ...cambios });

test('los nueve estados y sus motivos son de lista cerrada y tienen texto', () => {
  assert.equal(ESTADOS_CONTINUIDAD.length, 9);
  for (const e of ESTADOS_CONTINUIDAD) assert.ok(Object.hasOwn(TEXTOS_ESTADO, e), e);
  for (const m of MOTIVOS_CONTINUIDAD) assert.ok(Object.hasOwn(TEXTOS_MOTIVO, m), m);
});

test('estado normal, sin sesión y finalizada', () => {
  assert.deepEqual(derivar({}), { estado: 'conectada', motivo: 'ninguno' });
  assert.deepEqual(derivar({}, 'espectador'), { estado: 'conectada', motivo: 'ninguno' });
  assert.equal(derivar({ rol: null }).estado, 'sin-sesion');
  assert.equal(derivar({ sesion: 'sin-sesion' }).estado, 'sin-sesion');
  assert.equal(derivar({ sesion: 'finalizada', recuperacion: 'en-curso' }).estado, 'finalizada', 'finalizar prevalece sobre una recuperación');
});

test('distingue señalización, presencia, pistas y transporte: perder uno no implica perder los demás', () => {
  // Señalización perdida con el transporte aún conectado: requiere intervención por el canal, no por los medios.
  assert.deepEqual(derivar({ canal: 'interrumpida', canalMotivo: 'fin-inesperado' }), { estado: 'requiere-intervencion', motivo: 'canal-perdido' });
  assert.deepEqual(derivar({ canal: 'error', canalMotivo: 'rol-ocupado' }), { estado: 'requiere-intervencion', motivo: 'rol-ocupado' });
  assert.deepEqual(derivar({ canal: 'error', canalMotivo: 'limite-senales' }), { estado: 'requiere-intervencion', motivo: 'limite-senales' });
  assert.deepEqual(derivar({ canal: 'error', canalMotivo: 'tiempo-agotado' }), { estado: 'requiere-intervencion', motivo: 'canal-tiempo-agotado' });
  // Transporte transitoriamente desconectado con la señalización bien: interrupción, no cierre.
  assert.deepEqual(derivar({ transporte: 'disconnected' }), { estado: 'interrupcion-detectada', motivo: 'transporte-desconectado' });
  assert.deepEqual(derivar({ transporte: 'failed' }), { estado: 'requiere-intervencion', motivo: 'transporte-fallido' });
  assert.deepEqual(derivar({ transporte: 'closed' }), { estado: 'requiere-intervencion', motivo: 'transporte-cerrado' });
  // Pista silenciada con todo lo demás bien.
  assert.deepEqual(derivar({ pistas: 'silenciadas' }), { estado: 'interrupcion-detectada', motivo: 'pista-silenciada' });
  assert.deepEqual(derivar({ pistas: 'terminadas' }), { estado: 'requiere-intervencion', motivo: 'captura-terminada' });
  assert.deepEqual(derivar({ pistas: 'terminadas' }, 'espectador'), { estado: 'interrupcion-detectada', motivo: 'pista-remota-terminada' });
  // Conexión establecida sin pistas recibidas todavía.
  assert.deepEqual(derivar({ pistas: 'sin-pistas' }, 'espectador'), { estado: 'conectando', motivo: 'esperando-medios' });
  assert.deepEqual(derivar({ reproduccion: 'requiere-gesto' }, 'espectador'), { estado: 'conectada', motivo: 'reproduccion-requiere-gesto' });
});

test('una salida voluntaria no es un fallo; una desconexión del otro participante es una interrupción', () => {
  assert.deepEqual(derivar({ par: 'ausente', parMotivo: 'salida', transporte: 'sin-conexion' }), {
    estado: 'esperando-participante',
    motivo: 'participante-salio',
  });
  assert.deepEqual(derivar({ par: 'ausente', parMotivo: null, transporte: 'sin-conexion' }), {
    estado: 'esperando-participante',
    motivo: 'participante-ausente',
  });
  assert.deepEqual(derivar({ par: 'ausente', parMotivo: 'desconexion', transporte: 'sin-conexion' }), {
    estado: 'interrupcion-detectada',
    motivo: 'participante-desconectado',
  });
});

test('condiciones de la sesión: inexistente o no autorizada requieren intervención', () => {
  assert.deepEqual(derivar({ sesion: 'inexistente' }), { estado: 'requiere-intervencion', motivo: 'sesion-inexistente' });
  assert.deepEqual(derivar({ sesion: 'no-autorizada' }), { estado: 'requiere-intervencion', motivo: 'no-autorizado' });
});

test('recuperación: en curso, confirmada solo con su resultado y no confirmada', () => {
  assert.deepEqual(derivar({ recuperacion: 'en-curso', transporte: 'failed' }), { estado: 'recuperacion-en-curso', motivo: 'en-curso' });
  assert.deepEqual(derivar({ recuperacion: 'confirmada' }), { estado: 'recuperacion-confirmada', motivo: 'ninguno' });
  assert.deepEqual(derivar({ recuperacion: 'no-confirmada' }), { estado: 'conectada', motivo: 'recuperacion-no-confirmada' });
  // Una recuperación confirmada antes no oculta una interrupción posterior.
  assert.equal(derivar({ recuperacion: 'confirmada', transporte: 'disconnected' }).estado, 'interrupcion-detectada');
  assert.equal(derivar({ recuperacion: 'confirmada', canal: 'interrumpida' }).estado, 'requiere-intervencion');
});

test('conectando: canal abriéndose, sin captura o negociación pendiente', () => {
  assert.deepEqual(derivar({ canal: 'conectando', par: 'desconocido' }), { estado: 'conectando', motivo: 'canal-conectando' });
  assert.deepEqual(derivar({ pistas: 'sin-pistas', transporte: 'sin-conexion' }), { estado: 'conectando', motivo: 'sin-captura' });
  assert.deepEqual(derivar({ transporte: 'sin-conexion' }), { estado: 'conectando', motivo: 'esperando-negociacion' });
  assert.deepEqual(derivar({ transporte: 'connecting' }), { estado: 'conectando', motivo: 'transporte-conectando' });
  assert.deepEqual(derivar({ transporte: 'new' }), { estado: 'conectando', motivo: 'transporte-conectando' });
});

test('estadoPistas resume terminadas, silenciadas, activas y ninguna', () => {
  assert.equal(estadoPistas([]), 'sin-pistas');
  assert.equal(estadoPistas([{ readyState: 'live', muted: false }]), 'activas');
  assert.equal(estadoPistas([{ readyState: 'live', muted: true }, { readyState: 'live', muted: false }]), 'silenciadas');
  assert.equal(estadoPistas([{ readyState: 'ended' }, { readyState: 'live', muted: true }]), 'terminadas');
});

/**
 * @param {Partial<Record<string, number | null>>} video
 * @param {Partial<Record<string, number | null>>} audio
 */
const medidas = (video, audio) => ({ video: /** @type {Record<string, number | null>} */ (video), audio: /** @type {Record<string, number | null>} */ (audio) });

test('progreso del emisor: solo confirma el envío de audio y video', () => {
  const a = medidas({ bytesEnviados: 100 }, { bytesEnviados: 50 });
  assert.equal(evaluarProgreso('emisor', a, medidas({ bytesEnviados: 200 }, { bytesEnviados: 60 })), 'envio-confirmado');
  assert.equal(evaluarProgreso('emisor', a, medidas({ bytesEnviados: 200 }, { bytesEnviados: 50 })), 'parcial');
  assert.equal(evaluarProgreso('emisor', a, a), 'sin-progreso');
  assert.equal(evaluarProgreso('emisor', a, medidas({ bytesEnviados: null }, { bytesEnviados: 60 })), 'no-verificable');
  assert.equal(evaluarProgreso('emisor', null, a), 'no-verificable');
  // Contadores de recepción no sirven para confirmar el envío.
  assert.equal(evaluarProgreso('emisor', medidas({ bytesRecibidos: 1 }, { bytesRecibidos: 1 }), medidas({ bytesRecibidos: 9 }, { bytesRecibidos: 9 })), 'no-verificable');
});

// E03-R01-03: la prueba incluye ahora los bytes de audio recibidos, que el espectador también exige.
test('progreso del espectador: exige bytes y fotogramas de video, y bytes y paquetes de audio', () => {
  const a = medidas({ bytesRecibidos: 100, fotogramasDecodificados: 10 }, { paquetesRecibidos: 5, bytesRecibidos: 50 });
  const b = medidas({ bytesRecibidos: 200, fotogramasDecodificados: 20 }, { paquetesRecibidos: 9, bytesRecibidos: 90 });
  assert.equal(evaluarProgreso('espectador', a, b), 'recepcion-confirmada');
  // Bytes que llegan sin fotogramas decodificados: no se confirma la recuperación audiovisual.
  assert.equal(evaluarProgreso('espectador', a, medidas({ bytesRecibidos: 200, fotogramasDecodificados: 10 }, { paquetesRecibidos: 9, bytesRecibidos: 90 })), 'parcial');
  assert.equal(evaluarProgreso('espectador', a, a), 'sin-progreso');
  assert.equal(evaluarProgreso('espectador', a, medidas({ bytesRecibidos: 200, fotogramasDecodificados: Number.NaN }, { paquetesRecibidos: 9, bytesRecibidos: 90 })), 'no-verificable');
  assert.equal(evaluarProgreso('espectador', a, null), 'no-verificable');
});

test('los temporizadores técnicos están acotados y ninguno es el minuto de reconexión del producto', () => {
  for (const [nombre, valor] of Object.entries(LIMITES_RECUPERACION)) {
    assert.ok(Number.isInteger(valor) && valor > 0, nombre);
  }
  assert.ok(LIMITES_RECUPERACION.intentosRolOcupado <= 3, 'reintentos de 409 acotados');
  assert.ok(LIMITES_RECUPERACION.maxCandidatosEnCola <= 64, 'colas de candidatos acotadas');
  const plazos = [LIMITES_RECUPERACION.bienvenidaMs, LIMITES_RECUPERACION.negociacionMs, LIMITES_RECUPERACION.conexionMs];
  assert.ok(plazos.every((ms) => ms < 60_000), 'ningún plazo técnico llega al minuto del producto');
});
