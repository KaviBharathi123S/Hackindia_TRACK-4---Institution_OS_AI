import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, PencilLine, Trash2 } from 'lucide-react'
import { DEPARTMENTS } from '../config'

function StudentMiniTable({ rows }) {
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-white/5 text-mist/60 text-left">
            <th className="px-3 py-2 font-normal">ID</th>
            <th className="px-3 py-2 font-normal">Name</th>
            <th className="px-3 py-2 font-normal">Dept</th>
            <th className="px-3 py-2 font-normal">GCPA</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((r) => (
            <tr key={r.student_id} className="border-t border-white/5 text-white/90">
              <td className="px-3 py-1.5">{r.student_id}</td>
              <td className="px-3 py-1.5">{r.student_name}</td>
              <td className="px-3 py-1.5">{DEPARTMENTS[r.dept_id]?.code || r.dept_id}</td>
              <td className="px-3 py-1.5">{Number(r.gcpa).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 8 && (
        <p className="text-mist/40 text-[11px] px-3 py-1.5 bg-white/5">
          +{rows.length - 8} more — see full list on the Student Details page
        </p>
      )}
    </div>
  )
}

function AcademicMiniTable({ rows }) {
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-white/5 text-mist/60 text-left">
            <th className="px-3 py-2 font-normal">Year</th>
            <th className="px-3 py-2 font-normal">Total</th>
            <th className="px-3 py-2 font-normal">Grade</th>
            <th className="px-3 py-2 font-normal">SGPA</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.record_id} className="border-t border-white/5 text-white/90">
              <td className="px-3 py-1.5">{r.year_level}</td>
              <td className="px-3 py-1.5">{r.total}</td>
              <td className="px-3 py-1.5">{r.grade}</td>
              <td className="px-3 py-1.5">{Number(r.sgpa).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function InlineChatEvent({ event }) {
  const base = 'mt-2 rounded-xl px-3 py-2 text-xs flex items-center gap-2'

  if (event.type === 'render_table' && event.table === 'students') {
    return <StudentMiniTable rows={event.rows} />
  }
  if (event.type === 'render_table' && event.table === 'academic_records') {
    return <AcademicMiniTable rows={event.rows} />
  }

  if (event.type === 'row_created') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className={`${base} bg-emerald-500/10 text-emerald-300 border border-emerald-500/20`}>
        <CheckCircle2 size={14} />
        Added {event.data.student_name} ({event.data.student_id})
      </motion.div>
    )
  }

  if (event.type === 'row_updated') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className={`${base} bg-electric/10 text-electric border border-electric/20`}>
        <PencilLine size={14} />
        Updated {event.id || event.data?.student_id}
      </motion.div>
    )
  }

  if (event.type === 'row_deleted') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className={`${base} bg-red-500/10 text-red-300 border border-red-500/20`}>
        <Trash2 size={14} />
        Deleted {event.id}
      </motion.div>
    )
  }

  return null
}
