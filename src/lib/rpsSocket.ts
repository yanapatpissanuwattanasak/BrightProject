import { io, Socket } from 'socket.io-client'

export const RPS_WS_URL = import.meta.env.VITE_RPS_WS_URL as string | undefined

export function createRpsSocket(): Socket | null {
  if (!RPS_WS_URL) return null
  const a = io(`${RPS_WS_URL}`, {
    reconnectionAttempts: 3,
    timeout: 3000,
  })
  console.log(RPS_WS_URL);
  console.log("connect rps", a);
  
  return a
}
