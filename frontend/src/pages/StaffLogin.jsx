import React from 'react'
import { ShieldCheck } from 'lucide-react'
import LoginForm from '../components/LoginForm'

export default function StaffLogin() {
  return <LoginForm title="Staff Login" idLabel="Staff ID" icon={<ShieldCheck size={28} />} />
}
