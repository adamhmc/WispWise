import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameModeScreen } from './GameModeScreen'

const handlers = {
  selectedObjectCount: 5 as const,
  onSolo: vi.fn(),
  onMultiplayer: vi.fn(),
  onClassic: vi.fn(),
  onTimed: vi.fn(),
  onObjectCount: vi.fn(),
  onCreateRoom: vi.fn(),
  onJoinRoom: vi.fn(),
  onBack: vi.fn(),
}

describe('GameModeScreen', () => {
  it('offers solo and multiplayer on the first step', async () => {
    const user = userEvent.setup()
    render(<GameModeScreen step="game-mode" {...handlers} />)

    await user.click(screen.getByRole('button', { name: /單人遊戲/ }))
    await user.click(screen.getByRole('button', { name: /多人遊戲/ }))

    expect(handlers.onSolo).toHaveBeenCalledOnce()
    expect(handlers.onMultiplayer).toHaveBeenCalledOnce()
  })

  it('offers classic and 60-second solo modes', async () => {
    const user = userEvent.setup()
    render(<GameModeScreen step="solo-mode" {...handlers} />)

    await user.click(screen.getByRole('button', { name: /10 題練習/ }))
    await user.click(screen.getByRole('button', { name: /60 秒挑戰/ }))
    expect(handlers.onClassic).toHaveBeenCalledOnce()
    expect(handlers.onTimed).toHaveBeenCalledOnce()
  })

  it('offers five and seven objects before selecting the solo pace', async () => {
    const user = userEvent.setup()
    render(<GameModeScreen step="solo-object-count" {...handlers} />)

    await user.click(screen.getByRole('button', { name: /5 物品經典模式/ }))
    await user.click(screen.getByRole('button', { name: /7 物品擴充模式/ }))
    expect(handlers.onObjectCount).toHaveBeenNthCalledWith(1, 5)
    expect(handlers.onObjectCount).toHaveBeenNthCalledWith(2, 7)
  })

  it('offers Host and player roles on the multiplayer step', async () => {
    const user = userEvent.setup()
    render(<GameModeScreen step="multiplayer-role" {...handlers} />)

    await user.click(screen.getByRole('button', { name: /擔任 Host/ }))
    await user.click(screen.getByRole('button', { name: /加入房間/ }))

    expect(handlers.onCreateRoom).toHaveBeenCalledOnce()
    expect(handlers.onJoinRoom).toHaveBeenCalledOnce()
  })
})
