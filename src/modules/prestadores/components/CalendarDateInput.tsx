// @ts-nocheck
import { useEffect, useRef, useState } from 'react'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

function parseMMDDYYYY(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value).trim())
  if (!match) return null
  const [, mm, dd, yyyy] = match
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return date.getFullYear() === Number(yyyy) &&
    date.getMonth() === Number(mm) - 1 &&
    date.getDate() === Number(dd)
    ? date
    : null
}

function formatMMDDYYYY(date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`
}

export default function CalendarDateInput({
  value,
  onChange,
  onBlur,
  className = '',
  placeholder = 'MM/DD/AAAA',
}) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const anchorRef = useRef(null)
  const popoverRef = useRef(null)
  const selectedDate = parseMMDDYYYY(value)
  const baseDate = selectedDate ?? new Date()
  const [viewMonth, setViewMonth] = useState(baseDate.getMonth())
  const [viewYear, setViewYear] = useState(baseDate.getFullYear())

  useEffect(() => {
    if (!open) return
    const selected = parseMMDDYYYY(value)
    if (selected) {
      setViewMonth(selected.getMonth())
      setViewYear(selected.getFullYear())
    }
  }, [open, value])

  useEffect(() => {
    if (!open) return

    function place() {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = 288
      const height = 318
      const margin = 12
      const left = Math.min(Math.max(margin, rect.left), window.innerWidth - width - margin)
      const below = rect.bottom + 8
      const top = below + height > window.innerHeight - margin
        ? Math.max(margin, rect.top - height - 8)
        : below
      setPosition({ top, left })
    }

    function close(event) {
      if (anchorRef.current?.contains(event.target) || popoverRef.current?.contains(event.target)) return
      setOpen(false)
      onBlur?.()
    }

    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    document.addEventListener('mousedown', close)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
      document.removeEventListener('mousedown', close)
    }
  }, [open, onBlur])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  function changeMonth(delta) {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewMonth(next.getMonth())
    setViewYear(next.getFullYear())
  }

  function selectDay(day) {
    onChange(formatMMDDYYYY(new Date(viewYear, viewMonth, day)))
    setOpen(false)
    onBlur?.()
  }

  return (
    <>
      <div ref={anchorRef} className="relative">
        <input
          type="text"
          value={value}
          onChange={event => onChange(event.target.value)}
          onBlur={onBlur}
          onClick={() => setOpen(true)}
          placeholder={placeholder}
          className={`${className} pr-10`}
        />
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Seleccionar fecha"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          ref={popoverRef}
          className="fixed z-[120] w-72 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl"
          style={{ top: position.top, left: position.left }}
        >
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="text-sm font-700 text-slate-800">{MONTHS[viewMonth]} {viewYear}</p>
            <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(day => (
              <div key={day} className="py-1 text-center text-xs font-700 text-slate-400">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              const active = selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === day
              return day ? (
                <button
                  key={`${viewYear}-${viewMonth}-${day}`}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-8 rounded-xl text-sm font-600 transition-colors ${
                    active ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  {day}
                </button>
              ) : (
                <div key={`empty-${index}`} />
              )
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button type="button" onClick={() => onChange('')} className="text-xs font-700 text-slate-400 hover:text-slate-600">
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                onChange(formatMMDDYYYY(today))
                setOpen(false)
                onBlur?.()
              }}
              className="text-xs font-700 text-teal-600 hover:text-teal-700"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </>
  )
}
