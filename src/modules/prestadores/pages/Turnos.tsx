// @ts-nocheck
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useState, useEffect } from 'react'
import HeaderUser from '../components/HeaderUser'
import Dropdown from '../components/Dropdown'
import CalendarDateInput from '../components/CalendarDateInput'

const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`)
const HORAS_30 = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2,'0')}:${m}`
})

function MotivoTurnoModal({ turno, estado, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('')
  const label = estado === 'ausente' ? 'marcar ausente' : 'cancelar'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-700 text-slate-800">Motivo para {label} turno</h2>
          <p className="mt-1 text-xs text-slate-400">{turno?.nombre} · {turno?.hora}</p>
        </div>
        <div className="px-5 py-4">
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            rows={4}
            placeholder="Escribí el motivo..."
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
          />
          {!motivo.trim() && <p className="mt-1.5 text-xs text-rose-500">El motivo es obligatorio.</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-600 text-slate-600">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(motivo.trim())}
            disabled={!motivo.trim()}
            className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-700 text-white disabled:opacity-50"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

function NuevoTurnoModal({ fechaDefault, onClose, onGuardar }) {
  const [afiliado, setAfiliado] = useState('')
  const [afiliadoId, setAfiliadoId] = useState(null)
  const [afiliados, setAfiliados] = useState([])
  const [fecha,    setFecha]    = useState(fechaDefault)
  const [horaIni,  setHoraIni]  = useState('09:00')
  const [horaFin,  setHoraFin]  = useState('09:30')
  const [motivo,   setMotivo]   = useState('')
  const [notas,    setNotas]    = useState('')
  const [errors, setErrors]     = useState({})
  const [touched, setTouched]   = useState({})
  const [submitError, setSubmitError] = useState('')
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002'

  const fieldClass = (field) =>
    `text-sm border rounded-xl outline-none transition-colors ${
      errors[field] && touched[field]
        ? 'border-rose-300 focus:ring-2 focus:ring-rose-400'
        : 'border-slate-200 focus:ring-2 focus:ring-teal-500'
    }`

  function toMinutes(value) {
    const [h, m] = value.split(':').map(Number)
    return h * 60 + m
  }

  function isValidDate(value) {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
    if (!match) return false
    const [, dd, mm, yyyy] = match
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    return date.getFullYear() === Number(yyyy) &&
      date.getMonth() === Number(mm) - 1 &&
      date.getDate() === Number(dd)
  }

  function validate() {
    const nextErrors = {}
    if (!afiliadoId) nextErrors.afiliado = 'Seleccioná un afiliado de la búsqueda.'
    if (!isValidDate(fecha)) nextErrors.fecha = 'Ingresá una fecha válida con formato DD/MM/AAAA.'
    if (toMinutes(horaFin) <= toMinutes(horaIni)) nextErrors.hora = 'La hora de fin debe ser posterior a la de inicio.'
    if (!motivo.trim()) nextErrors.motivo = 'Ingresá el motivo del turno.'
    else if (motivo.trim().length < 5) nextErrors.motivo = 'El motivo debe tener al menos 5 caracteres.'
    setErrors(nextErrors)
    return nextErrors
  }

  function markTouched(field) {
    setTouched(prev => ({ ...prev, [field]: true }))
    validate()
  }

  function guardar() {
    const nextErrors = validate()
    setTouched({ afiliado: true, fecha: true, hora: true, motivo: true })
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Revisá los campos marcados antes de guardar el turno.')
      return
    }
    onGuardar({ afiliadoId, afiliado, fecha, horaIni, horaFin, motivo, notas })
    onClose()
  }

  async function buscarAfiliados(value) {
    setSubmitError('')
    setAfiliado(value)
    setAfiliadoId(null)
    if (value.trim().length < 2) {
      setAfiliados([])
      return
    }
    try {
      const res = await fetch(`${API_URL}/prestadores/afiliados/search?q=${encodeURIComponent(value.trim())}`, { credentials: 'include' })
      const data = await res.json()
      setAfiliados(Array.isArray(data) ? data : [])
    } catch {
      setAfiliados([])
    }
  }

  function seleccionarAfiliado(item) {
    setAfiliado(item.nombre)
    setAfiliadoId(item.id)
    setAfiliados([])
    setErrors(prev => {
      const { afiliado: _afiliado, ...rest } = prev
      return rest
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-600 text-slate-800">Nuevo turno</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-4">
          {submitError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-500 text-rose-600">
              {submitError}
            </div>
          )}

          {/* Afiliado */}
          <div>
            <label className="block text-xs font-600 text-slate-600 mb-1.5">Afiliado</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar afiliado por número, nombre o DNI"
                value={afiliado}
                onChange={e => buscarAfiliados(e.target.value)}
                onBlur={() => markTouched('afiliado')}
                className={`w-full pl-9 pr-4 py-2.5 text-slate-700 placeholder:text-slate-300 ${fieldClass('afiliado')}`}
              />
            </div>
            {afiliados.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                {afiliados.map(item => (
                  <button
                    type="button"
                    key={item.id}
                    onMouseDown={event => {
                      event.preventDefault()
                      seleccionarAfiliado(item)
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="font-700 text-slate-700">{item.nombre}</span>
                    <span className="text-xs text-slate-400">{item.nro}</span>
                  </button>
                ))}
              </div>
            )}
            {errors.afiliado && touched.afiliado && <p className="text-xs text-rose-500 mt-1.5">{errors.afiliado}</p>}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-600 text-slate-600 mb-1.5">Fecha</label>
            <CalendarDateInput
              value={fecha}
              onChange={next => { setSubmitError(''); setFecha(next) }}
              onBlur={() => markTouched('fecha')}
              className={`w-full pl-4 py-2.5 text-sm text-slate-700 ${fieldClass('fecha')}`}
            />
            {errors.fecha && touched.fecha && <p className="text-xs text-rose-500 mt-1.5">{errors.fecha}</p>}
          </div>

          {/* Hora */}
          <div>
            <label className="block text-xs font-600 text-slate-600 mb-1.5">Hora</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <Dropdown
                  value={horaIni}
                  options={HORAS_30}
                  onChange={next => { setSubmitError(''); setHoraIni(next); markTouched('hora') }}
                  className="w-full"
                  buttonClassName={`pl-8 pr-3 ${errors.hora && touched.hora ? 'border-rose-300 ring-0' : ''}`}
                  maxMenuHeight="max-h-56"
                />
              </div>
              <span className="text-slate-400 text-sm flex-shrink-0">—</span>
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <Dropdown
                  value={horaFin}
                  options={HORAS_30}
                  onChange={next => { setSubmitError(''); setHoraFin(next); markTouched('hora') }}
                  className="w-full"
                  buttonClassName={`pl-8 pr-3 ${errors.hora && touched.hora ? 'border-rose-300 ring-0' : ''}`}
                  maxMenuHeight="max-h-56"
                />
              </div>
            </div>
            {errors.hora && touched.hora && <p className="text-xs text-rose-500 mt-1.5">{errors.hora}</p>}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-600 text-slate-600 mb-1.5">Motivo</label>
            <div className="relative">
              <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <input
                type="text"
                placeholder="Motivo de consulta"
                value={motivo}
                onChange={e => { setSubmitError(''); setMotivo(e.target.value) }}
                onBlur={() => markTouched('motivo')}
                className={`w-full pl-9 pr-4 py-2.5 text-slate-700 placeholder:text-slate-300 ${fieldClass('motivo')}`}
              />
            </div>
            {errors.motivo && touched.motivo && <p className="text-xs text-rose-500 mt-1.5">{errors.motivo}</p>}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-600 text-slate-600 mb-1.5">Notas</label>
            <textarea
              placeholder="Notas adicionales (opcional)"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 placeholder:text-slate-300 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 sm:px-6 py-4 border-t border-slate-100">
          <button onClick={guardar} className="px-8 py-2.5 text-sm font-600 text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors">
            Crear turno
          </button>
        </div>
      </div>
    </div>
  )
}

function NotaModal({ turno, fecha, onClose, onSave }) {
  const [texto, setTexto] = useState(turno.nota ?? '')
  const [error, setError] = useState('')

  function guardar() {
    const limpio = texto.trim()
    if (!limpio) {
      setError('Ingresá una observación antes de guardar.')
      return
    }
    if (limpio.length < 5) {
      setError('La observación debe tener al menos 5 caracteres.')
      return
    }
    onSave(turno, limpio)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-0 sm:mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-600 text-slate-800">Agregar nota del turno</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Patient info */}
        <div className="px-5 py-4 flex items-start gap-3 border-b border-slate-100 bg-slate-50/60">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-600 text-slate-800">Paciente {turno.nombre}</p>
            <p className="text-xs text-slate-400 mt-0.5">{fecha} — {turno.hora} — {turno.horaFin ?? '11:30'}</p>
          </div>
        </div>

        {/* Observaciones */}
        <div className="px-5 py-4">
          <label className="block text-xs font-600 text-slate-600 mb-2">Observaciones</label>
          <textarea
            value={texto}
            onChange={e => { setTexto(e.target.value); setError('') }}
            rows={5}
            placeholder="Escribir observaciones del turno..."
            className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 outline-none text-slate-700 resize-none placeholder:text-slate-300 ${error ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'}`}
          />
          {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-4 border-t border-slate-100">
          <button
            onClick={guardar}
            className="px-8 py-2.5 text-sm font-600 text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

const DAYS_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_LONG = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

function toKey(date) {
  return date.toISOString().slice(0, 10)
}

function formatDateDDMMYYYY(date) {
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`
}

function toISODateFromDDMMYYYY(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || '').trim())
  if (!match) return value
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

async function readJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : {}

  if (!response.ok) {
    throw new Error(payload.message || payload.error || fallbackMessage)
  }

  return payload
}

export default function Turnos() {
  const { usuario: prestador, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { openNuevo } = (location.state as any) ?? {}
  const today = new Date()
  const [viewYear, setViewYear]     = useState(today.getFullYear())
  const [viewMonth, setViewMonth]   = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today)
  const [turnos,       setTurnos]       = useState([])
  const [diasConTurnos, setDiasConTurnos] = useState([])
  const [loading,      setLoading]      = useState(false)
  const [notaTurno,    setNotaTurno]    = useState(null)
  const [showNuevo,    setShowNuevo]    = useState(false)
  const [error, setError] = useState('')
  const [estadoTurno, setEstadoTurno] = useState(null)

  useEffect(() => {
    if (openNuevo) setShowNuevo(true)
  }, [openNuevo])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selectedKey = toKey(selectedDate)
  const dayLabel = `${DAYS_LONG[selectedDate.getDay()]} ${formatDateDDMMYYYY(selectedDate)}`

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002'

  function cargarTurnos() {
    setLoading(true)
    setError('')
    fetch(`${API_URL}/prestadores/turnos?date=${selectedKey}`, { credentials: 'include' })
      .then(r => readJsonResponse(r, 'No se pudieron cargar los turnos'))
      .then(d => { setTurnos(d); setLoading(false) })
      .catch(e => { setError(e.message || 'No se pudieron cargar los turnos'); setLoading(false) })
  }

  useEffect(() => {
    cargarTurnos()
  }, [selectedKey, API_URL])

  useEffect(() => {
    setDiasConTurnos([])
  }, [viewYear, viewMonth])

  async function handleAddNota(turno, texto) {
    try {
      await fetch(`${API_URL}/prestadores/turnos/${turno.id}/nota`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: texto }),
        credentials: 'include'
      })
      cargarTurnos()
    } catch (e) { setError('No se pudo guardar la nota') }
  }

  async function handleGuardarTurno(nuevo) {
    try {
      setError('')
      const res = await fetch(`${API_URL}/prestadores/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nuevo, fecha: toISODateFromDDMMYYYY(nuevo.fecha) }),
        credentials: 'include'
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'No se pudo crear el turno')
      cargarTurnos()
      setShowNuevo(false)
    } catch (e) { setError(e.message || 'No se pudo crear el turno') }
  }

  async function cambiarEstadoTurno(turno, estado, motivo = '') {
    const nota = estado === 'atendido' ? (turno.nota || 'Atención realizada') : undefined
    try {
      setError('')
      const res = await fetch(`${API_URL}/prestadores/turnos/${turno.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, motivo, nota }),
        credentials: 'include'
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'No se pudo actualizar el turno')
      cargarTurnos()
    } catch (e) {
      setError(e.message || 'No se pudo actualizar el turno')
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isToday    = (d) => d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
  const isSelected = (d) => d === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear()
  const hasTurnos  = (d) => diasConTurnos.includes(d)

  return (
    <>
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 flex flex-wrap gap-3 items-start sm:items-center sm:justify-between sticky top-0 z-10">
        <div className="min-w-0 flex-1 sm:flex-none">
          <h1 className="text-lg font-700 text-slate-800">Turnos — {dayLabel}</h1>
          <p className="text-xs text-slate-400">Agenda del prestador</p>
        </div>
        <div className="sm:hidden">
          <HeaderUser />
        </div>
        <div className="order-3 sm:order-none flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
          <button
            onClick={() => setShowNuevo(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo turno
          </button>
          <div className="hidden sm:block">
            <HeaderUser />
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-600 text-rose-700">
            {error}
          </div>
        )}
        <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-start">
          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 w-full xl:w-80 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-600 text-slate-700">Calendario</h2>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs font-600 text-slate-600 w-28 text-center">{MONTHS[viewMonth]} {viewYear}</span>
                <button onClick={nextMonth} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map((d, i) => (
                <div key={i} className="text-center text-xs font-600 text-slate-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(new Date(viewYear, viewMonth, day))}
                    className={`relative flex flex-col items-center justify-center h-9 w-full rounded-xl text-sm font-500 transition-colors
                      ${isSelected(day) ? 'bg-teal-500 text-white' : isToday(day) ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {day}
                    {hasTurnos(day) && !isSelected(day) && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-sm font-600 text-slate-700">Turnos del día</h2>
              <p className="text-xs text-slate-400 mt-0.5">{dayLabel}</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <p className="text-sm">Cargando turnos...</p>
              </div>
            ) : turnos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <svg className="w-10 h-10 mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Sin turnos para este día</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {turnos.map(turno => (
                  <div key={turno.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-700 text-slate-800 truncate">{turno.hora} - {turno.nombre}</p>
                      <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">{turno.motivo}</p>
                    </div>
                    <button
                      onClick={() => setNotaTurno(turno)}
                      className="text-xs font-500 text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 hover:border-teal-400 transition-colors flex-shrink-0"
                    >
                      {turno.nota ? 'Ver / Editar nota' : 'Añadir nota'}
                    </button>
                    {turno.estado !== 'atendido' && turno.estado !== 'cancelado' && (
                      <>
                        <button
                          onClick={() => cambiarEstadoTurno(turno, 'atendido')}
                          className="text-xs font-500 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors flex-shrink-0"
                        >
                          Marcar atendido
                        </button>
                        <button
                          onClick={() => setEstadoTurno({ turno, estado: 'ausente' })}
                          className="text-xs font-500 text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors flex-shrink-0"
                        >
                          Ausente
                        </button>
                        <button
                          onClick={() => setEstadoTurno({ turno, estado: 'cancelado' })}
                          className="text-xs font-500 text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex-shrink-0"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>

    {notaTurno && (
      <NotaModal
        turno={notaTurno}
        fecha={`${DAYS_LONG[selectedDate.getDay()]} ${formatDateDDMMYYYY(selectedDate)}`}
        onClose={() => setNotaTurno(null)}
        onSave={handleAddNota}
      />
    )}

    {showNuevo && (
      <NuevoTurnoModal
        fechaDefault={formatDateDDMMYYYY(selectedDate)}
        onClose={() => setShowNuevo(false)}
        onGuardar={handleGuardarTurno}
      />
    )}
    {estadoTurno && (
      <MotivoTurnoModal
        turno={estadoTurno.turno}
        estado={estadoTurno.estado}
        onClose={() => setEstadoTurno(null)}
        onConfirm={(motivo) => {
          cambiarEstadoTurno(estadoTurno.turno, estadoTurno.estado, motivo)
          setEstadoTurno(null)
        }}
      />
    )}
  </>
  )
}
