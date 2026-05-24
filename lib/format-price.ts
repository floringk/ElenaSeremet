/** Split "520 RON" style strings for typography (amount vs currency). */
export function splitPriceValue(value: string) {
  const m = value.trim().match(/^([\d.,\s]+)\s*(RON)$/i);
  if (!m) return { amount: value, currency: null as string | null };
  return { amount: m[1].trim(), currency: m[2].toUpperCase() };
}
