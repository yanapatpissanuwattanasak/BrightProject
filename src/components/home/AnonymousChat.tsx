import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAnonymousChat } from '@/hooks/useAnonymousChat'

export function AnonymousChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, addMessage, clearMessages } = useAnonymousChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  function handleSend() {
    const text = input.trim()
    if (!text) return
    addMessage(text)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 rounded-2xl border border-surface-border bg-surface-raised shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm font-medium text-text-primary">Anonymous Chat</span>
            </div>
            <button
              onClick={clearMessages}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              aria-label="Clear chat history"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-2 p-4 h-72 overflow-y-auto scrollbar-none">
            {messages.length === 0 && (
              <p className="text-xs text-text-muted text-center mt-auto">
                Say hello — this is a live chat, visible to all visitors.
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[75%] rounded-xl px-3 py-2 text-sm leading-snug',
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-surface-border text-text-primary',
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-surface-border">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              maxLength={300}
              className="flex-1 rounded-lg bg-surface border border-surface-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="h-12 w-12 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg flex items-center justify-center transition-colors"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  )
}
