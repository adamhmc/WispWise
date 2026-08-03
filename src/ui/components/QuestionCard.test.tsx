import { render, screen } from '@testing-library/react'
import { createCard } from '@/domain'
import { QuestionCard } from './QuestionCard'

describe('QuestionCard', () => {
  it('renders both displayed objects with accessible color and shape names', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'blue' },
      { objectId: 'bottle', colorId: 'red' },
    )

    render(<QuestionCard card={card} />)

    expect(screen.getByRole('article', { name: '題目卡' })).toBeTruthy()
    expect(screen.getByRole('img', { name: '藍色鬼' })).toBeTruthy()
    expect(screen.getByRole('img', { name: '紅色瓶子' })).toBeTruthy()
  })
})
