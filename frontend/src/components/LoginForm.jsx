import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, User } from 'lucide-react'

export default function LoginForm({ title, idLabel, icon }) {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!id.trim()) nextErrors.id = `${idLabel} is required`
    if (!password.trim()) nextErrors.password = 'Password is required'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="h-screen w-full gradient-bg flex items-center justify-center px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-3xl p-8 w-full max-w-sm shadow-2xl"
      >
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-1 text-mist/60 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-electric to-violet text-white mb-3">
            {icon}
          </div>
          <h2 className="text-2xl font-display font-semibold text-white">{title}</h2>
        </div>

        <label className="block text-sm text-mist/70 mb-1">{idLabel}</label>
        <div className="relative mb-1">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist/40" />
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-mist/30 focus:outline-none focus:ring-2 focus:ring-violet"
            placeholder={`Enter your ${idLabel.toLowerCase()}`}
          />
        </div>
        {errors.id && <p className="text-red-400 text-xs mb-2">{errors.id}</p>}

        <label className="block text-sm text-mist/70 mb-1 mt-3">Password</label>
        <div className="relative mb-1">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist/40" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-mist/30 focus:outline-none focus:ring-2 focus:ring-violet"
            placeholder="••••••••"
          />
        </div>
        {errors.password && <p className="text-red-400 text-xs mb-2">{errors.password}</p>}

        <button
          type="button"
          className="text-xs text-electric hover:text-skyglow mt-1 mb-5 block ml-auto"
        >
          Forgot password?
        </button>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className="ripple w-full py-3 rounded-xl bg-gradient-to-r from-electric to-violet text-white font-semibold shadow-lg hover:shadow-violet/40 transition-shadow"
        >
          Log In
        </motion.button>
      </motion.form>
    </div>
  )
}
