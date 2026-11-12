export interface EscapeSpot { x: number; y: number }

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[next]] = [result[next], result[index]]
  }
  return result
}

/** Fifteen hideouts, dealt in waves that each explore the whole playground. */
export function createEscapeDeck(): EscapeSpot[] {
  const columns = shuffled([0, 1, 2, 3, 4])
  const rows = shuffled([0, 1, 2])
  return [0, 1, 2].flatMap(wave => shuffled(columns.map((column, index) => ({
    x: column / 4,
    y: rows[(index + wave) % rows.length] / 2,
  }))))
}
