import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, GraduationCap } from 'lucide-react'

function SelectCard({ icon, title, subtitle, onClick, delay }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="ripple glass rounded-3xl p-10 w-72 flex flex-col items-center gap-4 shadow-xl hover:shadow-violet/30 transition-shadow"
    >
      <div className="p-5 rounded-2xl bg-gradient-to-br from-electric to-violet text-white">
        {icon}
      </div>
      <h3 className="text-xl font-display font-semibold text-white">{title}</h3>
      <p className="text-mist/60 text-sm text-center">{subtitle}</p>
    </motion.button>
  )
}

export default function LoginSelect() {
  const navigate = useNavigate()
  return (
    <div className="h-screen w-full gradient-bg flex flex-col items-center justify-center gap-10 px-4">
      <motion.h2
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-3xl md:text-4xl font-display font-bold text-white text-center"
      >
        Welcome back — how are you signing in?
      </motion.h2>
      <div className="flex flex-col sm:flex-row gap-8">
        <SelectCard
          icon={<ShieldCheck size={32} />}
          title="Staff Login"
          subtitle="Manage students, attendance, and grades"
          onClick={() => navigate('/login/staff')}
          delay={0.1}
        />
        <SelectCard
          icon={<GraduationCap size={32} />}
          title="Student Login"
          subtitle="View your grades, attendance, and profile"
          onClick={() => navigate('/login/student')}
          delay={0.25}
        />
      </div>
    </div>
  )
}
