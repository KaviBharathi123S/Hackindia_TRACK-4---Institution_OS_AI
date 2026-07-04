import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Wifi, WifiOff } from 'lucide-react'
import { useAgentSocket } from '../hooks/useAgentSocket'
import { useStudents } from '../context/StudentsContext'
import InlineChatEvent from './InlineChatEvent'

const SUGGESTED_PROMPTS = [
  'Show attendance of CSE students',
  'Which department has the highest grades?',
  'Add a new student',
  'Students below 75% attendance',
]

// One session id per browser tab/load — keeps conversation memory (the
// backend's session_store) tied to this chat window for its lifetime.
const SESSION_ID = crypto.randomUUID()

export default function AIAssistantPanel() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Ask me about students, attendance, or grades — or tell me to add, update, or delete a record.' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const feedRef = useRef(null)
  const { addStudent, updateStudent, removeStudent } = useStudents()

  const handleIncoming = (payload) => {
    setTyping(false)
    setMessages((prev) => [...prev, { role: 'ai', text: payload.reply, events: payload.ui_events || [] }])

    // This is the actual "dynamic UI" wiring: apply each event to global
    // state so Dashboard / Student Details reflect it immediately.
    for (const ev of payload.ui_events || []) {
      if (ev.type === 'row_created' && ev.table === 'students') addStudent(ev.data)
      if (ev.type === 'row_updated' && ev.table === 'students') updateStudent(ev.id, ev.data)
      if (ev.type === 'row_deleted' && ev.table === 'students') removeStudent(ev.id)
    }
  }

  const { sendMessage, status } = useAgentSocket(SESSION_ID, handleIncoming)

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  function handleSend(text) {
    const trimmed = (text ?? input).trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    const sent = sendMessage(trimmed)
    setInput('')
    if (sent) {
      setTyping(true)
    } else {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Not connected to the server yet — trying to reconnect, try again in a moment.' }])
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-80 shrink-0 glass rounded-3xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-electric to-violet">
            <Bot size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm">AI Assistant</span>
        </div>
        {status === 'open'
          ? <Wifi size={14} className="text-emerald-400" />
          : <WifiOff size={14} className="text-amber-400 animate-pulse" />}
      </div>

      <div ref={feedRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${m.role === 'user' ? 'order-2' : ''}`}>
              <div className={`flex items-center gap-1.5 mb-1 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'ai' && <Bot size={12} className="text-violet" />}
                <span className="text-[10px] text-mist/40">{m.role === 'user' ? 'You' : 'Assistant'}</span>
                {m.role === 'user' && <User size={12} className="text-electric" />}
              </div>
              <div
                className={`rounded-2xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-electric to-violet text-white'
                    : 'bg-white/8 text-mist/90 border border-white/10'
                }`}
              >
                {m.text}
              </div>
              {m.events?.map((ev, j) => <InlineChatEvent key={j} event={ev} />)}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-3"
            >
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-violet"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-mist/60 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSend() }}
        className="p-3 border-t border-white/10 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about students, attendance, grades..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-mist/30 focus:outline-none focus:ring-2 focus:ring-violet"
        />
        <button
          type="submit"
          className="ripple p-2.5 rounded-xl bg-gradient-to-r from-electric to-violet text-white"
        >
          <Send size={16} />
        </button>
      </form>
    </aside>
  )
}
