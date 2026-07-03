import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  {
    id: 'dashboard',
    path: '/prestadores',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'solicitudes',
    path: '/prestadores/solicitudes',
    label: 'Solicitudes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'situaciones',
    path: '/prestadores/situaciones',
    label: 'Situaciones terapéuticas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'turnos',
    path: '/prestadores/turnos',
    label: 'Turnos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'historia',
    path: '/prestadores/historia',
    label: 'Historia clínica',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/prestadores') return location.pathname === '/prestadores'
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-slate-100 shadow-sm
        transition-all duration-300 ease-in-out flex-shrink-0
        fixed md:sticky bottom-0 md:bottom-auto top-auto md:top-0 left-0 right-0 md:right-auto z-[70]
        w-full h-16 md:h-screen border-t md:border-t-0 pb-0
        ${collapsed ? 'md:w-16 md:min-w-[4rem] md:max-w-[4rem] md:basis-[4rem]' : 'md:w-[14.5rem] md:min-w-[14.5rem] md:max-w-[14.5rem] md:basis-[14.5rem]'}
      `}
    >
      <div className="hidden md:flex items-center justify-between px-4 py-5 border-b border-slate-100">
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="OSDU" className="w-16 h-16 object-contain flex-shrink-0" />
            <div>
              <p className="text-base font-800 text-emerald-700 leading-tight">OSDU</p>
              <p className="text-xs text-slate-400 leading-tight">Prestadores</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center mx-auto">
            <img src="/logo.png" alt="OSDU" className="w-12 h-12 object-contain" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ${collapsed ? 'mx-auto' : ''}`}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      <nav className="flex-1 w-full px-1 md:px-3 py-2 md:py-4 md:space-y-1 grid grid-cols-5 md:block items-center md:justify-start overflow-hidden md:overflow-visible">
        {!collapsed && (
          <p className="hidden md:block text-xs font-600 text-slate-400 uppercase tracking-wider px-2 mb-3">
            Menú principal
          </p>
        )}
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                w-full md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-1 md:px-3 py-2 md:py-2.5 rounded-xl text-[10px] sm:text-[11px] md:text-sm font-500 transition-all duration-150 min-w-0
                ${active ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                ${collapsed ? 'md:justify-center' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className={`flex-shrink-0 ${active ? 'text-teal-600' : ''}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate text-center md:text-left max-w-full md:max-w-none">{item.label}</span>
              )}
              {!collapsed && active && (
                <span className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
