import { useEffect, useState } from 'react'
import { useGameController } from '@/app/useGameController'
import { GameScreen } from '@/ui/screens/GameScreen'
import { HomeScreen } from '@/ui/screens/HomeScreen'
import { ResultsScreen } from '@/ui/screens/ResultsScreen'
import { RulesScreen } from '@/ui/screens/RulesScreen'
import { SettingsScreen } from '@/ui/screens/SettingsScreen'
import { TutorialScreen } from '@/ui/screens/TutorialScreen'
import { preloadGameAssets } from '@/ui/assets'

type UtilityView = 'rules' | 'settings' | 'tutorial' | null

export function App() {
  const game = useGameController()
  const [utilityView, setUtilityView] = useState<UtilityView>(null)
  const [startAfterTutorial, setStartAfterTutorial] = useState(false)

  useEffect(() => {
    preloadGameAssets()
  }, [])

  const requestStart = () => {
    if (!game.preferences.tutorialCompleted) {
      setStartAfterTutorial(true)
      setUtilityView('tutorial')
      return
    }
    game.startGame()
  }

  const finishTutorial = () => {
    game.setPreferences({ ...game.preferences, tutorialCompleted: true })
    setUtilityView(null)
    if (startAfterTutorial) game.startGame()
    setStartAfterTutorial(false)
  }

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
    return <ResultsScreen stats={game.state.stats} onRestart={game.restartGame} onHome={game.exitGame} />
  }

  if (utilityView === 'tutorial') return <TutorialScreen onComplete={finishTutorial} onSkip={finishTutorial} />
  if (utilityView === 'rules') return <RulesScreen onTutorial={() => { setStartAfterTutorial(false); setUtilityView('tutorial') }} onBack={() => setUtilityView(null)} />
  if (utilityView === 'settings') return <SettingsScreen preferences={game.preferences} onChange={game.setPreferences} onTutorial={() => { setStartAfterTutorial(false); setUtilityView('tutorial') }} onBack={() => setUtilityView(null)} />

  return (
    <HomeScreen
      onStart={requestStart}
      onOpenRules={() => setUtilityView('rules')}
      onOpenSettings={() => setUtilityView('settings')}
    />
  )
}
