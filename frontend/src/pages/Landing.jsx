import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: 40 + Math.random() * 100,
  top: Math.random() * 100,
  left: Math.random() * 100,
  delay: Math.random() * 4,
  hue: i % 2 === 0 ? 'bg-violet' : 'bg-electric',
}))

export default function Landing() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const duration = 3000
    const tick = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / duration) * 100)
      setProgress(pct)
      if (pct >= 100) clearInterval(tick)
    }, 40)
    const timeout = setTimeout(() => navigate('/login'), duration)
    return () => { clearInterval(tick); clearTimeout(timeout) }
  }, [navigate])

  return (
    <div className="relative h-screen w-full overflow-hidden gradient-bg animate-gradientShift flex flex-col items-center justify-center">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.hue} opacity-30 animate-drift`}
          style={{
            width: p.size, height: p.size, top: `${p.top}%`, left: `${p.left}%`,
            animationDelay: `${p.delay}s`, filter: 'blur(2px)',
          }}
        />
      ))}

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="font-display text-5xl md:text-7xl font-bold text-white glow-text tracking-tight text-center px-4"
      >
        Institution OS AI
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="mt-4 text-mist/70 font-body tracking-wide"
      >
        Loading...
      </motion.p>

      <div className="mt-8 w-64 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-electric to-violet rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
