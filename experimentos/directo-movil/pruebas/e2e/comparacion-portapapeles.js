// @ts-check
// Comparación del informe copiado con el mostrado, portable entre sistemas. El portapapeles de Windows
// devuelve saltos de línea CRLF (`\r\n`) y el cuadro de texto, LF (`\n`). Solo se normaliza CRLF a LF:
// no se recorta ni se eliminan espacios, ni se compara una parte, para no ocultar diferencias reales.

/**
 * Convierte exclusivamente cada `\r\n` en `\n`. Un `\r` suelto, un `\r\r\n` (queda `\r\n`) o cualquier otro
 * carácter no se tocan.
 * @param {string} texto
 */
export function normalizarCrLf(texto) {
  return texto.replace(/\r\n/g, '\n');
}

/**
 * `true` si los dos textos son idénticos salvo por los saltos de línea CRLF/LF.
 * @param {string} a
 * @param {string} b
 */
export function igualesSalvoCrLf(a, b) {
  return normalizarCrLf(a) === normalizarCrLf(b);
}
