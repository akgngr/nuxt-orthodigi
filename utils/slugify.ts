export function slugify(text: string, separator: string = '-') {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  }

  const s = separator === '-' ? '-' : separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return text
    .toString()
    .toLowerCase()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m] ?? m)
    .replace(/\s+/g, separator)
    .replace(new RegExp(`[^\\w${s}]+`, 'g'), '')
    .replace(new RegExp(`${s}+`, 'g'), separator)
    .replace(new RegExp(`^${s}+`), '')
    .replace(new RegExp(`${s}+$`), '')
}
