import { useState, type FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createRoomInviteUrl, type PublicRoomSnapshot, type TimeCompensationSeconds } from '@/multiplayer'
import { catalogForObjectCount, getFixedColor, type GameObjectCount } from '@/domain'
import { ObjectGlyph } from '@/ui/components/ObjectGlyph'
import { TimeCompensationSelect } from '@/ui/components/TimeCompensationSelect'
import { COLOR_PRESENTATION } from '@/ui/presentation'

interface MultiplayerLobbyScreenProps {
  readonly entryMode: 'create' | 'join'
  readonly initialRoomCode?: string
  readonly role: 'host' | 'player' | null
  readonly connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected'
  readonly startPending: boolean
  readonly snapshot: PublicRoomSnapshot | null
  readonly error: string | null
  readonly onCreate: () => void
  readonly onJoin: (roomCode: string, nickname: string) => void
  readonly onStart: () => void
  readonly onObjectCountChange: (objectCount: GameObjectCount) => void
  readonly onAutoAdvanceChange: (enabled: boolean) => void
  readonly onKickPlayer: (playerId: string) => void
  readonly onPlayerTimeCompensationChange: (playerId: string, seconds: TimeCompensationSeconds) => void
  readonly onBack: () => void
}

export function MultiplayerLobbyScreen({
  entryMode,
  initialRoomCode = '',
  role,
  connectionStatus,
  startPending,
  snapshot,
  error,
  onCreate,
  onJoin,
  onStart,
  onObjectCountChange,
  onAutoAdvanceChange,
  onKickPlayer,
  onPlayerTimeCompensationChange,
  onBack,
}: MultiplayerLobbyScreenProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode)
  const [nickname, setNickname] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const inviteUrl = snapshot ? createRoomInviteUrl(window.location.href, snapshot.roomCode) : ''

  const submitJoin = (event: FormEvent) => {
    event.preventDefault()
    onJoin(roomCode.trim().toUpperCase(), nickname.trim())
  }

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
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
              <p className="multiplayer-lead">建立後可在房間內選擇物品模式與自動換題設定。</p>
              <button className="primary-button" type="button" onClick={() => onCreate()} disabled={connectionStatus === 'connecting'}>
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
        <p className="room-mode-badge">本房間：{snapshot.objectCount} 物品模式</p>
        <div className="room-code-block"><span>房間代碼</span><strong>{snapshot.roomCode}</strong><small>請其他玩家在手機上輸入此代碼</small></div>
        {role === 'host' && (
          <section className="room-invite" aria-labelledby="room-invite-title">
            <QRCodeSVG value={inviteUrl} size={168} level="M" marginSize={2} aria-label="加入房間 QR Code" />
            <div>
              <h2 id="room-invite-title">掃描加入房間</h2>
              <p>玩家掃描 QR Code，或開啟邀請連結後輸入暱稱。</p>
              <button className="compact-button" type="button" onClick={() => void copyInvite()}>
                {copyStatus === 'copied' ? '已複製連結' : '複製加入連結'}
              </button>
              {copyStatus === 'failed' && <small role="alert">無法自動複製，請改用 QR Code。</small>}
            </div>
          </section>
        )}
        <div className="connection-pill" data-status={connectionStatus}>{connectionStatus === 'connected' ? '● 已連線' : '○ 連線中斷'}</div>
        <section className="room-object-guide" aria-labelledby="room-object-guide-title">
          <div className="room-object-guide__header">
            <div>
              <h2 id="room-object-guide-title">本局物品</h2>
              <p>先記住每個物品的標準造型與固定顏色</p>
            </div>
            <span>{snapshot.objectCount} 種</span>
          </div>
          <ul>
            {catalogForObjectCount(snapshot.objectCount).map((item) => {
              const colorId = getFixedColor(item.objectId)

              return (
                <li key={item.objectId}>
                  <ObjectGlyph objectId={item.objectId} colorId={colorId} />
                  <strong>{item.label}</strong>
                  <small>{COLOR_PRESENTATION[colorId].label}</small>
                </li>
              )
            })}
          </ul>
        </section>
        <div className="player-roster">
          <div className="player-roster__header"><h2>已加入玩家</h2><span>{snapshot.players.length} / 8</span></div>
          <p className="player-roster__help">補償秒數會從實際作答時間扣除，只影響計分，不延長 15 秒作答上限。</p>
          {snapshot.players.length === 0 ? <p className="empty-roster">還沒有玩家加入</p> : (
            <ul>{snapshot.players.map((player) => <li key={player.id}>
              <span className="player-avatar">{player.nickname.slice(0, 1)}</span>
              <strong>{player.nickname}</strong>
              <span className="player-roster__status">{player.connected ? '已連線' : '離線'}</span>
              {role === 'host' && (
                <>
                  <TimeCompensationSelect
                    nickname={player.nickname}
                    valueMs={player.timeCompensationMs}
                    onChange={(seconds) => onPlayerTimeCompensationChange(player.id, seconds)}
                  />
                  <button className="kick-player-button" type="button" onClick={() => onKickPlayer(player.id)} aria-label={`移除玩家 ${player.nickname}`}>移除</button>
                </>
              )}
              {role !== 'host' && player.timeCompensationMs > 0 && (
                <span className="time-compensation-badge">計分補償 +{player.timeCompensationMs / 1_000} 秒</span>
              )}
            </li>)}</ul>
          )}
        </div>
        {snapshot.phase !== 'lobby' ? (
          <div className="lobby-game-started" role="status">
            <strong>遊戲已開始</strong>
            <span>房間已進入第 1 題；多人題目與玩家作答畫面將在下一個開發階段接上。</span>
          </div>
        ) : role === 'host' ? (
          <div className="host-lobby-controls">
            <fieldset className="object-count-setting">
              <legend>選擇物品模式</legend>
              <label data-selected={snapshot.objectCount === 5 || undefined}>
                <input type="radio" name="object-count" value="5" checked={snapshot.objectCount === 5} onChange={() => onObjectCountChange(5)} />
                <strong>5 物品</strong><small>經典推理</small>
              </label>
              <label data-selected={snapshot.objectCount === 7 || undefined}>
                <input type="radio" name="object-count" value="7" checked={snapshot.objectCount === 7} onChange={() => onObjectCountChange(7)} />
                <strong>7 物品</strong><small>擴充圖庫</small>
              </label>
            </fieldset>
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
