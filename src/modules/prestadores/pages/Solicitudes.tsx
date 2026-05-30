// @ts-nocheck
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import DetalleSolicitud from './DetalleSolicitud'
import HeaderUser from '../components/HeaderUser'
import Dropdown from '../components/Dropdown'
import CalendarDateInput from '../components/CalendarDateInput'
const estadoConfig = {
  'Pendiente':   { cls: 'bg-amber-100 text-amber-700' },
  'En análisis': { cls: 'bg-indigo-100 text-indigo-700' },
  'Observada':   { cls: 'bg-violet-100 text-violet-700' },
  'Aprobada':    { cls: 'bg-emerald-100 text-emerald-700' },
  'Rechazada':   { cls: 'bg-rose-100 text-rose-700' },
}

const tipoConfig = {
  'Reintegro':    'bg-pink-100 text-pink-700',
  'Autorización': 'bg-emerald-100 text-emerald-700',
  'Receta':       'bg-violet-100 text-violet-700',
}

const TABS = [
  { key: 'todas',     label: 'Todas',      filter: () => true },
  { key: 'pendientes',label: 'Pendientes', filter: s => s.estado === 'Pendiente' },
  { key: 'analisis',  label: 'En análisis',filter: s => s.estado === 'En análisis' },
  { key: 'observadas',label: 'Observadas', filter: s => s.estado === 'Observada' },
  { key: 'resueltas', label: 'Resueltas',  filter: s => ['Aprobada', 'Rechazada'].includes(s.estado) },
]

const ESTADOS   = ['Todos', 'Pendiente', 'En análisis', 'Observada', 'Aprobada', 'Rechazada', 'Resueltas']
const TIPOS     = ['Todos', 'Reintegro', 'Autorización', 'Receta']
const PAGE_SIZE = 10

function isValidDDMMYYYY(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
  if (!match) return false
  const [, dd, mm, yyyy] = match
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return date.getFullYear() === Number(yyyy) &&
    date.getMonth() === Number(mm) - 1 &&
    date.getDate() === Number(dd)
}

function toDateInputValue(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
  if (!match || !isValidDDMMYYYY(value)) return ''
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

function fromDateInputValue(value) {
  if (!value) return ''
  const [yyyy, mm, dd] = value.split('-')
  return `${dd}/${mm}/${yyyy}`
}

function normalizeSlashDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value).trim())
  if (!match) return value
  const [, first, second, yyyy] = match
  if (Number(first) > 12) return `${first.padStart(2, '0')}/${second.padStart(2, '0')}/${yyyy}`
  return `${second.padStart(2, '0')}/${first.padStart(2, '0')}/${yyyy}`
}

function DateTextPicker({ value, onChange, onBlur, className = '', placeholder = 'DD/MM/AAAA' }) {
  return (
    <CalendarDateInput
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={className}
      placeholder={placeholder}
    />
  )
}

function FilterSelect({ label, value, options, onChange, getCount, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selectedLabel = value === 'Todos' ? label : value

  useEffect(() => {
    if (!open) return
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} className={`relative w-full sm:w-40 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-xs font-600 bg-white border rounded-xl outline-none transition-colors ${
          open ? 'border-teal-500 ring-2 ring-teal-100 text-slate-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'
        }`}
        aria-expanded={open}
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <svg className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-40 max-h-64 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-xl">
          {options.map(op => {
            const selected = value === op
            const count = getCount?.(op)
            return (
              <button
                key={op}
                type="button"
                onClick={() => {
                  onChange(op)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-600 transition-colors ${
                  selected ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="min-w-0 truncate">{op === 'Todos' ? label : op}</span>
                {Number.isFinite(count) && (
                  <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${
                    selected ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
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

function NuevaSolicitudModal({ onClose, onCreate }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002'
  function formatDateDDMMYYYY(date) {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const [form, setForm] = useState({
    afiliado: '',
    afiliadoId: null,
    tipo: '',
    fecha: formatDateDDMMYYYY(new Date()),
    descripcion: '',
    archivo: '',
    adjunto: null,
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [afiliados, setAfiliados] = useState([])

  const fieldClass = (field) =>
    `w-full text-sm border rounded-xl outline-none transition-colors ${
      errors[field] && touched[field]
        ? 'border-rose-300 focus:ring-2 focus:ring-rose-400'
        : 'border-slate-200 focus:ring-2 focus:ring-teal-500'
    }`

  function validate(nextForm = form) {
    const nextErrors = {}
    const afiliado = nextForm.afiliado.trim()
    const descripcion = nextForm.descripcion.trim()
    const fechaMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(nextForm.fecha.trim())

    if (!nextForm.afiliadoId) nextErrors.afiliado = 'Seleccioná un afiliado de la búsqueda.'

    if (!nextForm.tipo) nextErrors.tipo = 'Seleccioná el tipo de solicitud.'

    if (!fechaMatch) {
      nextErrors.fecha = 'Usá el formato DD/MM/AAAA.'
    } else {
      const [, dd, mm, yyyy] = fechaMatch
      const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
      const validDate =
        date.getFullYear() === Number(yyyy) &&
        date.getMonth() === Number(mm) - 1 &&
        date.getDate() === Number(dd)
      if (!validDate) nextErrors.fecha = 'Ingresá una fecha válida.'
    }

    if (!descripcion) nextErrors.descripcion = 'Ingresá una descripción.'
    else if (descripcion.length < 10) nextErrors.descripcion = 'La descripción debe tener al menos 10 caracteres.'

    setErrors(nextErrors)
    return nextErrors
  }

  function update(key, value) {
    setSubmitError('')
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (touched[key]) validate(next)
      return next
    })
  }

  async function buscarAfiliados(value) {
    update('afiliado', value)
    update('afiliadoId', null)
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

  function seleccionarAfiliado(afiliado) {
    setAfiliados([])
    setForm(prev => ({ ...prev, afiliado: afiliado.nombre, afiliadoId: afiliado.id }))
    setErrors(prev => {
      const { afiliado: _afiliado, ...rest } = prev
      return rest
    })
  }

  function markTouched(key) {
    setTouched(prev => ({ ...prev, [key]: true }))
    validate()
  }

  function handleFile(file) {
    setSubmitError('')
    setTouched(prev => ({ ...prev, archivo: true }))
    if (!file) {
      setForm(prev => ({ ...prev, archivo: '', adjunto: null }))
      return
    }
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    const validExtensions = /\.(pdf|jpe?g|png)$/i.test(file.name)
    if ((!validTypes.includes(file.type) && !validExtensions) || file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, archivo: 'El archivo debe ser PDF, JPG o PNG y pesar hasta 10MB.' }))
      setForm(prev => ({ ...prev, archivo: '', adjunto: null }))
      return
    }
    setErrors(prev => {
      const { archivo, ...rest } = prev
      return rest
    })
    setForm(prev => ({
      ...prev,
      archivo: file.name,
      adjunto: {
        nombre: file.name,
        tipo: file.type || 'application/octet-stream',
        tamanio: file.size,
      },
    }))
  }

  function crear() {
    const nextErrors = validate()
    setTouched({ afiliado: true, tipo: true, fecha: true, descripcion: true, archivo: true })
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Revisá los campos marcados antes de crear la solicitud.')
      return
    }
    onCreate(form)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-3 sm:p-6"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-700 text-slate-800">Nueva solicitud</h2>
            <p className="text-xs text-slate-400 mt-0.5">Completá los datos para crear una solicitud</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-6 overflow-y-auto overscroll-contain min-h-0">
          {submitError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-500 text-rose-600">
              {submitError}
            </div>
          )}

          <section>
            <h3 className="text-sm font-700 text-slate-800 mb-4">Datos básicos</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-600 text-slate-600 mb-1.5">Afiliado</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={form.afiliado}
                    onChange={e => buscarAfiliados(e.target.value)}
                    onBlur={() => markTouched('afiliado')}
                    placeholder="Buscar afiliado por nombre o nro..."
                    className={`${fieldClass('afiliado')} pl-9 pr-3 py-2.5`}
                  />
                </div>
                {afiliados.length > 0 && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                    {afiliados.map(afiliado => (
                      <button
                        type="button"
                        key={afiliado.id}
                        onMouseDown={event => {
                          event.preventDefault()
                          seleccionarAfiliado(afiliado)
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span>
                          <span className="font-700 text-slate-700">{afiliado.nombre}</span>
                          <span className="ml-2 text-xs text-slate-400">{afiliado.nro}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {errors.afiliado && touched.afiliado && <p className="text-xs text-rose-500 mt-1.5">{errors.afiliado}</p>}
              </div>
              <div>
                <label className="block text-xs font-600 text-slate-600 mb-1.5">Tipo de solicitud</label>
                <Dropdown
                  value={form.tipo}
                  options={['Reintegro', 'Autorización', 'Receta']}
                  onChange={value => update('tipo', value)}
                  placeholder="Seleccionar tipo"
                  buttonClassName={`py-2.5 ${errors.tipo && touched.tipo ? 'border-rose-300 ring-0' : ''}`}
                  maxMenuHeight="max-h-56"
                />
                {errors.tipo && touched.tipo && <p className="text-xs text-rose-500 mt-1.5">{errors.tipo}</p>}
              </div>
              <div>
                <label className="block text-xs font-600 text-slate-600 mb-1.5">Fecha de solicitud</label>
                <DateTextPicker
                  value={form.fecha}
                  onChange={value => update('fecha', value)}
                  onBlur={() => markTouched('fecha')}
                  className={`${fieldClass('fecha')} px-3 py-2.5`}
                />
                {errors.fecha && touched.fecha && <p className="text-xs text-rose-500 mt-1.5">{errors.fecha}</p>}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-700 text-slate-800 mb-4">Detalle</h3>
            <label className="block text-xs font-600 text-slate-600 mb-1.5">Descripción de la solicitud</label>
            <textarea
              value={form.descripcion}
              onChange={e => update('descripcion', e.target.value)}
              onBlur={() => markTouched('descripcion')}
              rows={5}
              placeholder="Ingrese una descripción detallada de la solicitud..."
              className={`${fieldClass('descripcion')} px-3 py-2.5 resize-none`}
            />
            {errors.descripcion && touched.descripcion && <p className="text-xs text-rose-500 mt-1.5">{errors.descripcion}</p>}
          </section>

          <section className="pt-5 border-t border-slate-100">
            <h3 className="text-sm font-700 text-slate-800 mb-1">Adjuntos</h3>
            <p className="text-xs text-slate-400 mb-3">Adjuntá la documentación relacionada con la solicitud.</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-600 text-teal-700 bg-white border border-teal-200 rounded-xl hover:bg-teal-50 cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.657-5.657L5.757 10.757a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Subir archivo
              <input type="file" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              {form.archivo || 'Formatos permitidos: PDF, JPG, PNG. Tamaño máximo 10MB.'}
            </p>
            {errors.archivo && touched.archivo && <p className="text-xs text-rose-500 mt-1.5">{errors.archivo}</p>}
          </section>

          <section className="pt-5 border-t border-slate-100">
            <h3 className="text-sm font-700 text-slate-800 mb-1">Información adicional</h3>
            <p className="text-xs text-slate-400 mb-3">Los campos pueden variar según el tipo de solicitud seleccionado.</p>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 18a6 6 0 100-12 6 6 0 000 12z" />
              </svg>
              Seleccioná un tipo de solicitud para ver los campos adicionales correspondientes.
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end px-4 sm:px-6 py-4 border-t border-slate-100 bg-white flex-shrink-0">
          <button onClick={crear} className="px-8 py-2.5 text-sm font-700 text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors">
            Crear solicitud
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Solicitudes() {
  const { usuario: prestador, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { initialEstado, initialTab, openNueva } = (location.state as any) ?? {}
  const [data,        setData]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [detalle,     setDetalle]     = useState(null)
  const [activeTab,   setActiveTab]   = useState('todas')
  const [filtEstado,  setFiltEstado]  = useState('Todos')
  const [filtTipo,    setFiltTipo]    = useState('Todos')
  const [filtAfil,    setFiltAfil]    = useState('Todos')
  const [filtFecha,   setFiltFecha]   = useState('')
  const [search,      setSearch]      = useState('')
  const [showNueva,   setShowNueva]   = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileTabOpen, setMobileTabOpen] = useState(false)
  const [error, setError] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002'

  useEffect(() => {
    setError('')
    fetch(`${API_URL}/prestadores/solicitudes`, { credentials: 'include' })
      .then(async res => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'No se pudieron cargar las solicitudes')
        return json
      })
      .then(d => {
        setData(d.map(s => ({ ...s, fecha: normalizeSlashDate(s.fecha) })))
        setLoading(false)
      })
      .catch(e => {
        setError(e.message || 'No se pudieron cargar las solicitudes')
        setLoading(false)
      })
  }, [API_URL])

  useEffect(() => {
    if (initialEstado) {
      if (initialEstado === 'Pendiente') {
        setActiveTab('pendientes')
        setFiltEstado('Todos')
        return
      }
      if (initialEstado === 'Resueltas') {
        setActiveTab('resueltas')
        setFiltEstado('Todos')
        return
      }
      setFiltEstado(initialEstado)
      setActiveTab('todas')
    }
  }, [initialEstado])

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
      setFiltEstado('Todos')
    }
  }, [initialTab])

  useEffect(() => {
    if (openNueva) setShowNueva(true)
  }, [openNueva])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, filtEstado, filtTipo, filtAfil, filtFecha, search])

  function dateCandidates(fecha) {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(fecha)
    if (!match) return []
    const [, dd, mm, yyyy] = match
    return [`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`]
  }

  function filterDateValue(value) {
    if (!value) return ''
    return toDateInputValue(value) || value
  }

  async function cambiarEstado(id, nuevoEstado, motivo = '') {
    try {
      setError('')
      const res = await fetch(`${API_URL}/prestadores/solicitudes/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado, motivo }),
        credentials: 'include'
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'No se pudo cambiar el estado')
      setData(prev => prev.map(s => s.id === id ? { ...s, ...json, fecha: normalizeSlashDate(json.fecha || s.fecha) } : s))
      setDetalle(prev => prev ? { ...prev, ...json, fecha: normalizeSlashDate(json.fecha || prev.fecha) } : null)
    } catch (error) {
      setError(error.message || 'No se pudo cambiar el estado')
      if (detalle) window.alert(error.message || 'No se pudo cambiar el estado')
    }
  }

  if (detalle) {
    const solActualizada = data.find(s => s.id === detalle.id) ?? detalle
    return (
      <DetalleSolicitud
        solicitud={solActualizada}
        onVolver={() => setDetalle(null)}
        onCambiarEstado={cambiarEstado}
        
      />
    )
  }

  const tabFn = TABS.find(t => t.key === activeTab).filter

  function filterSolicitudes(ignore = {}) {
    return data.filter(s => {
    if (!tabFn(s)) return false
    if (!ignore.estado && filtEstado === 'Resueltas' && !['Aprobada', 'Rechazada'].includes(s.estado)) return false
    if (!ignore.estado && filtEstado !== 'Todos' && filtEstado !== 'Resueltas' && s.estado !== filtEstado) return false
    if (!ignore.tipo && filtTipo !== 'Todos' && s.tipo !== filtTipo) return false
    if (!ignore.afiliado && filtAfil !== 'Todos' && s.afiliado !== filtAfil) return false
    if (!ignore.fecha && filtFecha && !dateCandidates(s.fecha).includes(filterDateValue(filtFecha))) return false
    if (search && !s.afiliado.toLowerCase().includes(search.toLowerCase()) &&
                  !s.nro.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  }

  function keepSelected(options, selected) {
    if (!selected || selected === 'Todos' || options.includes(selected)) return options
    return [...options, selected]
  }

  const filtered = filterSolicitudes()
  const estadoOptions = ['Todos', ...Array.from(new Set(filterSolicitudes({ estado: true }).map(s => s.estado)))]
  const ESTADOS_FILTRADOS = estadoOptions.includes('Aprobada') || estadoOptions.includes('Rechazada')
    ? [...estadoOptions, ...(estadoOptions.includes('Resueltas') ? [] : ['Resueltas'])]
    : estadoOptions
  const AFILIADOS = keepSelected(
    ['Todos', ...Array.from(new Set(filterSolicitudes({ afiliado: true }).map(s => s.afiliado)))],
    filtAfil
  )
  const TIPOS_FILTRADOS = keepSelected(
    ['Todos', ...Array.from(new Set(filterSolicitudes({ tipo: true }).map(s => s.tipo)))],
    filtTipo
  )
  const ESTADOS_SELECT = keepSelected(ESTADOS_FILTRADOS, filtEstado)

  const rowsForEstado = filterSolicitudes({ estado: true })
  const rowsForAfiliado = filterSolicitudes({ afiliado: true })
  const rowsForTipo = filterSolicitudes({ tipo: true })

  function countEstado(op) {
    if (op === 'Todos') return rowsForEstado.length
    if (op === 'Resueltas') return rowsForEstado.filter(s => ['Aprobada', 'Rechazada'].includes(s.estado)).length
    return rowsForEstado.filter(s => s.estado === op).length
  }

  function countAfiliado(op) {
    if (op === 'Todos') return rowsForAfiliado.length
    return rowsForAfiliado.filter(s => s.afiliado === op).length
  }

  function countTipo(op) {
    if (op === 'Todos') return rowsForTipo.length
    return rowsForTipo.filter(s => s.tipo === op).length
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const paginated = filtered.slice(pageStart, pageStart + PAGE_SIZE)
  const visibleStart = filtered.length === 0 ? 0 : pageStart + 1
  const visibleEnd = Math.min(pageStart + PAGE_SIZE, filtered.length)

  function resetFiltros() {
    setFiltEstado('Todos'); setFiltTipo('Todos'); setFiltAfil('Todos'); setFiltFecha(''); setSearch('')
  }

  function cambiarTab(tabKey) {
    setActiveTab(tabKey)
    setFiltEstado('Todos')
    setFiltAfil('Todos')
    setFiltTipo('Todos')
    setFiltFecha('')
    setMobileTabOpen(false)
  }

  async function crearSolicitud(form) {
    const payload = {
      afiliadoId: form.afiliadoId,
      tipo: form.tipo || 'Reintegro',
      fecha: toDateInputValue(form.fecha) || form.fecha,
      descripcion: form.descripcion || '',
      adjunto: form.adjunto,
    }

    try {
      const res = await fetch(`${API_URL}/prestadores/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      const nueva = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(nueva.message || 'No se pudo crear la solicitud')
      setData(prev => [{ ...nueva, fecha: normalizeSlashDate(nueva.fecha) }, ...prev])
      setFiltEstado('Todos')
      setActiveTab('todas')
      setCurrentPage(1)
    } catch (error) {
      setError(error.message || 'No se pudo crear la solicitud')
    }
  }

  const hayFiltros = filtEstado !== 'Todos' || filtTipo !== 'Todos' || filtAfil !== 'Todos' || filtFecha || search
  const activeTabInfo = TABS.find(tab => tab.key === activeTab) ?? TABS[0]
  const activeTabCount = data.filter(activeTabInfo.filter).length

  return (
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 flex flex-wrap gap-3 items-start sm:items-center sm:justify-between sticky top-0 z-10">
        <div className="min-w-0 flex-1 sm:flex-none">
          <h1 className="text-lg font-700 text-slate-800">Solicitudes</h1>
          <p className="text-xs text-slate-400">Bandeja de entrada</p>
        </div>
        <div className="sm:hidden">
          <HeaderUser />
        </div>
        <div className="order-3 sm:order-none flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
          <div className="relative w-full sm:w-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar afiliado o nro..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-slate-100 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-full sm:w-52"
            />
          </div>
          <div className="hidden sm:block">
            <HeaderUser />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Cargando solicitudes...</div>
      ) : (
      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-600 text-rose-700">
            {error}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Tabs row */}
          <div className="px-4 sm:px-6 pt-5 border-b border-slate-100 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="md:hidden">
              <label className="block text-xs font-600 text-slate-400 mb-1.5">Vista</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMobileTabOpen(prev => !prev)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-600 bg-white border rounded-xl outline-none transition-colors ${
                    mobileTabOpen ? 'border-teal-500 ring-2 ring-teal-100 text-slate-800' : 'border-slate-200 text-slate-700'
                  }`}
                  aria-expanded={mobileTabOpen}
                >
                  <span>{activeTabInfo.label} ({activeTabCount})</span>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${mobileTabOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileTabOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-40 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
                    {TABS.map(tab => {
                      const count = data.filter(tab.filter).length
                      const selected = tab.key === activeTab
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => cambiarTab(tab.key)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm font-600 transition-colors ${
                            selected ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${
                            selected ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1 flex-wrap">
              {TABS.map(tab => {
                const count = data.filter(tab.filter).length
                return (
                  <button
                    key={tab.key}
                    onClick={() => cambiarTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-500 transition-colors border-b-2 -mb-px
                      ${activeTab === tab.key
                        ? 'border-teal-500 text-teal-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab.label}
                    <span className={`text-xs font-600 px-1.5 py-0.5 rounded-full
                      ${activeTab === tab.key ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setShowNueva(true)}
              className="w-full md:w-auto justify-center flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors mb-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva solicitud
            </button>
          </div>

          {/* Filters row */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap bg-slate-50/50">
            <FilterSelect label="Estado"   value={filtEstado} options={ESTADOS_SELECT} onChange={setFiltEstado} getCount={countEstado} className="sm:w-36" />
            <FilterSelect label="Afiliado" value={filtAfil}   options={AFILIADOS} onChange={setFiltAfil} getCount={countAfiliado} className="sm:w-44" />
            <FilterSelect label="Tipo"     value={filtTipo}   options={TIPOS_FILTRADOS} onChange={setFiltTipo} getCount={countTipo} className="sm:w-36" />

            <DateTextPicker
              value={filtFecha}
              onChange={setFiltFecha}
              className="w-full sm:w-36 px-3 py-2.5 text-xs font-600 text-slate-600 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500 cursor-pointer placeholder:text-slate-400"
            />

            <button className="px-4 py-2.5 text-xs font-600 text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors">
              Filtrar
            </button>

            {hayFiltros && (
              <button onClick={resetFiltros} className="px-3 py-2 text-xs font-500 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                Limpiar
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-visible md:overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-2.5">Afiliado</th>
                  <th className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-2.5">Tipo</th>
                  <th className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-2.5">Estado</th>
                  <th className="hidden sm:table-cell text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-6 py-2.5">Fecha</th>
                  <th className="hidden sm:table-cell text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-6 py-2.5">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-400">
                      No hay solicitudes que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  paginated.map(sol => (
                    <tr key={sol.id} onClick={() => setDetalle(sol)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                      <td className="px-4 sm:px-6 py-3">
                        <p className="text-sm font-600 text-slate-800">{sol.afiliado}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{sol.nro}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-500 ${tipoConfig[sol.tipo]}`}>
                          {sol.tipo}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-500 ${estadoConfig[sol.estado]?.cls}`}>
                          {sol.estado}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-3 text-xs text-slate-400">{normalizeSlashDate(sol.fecha)}</td>
                      <td className="hidden sm:table-cell px-6 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDetalle(sol)
                          }}
                          className="flex items-center gap-1 text-xs font-500 text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-400 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Ver
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                Mostrando <span className="font-600 text-slate-600">{visibleStart}-{visibleEnd}</span> de <span className="font-600 text-slate-600">{filtered.length}</span> solicitudes
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={safePage === 1}
                    className="px-3 py-1.5 text-xs font-600 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-xs font-600 text-slate-500">
                    Página {safePage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={safePage === totalPages}
                    className="px-3 py-1.5 text-xs font-600 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}
      {showNueva && (
        <NuevaSolicitudModal
          onClose={() => setShowNueva(false)}
          onCreate={crearSolicitud}
        />
      )}
    </main>
  )
}
