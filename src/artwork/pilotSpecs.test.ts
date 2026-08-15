import {
  createExpansionArtworkSpecs,
  createPilotArtworkSpecs,
  createRemainingArtworkSpecs,
  PILOT_ARTWORK_CARD_IDS,
} from './pilotSpecs'

describe('pilot artwork specs', () => {
  it('exports five direct and five exclusion cards with exact subject constraints', () => {
    const specs = createPilotArtworkSpecs()
    expect(specs).toHaveLength(10)
    expect(specs.filter(({ kind }) => kind === 'direct')).toHaveLength(5)
    expect(specs.filter(({ kind }) => kind === 'exclusion')).toHaveLength(5)
    expect(new Set(specs.map(({ cardId }) => cardId)).size).toBe(10)
    expect(new Set(specs.slice(0, 5).map(({ cardId }) => cardId.split(':')[0])).size).toBeGreaterThan(1)
    expect(specs.every(({ prompt }) => prompt.includes('exactly two primary game objects'))).toBe(true)
    expect(specs.every(({ referenceAssetKeys }) => referenceAssetKeys.every(Boolean))).toBe(true)
    expect(specs.every(({ prompt }) => prompt.includes('do not redesign them'))).toBe(true)
    expect(specs.every(({ prompt }) => prompt.includes('do not add faces or limbs'))).toBe(true)
    expect(specs.every(({ prompt }) => prompt.includes('white objects must use neutral pure white'))).toBe(true)
    expect(specs.every(({ prompt }) => prompt.includes('darker neutral gray (#667085)'))).toBe(true)
  })

  it('exports twenty new balanced cards with all object pairs represented', () => {
    const specs = createExpansionArtworkSpecs()
    const pilotIds = new Set<string>(PILOT_ARTWORK_CARD_IDS)

    expect(specs).toHaveLength(20)
    expect(specs.filter(({ kind }) => kind === 'direct')).toHaveLength(10)
    expect(specs.filter(({ kind }) => kind === 'exclusion')).toHaveLength(10)
    expect(specs.every(({ cardId }) => !pilotIds.has(cardId))).toBe(true)
    expect(new Set(specs.map(({ cardId }) => cardId)).size).toBe(20)
    expect(new Set(specs.slice(0, 10).map(({ referenceAssetKeys }) => [...referenceAssetKeys].sort().join('|'))).size).toBe(10)
    expect(new Set(specs.slice(10).map(({ referenceAssetKeys }) => [...referenceAssetKeys].sort().join('|'))).size).toBe(10)
    expect(specs.every(({ prompt }) => prompt.includes('white objects must use neutral pure white'))).toBe(true)
    expect(specs.every(({ prompt }) => prompt.includes('darker neutral gray (#667085)'))).toBe(true)
  })

  it('exports all ninety remaining legal cards with strict color contrast prompts', () => {
    const pilotIds = new Set<string>(PILOT_ARTWORK_CARD_IDS)
    const expansionIds = new Set(createExpansionArtworkSpecs().map(({ cardId }) => cardId))
    const specs = createRemainingArtworkSpecs()

    expect(specs).toHaveLength(90)
    expect(specs.filter(({ kind }) => kind === 'direct')).toHaveLength(45)
    expect(specs.filter(({ kind }) => kind === 'exclusion')).toHaveLength(45)
    expect(new Set(specs.map(({ cardId }) => cardId)).size).toBe(90)
    expect(specs.every(({ cardId }) => !pilotIds.has(cardId) && !expansionIds.has(cardId))).toBe(true)
    expect(specs.every(({ prompt }) => prompt.includes('neutral pure white (#ffffff)'))).toBe(true)
    expect(specs.every(({ prompt }) => prompt.includes('darker neutral gray (#667085)'))).toBe(true)
  })
})
