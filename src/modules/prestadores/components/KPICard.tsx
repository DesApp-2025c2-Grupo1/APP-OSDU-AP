// @ts-nocheck
export default function KPICard({ title, value, change, changeLabel, icon, colorClass, bgClass, borderClass, onClick }) {
  const isPositive = change >= 0
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl p-4 sm:p-5 border shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:-translate-y-0.5 focus:ring-2 focus:ring-teal-500 outline-none' : ''} ${borderClass}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgClass}`}>
          <span className={colorClass}>{icon}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-500 px-2 py-1 rounded-full
            ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
        >
          {isPositive ? (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-700 text-slate-800 mb-1 tracking-tight">{value}</p>
      <p className="text-sm font-500 text-slate-500">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{changeLabel}</p>
    </Component>
  )
}
