import { useState, useEffect } from 'react'
import { ref, push, onValue, off } from 'firebase/database'
import { db } from '@/lib/firebase'

export interface RoomMessage {
  id: string
  text: string
  timestamp: number
  sessionId: string
  nickname: string
}

const ROOM_PATH = 'chatroom/messages'
const SESSION_KEY = 'chat_session_id'
const MAX_DISPLAY = 100

function getSession(): { sessionId: string; nickname: string } {
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  const nickname = 'Visitor #' + sessionId.slice(-4).toUpperCase()
  return { sessionId, nickname }
}

export function useChatRoom() {
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const { sessionId, nickname } = getSession()

  useEffect(() => {
    const chatRef = ref(db, ROOM_PATH)
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setMessages([])
        return
      }
      const loaded: RoomMessage[] = Object.entries(data).map(([id, val]) => ({
        id,
        ...(val as Omit<RoomMessage, 'id'>),
      }))
      loaded.sort((a, b) => a.timestamp - b.timestamp)
      setMessages(loaded.slice(-MAX_DISPLAY))
    })
    return () => off(chatRef)
  }, [])

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    push(ref(db, ROOM_PATH), {
      text: trimmed,
      timestamp: Date.now(),
      sessionId,
      nickname,
    })
  }

  return { messages, sendMessage, sessionId, nickname }
}
