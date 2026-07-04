import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { useStudents } from '../context/StudentsContext'
import { DEPARTMENTS } from '../config'

export default function StudentDetails() {
  const { students, loading } = useStudents()
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.student_name.toLowerCase().includes(search.toLowerCase()) ||
        s.student_id.toLowerCase().includes(search.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(search.toLowerCase())
      const matchesDept = deptFilter === 'all' || String(s.dept_id) === deptFilter
      return matchesSearch && matchesDept
    })
  }, [students, search, deptFilter])

  return (
    <div className="h-screen w-full gradient-bg flex p-4 gap-4 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto pr-1">
        <Navbar />

        <div className="glass rounded-2xl p-5 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or roll number..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-mist/30 focus:outline-none focus:ring-2 focus:ring-violet text-sm"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet"
            >
              <option value="all" className="bg-ink">All Departments</option>
              {Object.entries(DEPARTMENTS).map(([id, d]) => (
                <option key={id} value={id} className="bg-ink">{d.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-auto flex-1">
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => <div key={i} className="h-10 rounded-xl skeleton" />)}
              </div>
            ) : (
              <table className="w-full text-sm min-w-[800px]">
                <thead className="sticky top-0 bg-ink/80 backdrop-blur">
                  <tr className="text-mist/50 text-left border-b border-white/10">
                    <th className="py-2 font-normal">Student ID</th>
                    <th className="py-2 font-normal">Name</th>
                    <th className="py-2 font-normal">Department</th>
                    <th className="py-2 font-normal">Batch</th>
                    <th className="py-2 font-normal">Gender</th>
                    <th className="py-2 font-normal">GCPA</th>
                    <th className="py-2 font-normal">Status</th>
                    <th className="py-2 font-normal"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((s) => (
                      <motion.tr
                        key={s.student_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/5 text-white"
                      >
                        <td className="py-2.5">{s.student_id}</td>
                        <td className="py-2.5">{s.student_name}</td>
                        <td className="py-2.5 text-mist/60">{DEPARTMENTS[s.dept_id]?.name}</td>
                        <td className="py-2.5 text-mist/60">{s.batch}</td>
                        <td className="py-2.5 text-mist/60">{s.gender}</td>
                        <td className="py-2.5">{Number(s.gcpa).toFixed(2)}</td>
                        <td className="py-2.5"><StatusBadge status="Active" /></td>
                        <td className="py-2.5">
                          <button className="text-mist/40 hover:text-white"><Eye size={16} /></button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
            {!loading && filtered.length === 0 && (
              <p className="text-mist/40 text-sm text-center py-10">No students match your search.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
