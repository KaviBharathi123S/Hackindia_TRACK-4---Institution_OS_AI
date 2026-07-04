import React, { useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import CircularStat from '../components/CircularStat'
import DepartmentStats from '../components/DepartmentStats'
import RecentActivityTable from '../components/RecentActivityTable'
import AIAssistantPanel from '../components/AIAssistantPanel'
import { useStudents } from '../context/StudentsContext'

export default function Dashboard() {
  const { students, loading, error } = useStudents()

  const avgGpa = useMemo(() => {
    if (students.length === 0) return 0
    const sum = students.reduce((s, x) => s + Number(x.gcpa || 0), 0)
    return Math.round((sum / students.length) * 10)
  }, [students])

  return (
    <div className="h-screen w-full gradient-bg flex p-4 gap-4 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto pr-1">
        <Navbar />

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            Couldn't reach the backend ({error}). Make sure FastAPI is running on port 8000.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <CircularStat label="Leave Approval %" value={82} colorFrom="#8B5CF6" />
          <CircularStat label="Attendance %" value={88} colorFrom="#4F5DFF" />
          <CircularStat label="Average Grade" value={avgGpa} colorFrom="#38BDF8" />
        </div>

        <div className="glass rounded-2xl p-5 mb-4">
          <h3 className="text-white font-display font-semibold mb-3">Department Statistics</h3>
          <DepartmentStats students={students} />
        </div>

        <RecentActivityTable students={students} loading={loading} />
      </main>

      <AIAssistantPanel />
    </div>
  )
}
