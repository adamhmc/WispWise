import type { ObjectId } from '@/domain'
import { selectCurrentQuestion, selectScore, type GameState } from '@/game'
import { AnswerOptions } from '@/ui/components/AnswerOptions'
import { QuestionCard } from '@/ui/components/QuestionCard'

interface GameScreenProps {
  readonly state: Extract<GameState, { status: 'preparing' | 'answering' | 'feedback' }>
  readonly onAnswer: (objectId: ObjectId) => void
  readonly onNext: () => void
  readonly onExit: () => void
}

export function GameScreen({ state, onAnswer, onNext, onExit }: GameScreenProps) {
  const question = selectCurrentQuestion(state)
  const score = selectScore(state)

  if (!question) return null

  const feedback = state.status === 'feedback' ? state.answer : null

  return (
    <main className="game-screen">
      <header className="game-header">
        <button className="brand-button" type="button" onClick={onExit} aria-label="離開遊戲回首頁">
          <span className="brand-ghost" aria-hidden="true">●</span>
          <span>Geesten</span>
        </button>
        <div className="game-header__progress" aria-label={`第 ${state.questionIndex + 1} 題，共 10 題`}>
          <span>第 {state.questionIndex + 1} 題</span>
          <span className="progress-track" aria-hidden="true">
            <span style={{ width: `${(state.questionIndex + 1) * 10}%` }} />
          </span>
        </div>
      </header>

      <div className="game-stage">
        <aside className="stats-card" aria-label="目前成績">
          <p className="eyebrow">目前成績</p>
          <strong>{score}</strong>
          <span>答對題數</span>
          <div className="stats-card__meta">
            <span>{10 - state.questionIndex} 張</span>
            <small>含本題</small>
          </div>
        </aside>

        <section className="question-stage" aria-labelledby="question-prompt">
          <div className="question-stage__kicker">LOOK CLOSELY!</div>
          <QuestionCard card={question.card} />
          <p id="question-prompt" className="question-prompt">
            {state.status === 'preparing' ? '準備下一題…' : '找出正確的物品！'}
          </p>
          {feedback ? (
            <div className="basic-feedback" role="status">
              <strong>{feedback.isCorrect ? '答對了！' : '再接再厲！'}</strong>
              {state.session.explanationsEnabled ? (
                <button className="compact-button" type="button" onClick={onNext}>下一題</button>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      <AnswerOptions
        disabled={state.status !== 'answering'}
        selectedAnswer={feedback?.selectedAnswer}
        onSelect={onAnswer}
      />
    </main>
  )
}
