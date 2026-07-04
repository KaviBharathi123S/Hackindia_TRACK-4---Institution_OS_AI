import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DEPARTMENTS } from '../config'
import StatusBadge from './StatusBadge'

export default function RecentActivityTable({ students, loading }) {
  const recent = students.slice(0, 8)

  return (
    <div className="glass rounded-2xl p-5 overflow-x-auto">
      <h3 className="text-white font-display font-semibold mb-4">Recent Activity</h3>
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl skeleton" />
          ))}
        </div>
      ) : (
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="text-mist/50 text-left border-b border-white/10">
              <th className="pb-2 font-normal">Student</th>
              <th className="pb-2 font-normal">Department</th>
              <th className="pb-2 font-normal">GCPA</th>
              <th className="pb-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {recent.map((s) => (
                <motion.tr
                  key={s.student_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-white/5 text-white"
                >
                  <td className="py-2.5">{s.student_name}</td>
                  <td className="py-2.5 text-mist/60">{DEPARTMENTS[s.dept_id]?.code}</td>
                  <td className="py-2.5">{Number(s.gcpa).toFixed(2)}</td>
                  <td className="py-2.5"><StatusBadge status="Active" /></td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      )}
    </div>
  )
}
