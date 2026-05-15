import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { createRpsSocket, RPS_WS_URL } from '@/lib/rpsSocket'
import { HEROES } from '@/data/hero'
import type { Hero } from '@/data/hero'

type Choice = 'rock' | 'paper' | 'scissors'
type RoundResult = 'win' | 'lose' | 'draw'
export type ConnectionStatus = 'connecting' | 'connected' | 'offline'
export type RoomPhase = 'idle' | 'waiting-for-p2' | 'hero-select' | 'hero-selected' | 'battle' | 'gameover'

interface RpsRoomState {
  connectionStatus: ConnectionStatus
  roomCode: string | null
  roomPhase: RoomPhase
  playerHero: Hero | null
  opponentHero: Hero | null
  playerHp: number
  opponentHp: number
  isWaitingForOpponent: boolean
  roundResult: RoundResult | null
  playerChoice: Choice | null
  opponentChoice: Choice | null
  winner: 'player' | 'opponent' | null
  opponentDisconnected: boolean
  error: string | null
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function getSessionId(): string {
  let id = localStorage.getItem('rps-session-id')
  if (!id) {
    id = generateId()
    localStorage.setItem('rps-session-id', id)
  }
  return id
}

function findHero(heroId: string): Hero | null {
  return HEROES.find(h => h.id.toString() === heroId) ?? null
}

const INIT: RpsRoomState = {
  connectionStatus: RPS_WS_URL ? 'connecting' : 'offline',
  roomCode: null,
  roomPhase: 'idle',
  playerHero: null,
  opponentHero: null,
  playerHp: 3,
  opponentHp: 3,
  isWaitingForOpponent: false,
  roundResult: null,
  playerChoice: null,
  opponentChoice: null,
  winner: null,
  opponentDisconnected: false,
  error: null,
}

export function useRpsRoom() {
  const socketRef = useRef<Socket | null>(null)
  const sessionId = useRef(getSessionId())
  const [state, setState] = useState<RpsRoomState>(INIT)

  const patch = useCallback((partial: Partial<RpsRoomState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  useEffect(() => {
    if (!RPS_WS_URL) return

    const socket = createRpsSocket()
    if (!socket) return
    socketRef.current = socket

    socket.on('connect', () => patch({ connectionStatus: 'connected', error: null }))
    socket.on('disconnect', () => patch({ connectionStatus: 'offline' }))
    socket.on('connect_error', () => patch({ connectionStatus: 'offline' }))

    socket.on('room_created', ({ roomCode }: { roomCode: string }) => {
      patch({ roomCode, roomPhase: 'waiting-for-p2', error: null })
    })

    socket.on('player_joined', ({ roomCode }: { sessionId: string; roomCode: string }) => {
      patch({ roomCode, roomPhase: 'hero-select', error: null })
    })

    socket.on('hero_selected', ({ player, heroId }: { player: 'self' | 'opponent'; heroId: string }) => {
      if (player === 'self') {
        setState(prev => {
          if (prev.roomPhase === 'battle') return { ...prev, playerHero: findHero(heroId) }
          return { ...prev, playerHero: findHero(heroId), roomPhase: 'hero-selected', isWaitingForOpponent: true }
        })
      } else {
        patch({ opponentHero: findHero(heroId) })
      }
    })

    socket.on('battle_start', ({ playerHero, opponentHero, playerHp, opponentHp }: {
      playerHero: string; opponentHero: string; playerHp: number; opponentHp: number
    }) => {
      setState(prev => ({
        ...prev,
        playerHero: prev.playerHero ?? findHero(playerHero),
        opponentHero: prev.opponentHero ?? findHero(opponentHero),
        playerHp,
        opponentHp,
        roomPhase: 'battle',
        isWaitingForOpponent: false,
      }))
    })

    socket.on('waiting_for_opponent', () => {
      patch({ isWaitingForOpponent: true })
    })

    socket.on('round_result', (payload: {
      playerChoice: Choice
      opponentChoice: Choice
      result: RoundResult
      playerHp: number
      opponentHp: number
    }) => {
      patch({
        playerChoice: payload.playerChoice,
        opponentChoice: payload.opponentChoice,
        roundResult: payload.result,
        playerHp: payload.playerHp,
        opponentHp: payload.opponentHp,
        isWaitingForOpponent: false,
      })
    })

    socket.on('game_over', ({ winner: winnerId }: { winner: string }) => {
      patch({ winner: winnerId === sessionId.current ? 'player' : 'opponent', roomPhase: 'gameover' })
    })

    socket.on('player_disconnected', () => {
      patch({ opponentDisconnected: true })
    })

    socket.on('player_reconnected', ({ phase, playerHp, opponentHp, opponentHero }: {
      phase: string; playerHp: number; opponentHp: number; opponentHero: string | null
    }) => {
      patch({
        opponentDisconnected: false,
        playerHp,
        opponentHp,
        opponentHero: opponentHero ? findHero(opponentHero) : null,
        roomPhase: phase as RoomPhase,
      })
    })

    socket.on('error', ({ message }: { code: string; message: string }) => {
      patch({ error: message })
    })

    socket.connect()

    return () => {
      socket.disconnect()
      socket.removeAllListeners()
    }
  }, [patch])

  const createRoom = useCallback(() => {
    socketRef.current?.emit('create_room', { sessionId: sessionId.current })
  }, [])

  const joinRoom = useCallback((roomCode: string) => {
    socketRef.current?.emit('join_room', {
      roomCode: roomCode.trim().toUpperCase(),
      sessionId: sessionId.current,
    })
  }, [])

  const selectHero = useCallback((hero: Hero, roomCode: string) => {
    socketRef.current?.emit('select_hero', {
      roomCode,
      sessionId: sessionId.current,
      heroId: hero.id.toString(),
    })
  }, [])

  const submitChoice = useCallback((choice: Choice, roomCode: string) => {
    socketRef.current?.emit('submit_choice', {
      roomCode,
      sessionId: sessionId.current,
      choice,
    })
  }, [])

  const clearRoundResult = useCallback(() => {
    patch({ roundResult: null, playerChoice: null, opponentChoice: null })
  }, [patch])

  const resetRoom = useCallback(() => {
    setState(prev => ({ ...INIT, connectionStatus: prev.connectionStatus }))
  }, [])

  return {
    ...state,
    isMultiplayer: !!RPS_WS_URL,
    createRoom,
    joinRoom,
    selectHero,
    submitChoice,
    clearRoundResult,
    resetRoom,
  }
}
