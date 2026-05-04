// @ts-nocheck
const actions = [
  {
    id: 'analisis',
    label: 'Ver en análisis',
    description: '14 solicitudes en revisión',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50',
    hoverBg: 'hover:bg-indigo-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: 'observadas',
    label: 'Ver observadas',
    description: '6 requieren atención',
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-50',
    hoverBg: 'hover:bg-rose-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    id: 'nueva',
    label: 'Nueva solicitud',
    description: 'Crear y enviar',
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-50',
    hoverBg: 'hover:bg-teal-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    id: 'turno',
    label: 'Pedir turno',
    description: 'Agenda disponible',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    hoverBg: 'hover:bg-amber-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function QuickActions({ onAction }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-600 text-slate-800">Accesos rápidos</h2>
        <p className="text-sm text-slate-400 mt-0.5">Acciones frecuentes</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction?.(action.id)}
            className={`group flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-slate-100 min-h-28 sm:min-h-0
              transition-all duration-200 text-left
              hover:border-transparent hover:shadow-lg hover:scale-[1.02]
              ${action.hoverBg} hover:text-white`}
          >
            <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0
              transition-colors duration-200 ${action.bgClass} ${action.colorClass}
              group-hover:bg-white/20 group-hover:text-white`}>
              {action.icon}
            </span>
            <div>
              <p className={`text-xs sm:text-sm font-600 ${action.colorClass} group-hover:text-white transition-colors leading-snug`}>
                {action.label}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 group-hover:text-white/80 transition-colors mt-0.5 leading-snug">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
