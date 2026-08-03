import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

describe('App', () => {
  it('starts a game and accepts exactly one answer', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('heading', { name: '閃靈快手' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '開始遊戲' }))

    expect(await screen.findByRole('article', { name: '題目卡' })).toBeTruthy()
    const answerButtons = screen.getAllByRole('button', { name: /選擇/ })
    expect(answerButtons).toHaveLength(5)

    await user.click(answerButtons[0])
    expect(screen.getByRole('status')).toBeTruthy()
    expect(answerButtons.every((button) => button.hasAttribute('disabled'))).toBe(true)
  })

  it('opens and closes the provisional utility screens', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '玩法說明' }))
    expect(screen.getByRole('heading', { name: '兩種判斷方式' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '回首頁' }))
    expect(screen.getByRole('button', { name: '開始遊戲' })).toBeTruthy()
  })
})
