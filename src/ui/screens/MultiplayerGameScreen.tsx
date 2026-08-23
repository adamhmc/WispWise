import { useEffect, useState } from 'react'
import { getCatalogItem, getFixedColor, type ObjectId } from '@/domain'
import {
  findPlayerResult,
  hasPlayerAnswered,
  rankPublicPlayers,
  estimateRemainingSeconds,
  type PublicRound,
  type PublicRoomSnapshot,
} from '@/multiplayer'
import { AnswerOptions } from '@/ui/components/AnswerOptions'
import { ObjectGlyph } from '@/ui/components/ObjectGlyph'
import { QuestionCard } from '@/ui/components/QuestionCard'

interface MultiplayerGameScreenProps {
  readonly role: 'host' | 'player'
  readonly actorId: string | null
  readonly connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected'
  readonly snapshot: PublicRoomSnapshot
  readonly snapshotReceivedAtMs: number
  readonly selectedAnswer?: ObjectId
  readonly error: string | null
  readonly onAnswer: (answer: ObjectId) => void
  readonly onAdvance: () => void
  readonly onRematch: () => void
  readonly onExit: () => void
}

function useRemainingSeconds(
  serverRemainingMs: number | undefined,
  snapshotReceivedAtMs: number,
  active: boolean,
): number {
  const [nowMs, setNowMs] = useState(Date.now)

  useEffect(() => {
    if (!active || serverRemainingMs === undefined) return
    const timer = window.setInterval(() => setNowMs(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [active, serverRemainingMs])

  return estimateRemainingSeconds(serverRemainingMs, snapshotReceivedAtMs, nowMs)
}

function MultiplayerHeader({ snapshot, onExit }: { readonly snapshot: PublicRoomSnapshot; readonly onExit: () => void }) {
  const roundNumber = snapshot.round?.number ?? snapshot.round?.total ?? 10
  const total = snapshot.round?.total ?? 10
  return (
    <header className="game-header multiplayer-game__header">
      <button className="brand-button" type="button" onClick={onExit} aria-label="離開多人遊戲回首頁">
        <span className="brand-ghost" aria-hidden="true" />
        <span className="brand-name"><small>WispWise</small>多人挑戰</span>
      </button>
      <div className="game-title" aria-hidden="true"><small>ROOM {snapshot.roomCode}</small> WISPWISE!</div>
      <div className="game-header__progress" aria-label={`第 ${roundNumber} 題，共 ${total} 題`}>
        <span>第 {roundNumber} 題</span>
        <span className="progress-track" aria-hidden="true"><span style={{ width: `${(roundNumber / total) * 100}%` }} /></span>
      </div>
    </header>
  )
}

function PlayerProgress({ snapshot }: { readonly snapshot: PublicRoomSnapshot }) {
  const answered = new Set(snapshot.round?.answeredPlayerIds ?? [])
  return (
    <aside className="multiplayer-roster" aria-label="玩家作答進度">
      <h2>玩家作答</h2>
      <ul>
        {snapshot.players.map((player) => (
          <li key={player.id} data-answered={answered.has(player.id) || undefined}>
            <span className="player-avatar" aria-hidden="true" />
            <span><strong>{player.nickname}</strong><small>{player.score} 分</small></span>
            <b>{answered.has(player.id) ? '✓' : '…'}</b>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function RoundResults({
  snapshot,
  round,
  role,
  actorId,
  onAdvance,
  autoAdvanceRemainingSeconds,
}: {
  readonly snapshot: PublicRoomSnapshot
  readonly round: PublicRound
  readonly role: 'host' | 'player'
  readonly actorId: string | null
  readonly onAdvance: () => void
  readonly autoAdvanceRemainingSeconds: number | null
}) {
  const correctAnswer = snapshot.correctAnswer
  const playerResult = findPlayerResult(snapshot, actorId)
  const isLastRound = round.number === round.total

  return (
    <section className="multiplayer-results" aria-labelledby="round-result-title">
      <p className="eyebrow">本題結算</p>
      <h1 id="round-result-title">
        {role === 'player' && playerResult
          ? playerResult.isCorrect ? '答對了！' : '這題答錯了'
          : '正確答案'}
      </h1>
      <div className="round-review">
        <div className="round-review__card">
          <span>原本題目</span>
          <QuestionCard card={round.card} />
        </div>
        <div className="round-review__answer">
          {role === 'player' && playerResult && (
            <p className="player-answer-receipt" data-correct={playerResult.isCorrect || undefined}>
              <span aria-hidden="true">{playerResult.isCorrect ? '✓' : '×'}</span>
              你的選擇：<strong>{getCatalogItem(playerResult.answer).label}</strong>
            </p>
          )}
          {correctAnswer && (
            <div className="correct-object">
              <ObjectGlyph objectId={correctAnswer} colorId={getFixedColor(correctAnswer)} />
              <span><small>正確答案</small><strong>{getCatalogItem(correctAnswer).label}</strong></span>
            </div>
          )}
        </div>
      </div>
      <ol className="round-result-list">
        {snapshot.players.map((player) => {
          const result = snapshot.results?.find(({ playerId }) => playerId === player.id)
          return (
            <li key={player.id}>
              <strong>{player.nickname}</strong>
              <span>{result ? `${(result.elapsedMs / 1000).toFixed(1)} 秒` : '未作答'}</span>
              <b data-correct={result?.isCorrect || undefined}>+{result?.pointsAwarded ?? 0}</b>
            </li>
          )
        })}
      </ol>
      {autoAdvanceRemainingSeconds !== null && (
        <p className="auto-advance-countdown" role="timer">
          {isLastRound ? '最終排名' : '下一題'}將在 <strong>{autoAdvanceRemainingSeconds}</strong> 秒後顯示
        </p>
      )}
      {role === 'host' ? (
        <button className="primary-button" type="button" onClick={onAdvance}>
          {isLastRound ? '查看最終排名' : '下一題'}
        </button>
      ) : autoAdvanceRemainingSeconds === null
        ? <p className="waiting-hint">等待 Host 開始下一題…</p>
        : null}
    </section>
  )
}

function FinalRanking({
  snapshot,
  role,
  onRematch,
  onExit,
}: {
  readonly snapshot: PublicRoomSnapshot
  readonly role: MultiplayerGameScreenProps['role']
  readonly onRematch: () => void
  readonly onExit: () => void
}) {
  const ranked = rankPublicPlayers(snapshot.players)
  return (
    <section className="multiplayer-results final-ranking" aria-labelledby="final-ranking-title">
      <p className="eyebrow">10 題挑戰完成</p>
      <h1 id="final-ranking-title">最終排名</h1>
      <ol className="final-ranking__list">
        {ranked.map((player, index) => (
          <li key={player.id}>
            <span>{index + 1}</span>
            <strong>{player.nickname}</strong>
            <b>{player.score} 分</b>
          </li>
        ))}
      </ol>
      {role === 'host'
        ? <button className="primary-button" type="button" onClick={onRematch}>再玩一局</button>
        : <p className="waiting-hint">等待 Host 決定是否再玩一局…</p>}
      <button className="text-button" type="button" onClick={onExit}>回到首頁</button>
    </section>
  )
}

export function MultiplayerGameScreen({
  role,
  actorId,
  connectionStatus,
  snapshot,
  snapshotReceivedAtMs,
  selectedAnswer,
  error,
  onAnswer,
  onAdvance,
  onRematch,
  onExit,
}: MultiplayerGameScreenProps) {
  const round = snapshot.round
  const remainingSeconds = useRemainingSeconds(
    round?.remainingMs,
    snapshotReceivedAtMs,
    snapshot.phase === 'playing',
  )
  const answered = hasPlayerAnswered(snapshot, actorId) || selectedAnswer !== undefined
  const autoAdvanceRemainingSeconds = useRemainingSeconds(
    snapshot.autoAdvanceRemainingMs,
    snapshotReceivedAtMs,
    snapshot.phase === 'results',
  )
  const hasAutoAdvanceCountdown =
    snapshot.phase === 'results' && snapshot.autoAdvanceRemainingMs !== undefined

  return (
    <main className="game-screen multiplayer-game" data-role={role}>
      <MultiplayerHeader snapshot={snapshot} onExit={onExit} />
      {connectionStatus !== 'connected' && <div className="multiplayer-connection-warning" role="status">連線中斷，正在等待重新連線…</div>}
      {snapshot.phase === 'paused' ? (
        <section className="multiplayer-results"><h1>遊戲暫停</h1><p>Host 已離線，30 秒內重新連線即可繼續。</p></section>
      ) : snapshot.phase === 'finished' ? (
        <FinalRanking snapshot={snapshot} role={role} onRematch={onRematch} onExit={onExit} />
      ) : snapshot.phase === 'results' && round ? (
        <RoundResults
          snapshot={snapshot}
          round={round}
          role={role}
          actorId={actorId}
          onAdvance={onAdvance}
          autoAdvanceRemainingSeconds={hasAutoAdvanceCountdown ? autoAdvanceRemainingSeconds : null}
        />
      ) : snapshot.phase === 'results' ? (
        <section className="multiplayer-results"><h1>正在載入原本題目…</h1></section>
      ) : round ? (
        role === 'host' ? (
          <div className="multiplayer-host-stage">
            <PlayerProgress snapshot={snapshot} />
            <section className="question-stage" aria-labelledby="multiplayer-question-prompt">
              <div className="question-stage__kicker">剩下 {remainingSeconds} 秒</div>
              <QuestionCard card={round.card} />
              <p id="multiplayer-question-prompt" className="question-prompt">請玩家從手機選擇正確物品！</p>
            </section>
          </div>
        ) : (
          <section className="multiplayer-player-stage">
            <div className="player-round-status">
              <span className="round-timer">{remainingSeconds}</span>
              <div><p className="eyebrow">第 {round.number} 題</p><h1>{answered ? '答案已送出' : '選擇正確物品'}</h1></div>
            </div>
            {answered && selectedAnswer ? (
              <div className="answer-confirmation" role="status">
                <span className="answer-confirmation__check" aria-hidden="true">✓</span>
                <span>
                  <strong>已選擇：{getCatalogItem(selectedAnswer).label}</strong>
                  <small>答案已鎖定，請等待其他玩家</small>
                </span>
              </div>
            ) : answered ? (
              <p className="waiting-hint" role="status">答案已送出且無法更改，請等待其他玩家。</p>
            ) : null}
            <AnswerOptions objectCount={snapshot.objectCount} disabled={answered || remainingSeconds === 0} selectedAnswer={selectedAnswer} onSelect={onAnswer} />
          </section>
        )
      ) : <section className="multiplayer-results"><h1>正在載入題目…</h1></section>}
      {error && <p className="multiplayer-game__error" role="alert">{error}</p>}
    </main>
  )
}
