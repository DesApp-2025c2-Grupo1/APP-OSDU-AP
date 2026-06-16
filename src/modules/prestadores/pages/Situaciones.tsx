// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import HeaderUser from '../components/HeaderUser'
import CalendarDateInput from '../components/CalendarDateInput'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002'

function formatToday() {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${today.getFullYear()}`
}

function normalizeSlashDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || '').trim())
  if (!match) return value || ''
  const [, first, second, yyyy] = match
  if (Number(first) > 12) return `${first.padStart(2, '0')}/${second.padStart(2, '0')}/${yyyy}`
  return `${second.padStart(2, '0')}/${first.padStart(2, '0')}/${yyyy}`
}

function toISODateFromDDMMYYYY(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || '').trim())
  if (!match) return ''
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

function parseDDMMYYYY(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || '').trim())
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return date.getFullYear() === Number(yyyy) &&
    date.getMonth() === Number(mm) - 1 &&
    date.getDate() === Number(dd)
    ? date
    : null
}

function getApiMessage(payload, fallback) {
  return payload?.message || payload?.error || fallback
}

function estadoBadge(sit) {
  const label = sit.estado || (sit.activa ? 'Activa' : 'Finalizada')
  const normalized = String(label).toLowerCase()
  if (normalized.includes('baja')) {
    return <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-800 text-rose-600">Baja</span>
  }
  if (normalized.includes('final')) {
    return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-800 text-slate-500">Finalizada</span>
  }
  return <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-800 text-emerald-700">Activa</span>
}

function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function UserIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
    </svg>
  )
}

function CalendarIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M5.25 5.25h13.5A1.5 1.5 0 0120.25 6.75v11.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z" />
    </svg>
  )
}

function NoteIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h4.5M5.25 3.75h13.5A1.5 1.5 0 0120.25 5.25v13.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function SectionTitle({ icon, number, title }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        {icon}
      </span>
      <h3 className="text-base font-900 text-slate-800">{number}. {title}</h3>
    </div>
  )
}

function ConfirmDeleteModal({ item, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-800 text-slate-800">Eliminar situación</h2>
          <p className="mt-2 text-sm text-slate-500">¿Seguro que querés eliminar {item?.tipo ? `"${item.tipo}"` : 'esta situación'}?</p>
        </div>
        <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
          <button onClick={onCancel} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-700 text-slate-600 hover:bg-white">Cancelar</button>
          <button onClick={onConfirm} className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-700 text-white hover:bg-rose-700">Eliminar</button>
        </div>
      </div>
    </div>
  )
}

function FinalizarSituacionModal({ item, onCancel, onConfirm }) {
  const [motivo, setMotivo] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-800 text-slate-800">Dar de baja situación</h2>
          <p className="mt-2 text-sm text-slate-500">Indicá el motivo para finalizar {item?.tipo ? `"${item.tipo}"` : 'esta situación'}.</p>
        </div>
        <div className="px-6 py-4">
          <label className="mb-1.5 block text-xs font-800 text-slate-600">Motivo</label>
          <textarea
            value={motivo}
            onChange={event => setMotivo(event.target.value)}
            rows={4}
            placeholder="Escribí el motivo de la baja..."
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
          <button onClick={onCancel} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-700 text-slate-600 hover:bg-white">Cancelar</button>
          <button
            onClick={() => onConfirm(motivo.trim())}
            disabled={!motivo.trim()}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-700 text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Dar de baja
          </button>
        </div>
      </div>
    </div>
  )
}

const emptyForm = {
  tipo: '',
  descripcion: '',
  fechaInicio: formatToday(),
  fechaFin: '',
  sinFechaFin: true,
  tratamiento: '',
  observaciones: '',
}

export default function Situaciones() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedAffiliate, setSelectedAffiliate] = useState(null)
  const [situaciones, setSituaciones] = useState([])
  const [opcionesSit, setOpcionesSit] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('todas')
  const [filtEstado, setFiltEstado] = useState('Todos')
  const [filtFecha, setFiltFecha] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [finalizarTarget, setFinalizarTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [success, setSuccess] = useState('')
  const searchTimer = useRef(null)

  const selectedLabel = selectedAffiliate
    ? `${selectedAffiliate.nombre} (${selectedAffiliate.nro || 'sin credencial'})`
    : ''

  const activeCount = situaciones.filter(sit => sit.activa).length
  const finishedCount = situaciones.filter(sit => !sit.activa && String(sit.estado || '').toLowerCase() !== 'baja').length
  const bajaCount = situaciones.filter(sit => String(sit.estado || '').toLowerCase() === 'baja').length
  const tabs = [
    { key: 'todas', label: 'Todas', count: situaciones.length },
    { key: 'activas', label: 'Activas', count: activeCount },
    { key: 'finalizadas', label: 'Finalizadas', count: finishedCount },
    { key: 'baja', label: 'Baja', count: bajaCount },
  ]
  const filteredSituaciones = situaciones.filter(sit => {
    const status = String(sit.estado || (sit.activa ? 'activa' : 'finalizada')).toLowerCase()
    if (activeTab === 'activas' && !sit.activa) return false
    if (activeTab === 'finalizadas' && (sit.activa || status.includes('baja'))) return false
    if (activeTab === 'baja' && !status.includes('baja')) return false
    if (filtEstado === 'Activa' && !sit.activa) return false
    if (filtEstado === 'Finalizada' && (sit.activa || status.includes('baja'))) return false
    if (filtEstado === 'Baja' && !status.includes('baja')) return false
    if (filtFecha && normalizeSlashDate(sit.fechaInicio) !== filtFecha && normalizeSlashDate(sit.fechaFin) !== filtFecha) return false
    return true
  })
  const hayFiltros = activeTab !== 'todas' || filtEstado !== 'Todos' || filtFecha

  const tiposOptions = useMemo(() => opcionesSit.map(op => op.nombre).filter(Boolean), [opcionesSit])

  useEffect(() => {
    fetch(`${API_BASE_URL}/prestadores/situaciones/tipos`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setOpcionesSit(Array.isArray(data) ? data : []))
      .catch(() => setOpcionesSit([]))
  }, [])

  useEffect(() => {
    if (selectedAffiliate?.id) cargarSituacionesAfiliado(selectedAffiliate.id)
    else setSituaciones([])
  }, [selectedAffiliate?.id])

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setFormErrors(prev => {
      const next = { ...prev }
      delete next[field]
      if (field === 'sinFechaFin') delete next.fechaFin
      return next
    })
    setError('')
  }

  function buscarAfiliados(value) {
    setQuery(value)
    setSuccess('')
    setFormErrors(prev => {
      const next = { ...prev }
      delete next.afiliado
      return next
    })
    if (searchTimer.current) clearTimeout(searchTimer.current)

    if (value.trim().length < 2) {
      setSearchResults([])
      return
    }

    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/prestadores/afiliados/search?q=${encodeURIComponent(value.trim())}`, { credentials: 'include' })
        const data = await res.json().catch(() => [])
        if (!res.ok) throw new Error(getApiMessage(data, 'No se pudo buscar el afiliado'))
        setSearchResults(Array.isArray(data) ? data : [])
        setError('')
      } catch (e) {
        setSearchResults([])
        setError(e.message || 'No se pudo buscar el afiliado')
      }
    }, 300)
  }

  function seleccionarAfiliado(affiliate) {
    setSelectedAffiliate(affiliate)
    setQuery(`${affiliate.nombre} (${affiliate.nro || 'sin credencial'})`)
    setSearchResults([])
    setSuccess('')
    setError('')
    setFormErrors(prev => {
      const next = { ...prev }
      delete next.afiliado
      return next
    })
  }

  async function cargarSituacionesAfiliado(affiliateId) {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/prestadores/situaciones/afiliado/${affiliateId}`, { credentials: 'include' })
      const data = await res.json().catch(() => [])
      if (!res.ok) throw new Error(getApiMessage(data, 'No se pudieron cargar las situaciones'))
      setSituaciones((Array.isArray(data) ? data : []).map(s => ({
        ...s,
        fechaInicio: normalizeSlashDate(s.fechaInicio),
        fechaFin: normalizeSlashDate(s.fechaFin),
      })))
      setError('')
    } catch (e) {
      setSituaciones([])
      setError(e.message || 'No se pudieron cargar las situaciones')
    } finally {
      setLoading(false)
    }
  }

  function openNueva() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setSuccess('')
    setError('')
    setFormErrors({})
  }

  function openEditar(sit) {
    setEditingId(sit.id)
    setForm({
      tipo: sit.tipo || '',
      descripcion: '',
      fechaInicio: sit.fechaInicio || formatToday(),
      fechaFin: sit.fechaFin || '',
      sinFechaFin: !sit.fechaFin,
      tratamiento: '',
      observaciones: sit.observacion || '',
    })
    setShowForm(true)
    setSuccess('')
    setError('')
    setFormErrors({})
  }

  function volverListado() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setFormErrors({})
  }

  function validateForm() {
    const errors = {}
    if (!selectedAffiliate?.id) errors.afiliado = 'Seleccioná un afiliado.'
    if (!form.tipo.trim()) errors.tipo = 'Ingresá el diagnóstico o situación.'
    else if (form.tipo.trim().length < 3) errors.tipo = 'Ingresá al menos 3 caracteres.'
    const inicio = parseDDMMYYYY(form.fechaInicio)
    const fin = form.sinFechaFin ? null : parseDDMMYYYY(form.fechaFin)
    if (!form.fechaInicio.trim()) errors.fechaInicio = 'Ingresá la fecha de inicio.'
    else if (!inicio) errors.fechaInicio = 'Usá una fecha válida con formato DD/MM/AAAA.'
    if (!form.sinFechaFin && !form.fechaFin.trim()) errors.fechaFin = 'Ingresá una fecha de finalización o marcá sin fecha.'
    else if (!form.sinFechaFin && !fin) errors.fechaFin = 'Usá una fecha válida con formato DD/MM/AAAA.'
    if (inicio && fin && fin < inicio) errors.fechaFin = 'La fecha de finalización no puede ser anterior al inicio.'
    if (form.descripcion.length > 500) errors.descripcion = 'La descripción no puede superar 500 caracteres.'
    if (form.tratamiento.length > 200) errors.tratamiento = 'El tratamiento no puede superar 200 caracteres.'
    if (form.observaciones.length > 500) errors.observaciones = 'Las observaciones no pueden superar 500 caracteres.'
    return errors
  }

  function fieldClass(field) {
    return formErrors[field]
      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
      : 'border-slate-200 focus:border-teal-300 focus:ring-teal-100'
  }

  function FieldError({ field }) {
    return formErrors[field] ? <p className="mt-1 text-xs font-700 text-rose-500">{formErrors[field]}</p> : null
  }

  function buildObservation() {
    return [
      form.descripcion.trim() ? `Descripción: ${form.descripcion.trim()}` : '',
      form.tratamiento.trim() ? `Tratamiento indicado: ${form.tratamiento.trim()}` : '',
      form.observaciones.trim() ? `Observaciones: ${form.observaciones.trim()}` : '',
    ].filter(Boolean).join('\n')
  }

  async function guardarSituacion() {
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      setError('Revisá los campos marcados para guardar la situación.')
      return
    }

    const payload = {
      tipo: form.tipo.trim(),
      fechaInicio: toISODateFromDDMMYYYY(form.fechaInicio),
      fechaFin: form.sinFechaFin ? '' : toISODateFromDDMMYYYY(form.fechaFin),
      activa: form.sinFechaFin,
      observacion: buildObservation(),
    }

    setSaving(true)
    try {
      const url = editingId
        ? `${API_BASE_URL}/prestadores/situaciones/afiliado/${selectedAffiliate.id}/${editingId}`
        : `${API_BASE_URL}/prestadores/situaciones/afiliado/${selectedAffiliate.id}`
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(getApiMessage(data, 'No se pudo guardar la situación'))
      await cargarSituacionesAfiliado(selectedAffiliate.id)
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      setSuccess(editingId ? 'Situación actualizada correctamente.' : 'Situación guardada correctamente.')
      setError('')
    } catch (e) {
      setError(e.message || 'No se pudo guardar la situación')
    } finally {
      setSaving(false)
    }
  }

  async function darDeBaja(sit, motivo) {
    if (!selectedAffiliate?.id || !motivo.trim()) return
    try {
      const res = await fetch(`${API_BASE_URL}/prestadores/situaciones/afiliado/${selectedAffiliate.id}/${sit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: false, motivoFinalizacion: motivo.trim() }),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(getApiMessage(data, 'No se pudo finalizar la situación'))
      setFinalizarTarget(null)
      await cargarSituacionesAfiliado(selectedAffiliate.id)
      setSuccess('Situación dada de baja correctamente.')
    } catch (e) {
      setError(e.message || 'No se pudo finalizar la situación')
    }
  }

  async function confirmarEliminar() {
    if (!deleteTarget || !selectedAffiliate?.id) return
    try {
      const res = await fetch(`${API_BASE_URL}/prestadores/situaciones/afiliado/${selectedAffiliate.id}/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(getApiMessage(data, 'No se pudo eliminar la situación'))
      setDeleteTarget(null)
      await cargarSituacionesAfiliado(selectedAffiliate.id)
      setSuccess('Situación eliminada correctamente.')
    } catch (e) {
      setError(e.message || 'No se pudo eliminar la situación')
    }
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50 pb-24 md:pb-0">
      <header className="sticky top-0 z-10 flex flex-wrap items-start gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:items-center sm:justify-between sm:px-8">
        <div className="min-w-0 flex-1 sm:flex-none">
          <h1 className="text-lg font-700 text-slate-800">Situaciones terapéuticas</h1>
          <p className="text-xs text-slate-400">Gestión de situaciones de afiliados y grupo familiar</p>
        </div>
        <div className="sm:hidden">
          <HeaderUser />
        </div>
        <div className="order-3 flex w-full items-center justify-start gap-3 sm:order-none sm:w-auto sm:justify-end">
          <div className="relative w-full sm:w-auto">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => buscarAfiliados(e.target.value)}
              placeholder="Buscar afiliado..."
              className="w-full rounded-lg border-0 bg-slate-100 py-2 pl-9 pr-4 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 sm:w-52"
            />
          </div>
          <div className="hidden sm:block">
            <HeaderUser />
          </div>
        </div>
      </header>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-3 pb-20 backdrop-blur-sm sm:p-4">
          <section className="flex max-h-[calc(100dvh-6.5rem)] min-h-0 w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl sm:max-h-[92vh] md:max-w-6xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-base font-900 text-slate-800">{editingId ? 'Editar situación terapéutica' : 'Nueva situación terapéutica'}</h2>
                <p className="mt-0.5 text-xs font-600 text-slate-400">Completá los datos para registrar una nueva situación.</p>
              </div>
              <button onClick={volverListado} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" aria-label="Cerrar">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">

              {error && <div className="mb-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-700 text-rose-700">{error}</div>}

              <div className="space-y-3 sm:space-y-4">
                <section className="border-b border-slate-100 pb-3 sm:pb-4">
                  <SectionTitle icon={<UserIcon />} number="1" title="Afiliado / Integrante" />
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-900 text-slate-700">Afiliado</span>
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={query}
                          onChange={e => buscarAfiliados(e.target.value)}
                          placeholder="Buscar afiliado por número, apellido o teléfono"
                          className={`w-full rounded-lg border py-2 pl-10 pr-4 text-sm font-600 text-slate-700 outline-none focus:ring-2 ${fieldClass('afiliado')}`}
                        />
                        {searchResults.length > 0 && (
                          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-auto rounded-xl border border-slate-100 bg-white shadow-xl">
                            {searchResults.map(item => (
                              <button
                                key={item.id}
                                type="button"
                                onMouseDown={event => {
                                  event.preventDefault()
                                  seleccionarAfiliado(item)
                                }}
                                className="w-full px-4 py-3 text-left text-sm font-700 text-slate-700 hover:bg-teal-50"
                              >
                                {item.nombre} <span className="font-600 text-slate-400">({item.nro || 'sin credencial'})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <FieldError field="afiliado" />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-900 text-slate-700">Integrante del grupo familiar</span>
                      <div className="relative">
                        <select
                          value={selectedAffiliate?.id || ''}
                          onChange={e => {
                            const next = searchResults.find(item => String(item.id) === e.target.value) || selectedAffiliate
                            if (next) seleccionarAfiliado(next)
                          }}
                          className={`w-full appearance-none rounded-lg border bg-white py-2 pl-4 pr-10 text-sm font-600 text-slate-700 outline-none focus:ring-2 ${fieldClass('afiliado')}`}
                        >
                          {selectedAffiliate ? (
                            <option value={selectedAffiliate.id}>{selectedAffiliate.nombre} - {selectedAffiliate.nro || 'sin credencial'}</option>
                          ) : (
                            <option value="">Seleccioná un afiliado</option>
                          )}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><ChevronDownIcon /></span>
                      </div>
                      <FieldError field="afiliado" />
                    </label>
                  </div>
                </section>

                <section className="border-b border-slate-100 pb-3 sm:pb-4">
                  <SectionTitle icon={<CalendarIcon />} number="2" title="Datos de la situación" />
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-900 text-slate-700">Diagnóstico / Situación</span>
                      <input
                        list="situaciones-options"
                        value={form.tipo}
                        onChange={e => updateForm('tipo', e.target.value)}
                        placeholder="Ej: Diabetes mellitus tipo 2"
                        className={`w-full rounded-lg border px-4 py-2 text-sm font-600 text-slate-700 outline-none focus:ring-2 ${fieldClass('tipo')}`}
                      />
                      <datalist id="situaciones-options">
                        {tiposOptions.map(option => <option key={option} value={option} />)}
                      </datalist>
                      <FieldError field="tipo" />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-900 text-slate-700">Descripción (opcional)</span>
                      <textarea
                        value={form.descripcion}
                        onChange={e => updateForm('descripcion', e.target.value)}
                        rows={2}
                        placeholder="Agregá información adicional sobre la situación..."
                        className={`w-full resize-none rounded-lg border px-4 py-2 text-sm font-600 text-slate-700 outline-none focus:ring-2 ${fieldClass('descripcion')}`}
                      />
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <FieldError field="descripcion" />
                        <span className={`ml-auto text-xs font-600 ${form.descripcion.length > 500 ? 'text-rose-500' : 'text-slate-300'}`}>{form.descripcion.length}/500</span>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-900 text-slate-700">Fecha de inicio</span>
                      <CalendarDateInput
                        value={form.fechaInicio}
                        onChange={value => updateForm('fechaInicio', value)}
                        className={`w-full rounded-lg border px-4 py-2 text-sm font-600 text-slate-700 outline-none focus:ring-2 ${fieldClass('fechaInicio')}`}
                      />
                      <FieldError field="fechaInicio" />
                    </label>

                    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-900 text-slate-700">Fecha estimada de finalización (opcional)</span>
                        <CalendarDateInput
                          value={form.fechaFin}
                          onChange={value => updateForm('fechaFin', value)}
                          placeholder="Seleccionar fecha"
                          className={`w-full rounded-lg border px-4 py-2 text-sm font-600 text-slate-700 outline-none focus:ring-2 disabled:bg-slate-50 ${fieldClass('fechaFin')}`}
                        />
                        <FieldError field="fechaFin" />
                      </label>
                      <label className="mb-1.5 inline-flex items-center gap-2 text-sm font-800 text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.sinFechaFin}
                          onChange={e => {
                            updateForm('sinFechaFin', e.target.checked)
                            if (e.target.checked) updateForm('fechaFin', '')
                          }}
                          className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                        />
                        Sin fecha de finalización
                      </label>
                    </div>
                  </div>
                </section>

                <section>
                  <SectionTitle icon={<NoteIcon />} number="3" title="Tratamiento / Observaciones" />
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-900 text-slate-700">Tratamiento indicado (opcional)</span>
                      <input
                        value={form.tratamiento}
                        onChange={e => updateForm('tratamiento', e.target.value)}
                        placeholder="Ej: Metformina 850 mg cada 12 hs"
                        className={`w-full rounded-lg border px-4 py-2 text-sm font-600 text-slate-700 outline-none focus:ring-2 ${fieldClass('tratamiento')}`}
                      />
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <FieldError field="tratamiento" />
                        <span className={`ml-auto text-xs font-600 ${form.tratamiento.length > 200 ? 'text-rose-500' : 'text-slate-300'}`}>{form.tratamiento.length}/200</span>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-900 text-slate-700">Observaciones (opcional)</span>
                      <textarea
                        value={form.observaciones}
                        onChange={e => updateForm('observaciones', e.target.value)}
                        rows={2}
                        placeholder="Observaciones adicionales..."
                        className={`w-full resize-none rounded-lg border px-4 py-2 text-sm font-600 text-slate-700 outline-none focus:ring-2 ${fieldClass('observaciones')}`}
                      />
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <FieldError field="observaciones" />
                        <span className={`ml-auto text-xs font-600 ${form.observaciones.length > 500 ? 'text-rose-500' : 'text-slate-300'}`}>{form.observaciones.length}/500</span>
                      </div>
                    </label>
                  </div>
                </section>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-4 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-6">
              <button
                onClick={guardarSituacion}
                disabled={saving}
                className="w-full rounded-xl bg-teal-600 px-7 py-2.5 text-sm font-900 text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:rounded-lg sm:py-2"
              >
                {saving ? 'Guardando...' : 'Guardar situación'}
              </button>
            </div>
          </section>
        </div>
      )}

        <div className="p-4 sm:p-8">
          {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-700 text-rose-700">{error}</div>}
          {success && <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-700 text-teal-700">{success}</div>}

          <section className="mt-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 pt-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="hidden md:flex items-center gap-1 flex-wrap">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-500 transition-colors ${
                      activeTab === tab.key
                        ? 'border-teal-500 text-teal-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-600 ${
                      activeTab === tab.key ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="md:hidden">
                <select
                  value={activeTab}
                  onChange={e => setActiveTab(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-600 text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
                  {tabs.map(tab => <option key={tab.key} value={tab.key}>{tab.label} ({tab.count})</option>)}
                </select>
              </div>
              <button
                onClick={openNueva}
                className="mb-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-600 text-white transition-colors hover:bg-teal-700 md:w-auto"
              >
                <PlusIcon />
                Nueva situación
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-6">
              <div className="relative w-full sm:w-72">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={e => buscarAfiliados(e.target.value)}
                  placeholder="Buscar afiliado o nro..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs font-600 text-slate-600 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-auto rounded-xl border border-slate-100 bg-white shadow-xl">
                    {searchResults.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={event => {
                          event.preventDefault()
                          seleccionarAfiliado(item)
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-600 text-slate-700 hover:bg-teal-50"
                      >
                        {item.nombre} <span className="text-xs font-500 text-slate-400">({item.nro || 'sin credencial'})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <select
                value={filtEstado}
                onChange={e => setFiltEstado(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-600 text-slate-600 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:w-36"
              >
                <option>Todos</option>
                <option>Activa</option>
                <option>Finalizada</option>
                <option>Baja</option>
              </select>
              <CalendarDateInput
                value={filtFecha}
                onChange={setFiltFecha}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-600 text-slate-600 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:w-36"
                placeholder="DD/MM/AAAA"
              />
              <button className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-600 text-white transition-colors hover:bg-teal-700">
                Filtrar
              </button>
              {hayFiltros && (
                <button
                  onClick={() => {
                    setActiveTab('todas')
                    setFiltEstado('Todos')
                    setFiltFecha('')
                  }}
                  className="rounded-lg px-3 py-2 text-xs font-500 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  Limpiar
                </button>
              )}
              {selectedAffiliate && (
                <span className="ml-auto text-xs font-600 text-slate-400">
                  {selectedLabel}
                </span>
              )}
            </div>

            <div className="overflow-x-visible md:overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-2.5 text-left text-xs font-600 uppercase tracking-wider text-slate-400 sm:px-6">Diagnóstico / Situación</th>
                    <th className="px-4 py-2.5 text-left text-xs font-600 uppercase tracking-wider text-slate-400 sm:px-6">Fecha inicio</th>
                    <th className="hidden px-6 py-2.5 text-left text-xs font-600 uppercase tracking-wider text-slate-400 sm:table-cell">Fecha fin</th>
                    <th className="px-4 py-2.5 text-left text-xs font-600 uppercase tracking-wider text-slate-400 sm:px-6">Estado</th>
                    <th className="hidden px-6 py-2.5 text-left text-xs font-600 uppercase tracking-wider text-slate-400 lg:table-cell">Observaciones</th>
                    <th className="hidden px-6 py-2.5 text-left text-xs font-600 uppercase tracking-wider text-slate-400 sm:table-cell">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!selectedAffiliate ? (
                    <tr><td colSpan={6} className="px-6 py-14 text-center text-sm text-slate-400">Buscá y seleccioná un afiliado para ver sus situaciones.</td></tr>
                  ) : loading ? (
                    <tr><td colSpan={6} className="px-6 py-14 text-center text-sm text-slate-400">Cargando situaciones...</td></tr>
                  ) : filteredSituaciones.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-14 text-center text-sm text-slate-400">No hay situaciones que coincidan con los filtros aplicados.</td></tr>
                  ) : (
                    filteredSituaciones.map(sit => (
                      <tr key={sit.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-3 sm:px-6">
                          <p className="text-sm font-600 text-slate-800">{sit.tipo}</p>
                          <p className="mt-0.5 text-xs text-slate-400 sm:hidden">{sit.fechaFin || 'Sin fecha fin'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 sm:px-6">{sit.fechaInicio}</td>
                        <td className="hidden px-6 py-3 text-xs text-slate-400 sm:table-cell">{sit.fechaFin || '-'}</td>
                        <td className="px-4 py-3 sm:px-6">{estadoBadge(sit)}</td>
                        <td className="hidden max-w-sm whitespace-pre-line px-6 py-3 text-xs text-slate-400 lg:table-cell">{sit.observacion || 'Sin observaciones.'}</td>
                        <td className="hidden px-6 py-3 sm:table-cell">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditar(sit)} className="inline-flex items-center gap-1 rounded-lg border border-teal-200 px-3 py-1.5 text-xs font-500 text-teal-600 transition-colors hover:border-teal-400 hover:text-teal-700" title="Editar">
                              <EditIcon />
                              Editar
                            </button>
                            {sit.activa && (
                              <button onClick={() => setFinalizarTarget(sit)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-500 transition-colors hover:bg-rose-50" title="Dar de baja">
                                <TrashIcon />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-500" /> Activa {activeCount ? `(${activeCount})` : ''}</span>
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-400" /> Finalizada {finishedCount ? `(${finishedCount})` : ''}</span>
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /> Baja {bajaCount ? `(${bajaCount})` : ''}</span>
                <span>Mostrando {filteredSituaciones.length} situaciones</span>
              </div>
            </div>
          </section>
        </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          item={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmarEliminar}
        />
      )}
      {finalizarTarget && (
        <FinalizarSituacionModal
          item={finalizarTarget}
          onCancel={() => setFinalizarTarget(null)}
          onConfirm={motivo => darDeBaja(finalizarTarget, motivo)}
        />
      )}
    </main>
  )
}
