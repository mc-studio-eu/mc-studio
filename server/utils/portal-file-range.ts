export function portalFileRange(header: string | undefined, size: number) {
  if (!header) return undefined
  const match = /^bytes=(\d*)-(\d*)$/i.exec(header)
  if (!match) return undefined
  const [, first, last] = match
  if ((!first && !last) || size <= 0) return null

  if (!first) {
    const suffixLength = Number(last)
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null
    return { start: Math.max(size - suffixLength, 0), end: size - 1 }
  }

  const start = Number(first)
  const end = last ? Math.min(Number(last), size - 1) : size - 1
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) return null
  return { start, end }
}
