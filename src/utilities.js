/**
 * # Utilities
 *
 * Convenience helpers.
 */

/**
 * Create an array with the DOM nodes of the list
 *
 * @param  {NodeList}             nodes - [description]
 * @return {Array.<HTMLElement>}        - [description]
 */
export function convertNodeList (nodes) {
  const { length } = nodes
  const arr = new Array(length)
  for (var i = 0; i < length; i++) {
    arr[i] = nodes[i]
  }
  return arr
}

/**
 * Escape special characters and line breaks as a simplified version of 'CSS.escape()'
 *
 * Description of valid characters: https://mathiasbynens.be/notes/css-escapes
 *
 * @param  {String?} value - [description]
 * @return {String}        - [description]
 */
export function escapeValue (value) {
  return value && value.replace(/['"`\\/:\?&!#$%^()[\]{|}*+;,.<=>@~]/g, '\\$&')
                       .replace(/\n/g, '\A')
}

/**
 * Escape a value for use as a CSS identifier (class name, ID, etc.)
 *
 * Uses CSS.escape() when available (browsers), otherwise applies a polyfill
 * based on the CSSOM spec: https://drafts.csswg.org/cssom/#serialize-an-identifier
 *
 * @param  {String} value - [description]
 * @return {String}       - [description]
 */
export function cssEscapeIdentifier (value) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  // Polyfill based on https://github.com/mathiasbynens/CSS.escape
  value = String(value)
  var result = ''
  var length = value.length
  for (var i = 0; i < length; i++) {
    var ch = value.charAt(i)
    var code = value.charCodeAt(i)
    if (code === 0) {
      result += '\uFFFD'
      continue
    }
    if (
      (code >= 0x0001 && code <= 0x001F) || code === 0x007F ||
      (i === 0 && code >= 0x0030 && code <= 0x0039) ||
      (i === 1 && code >= 0x0030 && code <= 0x0039 && value.charCodeAt(0) === 0x002D)
    ) {
      result += '\\' + code.toString(16) + ' '
      continue
    }
    if (i === 0 && code === 0x002D && length === 1) {
      result += '\\' + ch
      continue
    }
    if (
      code >= 0x0080 ||
      code === 0x002D ||
      code === 0x005F ||
      (code >= 0x0030 && code <= 0x0039) ||
      (code >= 0x0041 && code <= 0x005A) ||
      (code >= 0x0061 && code <= 0x007A)
    ) {
      result += ch
      continue
    }
    result += '\\' + ch
  }
  return result
}
