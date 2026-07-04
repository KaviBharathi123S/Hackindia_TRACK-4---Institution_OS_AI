import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, PencilLine, Trash2, Pencil, Check, X } from 'lucide-react'
import { DEPARTMENTS, API_BASE } from '../config'
import { useStudents } from '../context/StudentsContext'

function StudentMiniTable({ rows }) {
  // Local copy so this specific chat bubble's table can show the edited
  // value immediately, independent of the (frozen) event.rows it was given.
  const [localRows, setLocalRows] = useState(rows)
  const [editingId, setEditingId] = useState(null)
  const [draftValue, setDraftValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorId, setErrorId] = useState(null)
  const { updateStudent } = useStudents()

  function startEdit(row) {
    setEditingId(row.student_id)
    setDraftValue(String(row.gcpa))
    setErrorId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setDraftValue('')
  }

  async function saveEdit(studentId) {
    const parsed = parseFloat(draftValue)
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 10) {
      setErrorId(studentId)
      return
    }
    setSaving(true)
    try {
      // Direct REST call to FastAPI — bypasses the AI agent entirely.
      const res = await fetch(`${API_BASE}/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gcpa: parsed }),
      })
      if (!res.ok) throw new Error('Update failed')
      setLocalRows((prev) =>
        prev.map((r) => (r.student_id === studentId ? { ...r, gcpa: parsed } : r))
      )
      updateStudent(studentId, { gcpa: parsed }) // syncs Dashboard / Student Details live
      setEditingId(null)
    } catch {
      setErrorId(studentId)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-white/5 text-mist/60 text-left">
            <th className="px-3 py-2 font-normal">ID</th>
            <th className="px-3 py-2 font-normal">Name</th>
            <th className="px-3 py-2 font-normal">Dept</th>
            <th className="px-3 py-2 font-normal">GCPA</th>
            <th className="px-3 py-2 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {localRows.slice(0, 8).map((r) => (
            <tr key={r.student_id} className="border-t border-white/5 text-white/90">
              <td className="px-3 py-1.5">{r.student_id}</td>
              <td className="px-3 py-1.5">{r.student_name}</td>
              <td className="px-3 py-1.5">{DEPARTMENTS[r.dept_id]?.code || r.dept_id}</td>
              <td className="px-3 py-1.5">
                {editingId === r.student_id ? (
                  <input
                    autoFocus
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    className="w-16 bg-white/10 border border-violet/50 rounded px-1.5 py-0.5 text-white text-xs focus:outline-none"
                  />
                ) : (
                  Number(r.gcpa).toFixed(2)
                )}
                {errorId === r.student_id && (
                  <span className="text-red-400 ml-1">✗</span>
                )}
              </td>
              <td className="px-3 py-1.5">
                {editingId === r.student_id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => saveEdit(r.student_id)}
                      disabled={saving}
                      className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                    >
                      <Check size={13} />
                    </button>
                    <button onClick={cancelEdit} className="text-mist/50 hover:text-white">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(r)}
                    className="text-mist/40 hover:text-violet transition-colors"
                    title="Edit GCPA"
                  >
                    <Pencil size={13} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {localRows.length > 8 && (
        <p className="text-mist/40 text-[11px] px-3 py-1.5 bg-white/5">
          +{localRows.length - 8} more — see full list on the Student Details page
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

function AttendanceMiniTable({ rows }) {
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-white/5 text-mist/60 text-left">
            <th className="px-3 py-2 font-normal">Student</th>
            <th className="px-3 py-2 font-normal">Leave Allotted</th>
            <th className="px-3 py-2 font-normal">Taken</th>
            <th className="px-3 py-2 font-normal">On Duty</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((r) => (
            <tr key={r.attendance_id} className="border-t border-white/5 text-white/90">
              <td className="px-3 py-1.5">{r.student_name || r.student_id}</td>
              <td className="px-3 py-1.5">{r.leave}</td>
              <td className="px-3 py-1.5">{r.leave_taken_so_far}</td>
              <td className="px-3 py-1.5">{r.on_duty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 8 && (
        <p className="text-mist/40 text-[11px] px-3 py-1.5 bg-white/5">
          +{rows.length - 8} more
        </p>
      )}
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
  if (event.type === 'render_table' && event.table === 'attendance') {
    return <AttendanceMiniTable rows={event.rows} />
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
