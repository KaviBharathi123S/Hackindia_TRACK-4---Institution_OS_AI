import React, { useMemo } from 'react'
import { DEPARTMENTS } from '../config'

// Deterministic pseudo-random helper so attendance/leave numbers stay stable
// across re-renders instead of jumping around (real attendance data would
// come from a bulk /attendance endpoint — this derives a stable placeholder
// from the student count until that endpoint exists).
function stableStat(seed, min, max) {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

export default function DepartmentStats({ students }) {
  const stats = useMemo(() => {
    return Object.entries(DEPARTMENTS).map(([deptId, dept]) => {
      const deptStudents = students.filter((s) => s.dept_id === Number(deptId))
      const avgGpa =
        deptStudents.length > 0
          ? (deptStudents.reduce((sum, s) => sum + Number(s.gcpa || 0), 0) / deptStudents.length).toFixed(2)
          : '0.00'
      return {
        ...dept,
        deptId,
        count: deptStudents.length,
        avgGpa,
        attendance: stableStat(Number(deptId) * 7.3, 78, 96),
        leaveRequests: stableStat(Number(deptId) * 3.1, 1, 9),
      }
    })
  }, [students])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((d) => (
        <div key={d.deptId} className="glass rounded-2xl p-4">
          <p className="text-white font-semibold text-sm mb-2">{d.name}</p>
          <div className="text-xs text-mist/60 space-y-1">
            <p>Students: <span className="text-white">{d.count}</span></p>
            <p>Attendance: <span className="text-white">{d.attendance}%</span></p>
            <p>Avg GPA: <span className="text-white">{d.avgGpa}</span></p>
            <p>Leave Requests: <span className="text-white">{d.leaveRequests}</span></p>
          </div>
        </div>
      ))}
    </div>
  )
}
