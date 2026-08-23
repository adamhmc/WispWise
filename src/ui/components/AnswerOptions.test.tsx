import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnswerOptions } from './AnswerOptions'

describe('AnswerOptions', () => {
  it('shows all seven choices in expanded mode', () => {
    render(<AnswerOptions objectCount={7} disabled={false} onSelect={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(7)
    expect(screen.getByRole('button', { name: '選擇南瓜' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '選擇巫師帽' })).toBeTruthy()
  })

  it('renders five named buttons and sends the selected object', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<AnswerOptions disabled={false} onSelect={onSelect} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)

    await user.click(screen.getByRole('button', { name: '選擇鬼' }))
    expect(onSelect).toHaveBeenCalledWith('ghost')
  })

  it('marks the selected answer and blocks clicks while disabled', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<AnswerOptions disabled selectedAnswer="chair" onSelect={onSelect} />)

    const selected = screen.getByRole('button', { name: '選擇椅子' })
    expect(selected.getAttribute('aria-pressed')).toBe('true')
    expect(selected.querySelector('[data-selection-confirmed]')?.textContent).toBe('✓')
    await user.click(screen.getByRole('button', { name: '選擇椅子' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('shows both correct and incorrect outcomes without relying on color alone', () => {
    render(
      <AnswerOptions
        disabled
        selectedAnswer="chair"
        correctAnswer="ghost"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '選擇鬼' }).dataset.status).toBe('correct')
    expect(screen.getByRole('button', { name: '選擇椅子' }).dataset.status).toBe('incorrect')
  })
})
