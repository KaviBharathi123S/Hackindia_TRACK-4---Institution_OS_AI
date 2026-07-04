import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, BookOpen, CalendarCheck, FileText, Settings, LogOut } from 'lucide-react'

const MENU = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Student Details', icon: Users, path: '/students' },
  { label: 'Grades', icon: BookOpen, path: '/grades' },
  { label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
  { label: 'Leave Requests', icon: FileText, path: '/dashboard' },
  { label: 'Settings', icon: Settings, path: '/dashboard' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="hidden md:flex flex-col w-60 shrink-0 glass !bg-black/30 rounded-r-3xl py-6 px-4 gap-1"
    >
      <div className="px-2 mb-6">
        <h1 className="text-white font-display font-bold text-lg leading-tight">Institution<br />OS AI</h1>
      </div>

      {MENU.map((item) => {
        const active = location.pathname === item.path
        const Icon = item.icon
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              active
                ? 'bg-gradient-to-r from-electric to-violet text-white shadow-lg'
                : 'text-mist/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {item.label}
          </button>
        )
      })}

      <div className="flex-1" />

      <button
        onClick={() => navigate('/login')}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-mist/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
      >
        <LogOut size={18} />
        Logout
      </button>
    </motion.aside>
  )
}
