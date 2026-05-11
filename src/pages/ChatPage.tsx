import { useState, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'
import { useChatRoom } from '@/hooks/useChatRoom'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, sessionId, nickname } = useChatRoom()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <Helmet>
        <title>Chat — Bright Portfolio</title>
        <meta name="description" content="Live public chat room — say hello to other visitors." />
      </Helmet>

      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text-primary">Live Chat</h1>
          <p className="text-sm text-text-muted mt-1">
            Public chat room — everyone can see your messages. You are{' '}
            <span className="font-medium text-text-secondary">{nickname}</span>.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-surface-border bg-surface-raised p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="text-sm text-text-muted text-center m-auto">
              No messages yet. Be the first to say hello!
            </p>
          )}

          {messages.map((msg) => {
            const isMe = msg.sessionId === sessionId
            return (
              <div key={msg.id} className={cn('flex flex-col gap-1', isMe ? 'items-end' : 'items-start')}>
                {!isMe && (
                  <span className="text-xs text-text-muted px-1">{msg.nickname}</span>
                )}
                <div className={cn('flex items-end gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
                  <div
                    className={cn(
                      'max-w-xs rounded-2xl px-4 py-2 text-sm leading-snug break-words',
                      isMe
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-surface border border-surface-border text-text-primary rounded-bl-sm',
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message as ${nickname}…`}
            maxLength={500}
            className="flex-1 rounded-xl bg-surface border border-surface-border px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}
