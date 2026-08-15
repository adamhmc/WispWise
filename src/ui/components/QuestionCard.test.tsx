import { render, screen } from '@testing-library/react'
import { createCard } from '@/domain'
import { QuestionCard } from './QuestionCard'

describe('QuestionCard', () => {
  it('renders both displayed objects as a fallback when artwork is unavailable', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'white' },
      { objectId: 'chair', colorId: 'red' },
    )

    render(<QuestionCard card={card} />)

    expect(screen.getByRole('article', { name: '題目卡' })).toBeTruthy()
    expect(screen.getByRole('img', { name: '白色鬼' })).toBeTruthy()
    expect(screen.getByRole('img', { name: '紅色椅子' })).toBeTruthy()
  })

  it('selects approved library artwork for a legal card by default', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'blue' },
      { objectId: 'bottle', colorId: 'red' },
    )

    render(<QuestionCard card={card} />)

    expect(screen.getByRole('img', { name: '藍色鬼與紅色瓶子的互動場景' })).toBeTruthy()
    expect(screen.queryByRole('img', { name: '藍色鬼' })).toBeNull()
  })

  it('uses approved artwork when provided instead of the fallback composition', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'blue' },
      { objectId: 'bottle', colorId: 'red' },
    )

    render(<QuestionCard card={card} artwork={{
      id: 'pilot-a',
      imageUrl: '/pilot.webp',
      alt: '藍色鬼與紅色瓶子的互動場景',
      status: 'approved',
    }} />)

    expect(screen.getByRole('img', { name: '藍色鬼與紅色瓶子的互動場景' })).toBeTruthy()
    expect(screen.queryByRole('img', { name: '藍色鬼' })).toBeNull()
  })
})
