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
import { clearRoomInviteFromUrl, invitedRoomCodeFromUrl } from '@/multiplayer'
import type { GameMode } from '@/game'
import type { GameObjectCount } from '@/domain'

type UtilityView = 'rules' | 'settings' | 'tutorial' | null

export function App() {
  const invitedRoomCode = invitedRoomCodeFromUrl(window.location.href)
  const game = useGameController()
  const multiplayer = useMultiplayerLobby()
  const [utilityView, setUtilityView] = useState<UtilityView>(null)
  const [modeView, setModeView] = useState<'game-mode' | 'solo-object-count' | 'solo-mode' | 'multiplayer-role' | null>(null)
  const [selectedObjectCount, setSelectedObjectCount] = useState<GameObjectCount>(5)
  const [multiplayerEntry, setMultiplayerEntry] = useState<'create' | 'join' | null>(
    invitedRoomCode ? 'join' : null,
  )
  const [startAfterTutorial, setStartAfterTutorial] = useState<{ mode: GameMode; objectCount: GameObjectCount } | null>(null)

  useEffect(() => {
    preloadGameAssets()
  }, [])

  const requestStart = (mode: GameMode, objectCount: GameObjectCount) => {
    if (!game.preferences.tutorialCompleted) {
      setStartAfterTutorial({ mode, objectCount })
      setUtilityView('tutorial')
      return
    }
    game.startGame(mode, objectCount)
  }

  const finishTutorial = () => {
    game.setPreferences({ ...game.preferences, tutorialCompleted: true })
    setUtilityView(null)
    if (startAfterTutorial) game.startGame(startAfterTutorial.mode, startAfterTutorial.objectCount)
    setStartAfterTutorial(null)
  }

  const leaveMultiplayer = () => {
    multiplayer.reset()
    setMultiplayerEntry(null)
    if (invitedRoomCodeFromUrl(window.location.href)) {
      window.history.replaceState(null, '', clearRoomInviteFromUrl(window.location.href))
    }
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
    return <ResultsScreen mode={game.state.session.mode} stats={game.state.stats} onRestart={game.restartGame} onHome={game.exitGame} />
  }

  if (utilityView === 'tutorial') return <TutorialScreen onComplete={finishTutorial} onSkip={finishTutorial} />
  if (utilityView === 'rules') return <RulesScreen onTutorial={() => { setStartAfterTutorial(null); setUtilityView('tutorial') }} onBack={() => setUtilityView(null)} />
  if (utilityView === 'settings') return <SettingsScreen preferences={game.preferences} onChange={game.setPreferences} onTutorial={() => { setStartAfterTutorial(null); setUtilityView('tutorial') }} onBack={() => setUtilityView(null)} />

  if (modeView) {
    return (
      <GameModeScreen
        step={modeView}
        selectedObjectCount={selectedObjectCount}
        onSolo={() => setModeView('solo-object-count')}
        onObjectCount={(objectCount) => { setSelectedObjectCount(objectCount); setModeView('solo-mode') }}
        onClassic={() => { setModeView(null); requestStart('classic', selectedObjectCount) }}
        onTimed={() => { setModeView(null); requestStart('timed', selectedObjectCount) }}
        onMultiplayer={() => setModeView('multiplayer-role')}
        onCreateRoom={() => { setModeView(null); setMultiplayerEntry('create') }}
        onJoinRoom={() => { setModeView(null); setMultiplayerEntry('join') }}
        onBack={() => setModeView(
          modeView === 'game-mode' ? null : modeView === 'solo-mode' ? 'solo-object-count' : 'game-mode',
        )}
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
          onKickPlayer={multiplayer.kickPlayer}
          onPlayerTimeCompensationChange={multiplayer.setPlayerTimeCompensation}
          onRematch={multiplayer.resetGame}
          onExit={leaveMultiplayer}
        />
      )
    }
    return (
      <MultiplayerLobbyScreen
        entryMode={multiplayerEntry}
        initialRoomCode={invitedRoomCode ?? undefined}
        role={multiplayer.role}
        connectionStatus={multiplayer.connectionStatus}
        startPending={multiplayer.startPending}
        snapshot={multiplayer.snapshot}
        error={multiplayer.error}
        onCreate={multiplayer.createRoom}
        onJoin={multiplayer.joinRoom}
        onStart={multiplayer.startGame}
        onObjectCountChange={multiplayer.setObjectCount}
        onAutoAdvanceChange={multiplayer.setAutoAdvanceEnabled}
        onKickPlayer={multiplayer.kickPlayer}
        onPlayerTimeCompensationChange={multiplayer.setPlayerTimeCompensation}
        onBack={leaveMultiplayer}
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
