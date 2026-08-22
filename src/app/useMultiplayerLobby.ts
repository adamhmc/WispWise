import { useCallback, useEffect, useRef, useState } from 'react'
import type { ObjectId } from '@/domain'
import {
  createClientCommandId,
  type AutoAdvanceSeconds,
  type PublicRoomSnapshot,
  type ServerMessage,
} from '@/multiplayer'
import {
  MULTIPLAYER_IDENTITY_KEY,
  connectToMultiplayerRoom,
  createMultiplayerRoom,
  fetchMultiplayerRoomSnapshot,
  joinMultiplayerRoom,
} from '@/multiplayer/client'
import { shouldApplyRoomSnapshot } from '@/multiplayer/selectors'

type LobbyRole = 'host' | 'player'
type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected'

interface StoredIdentity {
  readonly roomCode: string
  readonly role: LobbyRole
  readonly token: string
  readonly actorId: string
}

interface AnswerSelection {
  readonly roundId: string
  readonly answer: ObjectId
  readonly commandId: string
}

export function useMultiplayerLobby() {
  const [snapshot, setSnapshot] = useState<PublicRoomSnapshot | null>(null)
  const [snapshotReceivedAtMs, setSnapshotReceivedAtMs] = useState(Date.now)
  const [role, setRole] = useState<LobbyRole | null>(null)
  const [actorId, setActorId] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [startPending, setStartPending] = useState(false)
  const [answerSelection, setAnswerSelection] = useState<AnswerSelection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const latestSnapshotRef = useRef<PublicRoomSnapshot | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const connectionGenerationRef = useRef(0)
  const shouldReconnectRef = useRef(false)

  useEffect(() => () => {
    shouldReconnectRef.current = false
    connectionGenerationRef.current += 1
    if (reconnectTimerRef.current !== null) window.clearTimeout(reconnectTimerRef.current)
    socketRef.current?.close(1000, 'leaving lobby')
  }, [])

  const applySnapshot = useCallback((nextSnapshot: PublicRoomSnapshot) => {
    const current = latestSnapshotRef.current
    if (!shouldApplyRoomSnapshot(current, nextSnapshot)) return
    latestSnapshotRef.current = nextSnapshot
    setSnapshot(nextSnapshot)
    setSnapshotReceivedAtMs(Date.now())
    setAnswerSelection((current) =>
      current && nextSnapshot.round?.id === current.roundId ? current : null,
    )
    if (nextSnapshot.phase !== 'lobby') {
      setStartPending(false)
      setError(null)
    }
  }, [])

  const receiveMessage = (message: ServerMessage) => {
    if (message.type === 'room-snapshot' || message.type === 'joined-room') {
      applySnapshot(message.snapshot)
    }
    if (message.type === 'command-rejected') {
      setStartPending(false)
      if (message.commandId) setAnswerSelection(null)
      setError(message.reason)
    }
  }

  const connect = (identity: StoredIdentity) => {
    const generation = connectionGenerationRef.current + 1
    connectionGenerationRef.current = generation
    shouldReconnectRef.current = true
    socketRef.current?.close(1000, 'replaced connection')
    setConnectionStatus('connecting')
    socketRef.current = connectToMultiplayerRoom({
      roomCode: identity.roomCode,
      role: identity.role,
      token: identity.token,
      onMessage: receiveMessage,
      onOpen: () => {
        if (generation !== connectionGenerationRef.current) return
        setConnectionStatus('connected')
        void fetchMultiplayerRoomSnapshot(identity.roomCode)
          .then(applySnapshot)
          .catch(() => undefined)
      },
      onClose: () => {
        if (generation !== connectionGenerationRef.current || !shouldReconnectRef.current) return
        setConnectionStatus('disconnected')
        reconnectTimerRef.current = window.setTimeout(() => connect(identity), 1_000)
      },
    })
  }

  const pollingRoomCode = snapshot?.phase === 'lobby' ? snapshot.roomCode : null
  useEffect(() => {
    if (!pollingRoomCode) return
    let cancelled = false
    const timer = window.setInterval(() => {
      void fetchMultiplayerRoomSnapshot(pollingRoomCode)
        .then((latest) => { if (!cancelled) applySnapshot(latest) })
        .catch(() => undefined)
    }, 2_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [applySnapshot, pollingRoomCode])

  const createRoom = async () => {
    setError(null)
    setConnectionStatus('connecting')
    try {
      const created = await createMultiplayerRoom()
      const identity: StoredIdentity = {
        roomCode: created.snapshot.roomCode,
        role: 'host',
        token: created.hostToken,
        actorId: created.hostId,
      }
      sessionStorage.setItem(MULTIPLAYER_IDENTITY_KEY, JSON.stringify(identity))
      setRole('host')
      setActorId(created.hostId)
      applySnapshot(created.snapshot)
      connect(identity)
    } catch (caught) {
      setConnectionStatus('idle')
      setError(caught instanceof Error ? caught.message : '無法建立房間')
    }
  }

  const joinRoom = async (roomCode: string, nickname: string) => {
    setError(null)
    setConnectionStatus('connecting')
    try {
      const joined = await joinMultiplayerRoom(roomCode, nickname)
      const identity: StoredIdentity = {
        roomCode: joined.snapshot.roomCode,
        role: 'player',
        token: joined.reconnectToken,
        actorId: joined.playerId,
      }
      sessionStorage.setItem(MULTIPLAYER_IDENTITY_KEY, JSON.stringify(identity))
      setRole('player')
      setActorId(joined.playerId)
      applySnapshot(joined.snapshot)
      connect(identity)
    } catch (caught) {
      setConnectionStatus('idle')
      setError(caught instanceof Error ? caught.message : '無法加入房間')
    }
  }

  const startGame = () => {
    setError(null)
    if (snapshot?.phase !== 'lobby' || startPending) return
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      setError('正在等待伺服器連線')
      return
    }
    setStartPending(true)
    socketRef.current.send(JSON.stringify({ type: 'start-game' }))
  }

  const setAutoAdvanceEnabled = (enabled: boolean) => {
    setError(null)
    if (role !== 'host' || snapshot?.phase !== 'lobby') return
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      setError('正在等待伺服器連線')
      return
    }
    const seconds: AutoAdvanceSeconds | null = enabled ? 5 : null
    socketRef.current.send(JSON.stringify({ type: 'set-auto-advance', seconds }))
  }

  const submitAnswer = (answer: ObjectId) => {
    setError(null)
    const round = snapshot?.round
    if (
      role !== 'player' ||
      snapshot?.phase !== 'playing' ||
      !round ||
      !actorId ||
      answerSelection ||
      round.answeredPlayerIds.includes(actorId)
    ) return
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      setError('正在等待伺服器連線')
      return
    }
    const selection: AnswerSelection = {
      roundId: round.id,
      answer,
      commandId: createClientCommandId(),
    }
    setAnswerSelection(selection)
    try {
      socketRef.current.send(JSON.stringify({
        type: 'submit-answer',
        commandId: selection.commandId,
        roundId: selection.roundId,
        answer: selection.answer,
      }))
    } catch {
      setAnswerSelection(null)
      setError('答案送出失敗，請確認連線後再試一次')
    }
  }

  const advanceRound = () => {
    setError(null)
    if (role !== 'host' || snapshot?.phase !== 'results') return
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      setError('正在等待伺服器連線')
      return
    }
    socketRef.current.send(JSON.stringify({ type: 'advance-round' }))
  }

  const resetGame = () => {
    setError(null)
    if (role !== 'host' || snapshot?.phase !== 'finished' || snapshot.finishReason !== 'completed') return
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      setError('正在等待伺服器連線')
      return
    }
    socketRef.current.send(JSON.stringify({ type: 'reset-game' }))
  }

  const reset = () => {
    shouldReconnectRef.current = false
    connectionGenerationRef.current += 1
    if (reconnectTimerRef.current !== null) window.clearTimeout(reconnectTimerRef.current)
    socketRef.current?.close(1000, 'leaving lobby')
    socketRef.current = null
    sessionStorage.removeItem(MULTIPLAYER_IDENTITY_KEY)
    setSnapshot(null)
    latestSnapshotRef.current = null
    setSnapshotReceivedAtMs(Date.now())
    setRole(null)
    setActorId(null)
    setConnectionStatus('idle')
    setStartPending(false)
    setAnswerSelection(null)
    setError(null)
  }

  const selectedAnswer =
    answerSelection && answerSelection.roundId === snapshot?.round?.id
      ? answerSelection.answer
      : undefined

  return {
    snapshot,
    snapshotReceivedAtMs,
    role,
    actorId,
    connectionStatus,
    startPending,
    selectedAnswer,
    error,
    createRoom,
    joinRoom,
    startGame,
    setAutoAdvanceEnabled,
    submitAnswer,
    advanceRound,
    resetGame,
    reset,
  }
}
