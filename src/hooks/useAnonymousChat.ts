import { useState, useEffect } from 'react'
import { ref, push, remove, onValue, off } from 'firebase/database'
import { db } from '@/lib/firebase'

export interface ChatMessage {
  id: string
  text: string
  timestamp: number
  role: 'user' | 'bot'
}

const CHAT_PATH = 'chat/messages'

export function useAnonymousChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    const chatRef = ref(db, CHAT_PATH)
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setMessages([])
        return
      }
      const loaded: ChatMessage[] = Object.entries(data).map(([id, val]) => ({
        id,
        ...(val as Omit<ChatMessage, 'id'>),
      }))
      loaded.sort((a, b) => a.timestamp - b.timestamp)
      setMessages(loaded)
    })
    return () => off(chatRef)
  }, [])

  function addMessage(text: string) {
    const chatRef = ref(db, CHAT_PATH)
    const now = Date.now()
    push(chatRef, { text, timestamp: now, role: 'user' })
    push(chatRef, { text: getBotReply(text), timestamp: now + 1, role: 'bot' })
  }

  function clearMessages() {
    remove(ref(db, CHAT_PATH))
  }

  return { messages, addMessage, clearMessages }
}

const BOT_REPLIES = [
  "Thanks for saying hi! I'm Bright's portfolio bot. Feel free to look around.",
  "Hey there! Glad you stopped by. Check out the projects above.",
  "Hello! Anything I can help with? I'm a simple bot, but I'm friendly.",
  "Nice to meet you! Bright built this little chat just for fun.",
  "Hi! I'm a live bot now — messages are shared with all visitors.",
]

function getBotReply(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hey! Welcome to Bright's portfolio. 👋"
  }
  if (lower.includes('contact') || lower.includes('hire') || lower.includes('work')) {
    return "For serious inquiries, head over to the Contact page — Bright checks it regularly."
  }
  if (lower.includes('project')) {
    return "Scroll up to see featured projects, or visit the Projects page for the full list."
  }
  return BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)]
}
