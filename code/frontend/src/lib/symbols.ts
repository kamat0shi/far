/** Грубая нормализация base из символьной строки биржи */
export function getBase(sym: string): string {
  const QUOTES = ['USDT','USDC','USD']
  const S = sym.replace(/[-]/g, '_').toUpperCase()
  for (const q of QUOTES) {
    const idx = S.indexOf(q)
    if (idx > 0) return S.slice(0, idx).replace(/[_]/g, '')
  }
  return S.split('_')[0]
}
