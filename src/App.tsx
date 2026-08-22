import { useEffect, useState } from 'react'
import { useGameController } from '@/app/useGameController'
import { useMultiplayerLobby } from '@/app/useMultiplayerLobby'
import { GameScreen } from '@/ui/screens/GameScreen'
import { GameModeScreen } from '@/ui/screens/GameModeScreen'
import { HomeScreen } from '@/ui/screens/HomeScreen'
import { MultiplayerLobbyScreen } from '@/ui/screens/MultiplayerLobbyScreen'
import { MultiplayerGameScreen } from '@/ui/screens/MultiplayerGameScreen'
import { ResultsScreen } from '@/ui/screens/ResultsScreen'
import { RulesScreen } from '@/ui/screens/RulesScreen'
import { SettingsScreen } from '@/ui/screens/SettingsScreen'
import { TutorialScreen } from '@/ui/screens/TutorialScreen'
import { preloadGameAssets } from '@/ui/assets'

type UtilityView = 'rules' | 'settings' | 'tutorial' | null

export function App() {
  const game = useGameController()
  const multiplayer = useMultiplayerLobby()
  const [utilityView, setUtilityView] = useState<UtilityView>(null)
  const [modeView, setModeView] = useState<'game-mode' | 'multiplayer-role' | null>(null)
  const [multiplayerEntry, setMultiplayerEntry] = useState<'create' | 'join' | null>(null)
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

  if (modeView) {
    return (
      <GameModeScreen
        step={modeView}
        onSolo={() => { setModeView(null); requestStart() }}
        onMultiplayer={() => setModeView('multiplayer-role')}
        onCreateRoom={() => { setModeView(null); setMultiplayerEntry('create') }}
        onJoinRoom={() => { setModeView(null); setMultiplayerEntry('join') }}
        onBack={() => setModeView(modeView === 'multiplayer-role' ? 'game-mode' : null)}
      />
    )
  }

  if (multiplayerEntry) {
    if (multiplayer.snapshot && multiplayer.role && multiplayer.snapshot.phase !== 'lobby') {
      return (
        <MultiplayerGameScreen
          role={multiplayer.role}
          actorId={multiplayer.actorId}
          connectionStatus={multiplayer.connectionStatus}
          snapshot={multiplayer.snapshot}
          snapshotReceivedAtMs={multiplayer.snapshotReceivedAtMs}
          selectedAnswer={multiplayer.selectedAnswer}
          error={multiplayer.error}
          onAnswer={multiplayer.submitAnswer}
          onAdvance={multiplayer.advanceRound}
          onExit={() => { multiplayer.reset(); setMultiplayerEntry(null) }}
        />
      )
    }
    return (
      <MultiplayerLobbyScreen
        entryMode={multiplayerEntry}
        role={multiplayer.role}
        connectionStatus={multiplayer.connectionStatus}
        startPending={multiplayer.startPending}
        snapshot={multiplayer.snapshot}
        error={multiplayer.error}
        onCreate={multiplayer.createRoom}
        onJoin={multiplayer.joinRoom}
        onStart={multiplayer.startGame}
        onAutoAdvanceChange={multiplayer.setAutoAdvanceEnabled}
        onBack={() => { multiplayer.reset(); setMultiplayerEntry(null) }}
      />
    )
  }

  return (
    <HomeScreen
      onStart={() => setModeView('game-mode')}
      onOpenRules={() => setUtilityView('rules')}
      onOpenSettings={() => setUtilityView('settings')}
    />
  )
}
