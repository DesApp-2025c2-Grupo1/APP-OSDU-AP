// @ts-nocheck
import { useEffect, useRef, useState } from 'react'

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = 'Seleccionar',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  maxMenuHeight = 'max-h-64',
  renderIcon,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const normalizedOptions = options.map(option =>
    typeof option === 'string' ? { value: option, label: option } : option
  )
  const selected = normalizedOptions.find(option => option.value === value)

  useEffect(() => {
    if (!open) return
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-600 bg-white border rounded-xl outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          open ? 'border-teal-500 ring-2 ring-teal-100 text-slate-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'
        } ${buttonClassName}`}
        aria-expanded={open}
      >
        <span className="min-w-0 flex items-center gap-2 truncate">
          {renderIcon?.()}
          <span className="min-w-0 truncate">{selected?.label ?? placeholder}</span>
        </span>
        <svg className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && !disabled && (
        <div className={`absolute left-0 right-0 top-full mt-2 z-[90] overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-xl ${maxMenuHeight} ${menuClassName}`}>
          {normalizedOptions.map(option => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-600 transition-colors ${
                  isSelected ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {Number.isFinite(option.count) && (
                  <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {option.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
