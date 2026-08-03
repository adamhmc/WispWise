import { useMemo, useState } from 'react'
import { createCard, type ObjectId } from '@/domain'
import { AnswerOptions } from '@/ui/components/AnswerOptions'
import { QuestionCard } from '@/ui/components/QuestionCard'

const TUTORIALS = [
  {
    card: createCard({ objectId: 'ghost', colorId: 'white' }, { objectId: 'chair', colorId: 'green' }),
    answer: 'ghost' as ObjectId,
    title: '先找直接匹配',
    explanation: '白色是鬼的固定顏色，所以答案是鬼。',
  },
  {
    card: createCard({ objectId: 'ghost', colorId: 'red' }, { objectId: 'chair', colorId: 'blue' }),
    answer: 'bottle' as ObjectId,
    title: '再試排除推理',
    explanation: '排除鬼、椅子、紅色與藍色後，唯一剩下的固定配對是綠色瓶子。',
  },
] as const

interface TutorialScreenProps {
  readonly onComplete: () => void
  readonly onSkip: () => void
}

export function TutorialScreen({ onComplete, onSkip }: TutorialScreenProps) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<ObjectId>()
  const tutorial = TUTORIALS[step]
  const isCorrect = selected === tutorial.answer
  const progressLabel = useMemo(() => `教學第 ${step + 1} 題，共 2 題`, [step])

  const continueTutorial = () => {
    if (step === TUTORIALS.length - 1) onComplete()
    else {
      setStep(step + 1)
      setSelected(undefined)
    }
  }

  return (
    <main className="tutorial-screen">
      <header className="tutorial-header"><strong>{progressLabel}</strong><button className="text-button" type="button" onClick={onSkip}>略過教學</button></header>
      <section className="tutorial-card" aria-labelledby="tutorial-title">
        <p className="eyebrow">互動教學</p>
        <h1 id="tutorial-title">{tutorial.title}</h1>
        <QuestionCard card={tutorial.card} />
        {selected ? (
          <div className="tutorial-feedback" data-correct={isCorrect} role="status">
            <strong>{isCorrect ? '答對了！' : '再看一次規則'}</strong>
            <p>{tutorial.explanation}</p>
            <button className="compact-button" type="button" onClick={continueTutorial}>{step === 1 ? '開始遊戲' : '下一題'}</button>
          </div>
        ) : <p className="tutorial-hint">請選出正確物品</p>}
      </section>
      <AnswerOptions disabled={Boolean(selected)} selectedAnswer={selected} correctAnswer={selected ? tutorial.answer : undefined} onSelect={setSelected} />
    </main>
  )
}
