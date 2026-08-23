import { canonicalCardId, createCard } from './card'

describe('card', () => {
  const ghost = { objectId: 'ghost', colorId: 'blue' } as const
  const bottle = { objectId: 'bottle', colorId: 'red' } as const

  it('uses the same canonical ID when left and right are exchanged', () => {
    expect(canonicalCardId(ghost, bottle)).toBe(canonicalCardId(bottle, ghost))
  })

  it('uses different IDs for different displayed colors', () => {
    expect(canonicalCardId(ghost, bottle)).not.toBe(
      canonicalCardId({ ...ghost, colorId: 'green' }, bottle),
    )
  })

  it('rejects duplicate objects', () => {
    expect(() => createCard(ghost, { ...ghost, colorId: 'red' })).toThrow(
      'Card objects must be different',
    )
  })

  it('rejects duplicate colors', () => {
    expect(() => createCard(ghost, { ...bottle, colorId: 'blue' })).toThrow(
      'Card colors must be different',
    )
  })

  it('supports a third object and keeps its canonical ID order-independent', () => {
    const hat = { objectId: 'wizard-hat', colorId: 'purple' } as const
    const first = createCard(ghost, bottle, hat)
    const reordered = createCard(hat, ghost, bottle)

    expect(first.id).toBe(reordered.id)
    expect(first.third).toEqual(hat)
  })
})
