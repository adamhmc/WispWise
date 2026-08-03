import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnswerOptions } from './AnswerOptions'

describe('AnswerOptions', () => {
  it('renders five named buttons and sends the selected object', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<AnswerOptions disabled={false} onSelect={onSelect} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)

    await user.click(screen.getByRole('button', { name: '選擇圓形' }))
    expect(onSelect).toHaveBeenCalledWith('ghost')
  })

  it('marks the selected answer and blocks clicks while disabled', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<AnswerOptions disabled selectedAnswer="chair" onSelect={onSelect} />)

    expect(screen.getByRole('button', { name: '選擇三角形' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    await user.click(screen.getByRole('button', { name: '選擇三角形' }))
    expect(onSelect).not.toHaveBeenCalled()
  })
})
