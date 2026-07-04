import React from 'react'
import { Bell } from 'lucide-react'

export default function Navbar() {
  return (
    <div className="flex items-center justify-between px-6 py-4 glass rounded-2xl mb-6">
      <h2 className="text-white font-display font-semibold text-lg">Institution OS AI</h2>
      <div className="flex items-center gap-4">
        <button className="relative text-mist/70 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric to-violet flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
          <span className="text-white text-sm hidden sm:block">Admin User</span>
        </div>
      </div>
    </div>
  )
}
