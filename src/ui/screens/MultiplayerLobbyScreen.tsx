import { useState, type FormEvent } from 'react'
import type { PublicRoomSnapshot } from '@/multiplayer'

interface MultiplayerLobbyScreenProps {
  readonly entryMode: 'create' | 'join'
  readonly role: 'host' | 'player' | null
  readonly connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected'
  readonly startPending: boolean
  readonly snapshot: PublicRoomSnapshot | null
  readonly error: string | null
  readonly onCreate: () => void
  readonly onJoin: (roomCode: string, nickname: string) => void
  readonly onStart: () => void
  readonly onAutoAdvanceChange: (enabled: boolean) => void
  readonly onBack: () => void
}

export function MultiplayerLobbyScreen({
  entryMode,
  role,
  connectionStatus,
  startPending,
  snapshot,
  error,
  onCreate,
  onJoin,
  onStart,
  onAutoAdvanceChange,
  onBack,
}: MultiplayerLobbyScreenProps) {
  const [roomCode, setRoomCode] = useState('')
  const [nickname, setNickname] = useState('')

  const submitJoin = (event: FormEvent) => {
    event.preventDefault()
    onJoin(roomCode.trim().toUpperCase(), nickname.trim())
  }

  if (!snapshot) {
    return (
      <main className="multiplayer-screen">
        <section className="multiplayer-card">
          <button className="text-button multiplayer-back" type="button" onClick={onBack}>← 返回</button>
          <div className="brand-lockup">
            <span className="brand-ghost" aria-hidden="true" />
            <div><p className="eyebrow">WispWise 多人模式</p><h1>{entryMode === 'create' ? '建立房間' : '加入房間'}</h1></div>
          </div>
          {entryMode === 'create' ? (
            <>
              <p className="multiplayer-lead">這台裝置將作為 Host，放在桌上顯示題目與全場狀態。</p>
              <button className="primary-button" type="button" onClick={onCreate} disabled={connectionStatus === 'connecting'}>
                {connectionStatus === 'connecting' ? '正在建立…' : '產生房間代碼'}
              </button>
            </>
          ) : (
            <form className="join-form" onSubmit={submitJoin}>
              <label>房間代碼<input value={roomCode} onChange={(event) => setRoomCode(event.target.value)} maxLength={6} autoCapitalize="characters" placeholder="例如 WISP42" required /></label>
              <label>玩家暱稱<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={20} placeholder="你的名字" required /></label>
              <button className="primary-button" type="submit" disabled={connectionStatus === 'connecting'}>{connectionStatus === 'connecting' ? '正在加入…' : '加入房間'}</button>
            </form>
          )}
          {error && <p className="lobby-error" role="alert">{error}</p>}
        </section>
      </main>
    )
  }

  return (
    <main className="multiplayer-screen">
      <section className="multiplayer-card lobby-card">
        <button className="text-button multiplayer-back" type="button" onClick={onBack}>← 離開房間</button>
        <p className="eyebrow">WispWise 多人模式</p>
        <h1>{role === 'host' ? '房間已建立' : '等待 Host 開始'}</h1>
        <div className="room-code-block"><span>房間代碼</span><strong>{snapshot.roomCode}</strong><small>請其他玩家在手機上輸入此代碼</small></div>
        <div className="connection-pill" data-status={connectionStatus}>{connectionStatus === 'connected' ? '● 已連線' : '○ 連線中斷'}</div>
        <div className="player-roster">
          <div className="player-roster__header"><h2>已加入玩家</h2><span>{snapshot.players.length} / 8</span></div>
          {snapshot.players.length === 0 ? <p className="empty-roster">還沒有玩家加入</p> : (
            <ul>{snapshot.players.map((player) => <li key={player.id}><span className="player-avatar">{player.nickname.slice(0, 1)}</span><strong>{player.nickname}</strong><span>{player.connected ? '已連線' : '離線'}</span></li>)}</ul>
          )}
        </div>
        {snapshot.phase !== 'lobby' ? (
          <div className="lobby-game-started" role="status">
            <strong>遊戲已開始</strong>
            <span>房間已進入第 1 題；多人題目與玩家作答畫面將在下一個開發階段接上。</span>
          </div>
        ) : role === 'host' ? (
          <div className="host-lobby-controls">
            <label className="auto-advance-setting">
              <span><strong>自動進行下一題</strong><small>開啟後，結算 5 秒會自動繼續</small></span>
              <input
                type="checkbox"
                aria-label="自動進行下一題"
                checked={snapshot.autoAdvanceSeconds !== null}
                onChange={(event) => onAutoAdvanceChange(event.target.checked)}
              />
            </label>
            <button
              className="primary-button"
              type="button"
              onClick={onStart}
              disabled={snapshot.players.length === 0 || connectionStatus !== 'connected' || startPending}
            >
              {startPending ? '正在開始…' : '開始 10 題挑戰'}
            </button>
          </div>
        ) : <p className="waiting-hint">題目會顯示在 Host 裝置；你的手機只會顯示作答選項。</p>}
        {error && <p className="lobby-error" role="alert">{error}</p>}
      </section>
    </main>
  )
}
