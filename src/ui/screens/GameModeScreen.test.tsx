import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameModeScreen } from './GameModeScreen'

const handlers = {
  onSolo: vi.fn(),
  onMultiplayer: vi.fn(),
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

  it('offers Host and player roles on the multiplayer step', async () => {
    const user = userEvent.setup()
    render(<GameModeScreen step="multiplayer-role" {...handlers} />)

    await user.click(screen.getByRole('button', { name: /擔任 Host/ }))
    await user.click(screen.getByRole('button', { name: /加入房間/ }))

    expect(handlers.onCreateRoom).toHaveBeenCalledOnce()
    expect(handlers.onJoinRoom).toHaveBeenCalledOnce()
  })
})
