import type { GameStats } from '@/domain'
import type { GameMode } from '@/game'

interface ResultsScreenProps {
  readonly stats: GameStats
  readonly mode: GameMode
  readonly onRestart: () => void
  readonly onHome: () => void
}

export function ResultsScreen({ stats, mode, onRestart, onHome }: ResultsScreenProps) {
  const average = stats.averageCorrectTimeMs == null ? '—' : `${(stats.averageCorrectTimeMs / 1000).toFixed(1)} 秒`

  return (
    <main className="utility-screen results-screen">
      <section className="utility-card" aria-labelledby="results-title">
        <p className="eyebrow">{mode === 'timed' ? '60 秒挑戰完成' : '本局完成'}</p>
        <h1 id="results-title">{mode === 'timed' ? `完成 ${stats.total} 題！` : '漂亮收尾！'}</h1>
        <p className="utility-lead">這些成績只用於本頁顯示，離開後不會保存。</p>
        <div className="result-grid">
          <div><strong>{mode === 'timed' ? stats.total : `${stats.correct} / ${stats.total}`}</strong><span>{mode === 'timed' ? '完成題數' : '答對題數'}</span></div>
          <div><strong>{Math.round(stats.accuracy * 100)}%</strong><span>正確率</span></div>
          <div><strong>{average}</strong><span>答對平均時間</span></div>
          <div><strong>{stats.correct}</strong><span>答對題數</span></div>
        </div>
        <button className="primary-button" type="button" onClick={onRestart}>再玩一次</button>
        <button className="text-button" type="button" onClick={onHome}>回首頁</button>
      </section>
    </main>
  )
}
