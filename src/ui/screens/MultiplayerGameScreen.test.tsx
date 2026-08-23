import { render, screen } from '@testing-library/react'
import { createCard } from '@/domain'
import type { PublicRoomSnapshot } from '@/multiplayer'
import { MultiplayerGameScreen } from './MultiplayerGameScreen'

const card = createCard(
  { objectId: 'ghost', colorId: 'red' },
  { objectId: 'chair', colorId: 'blue' },
)

function snapshot(phase: PublicRoomSnapshot['phase']): PublicRoomSnapshot {
  return {
    protocolVersion: 3,
    roomCode: 'WISP42',
    revision: 2,
    phase,
    objectCount: 5,
    hostConnected: true,
    serverNowMs: Date.now(),
    players: [
      { id: 'p1', nickname: 'Ada', connected: true, score: 1000, correctElapsedTotalMs: 1200 },
      { id: 'p2', nickname: 'Lin', connected: true, score: 0, correctElapsedTotalMs: 0 },
    ],
    autoAdvanceSeconds: null,
    round: {
      id: 'round-1',
      number: 1,
      total: 10,
      card,
      deadlineAtMs: Date.now() + 15_000,
      remainingMs: 15_000,
      answeredPlayerIds: ['p1'],
    },
    ...(phase === 'results'
      ? {
          correctAnswer: 'ghost' as const,
          results: [{ playerId: 'p1', answer: 'ghost' as const, isCorrect: true, elapsedMs: 1200, pointsAwarded: 1000 }],
        }
      : {}),
  }
}

const handlers = { onAnswer: vi.fn(), onAdvance: vi.fn(), onRematch: vi.fn(), onExit: vi.fn() }

describe('MultiplayerGameScreen', () => {
  it('shows the question and player answer progress on the Host', () => {
    render(
      <MultiplayerGameScreen
        role="host"
        actorId={null}
        connectionStatus="connected"
        snapshot={snapshot('playing')}
        snapshotReceivedAtMs={Date.now()}
        error={null}
        {...handlers}
      />,
    )

    expect(screen.getByRole('article', { name: '題目卡' })).toBeTruthy()
    expect(screen.getByRole('complementary', { name: '玩家作答進度' }).textContent).toContain('Ada')
    expect(screen.queryByRole('button', { name: '選擇鬼' })).toBeNull()
  })

  it('shows answer choices without the card on a player device', () => {
    const { rerender } = render(
      <MultiplayerGameScreen
        role="player"
        actorId="p2"
        connectionStatus="connected"
        snapshot={snapshot('playing')}
        snapshotReceivedAtMs={Date.now()}
        error={null}
        {...handlers}
      />,
    )

    expect(screen.queryByRole('article', { name: '題目卡' })).toBeNull()
    expect(screen.getByRole('button', { name: '選擇鬼' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '選擇正確物品' })).toBeTruthy()

    rerender(
      <MultiplayerGameScreen
        role="player"
        actorId="p1"
        connectionStatus="connected"
        snapshot={snapshot('playing')}
        snapshotReceivedAtMs={Date.now()}
        selectedAnswer="ghost"
        error={null}
        {...handlers}
      />,
    )
    const selected = screen.getByRole<HTMLButtonElement>('button', { name: '選擇鬼' })
    expect(selected.disabled).toBe(true)
    expect(selected.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('status').textContent).toContain('已選擇：鬼')
    expect(screen.getByRole('status').textContent).toContain('答案已鎖定')
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '選擇椅子' }).disabled).toBe(true)
    expect(screen.queryByText('正確答案')).toBeNull()
  })

  it('shows seven choices when the Host created an expanded room', () => {
    render(
      <MultiplayerGameScreen
        role="player"
        actorId="p2"
        connectionStatus="connected"
        snapshot={{ ...snapshot('playing'), objectCount: 7 }}
        snapshotReceivedAtMs={Date.now()}
        error={null}
        {...handlers}
      />,
    )

    expect(screen.getAllByRole('button', { name: /選擇/ })).toHaveLength(7)
    expect(screen.getByRole('button', { name: '選擇南瓜' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '選擇巫師帽' })).toBeTruthy()
  })

  it('shows round results and lets only the Host advance', () => {
    const { rerender } = render(
      <MultiplayerGameScreen
        role="host"
        actorId={null}
        connectionStatus="connected"
        snapshot={snapshot('results')}
        snapshotReceivedAtMs={Date.now()}
        error={null}
        {...handlers}
      />,
    )
    expect(screen.getByRole('heading', { name: '正確答案' })).toBeTruthy()
    expect(screen.getByRole('article', { name: '題目卡' })).toBeTruthy()
    expect(screen.getByText('原本題目')).toBeTruthy()
    expect(screen.getByRole('button', { name: '下一題' })).toBeTruthy()

    rerender(
      <MultiplayerGameScreen
        role="player"
        actorId="p1"
        connectionStatus="connected"
        snapshot={snapshot('results')}
        snapshotReceivedAtMs={Date.now()}
        error={null}
        {...handlers}
      />,
    )
    expect(screen.getByRole('heading', { name: '答對了！' })).toBeTruthy()
    expect(screen.getByText('你的選擇：', { exact: false }).textContent).toContain('鬼')
    expect(screen.queryByRole('button', { name: '下一題' })).toBeNull()
  })

  it('shows the server-synchronized automatic advance countdown', () => {
    render(
      <MultiplayerGameScreen
        role="player"
        actorId="p1"
        connectionStatus="connected"
        snapshot={{
          ...snapshot('results'),
          autoAdvanceSeconds: 5,
          autoAdvanceAtMs: Date.now() + 5_000,
          autoAdvanceRemainingMs: 5_000,
        }}
        snapshotReceivedAtMs={Date.now()}
        error={null}
        {...handlers}
      />,
    )
    expect(screen.getByRole('timer').textContent).toContain('下一題將在 5 秒後顯示')
    expect(screen.queryByText('等待 Host 開始下一題…')).toBeNull()
  })

  it('orders the final ranking by score and response time', () => {
    const finished = { ...snapshot('results'), phase: 'finished' as const }
    render(
      <MultiplayerGameScreen
        role="host"
        actorId={null}
        connectionStatus="connected"
        snapshot={finished}
        snapshotReceivedAtMs={Date.now()}
        error={null}
        {...handlers}
      />,
    )
    const ranking = screen.getByRole('list').textContent ?? ''
    expect(ranking.indexOf('Ada')).toBeLessThan(ranking.indexOf('Lin'))
    expect(screen.getByRole('heading', { name: '最終排名' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '再玩一局' })).toBeTruthy()
  })

  it('asks players to wait for the Host after the final ranking', () => {
    render(
      <MultiplayerGameScreen
        role="player"
        actorId="p1"
        connectionStatus="connected"
        snapshot={{ ...snapshot('results'), phase: 'finished' }}
        snapshotReceivedAtMs={Date.now()}
        error={null}
        {...handlers}
      />,
    )
    expect(screen.getByText('等待 Host 決定是否再玩一局…')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '再玩一局' })).toBeNull()
  })
})
