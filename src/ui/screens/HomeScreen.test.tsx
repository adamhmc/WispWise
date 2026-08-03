import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeScreen } from './HomeScreen'

describe('HomeScreen', () => {
  it('exposes start, rules, and settings actions', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    const onOpenRules = vi.fn()
    const onOpenSettings = vi.fn()

    render(
      <HomeScreen
        onStart={onStart}
        onOpenRules={onOpenRules}
        onOpenSettings={onOpenSettings}
      />,
    )

    await user.click(screen.getByRole('button', { name: '開始遊戲' }))
    await user.click(screen.getByRole('button', { name: '玩法說明' }))
    await user.click(screen.getByRole('button', { name: '設定' }))

    expect(onStart).toHaveBeenCalledOnce()
    expect(onOpenRules).toHaveBeenCalledOnce()
    expect(onOpenSettings).toHaveBeenCalledOnce()
  })
})
