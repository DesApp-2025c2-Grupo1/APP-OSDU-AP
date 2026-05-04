// @ts-nocheck
import KPICard from '../components/KPICard'
import RequestsChart from '../components/RequestsChart'
import QuickActions from '../components/QuickActions'
import HeaderUser from '../components/HeaderUser'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

function normalizeSlashDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value).trim())
  if (!match) return value
  const [, first, second, yyyy] = match
  if (Number(first) > 12) return `${second.padStart(2, '0')}/${first.padStart(2, '0')}/${yyyy}`
  return `${first.padStart(2, '0')}/${second.padStart(2, '0')}/${yyyy}`
}

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Nueva solicitud recibida',
    text: 'Se recibió una nueva solicitud de reintegro de Juan Pérez.',
    time: 'Hoy, 10:30',
    unread: true,
    iconClass: 'bg-teal-50 text-teal-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 9.5V19a2 2 0 01-2 2z" />
    ),
  },
  {
    id: 2,
    title: 'Solicitud en análisis',
    text: 'La solicitud de autorización de María López pasó a estado en análisis.',
    time: 'Hoy, 09:15',
    unread: true,
    iconClass: 'bg-amber-50 text-amber-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    id: 3,
    title: 'Solicitud observada',
    text: 'La solicitud de reintegro de Carlos García fue observada. Requiere tu revisión.',
    time: 'Ayer, 16:45',
    unread: true,
    iconClass: 'bg-orange-50 text-orange-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9h3.4L21 17.5 19.3 20H4.7L3 17.5 10.3 3.9z" />
    ),
  },
  {
    id: 4,
    title: 'Solicitud aprobada',
    text: 'La solicitud de autorización de Ana Torres fue aprobada exitosamente.',
    time: 'Ayer, 11:20',
    unread: false,
    iconClass: 'bg-emerald-50 text-emerald-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    ),
  },
  {
    id: 5,
    title: 'Solicitud rechazada',
    text: 'La solicitud de reintegro de Luis Martínez fue rechazada.',
    time: '05/14/2024',
    unread: false,
    iconClass: 'bg-rose-50 text-rose-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    ),
  },
]

const PERIOD_OPTIONS = ['Este mes', 'Mes anterior', 'Últimos 3 meses']

function PeriodDropdown() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(PERIOD_OPTIONS[0])
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} className="relative min-w-0 w-full sm:w-40">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-xs font-600 bg-white sm:bg-slate-100 border rounded-xl outline-none transition-colors ${
          open ? 'border-teal-500 ring-2 ring-teal-100 text-slate-800' : 'border-slate-200 sm:border-transparent text-slate-600 hover:border-slate-300'
        }`}
        aria-expanded={open}
      >
        <span className="min-w-0 truncate">{value}</span>
        <svg className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[80] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
          {PERIOD_OPTIONS.map(option => {
            const selected = option === value
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setValue(option)
                  setOpen(false)
                }}
                className={`w-full px-3 py-2.5 text-left text-sm font-600 transition-colors ${
                  selected ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const unreadCount = notifications.filter(n => n.unread).length

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  function markAllRead() {
    setNotifications(prev => prev.map(item => ({ ...item, unread: false })))
  }

  function openNotification(notification) {
    setNotifications(prev => prev.map(item => item.id === notification.id ? { ...item, unread: false } : item))
    setSelectedNotification({ ...notification, unread: false })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="fixed left-3 right-3 top-20 max-h-[calc(100dvh-8.5rem)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[28rem] sm:max-w-[calc(100vw-2rem)] sm:max-h-none bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-[80] flex flex-col">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-700 text-slate-800">Notificaciones</h2>
            <p className="text-xs text-slate-400 mt-0.5">Mantenete al día con las novedades importantes.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-700 text-slate-800">Todas</span>
              <span className="text-xs font-700 text-white bg-teal-600 rounded-full px-2 py-0.5">{unreadCount}</span>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] sm:text-xs font-600 text-slate-500 hover:text-teal-700 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Marcar todas como leídas
            </button>
          </div>
          <div className="flex-1 sm:flex-none sm:max-h-[24rem] overflow-y-auto overscroll-contain">
            {notifications.map((notification, idx) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => openNotification(notification)}
                className={`${idx >= 3 ? 'hidden sm:flex' : 'flex'} w-full px-4 sm:px-5 py-3 sm:py-4 items-start gap-3 sm:gap-4 text-left border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${notification.unread ? 'bg-teal-50/40' : 'bg-white'}`}
              >
                <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.iconClass}`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {notification.icon}
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-700 text-slate-800">{notification.title}</span>
                  <span className="block text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{notification.text}</span>
                </span>
                <span className="flex flex-col items-end gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-500">{notification.time}</span>
                  {notification.unread && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 sm:px-5 py-3 sm:py-4 bg-white flex justify-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setShowAll(true)
              }}
              className="w-full sm:w-auto px-8 py-2.5 text-sm font-600 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}

      {selectedNotification && (
        <div
          onMouseDown={() => setSelectedNotification(null)}
          className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-slate-900/30 backdrop-blur-sm p-3 sm:p-6 pt-16 sm:pt-6 pb-24 sm:pb-6"
        >
          <div
            onMouseDown={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedNotification.iconClass}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {selectedNotification.icon}
                  </svg>
                </span>
                <div>
                  <h2 className="text-lg font-700 text-slate-800">{selectedNotification.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedNotification.time}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-slate-600">{selectedNotification.text}</p>
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs font-700 text-slate-500 uppercase">Estado</p>
                <p className="text-sm text-slate-700 mt-1">Notificación leída</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAll && (
        <div
          onMouseDown={() => setShowAll(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-6"
        >
          <div
            onMouseDown={e => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[calc(100dvh-10rem)] sm:max-h-[86vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-700 text-slate-800">Todas las notificaciones</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Historial de novedades importantes.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
              <span className="text-sm font-700 text-slate-800">{notifications.length} notificaciones</span>
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] sm:text-xs font-600 text-teal-700 hover:text-teal-800 transition-colors"
              >
                Marcar todas como leídas
              </button>
            </div>
            <div className="overflow-y-auto">
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    setShowAll(false)
                    openNotification(notification)
                  }}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 flex items-start gap-3 sm:gap-4 text-left border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${notification.unread ? 'bg-teal-50/40' : 'bg-white'}`}
                >
                  <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.iconClass}`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {notification.icon}
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-700 text-slate-800">{notification.title}</span>
                    <span className="block text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">{notification.text}</span>
                  </span>
                  <span className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className="text-xs text-slate-500">{notification.time}</span>
                    {notification.unread && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const nombre = usuario?.nombre ?? 'Prestador'
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002'
    fetch(`${API_URL}/providers/dashboard/stats`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => console.error(e))
  }, [])

  if (!data) return <div className="p-8 text-center text-slate-500">Cargando dashboard...</div>

  const kpis = [
    {
      title: 'Solicitudes pendientes',
      value: data.pendientes,
      targetEstado: 'Pendiente',
      change: 12,
      changeLabel: 'vs. semana anterior',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'En análisis',
      value: 14,
      targetEstado: 'En análisis',
      change: -5,
      changeLabel: 'vs. semana anterior',
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50',
      borderClass: 'border-indigo-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      title: 'Observadas',
      value: data.observadas,
      targetEstado: 'Observada',
      change: -18,
      changeLabel: 'vs. semana anterior',
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      title: 'Resueltas',
      value: 143,
      targetEstado: 'Resueltas',
      change: 8,
      changeLabel: 'aprobadas + rechazadas',
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  function getKpiNavigateOptions(kpi) {
    if (kpi.title.startsWith('En')) return { tab: 'analisis' }
    if (kpi.title === 'Observadas') return { tab: 'observadas' }
    return { estado: kpi.targetEstado }
  }

  return (
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 flex flex-wrap gap-3 items-start sm:items-center sm:justify-between sticky top-0 z-50">
        <div className="min-w-0 flex-1 sm:flex-none">
          <h1 className="text-lg font-700 text-slate-800">Dashboard</h1>
          <p className="text-xs text-slate-400">Lunes, 04/13/2026</p>
        </div>
        <div className="sm:hidden flex items-center gap-2">
          <NotificationsBell />
          <HeaderUser />
        </div>
        <div className="order-3 sm:order-none flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end">
          <PeriodDropdown />
          <div className="hidden sm:block">
            <NotificationsBell />
          </div>
          <div className="hidden sm:block">
            <HeaderUser />
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-6">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-teal-100 text-sm font-500 mb-1">Bienvenido de vuelta 👋</p>
            <h2 className="text-white text-xl font-700">Bienvenido, {nombre}</h2>
            <p className="text-teal-100 text-sm mt-1">Tenés <span className="text-white font-600">{data.pendientes} solicitudes pendientes</span> y {data.observadas} observadas</p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-teal-400/30 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute right-16 bottom-0 w-32 h-32 bg-teal-400/20 rounded-full translate-y-1/2" />
          <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => navigate('/prestadores/solicitudes', { state: { estado: 'Pendiente' } })}
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-500 px-4 py-2 rounded-xl transition-colors backdrop-blur-sm"
            >
              Ver pendientes
            </button>
            <button
              onClick={() => navigate('/prestadores/solicitudes', { state: { openNueva: true } })}
              className="bg-white text-teal-700 text-sm font-600 px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors shadow-sm"
            >
              Nueva solicitud
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KPICard
              key={kpi.title}
              {...kpi}
              onClick={() => navigate('/prestadores/solicitudes', { state: getKpiNavigateOptions(kpi) })}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RequestsChart />
          </div>
          <QuickActions
            onAction={(id) => {
              if (id === 'nueva') navigate('/prestadores/solicitudes', { state: { openNueva: true } })
              if (id === 'analisis') navigate('/prestadores/solicitudes', { state: { tab: 'analisis' } })
              if (id === 'observadas') navigate('/prestadores/solicitudes', { state: { tab: 'observadas' } })
              if (id === 'turno') navigate('/prestadores/turnos', { state: { openNuevo: true } })
            }}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-600 text-slate-800">Actividad reciente</h2>
              <p className="text-sm text-slate-400 mt-0.5">Últimas solicitudes registradas</p>
            </div>
            <button
              onClick={() => navigate('/prestadores/solicitudes')}
              className="text-xs font-500 text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver todas →
            </button>
          </div>
          <div className="overflow-x-visible sm:overflow-x-auto">
            <table className="w-full table-fixed sm:table-auto">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-[10px] sm:text-xs font-600 text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 w-16 sm:w-auto">N° Solicitud</th>
                  <th className="text-left text-[10px] sm:text-xs font-600 text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3">Paciente</th>
                  <th className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Tipo</th>
                  <th className="text-left text-[10px] sm:text-xs font-600 text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 w-24 sm:w-auto">Estado</th>
                  <th className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.actividadReciente.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-3 sm:px-6 py-4 align-top">
                      <span className="text-sm font-600 text-teal-600">{item.id}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 align-top">
                      <span className="block text-xs sm:text-sm font-500 text-slate-700 leading-relaxed break-words">{item.texto}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-500">{item.tipo}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 align-top">
                      <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-500 whitespace-nowrap ${item.color}`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs text-slate-400">{normalizeSlashDate(item.tiempo)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
