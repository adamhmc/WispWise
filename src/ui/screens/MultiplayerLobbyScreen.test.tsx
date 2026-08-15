import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiplayerLobbyScreen } from './MultiplayerLobbyScreen'

const baseProps = {
  entryMode: 'join' as const,
  role: null,
  connectionStatus: 'idle' as const,
  startPending: false,
  snapshot: null,
  error: null,
  onCreate: vi.fn(),
  onJoin: vi.fn(),
  onStart: vi.fn(),
  onBack: vi.fn(),
}

describe('MultiplayerLobbyScreen', () => {
  it('submits a normalized room code and nickname', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    render(<MultiplayerLobbyScreen {...baseProps} onJoin={onJoin} />)
    await user.type(screen.getByLabelText('房間代碼'), 'wisp42')
    await user.type(screen.getByLabelText('玩家暱稱'), 'Ada')
    await user.click(screen.getByRole('button', { name: '加入房間' }))
    expect(onJoin).toHaveBeenCalledWith('WISP42', 'Ada')
  })

  it('shows the roster and enables start for a connected host with players', () => {
    render(
      <MultiplayerLobbyScreen
        {...baseProps}
        entryMode="create"
        role="host"
        connectionStatus="connected"
        snapshot={{
          protocolVersion: 1,
          roomCode: 'WISP42',
          revision: 1,
          phase: 'lobby',
          hostConnected: true,
          serverNowMs: 0,
          players: [{ id: 'p1', nickname: 'Ada', connected: true, score: 0, correctElapsedTotalMs: 0 }],
        }}
      />,
    )
    expect(screen.getByText('WISP42')).toBeTruthy()
    expect(screen.getByText('Ada')).toBeTruthy()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '開始 10 題挑戰' }).disabled).toBe(false)
  })

  it('removes the start action after the room enters play', () => {
    render(
      <MultiplayerLobbyScreen
        {...baseProps}
        entryMode="create"
        role="host"
        connectionStatus="connected"
        snapshot={{
          protocolVersion: 1,
          roomCode: 'WISP42',
          revision: 2,
          phase: 'playing',
          hostConnected: true,
          serverNowMs: 0,
          players: [{ id: 'p1', nickname: 'Ada', connected: true, score: 0, correctElapsedTotalMs: 0 }],
        }}
      />,
    )

    expect(screen.getByRole('status').textContent).toContain('遊戲已開始')
    expect(screen.queryByRole('button', { name: '開始 10 題挑戰' })).toBeNull()
  })
})
