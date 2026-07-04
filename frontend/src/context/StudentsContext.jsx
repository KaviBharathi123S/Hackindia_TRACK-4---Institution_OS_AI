import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { API_BASE } from '../config'

const StudentsContext = createContext(null)

export function StudentsProvider({ children }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/students?limit=1000`)
      if (!res.ok) throw new Error(`Backend returned ${res.status}`)
      const data = await res.json()
      setStudents(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  // These three are called by the AI Assistant panel when a ui_event arrives.
  // This is THE mechanism that makes other pages update live, with no refresh:
  // any component reading `students` from this context re-renders automatically.
  const addStudent = useCallback((student) => {
    setStudents((prev) => {
      if (prev.some((s) => s.student_id === student.student_id)) return prev
      return [student, ...prev]
    })
  }, [])

  const updateStudent = useCallback((studentId, patch) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, ...patch } : s))
    )
  }, [])

  const removeStudent = useCallback((studentId) => {
    setStudents((prev) => prev.filter((s) => s.student_id !== studentId))
  }, [])

  return (
    <StudentsContext.Provider
      value={{ students, loading, error, fetchStudents, addStudent, updateStudent, removeStudent }}
    >
      {children}
    </StudentsContext.Provider>
  )
}

export function useStudents() {
  const ctx = useContext(StudentsContext)
  if (!ctx) throw new Error('useStudents must be used inside StudentsProvider')
  return ctx
}
