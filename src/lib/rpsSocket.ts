import { io, Socket } from 'socket.io-client'

export const RPS_WS_URL = import.meta.env.VITE_RPS_WS_URL as string | undefined

export function createRpsSocket(): Socket | null {
  if (!RPS_WS_URL) return null
  return io(`${RPS_WS_URL}`, {
    path: '/socket.io',
    transports: ['websocket'],
    autoConnect: false,
    reconnectionAttempts: 3,
    timeout: 3000,
  })
}
