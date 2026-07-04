import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, LinearScale, CategoryScale, Tooltip } from 'chart.js'
import { Download } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

ChartJS.register(BarElement, LinearScale, CategoryScale, Tooltip)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const ATTENDANCE = [92, 88, 95, 84, 90, 93]

export default function Attendance() {
  const chartData = {
    labels: MONTHS,
    datasets: [{
      label: 'Attendance %',
      data: ATTENDANCE,
      backgroundColor: '#4F5DFF',
      borderRadius: 8,
    }],
  }

  return (
    <div className="h-screen w-full gradient-bg flex p-4 gap-4 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto pr-1">
        <Navbar />

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-mist/60 text-sm mb-1">Overall %</p>
            <p className="text-3xl font-display font-bold text-white">90.3%</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-mist/60 text-sm mb-1">Present</p>
            <p className="text-3xl font-display font-bold text-emerald-400">142</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-mist/60 text-sm mb-1">Absent</p>
            <p className="text-3xl font-display font-bold text-red-400">12</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-display font-semibold">Monthly Attendance</h3>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-mist/70 hover:text-white transition-colors">
              <Download size={14} /> Download Report
            </button>
          </div>
          <Bar data={chartData} options={{ plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, ticks: { color: '#ffffff60' } }, x: { ticks: { color: '#ffffff60' } } } }} />
        </div>
      </main>
    </div>
  )
}
