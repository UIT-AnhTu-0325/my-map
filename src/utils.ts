/**
 * Format price for display with "tỷ" unit.
 * Users input in tỷ units (e.g. 2.58 = 2.58 tỷ).
 * If masked, partially hide the price.
 */
export function formatPrice(price: number, masked: boolean): string {
  if (masked) {
    const str = price.toString();
    // Show first 2 chars, mask the rest
    if (str.length > 2) {
      const visible = str.slice(0, 2);
      const hidden = str.slice(2).replace(/[0-9]/g, 'x');
      return visible + hidden + ' tỷ';
    }
    return str + ' tỷ';
  }

  // Format: keep decimals, use dot as thousand separator for integer part
  const parts = price.toString().split('.');
  const intPart = addDots(parts[0]);
  const decPart = parts[1];
  if (decPart) {
    return intPart + ',' + decPart + ' tỷ';
  }
  return intPart + ' tỷ';
}

function addDots(s: string): string {
  const chars = s.split('');
  const result: string[] = [];
  let count = 0;
  for (let i = chars.length - 1; i >= 0; i--) {
    result.unshift(chars[i]);
    count++;
    if (count % 3 === 0 && i > 0) {
      result.unshift('.');
    }
  }
  return result.join('');
}
