export type RandomSource = () => number

export function shuffle<T>(input: readonly T[], random: RandomSource): T[] {
  const output = [...input]

  for (let index = output.length - 1; index > 0; index -= 1) {
    const value = random()

    if (value < 0 || value >= 1 || !Number.isFinite(value)) {
      throw new Error('Random source must return a finite value from 0 up to 1')
    }

    const targetIndex = Math.floor(value * (index + 1))
    ;[output[index], output[targetIndex]] = [output[targetIndex], output[index]]
  }

  return output
}
