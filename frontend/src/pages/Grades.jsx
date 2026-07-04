import React, { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const SUBJECTS_BY_YEAR = {
  1: ['Maths', 'Physics', 'Chemistry'],
  2: ['Data Structures and Algorithms', 'Probability and Statistics', 'Java'],
  3: ['Design and Analysis of Algorithm', 'Machine Learning', 'UI/UX'],
  4: ['Data Warehousing and Data Mining', 'Data Science', 'Computer Architecture'],
}

export default function Grades() {
  const [year, setYear] = useState(1)

  const chartData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
    datasets: [{
      label: 'SGPA',
      data: [7.8, 8.1, 8.4, 8.6],
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139,92,246,0.15)',
      fill: true,
      tension: 0.4,
    }],
  }

  return (
    <div className="h-screen w-full gradient-bg flex p-4 gap-4 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto pr-1">
        <Navbar />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-mist/60 text-sm mb-1">CGPA</p>
            <p className="text-3xl font-display font-bold text-white">8.42</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-mist/60 text-sm mb-1">Current SGPA</p>
            <p className="text-3xl font-display font-bold text-white">8.6</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                year === y ? 'bg-gradient-to-r from-electric to-violet text-white' : 'bg-white/5 text-mist/60 hover:text-white'
              }`}
            >
              Year {y}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {SUBJECTS_BY_YEAR[year].map((subj) => (
            <div key={subj} className="glass rounded-2xl p-4">
              <p className="text-white text-sm font-medium mb-2">{subj}</p>
              <p className="text-2xl font-display font-bold text-violet">{75 + Math.floor(Math.random() * 20)}</p>
              <p className="text-mist/40 text-xs">out of 100</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-display font-semibold mb-3">Performance Over Years</h3>
          <Line data={chartData} options={{ plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 10, ticks: { color: '#ffffff60' } }, x: { ticks: { color: '#ffffff60' } } } }} />
        </div>
      </main>
    </div>
  )
}
