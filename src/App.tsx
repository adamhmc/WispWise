import { useState } from 'react'
import { useGameController } from '@/app/useGameController'
import { HomeScreen } from '@/ui/screens/HomeScreen'
import { GameScreen } from '@/ui/screens/GameScreen'

type UtilityView = 'rules' | 'settings' | null

export function App() {
  const game = useGameController()
  const [utilityView, setUtilityView] = useState<UtilityView>(null)

  if (game.state.status === 'preparing' || game.state.status === 'answering' || game.state.status === 'feedback') {
    return (
      <GameScreen
        state={game.state}
        onAnswer={game.submitAnswer}
        onNext={game.nextQuestion}
        onExit={game.exitGame}
      />
    )
  }

  if (game.state.status === 'results') {
    return (
      <main className="simple-panel">
        <p className="eyebrow">本局完成</p>
        <h1>{game.state.stats.correct} / 10</h1>
        <p>完整結果頁將在下一個 UI 階段加入。</p>
        <button className="primary-button" type="button" onClick={game.restartGame}>再玩一次</button>
        <button className="text-button" type="button" onClick={game.exitGame}>回首頁</button>
      </main>
    )
  }

  if (utilityView) {
    return (
      <main className="simple-panel">
        <p className="eyebrow">{utilityView === 'rules' ? '玩法說明' : '設定'}</p>
        <h1>{utilityView === 'rules' ? '兩種判斷方式' : '遊戲偏好'}</h1>
        <p>這個畫面會在 UI Gate 2 完成。</p>
        <button className="primary-button" type="button" onClick={() => setUtilityView(null)}>回首頁</button>
      </main>
    )
  }

  return (
    <HomeScreen
      onStart={game.startGame}
      onOpenRules={() => setUtilityView('rules')}
      onOpenSettings={() => setUtilityView('settings')}
    />
  )
}
