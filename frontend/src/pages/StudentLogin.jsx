import React from 'react'
import { GraduationCap } from 'lucide-react'
import LoginForm from '../components/LoginForm'

export default function StudentLogin() {
  return <LoginForm title="Student Login" idLabel="Student ID" icon={<GraduationCap size={28} />} />
}
