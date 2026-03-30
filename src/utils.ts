/**
 * Format price with commas and "tỷ đồng" unit.
 * If masked, show only first 2 digits, rest replaced with 'x'.
 * e.g. 7000 → "7,000 tỷ đồng" (full) or "7,0xx tỷ đồng" (masked)
 */
export function formatPrice(price: number, masked: boolean): string {
  const str = Math.floor(price).toString();

  if (masked && str.length > 2) {
    const visible = str.slice(0, 2);
    const hidden = 'x'.repeat(str.length - 2);
    const raw = visible + hidden;
    return addDots(raw) + ' tỷ';
  }

  return addDots(str) + ' tỷ';
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
