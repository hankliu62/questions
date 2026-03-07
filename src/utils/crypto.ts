const PREFIX = 'h:';

/**
 * 混淆字符串
 * @param str 原始字符串
 * @returns 混淆后的字符串
 */
export function obfuscate(str: string): string {
  if (!str || str.startsWith(PREFIX)) return str;
  // 使用 Base64 进行简单的混淆
  try {
    return PREFIX + btoa(encodeURIComponent(str));
  } catch (_e) {
    return str;
  }
}

/**
 * 还原混淆字符串
 * @param str 混淆后的字符串
 * @returns 还原后的字符串
 */
export function deobfuscate(str: string): string {
  if (typeof str !== 'string' || !str.startsWith(PREFIX)) return str;
  try {
    // 还原 Base64
    return decodeURIComponent(atob(str.slice(PREFIX.length)));
  } catch (_e) {
    return str;
  }
}

/**
 * 判断是否是经过混淆的字符串
 * @param str 待判断的字符串
 * @returns 是否经过混淆
 */
export function isObfuscated(str: string): boolean {
  return typeof str === 'string' && str.startsWith(PREFIX);
}
