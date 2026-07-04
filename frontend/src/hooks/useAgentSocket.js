import { useEffect, useRef, useState, useCallback } from 'react'
import { WS_BASE } from '../config'

/**
 * Connects to ws://.../ws/chat/{sessionId} — the real FastAPI agent endpoint.
 * onMessage receives the parsed {reply, ui_events} object for every response.
 */
export function useAgentSocket(sessionId, onMessage) {
  const wsRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const [status, setStatus] = useState('connecting') // connecting | open | closed

  onMessageRef.current = onMessage

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    let retryTimeout

    function connect() {
      const ws = new WebSocket(`${WS_BASE}/ws/chat/${sessionId}`)
      wsRef.current = ws

      ws.onopen = () => { if (!cancelled) setStatus('open') }

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          onMessageRef.current?.(parsed)
        } catch {
          onMessageRef.current?.({ reply: 'Received an unreadable response.', ui_events: [] })
        }
      }

      ws.onclose = () => {
        if (cancelled) return
        setStatus('closed')
        // auto-reconnect after 2s, e.g. if the backend restarted mid-session
        retryTimeout = setTimeout(connect, 2000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(retryTimeout)
      wsRef.current?.close()
    }
  }, [sessionId])

  const sendMessage = useCallback((text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(text)
      return true
    }
    return false
  }, [])

  return { sendMessage, status }
}
