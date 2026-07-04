import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip)

export default function CircularStat({ label, value, colorFrom = '#4F5DFF', colorTo = '#8B5CF6' }) {
  const data = {
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [colorFrom, 'rgba(255,255,255,0.08)'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  }

  return (
    <div className="glass rounded-2xl p-5 flex flex-col items-center">
      <div className="relative w-28 h-28">
        <Doughnut data={data} options={{ plugins: { tooltip: { enabled: false } }, animation: { duration: 800 } }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-display font-bold text-xl">{value}%</span>
        </div>
      </div>
      <p className="mt-3 text-mist/70 text-sm text-center">{label}</p>
    </div>
  )
}
