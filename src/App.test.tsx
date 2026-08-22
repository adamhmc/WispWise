import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

describe('App', () => {
  afterEach(() => window.history.replaceState(null, '', '/'))

  it('opens the first-play tutorial and accepts exactly one answer', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('heading', { name: '靈機一選' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '開始遊戲' }))
    await user.click(screen.getByRole('button', { name: /單人遊戲/ }))
    await user.click(screen.getByRole('button', { name: /10 題練習/ }))

    expect(screen.getByRole('heading', { name: '先找直接匹配' })).toBeTruthy()
    expect(await screen.findByRole('article', { name: '題目卡' })).toBeTruthy()
    const answerButtons = screen.getAllByRole('button', { name: /選擇/ })
    expect(answerButtons).toHaveLength(5)

    await user.click(answerButtons[0])
    expect(screen.getByRole('status')).toBeTruthy()
    expect(answerButtons.every((button) => button.hasAttribute('disabled'))).toBe(true)
  })

  it('opens and closes the complete rules screen', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '玩法說明' }))
    expect(screen.getByRole('heading', { name: '找出唯一正解' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '回首頁' }))
    expect(screen.getByRole('button', { name: '開始遊戲' })).toBeTruthy()
  })

  it('navigates from game mode to multiplayer role selection', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '開始遊戲' }))
    expect(screen.getByRole('heading', { name: '選擇遊戲模式' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /多人遊戲/ }))
    expect(screen.getByRole('heading', { name: '多人遊戲' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /擔任 Host/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /加入房間/ })).toBeTruthy()
  })

  it('opens the join screen and prefills a room code from an invite URL', () => {
    window.history.replaceState(null, '', '/?room=ABC234')
    render(<App />)

    expect(screen.getByRole('heading', { name: '加入房間' })).toBeTruthy()
    expect(screen.getByLabelText<HTMLInputElement>('房間代碼').value).toBe('ABC234')
  })

  it('persists preferences but does not expose history controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '設定' }))
    await user.click(screen.getByRole('checkbox', { name: '自動換題' }))

    expect(window.localStorage.getItem('wispwise.preferences.v1')).toContain('"explanationsEnabled":false')
    expect(screen.queryByText(/歷史戰績/)).toBeNull()
  })
})
