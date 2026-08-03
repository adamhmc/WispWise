import { render, screen } from '@testing-library/react'
import { COLOR_IDS, OBJECT_IDS } from '@/domain'
import { COLOR_PRESENTATION, PHASE_ONE_OBJECTS } from '@/ui/presentation'
import { ObjectGlyph } from './ObjectGlyph'

const combinations = OBJECT_IDS.flatMap((objectId) =>
  COLOR_IDS.map((colorId) => ({ objectId, colorId })),
)

describe('ObjectGlyph', () => {
  it.each(combinations)('renders $objectId using $colorId', ({ objectId, colorId }) => {
    render(<ObjectGlyph objectId={objectId} colorId={colorId} />)

    const label = `${COLOR_PRESENTATION[colorId].label}${PHASE_ONE_OBJECTS[objectId].label}`
    expect(screen.getByRole('img', { name: label })).toBeTruthy()
  })

  it('marks a wrong-color ghost for full-body recoloring', () => {
    render(<ObjectGlyph objectId="ghost" colorId="red" />)

    const ghost = screen.getByRole('img', { name: '紅色鬼' })
    expect(ghost.dataset.object).toBe('ghost')
    expect(ghost.dataset.recolored).toBe('true')
  })
})
