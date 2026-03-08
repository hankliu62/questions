const PREFIX = 'h:';

/**
 * 打乱字符顺序（通过循环移位）
 * @param str 输入字符串
 * @param shift 移位数量（正向）
 * @returns 打乱后的字符串
 */
function shuffleChars(str: string, shift: number): string {
  const len = str.length;
  if (len <= 1) return str;

  // 循环移位
  shift = ((shift % len) + len) % len;
  if (shift === 0) return str;

  return str.slice(-shift) + str.slice(0, -shift);
}

/**
 * 混淆字符串
 * @param str 原始字符串
 * @returns 混淆后的字符串
 */
export function obfuscate(str: string): string {
  if (!str || str.startsWith(PREFIX)) return str;
  try {
    // 第一步：Base64 编码
    const base64 = btoa(encodeURIComponent(str));
    // 第二步：打乱字符顺序（使用字符串长度作为移位值，每次混淆结果都不同）
    const shift = (str.length + Math.floor(Math.random() * 10)) % base64.length || 1;
    const shuffled = shuffleChars(base64, shift);
    // 第三步：在前面添加移位信息（前缀 + 移位值 + 打乱后的内容）
    return `${PREFIX}${shift.toString(36)}_${shuffled}`;
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
    // 解析前缀后的内容：格式为 prefix + shift + "_" + shuffled
    const rest = str.slice(PREFIX.length);
    const underscoreIdx = rest.indexOf('_');
    if (underscoreIdx === -1) return str;

    // 提取移位值
    const shift = parseInt(rest.slice(0, underscoreIdx), 36);
    if (isNaN(shift)) return str;

    // 提取打乱后的内容
    const shuffled = rest.slice(underscoreIdx + 1);
    // 逆序移位（反向移位）
    const unshifted = shuffleChars(shuffled, -shift);
    // 还原 Base64
    return decodeURIComponent(atob(unshifted));
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
