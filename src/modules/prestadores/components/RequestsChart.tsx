// @ts-nocheck
import { useState } from 'react'

const dailyData = [
  { label: 'Lun', pendientes: 12, analisis: 8, observadas: 3, resueltas: 18 },
  { label: 'Mar', pendientes: 15, analisis: 10, observadas: 5, resueltas: 22 },
  { label: 'Mié', pendientes: 9, analisis: 14, observadas: 4, resueltas: 25 },
  { label: 'Jue', pendientes: 18, analisis: 11, observadas: 7, resueltas: 20 },
  { label: 'Vie', pendientes: 22, analisis: 9, observadas: 2, resueltas: 30 },
  { label: 'Sáb', pendientes: 7, analisis: 5, observadas: 1, resueltas: 14 },
  { label: 'Dom', pendientes: 4, analisis: 3, observadas: 0, resueltas: 8 },
]

const weeklyData = [
  { label: 'Sem 1', pendientes: 48, analisis: 32, observadas: 12, resueltas: 68 },
  { label: 'Sem 2', pendientes: 62, analisis: 41, observadas: 18, resueltas: 85 },
  { label: 'Sem 3', pendientes: 55, analisis: 38, observadas: 15, resueltas: 92 },
  { label: 'Sem 4', pendientes: 71, analisis: 45, observadas: 22, resueltas: 110 },
]

const series = [
  { key: 'pendientes', label: 'Pendientes', color: '#f59e0b' },
  { key: 'analisis', label: 'En análisis', color: '#6366f1' },
  { key: 'observadas', label: 'Observadas', color: '#ef4444' },
  { key: 'resueltas', label: 'Resueltas', color: '#10b981' },
]

function getSVGPath(data, key, maxVal, width, height) {
  const pad = 30
  const w = width - pad * 2
  const h = height - pad * 2
  return data
    .map((d, i) => {
      const x = pad + (i / (data.length - 1)) * w
      const y = pad + h - (d[key] / maxVal) * h
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`
    })
    .join(' ')
}

export default function RequestsChart() {
  const [mode, setMode] = useState('day')
  const [hoveredSeries, setHoveredSeries] = useState(null)

  const data = mode === 'day' ? dailyData : weeklyData
  const chartWidth = 700
  const chartHeight = 220
  const pad = 30
  const maxVal = Math.max(...data.flatMap((d) => series.map((s) => d[s.key]))) * 1.2

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-base font-600 text-slate-800">Evolución de solicitudes</h2>
          <p className="text-sm text-slate-400 mt-0.5">Seguimiento por período</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('day')}
            className={`px-3 py-1.5 text-xs font-500 rounded-md transition-all ${mode === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Por día
          </button>
          <button
            onClick={() => setMode('week')}
            className={`px-3 py-1.5 text-xs font-500 rounded-md transition-all ${mode === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Por semana
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-4 flex-wrap">
        {series.map((s) => (
          <button
            key={s.key}
            onMouseEnter={() => setHoveredSeries(s.key)}
            onMouseLeave={() => setHoveredSeries(null)}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-slate-500 group-hover:text-slate-800 transition-colors">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ minWidth: 300 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = pad + (chartHeight - pad * 2) * ratio
            const val = Math.round(maxVal * (1 - ratio))
            return (
              <g key={ratio}>
                <line x1={pad} y1={y} x2={chartWidth - pad} y2={y} stroke="#f1f5f9" strokeWidth={1} />
                <text x={pad - 5} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">{val}</text>
              </g>
            )
          })}

          {data.map((d, i) => {
            const x = pad + (i / (data.length - 1)) * (chartWidth - pad * 2)
            return (
              <text key={i} x={x} y={chartHeight - 5} textAnchor="middle" fontSize={11} fill="#94a3b8">
                {d.label}
              </text>
            )
          })}

          {series.map((s) => {
            const path = getSVGPath(data, s.key, maxVal, chartWidth, chartHeight)
            const firstX = pad
            const lastX = pad + (chartWidth - pad * 2)
            const bottomY = pad + (chartHeight - pad * 2)
            const isActive = hoveredSeries === null || hoveredSeries === s.key
            return (
              <g key={s.key} style={{ opacity: isActive ? 1 : 0.2, transition: 'opacity 0.2s' }}>
                <path d={`${path} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`} fill={s.color} fillOpacity={0.07} />
                <path d={path} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {data.map((d, i) => {
                  const x = pad + (i / (data.length - 1)) * (chartWidth - pad * 2)
                  const val = d[s.key]
                  const y = pad + (chartHeight - pad * 2) - (val / maxVal) * (chartHeight - pad * 2)
                  return <circle key={i} cx={x} cy={y} r={3.5} fill={s.color} stroke="white" strokeWidth={1.5} />
                })}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
