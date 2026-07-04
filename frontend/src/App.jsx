import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StudentsProvider } from './context/StudentsContext'
import Landing from './pages/Landing'
import LoginSelect from './pages/LoginSelect'
import StaffLogin from './pages/StaffLogin'
import StudentLogin from './pages/StudentLogin'
import Dashboard from './pages/Dashboard'
import StudentDetails from './pages/StudentDetails'
import Grades from './pages/Grades'
import Attendance from './pages/Attendance'

export default function App() {
  return (
    <StudentsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginSelect />} />
          <Route path="/login/staff" element={<StaffLogin />} />
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentDetails />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </BrowserRouter>
    </StudentsProvider>
  )
}
