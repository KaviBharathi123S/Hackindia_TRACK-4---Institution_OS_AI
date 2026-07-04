import React from 'react'

const STYLES = {
  Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  Active: 'bg-electric/15 text-electric border-electric/30',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.Active
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  )
}
