import { shuffle } from './shuffle'

describe('shuffle', () => {
  it('is deterministic with an injected random source and does not mutate input', () => {
    const input = [1, 2, 3, 4]
    const values = [0, 0.5, 0.75]
    const output = shuffle(input, () => values.shift() ?? 0)

    expect(output).toEqual([4, 3, 2, 1])
    expect(input).toEqual([1, 2, 3, 4])
  })

  it.each([-0.1, 1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid random value %s',
    (value) => {
      expect(() => shuffle([1, 2], () => value)).toThrow('finite value from 0 up to 1')
    },
  )
})
