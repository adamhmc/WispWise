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
  onAutoAdvanceChange: vi.fn(),
  onBack: vi.fn(),
}

describe('MultiplayerLobbyScreen', () => {
  it('lets a Host create either a five- or seven-object room', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(<MultiplayerLobbyScreen {...baseProps} entryMode="create" onCreate={onCreate} />)

    await user.click(screen.getByRole('radio', { name: /7 物品/ }))
    await user.click(screen.getByRole('button', { name: '產生房間代碼' }))
    expect(onCreate).toHaveBeenCalledWith(7)
  })

  it('submits a normalized room code and nickname', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    render(<MultiplayerLobbyScreen {...baseProps} onJoin={onJoin} />)
    await user.type(screen.getByLabelText('房間代碼'), 'wisp42')
    await user.type(screen.getByLabelText('玩家暱稱'), 'Ada')
    await user.click(screen.getByRole('button', { name: '加入房間' }))
    expect(onJoin).toHaveBeenCalledWith('WISP42', 'Ada')
  })

  it('prefills a room code supplied by an invite link', () => {
    render(<MultiplayerLobbyScreen {...baseProps} initialRoomCode="WISP42" />)
    expect(screen.getByLabelText<HTMLInputElement>('房間代碼').value).toBe('WISP42')
  })

  it('shows the roster and enables start for a connected host with players', () => {
    render(
      <MultiplayerLobbyScreen
        {...baseProps}
        entryMode="create"
        role="host"
        connectionStatus="connected"
        snapshot={{
          protocolVersion: 3,
          roomCode: 'WISP42',
          revision: 1,
          phase: 'lobby',
          objectCount: 5,
          hostConnected: true,
          serverNowMs: 0,
          players: [{ id: 'p1', nickname: 'Ada', connected: true, score: 0, correctElapsedTotalMs: 0 }],
          autoAdvanceSeconds: null,
        }}
      />,
    )
    expect(screen.getByText('WISP42')).toBeTruthy()
    expect(screen.getByText('Ada')).toBeTruthy()
    expect(screen.getByText('本房間：5 物品模式')).toBeTruthy()
    expect(screen.getByLabelText('加入房間 QR Code')).toBeTruthy()
    expect(screen.getByRole('button', { name: '複製加入連結' })).toBeTruthy()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '開始 10 題挑戰' }).disabled).toBe(false)
  })

  it('lets the Host enable automatic next-question progression', async () => {
    const user = userEvent.setup()
    const onAutoAdvanceChange = vi.fn()
    render(
      <MultiplayerLobbyScreen
        {...baseProps}
        entryMode="create"
        role="host"
        connectionStatus="connected"
        onAutoAdvanceChange={onAutoAdvanceChange}
        snapshot={{
          protocolVersion: 3,
          roomCode: 'WISP42',
          revision: 1,
          phase: 'lobby',
          objectCount: 5,
          hostConnected: true,
          serverNowMs: 0,
          players: [],
          autoAdvanceSeconds: null,
        }}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: '自動進行下一題' }))
    expect(onAutoAdvanceChange).toHaveBeenCalledWith(true)
  })

  it('removes the start action after the room enters play', () => {
    render(
      <MultiplayerLobbyScreen
        {...baseProps}
        entryMode="create"
        role="host"
        connectionStatus="connected"
        snapshot={{
          protocolVersion: 3,
          roomCode: 'WISP42',
          revision: 2,
          phase: 'playing',
          objectCount: 5,
          hostConnected: true,
          serverNowMs: 0,
          players: [{ id: 'p1', nickname: 'Ada', connected: true, score: 0, correctElapsedTotalMs: 0 }],
          autoAdvanceSeconds: null,
        }}
      />,
    )

    expect(screen.getByRole('status').textContent).toContain('遊戲已開始')
    expect(screen.queryByRole('button', { name: '開始 10 題挑戰' })).toBeNull()
  })
})
