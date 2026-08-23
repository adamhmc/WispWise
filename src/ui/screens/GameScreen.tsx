import { useEffect, useState } from 'react'
import { createAnswerExplanation, getCatalogItem, type ObjectId } from '@/domain'
import { TIMED_GAME_DURATION_MS, selectCurrentQuestion, selectScore, type GameState } from '@/game'
import { AnswerOptions } from '@/ui/components/AnswerOptions'
import { QuestionCard } from '@/ui/components/QuestionCard'

interface GameScreenProps {
  readonly state: Extract<GameState, { status: 'preparing' | 'answering' | 'feedback' }>
  readonly onAnswer: (objectId: ObjectId) => void
  readonly onNext: () => void
  readonly onExit: () => void
}

function useRemainingTimedMs(state: GameScreenProps['state']): number | null {
  const deadlineAtMs = state.session.deadlineAtMs
  const [remainingMs, setRemainingMs] = useState(TIMED_GAME_DURATION_MS)

  useEffect(() => {
    if (state.session.mode !== 'timed') return

    const handle = window.setInterval(() => setRemainingMs(
      deadlineAtMs === undefined
        ? TIMED_GAME_DURATION_MS
        : Math.max(0, deadlineAtMs - performance.now()),
    ), 200)
    return () => window.clearInterval(handle)
  }, [deadlineAtMs, state.session.mode])

  return state.session.mode === 'timed' ? remainingMs : null
}

export function GameScreen({ state, onAnswer, onNext, onExit }: GameScreenProps) {
  const question = selectCurrentQuestion(state)
  const score = selectScore(state)
  const remainingTimedMs = useRemainingTimedMs(state)

  if (!question) return null

  const feedback = state.status === 'feedback' ? state.answer : null
  const explanation = feedback ? createAnswerExplanation(question.card, question.evaluation) : null
  const answerLabel = feedback ? getCatalogItem(feedback.correctAnswer).label : ''
  const explanationText = explanation?.kind === 'direct'
    ? `${answerLabel}以自己的正確顏色出現在卡牌上。`
    : explanation
      ? `卡牌上的物品與顏色都先排除，剩下的是${answerLabel}。`
      : ''
  const lastElapsedMs = state.session.records.at(-1)?.elapsedMs
  const timed = state.session.mode === 'timed'
  const timedQuestionNumber = state.session.records.length + (state.status === 'feedback' ? 0 : 1)
  const remainingSeconds = Math.ceil((remainingTimedMs ?? TIMED_GAME_DURATION_MS) / 1000)

  return (
    <main className="game-screen">
      <header className="game-header">
        <button className="brand-button" type="button" onClick={onExit} aria-label="離開遊戲回首頁">
          <span className="brand-ghost" aria-hidden="true">
            <span className="brand-ghost__eyes">••</span>
          </span>
          <span className="brand-name"><small>WispWise</small>靈機一選</span>
        </button>
        <div className="game-title" aria-hidden="true"><small>LOOK · THINK · PICK</small> WISPWISE!</div>
        <div
          className="game-header__progress"
          aria-label={timed ? `剩餘 ${remainingSeconds} 秒` : `第 ${state.questionIndex + 1} 題，共 10 題`}
        >
          <span>{timed ? `剩餘 ${remainingSeconds} 秒` : `第 ${state.questionIndex + 1} 題`}</span>
          <span className="progress-track" aria-hidden="true">
            <span style={{ width: timed
              ? `${Math.max(0, Math.min(100, (remainingSeconds / 60) * 100))}%`
              : `${(state.questionIndex + 1) * 10}%` }} />
          </span>
        </div>
      </header>

      <div className="game-stage">
        <aside className="stats-card" aria-label="目前成績">
          <p className="stats-card__title">玩家狀態</p>
          <div className="player-pill">
            <span className="player-avatar" aria-hidden="true">●</span>
            <span><strong>單人玩家</strong><small>練習中</small></span>
          </div>
          <div className="stats-pill"><strong>{score}</strong><span>答對題數</span></div>
          <div className="stats-pill"><strong>{lastElapsedMs == null ? '—' : `${(lastElapsedMs / 1000).toFixed(1)}s`}</strong><span>最近作答</span></div>
          <div className="stats-card__meta">
            <strong>{timed ? state.session.records.length : 10 - state.questionIndex}</strong>
            <span>{timed ? '已完成題數' : '張卡牌剩餘'}</span>
          </div>
        </aside>

        <section className="question-stage" aria-labelledby="question-prompt">
          <div className="question-stage__kicker">{timed ? `第 ${timedQuestionNumber} 題` : 'LOOK CLOSELY!'}</div>
          <QuestionCard card={question.card} />
          <p id="question-prompt" className="question-prompt">
            {state.status === 'preparing' ? '準備下一題…' : '找出正確的物品！'}
          </p>
          {feedback ? (
            <div className="feedback-card" data-correct={feedback.isCorrect} role="status" aria-live="polite">
              <div>
                <strong>{feedback.isCorrect ? '答對了！' : `正確答案是${answerLabel}`}</strong>
                <p>{explanationText}</p>
              </div>
              {state.session.explanationsEnabled ? (
                <button className="compact-button" type="button" onClick={onNext}>下一題</button>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      <AnswerOptions
        disabled={state.status !== 'answering'}
        objectCount={state.session.objectCount}
        selectedAnswer={feedback?.selectedAnswer}
        correctAnswer={feedback?.correctAnswer}
        onSelect={onAnswer}
      />
    </main>
  )
}
