import type { GameStats } from '@/domain'

interface ResultsScreenProps {
  readonly stats: GameStats
  readonly onRestart: () => void
  readonly onHome: () => void
}

export function ResultsScreen({ stats, onRestart, onHome }: ResultsScreenProps) {
  const average = stats.averageCorrectTimeMs == null ? '—' : `${(stats.averageCorrectTimeMs / 1000).toFixed(1)} 秒`

  return (
    <main className="utility-screen results-screen">
      <section className="utility-card" aria-labelledby="results-title">
        <p className="eyebrow">本局完成</p>
        <h1 id="results-title">漂亮收尾！</h1>
        <p className="utility-lead">這些成績只用於本頁顯示，離開後不會保存。</p>
        <div className="result-grid">
          <div><strong>{stats.correct} / {stats.total}</strong><span>答對題數</span></div>
          <div><strong>{Math.round(stats.accuracy * 100)}%</strong><span>正確率</span></div>
          <div><strong>{average}</strong><span>答對平均時間</span></div>
          <div><strong>{stats.incorrect}</strong><span>答錯題數</span></div>
        </div>
        <button className="primary-button" type="button" onClick={onRestart}>再玩一次</button>
        <button className="text-button" type="button" onClick={onHome}>回首頁</button>
      </section>
    </main>
  )
}
