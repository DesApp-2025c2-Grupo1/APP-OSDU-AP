import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  Check,
  ChevronDown,
  Download,
  FileText,
  MoreVertical,
  Paperclip,
  Pencil,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import HeaderUser from '../components/HeaderUser'

type Affiliate = {
  id: number
  nombre: string
  nro?: string
  tipo?: string
  edad?: number
  iniciales?: string
  color?: string
}

type HistoryEntry = {
  id: number
  afiliadoId?: number
  prestadorId?: number
  turnoId?: number | null
  fecha?: string
  doctor?: string
  especialidad?: string
  modalidad?: string
  nota?: string
  mia?: boolean
  iniciales?: string
  color?: string
}

type Tone = 'emerald' | 'amber' | 'blue'

type NoteIconConfig = {
  icon: LucideIcon
  tone: Tone
}

type ModalNuevaNotaProps = {
  selectedTab: Affiliate | null
  value: string
  onChange: Dispatch<SetStateAction<string>>
  onClose: () => void
  onSave: () => void
  saving: boolean
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function getApiMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string') {
    return payload.message
  }
  return fallback
}

function normalizeSlashDate(value?: string) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || '').trim())
  if (!match) return value || ''
  const [, first, second, yyyy] = match
  return `${first.padStart(2, '0')}/${second.padStart(2, '0')}/${yyyy}`
}

function initials(name?: string) {
  return String(name || 'Afiliado')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function noteTitle(entry?: HistoryEntry) {
  const modality = String(entry?.modalidad || '').toLowerCase()
  const specialty = String(entry?.especialidad || '').toLowerCase()
  if (modality.includes('enfer')) return 'Nota de enfermería'
  if (specialty.includes('enfer')) return 'Nota de enfermería'
  if (specialty.includes('cardio')) return 'Consulta cardiológica'
  if (modality.includes('consulta') || specialty.includes('clín') || specialty.includes('clinic')) return 'Consulta médica'
  return entry?.modalidad || 'Control clínico'
}

function noteIcon(entry?: HistoryEntry): NoteIconConfig {
  const title = noteTitle(entry).toLowerCase()
  if (title.includes('enfer')) return { icon: FileText, tone: 'amber' }
  if (title.includes('consulta')) return { icon: Stethoscope, tone: 'blue' }
  return { icon: FileText, tone: 'emerald' }
}

function IconBadge({ entry }: { entry?: HistoryEntry }) {
  const { icon: Icon, tone } = noteIcon(entry)
  const tones = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    amber: 'border-amber-200 bg-amber-50 text-amber-600',
    blue: 'border-sky-200 bg-sky-50 text-sky-600',
  }

  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${tones[tone]}`}>
      <Icon className="h-4 w-4" />
    </span>
  )
}

function compactNote(value?: string) {
  const text = String(value || 'Sin detalle cargado.')
  return text.length > 98 ? `${text.slice(0, 98).trim()}...` : text
}

function ModalNuevaNota({ selectedTab, value, onChange, onClose, onSave, saving }: ModalNuevaNotaProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-800 text-slate-900">Nueva nota clínica</h2>
            <p className="mt-0.5 text-xs font-600 text-slate-400">{selectedTab?.nombre}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <label className="text-xs font-800 uppercase text-slate-400">Evolución</label>
          <textarea
            autoFocus
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={7}
            placeholder="Escribí la evolución del afiliado..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-800 text-slate-600 transition hover:bg-slate-50">
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={saving || !value.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-800 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Pencil className="h-3.5 w-3.5" />
              {saving ? 'Guardando...' : 'Guardar nota'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HistoriaClinica() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002'

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Affiliate[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedTab, setSelectedTab] = useState<Affiliate | null>(null)
  const [openedPatients, setOpenedPatients] = useState<Affiliate[]>([])
  const [historiaPorPaciente, setHistoriaPorPaciente] = useState<Record<number, HistoryEntry[]>>({})
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const [filter, setFilter] = useState('todas')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showNewNote, setShowNewNote] = useState(false)
  const [nuevaNota, setNuevaNota] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!error) return undefined
    const timer = window.setTimeout(() => setError(''), 4500)
    return () => window.clearTimeout(timer)
  }, [error])

  async function buscar(nextQuery = query) {
    const q = nextQuery.trim()
    if (!q) {
      setResults([])
      return
    }

    try {
      setSearching(true)
      setError('')
      const res = await fetch(`${API_URL}/prestadores/afiliados/search?q=${encodeURIComponent(q)}`, { credentials: 'include' })
      const found = await res.json() as Affiliate[] | { message?: string }
      if (!res.ok) throw new Error(getApiMessage(found, 'No se pudo buscar el afiliado'))
      setResults(Array.isArray(found) ? found : [])
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo buscar el afiliado'))
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  async function cargarHistoria(id: number) {
    try {
      setLoadingHistory(true)
      setError('')
      const res = await fetch(`${API_URL}/prestadores/historia-clinica/afiliado/${id}`, { credentials: 'include' })
      const data = await res.json() as HistoryEntry[] | { message?: string }
      if (!res.ok) throw new Error(getApiMessage(data, 'No se pudo cargar la historia clínica'))
      const entries = Array.isArray(data) ? data : []
      setHistoriaPorPaciente(prev => ({ ...prev, [id]: entries }))
      setSelectedNoteId(entries[0]?.id ?? null)
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo cargar la historia clínica'))
    } finally {
      setLoadingHistory(false)
    }
  }

  function seleccionarAfiliado(afiliado: Affiliate) {
    setSelectedTab(afiliado)
    setOpenedPatients(prev => (prev.some(item => item.id === afiliado.id) ? prev : [...prev, afiliado]))
    setQuery(`${afiliado.nombre} (${afiliado.nro || 'sin credencial'})`)
    setResults([])
    setFilter('todas')

    const loaded = historiaPorPaciente[afiliado.id]
    if (loaded) {
      setSelectedNoteId(loaded[0]?.id ?? null)
    } else {
      cargarHistoria(afiliado.id)
    }
  }

  async function agregarEvolucion() {
    if (!selectedTab || !nuevaNota.trim()) {
      setError('Seleccioná un afiliado e ingresá una evolución.')
      return
    }

    try {
      setSavingNote(true)
      setError('')
      const res = await fetch(`${API_URL}/prestadores/historia-clinica/afiliado/${selectedTab.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: nuevaNota.trim(), modalidad: 'Consulta' }),
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({})) as HistoryEntry & { message?: string }
      if (!res.ok) throw new Error(json.message || 'No se pudo guardar la evolución')
      setHistoriaPorPaciente(prev => ({
        ...prev,
        [selectedTab.id]: [json, ...(prev[selectedTab.id] || [])],
      }))
      setSelectedNoteId(json.id)
      setNuevaNota('')
      setFilter('mis')
      setShowNewNote(false)
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo guardar la evolución'))
    } finally {
      setSavingNote(false)
    }
  }

  const historia = useMemo(() => {
    if (!selectedTab) return []
    return historiaPorPaciente[selectedTab.id] ?? []
  }, [historiaPorPaciente, selectedTab])

  const filteredHistory = useMemo(() => {
    if (filter === 'mis') return historia.filter(entry => entry.mia)
    return historia
  }, [filter, historia])

  const selectedNote = useMemo(() => {
    return filteredHistory.find(entry => entry.id === selectedNoteId) || filteredHistory[0] || null
  }, [filteredHistory, selectedNoteId])

  const filterLabel = filter === 'mis' ? 'Solo mis notas' : 'Todas las notas'

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50 pb-24 md:pb-0">
      <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-900 text-slate-900">Historia clínica</h1>
          <p className="mt-0.5 text-sm font-500 text-slate-500">Consulta y visualización de historia clínica</p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <HeaderUser />
        </div>
      </header>

      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="fixed bottom-20 right-4 z-[95] max-w-sm rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-700 text-rose-700 shadow-lg md:bottom-4">
            {error}
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <p className="text-sm font-900 text-slate-800">Seleccionar afiliado o integrante</p>
              <div className="mt-3 flex max-w-xl items-center rounded-lg border border-slate-300 bg-white px-3 py-2">
                <input
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value)
                    if (!e.target.value.trim()) setResults([])
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') buscar()
                  }}
                  placeholder="Juan Pérez (20-34567891-2)"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm font-700 text-slate-600 outline-none placeholder:text-slate-400"
                />
                {query ? (
                  <button onClick={() => { setQuery(''); setResults([]) }} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              {(results.length > 0 || searching) && (
                <div className="absolute z-40 mt-2 w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {searching ? (
                    <p className="px-4 py-3 text-sm font-700 text-slate-400">Buscando...</p>
                  ) : (
                    results.map(item => (
                      <button
                        key={item.id}
                        onClick={() => seleccionarAfiliado(item)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-emerald-50"
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-900 ${item.color || 'bg-emerald-100 text-emerald-700'}`}>
                          {item.iniciales || initials(item.nombre)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-800 text-slate-800">{item.nombre}</span>
                          <span className="block truncate text-xs font-600 text-slate-400">Credencial {item.nro || 'sin dato'}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex min-w-0 items-center gap-3 lg:min-w-[390px]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <UserRound className="h-5 w-5" />
              </span>
              {selectedTab ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-900 text-slate-900">{selectedTab.nombre}</p>
                  <p className="truncate text-xs font-700 text-slate-500">Titular - {selectedTab.nro || 'Sin credencial'}</p>
                  <p className="truncate text-xs font-600 text-slate-400">Edad: {selectedTab.edad || '-'} años | Obra social: {selectedTab.tipo || 'OSDU'}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-900 text-slate-500">Sin afiliado seleccionado</p>
                  <p className="text-xs font-600 text-slate-400">Buscá por nombre, documento o credencial</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 pt-3 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <nav className="flex min-w-0 gap-8 overflow-x-auto">
              {['Resumen', 'Notas clínicas', 'Antecedentes', 'Estudios', 'Recetas', 'Documentos'].map((tab, index) => (
                <button
                  key={tab}
                  className={`shrink-0 border-b-2 px-0 py-4 text-sm font-800 transition ${
                    index === 0 ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="relative flex items-center gap-2 pb-3">
              <span className="text-xs font-800 text-slate-500">Filtrar notas por:</span>
              <button
                onClick={() => setFilterOpen(prev => !prev)}
                className="flex h-10 min-w-44 items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 text-left text-sm font-700 text-slate-600 transition hover:border-emerald-200"
              >
                {filterLabel}
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-11 z-30 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                  {[
                    { id: 'todas', title: 'Todas las notas', subtitle: 'Muestra todas las notas clínicas' },
                    { id: 'mis', title: 'Solo mis notas', subtitle: 'Solo notas tomadas por mí' },
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => { setFilter(option.id); setFilterOpen(false) }}
                      className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <span>
                        <span className={`block text-sm font-900 ${filter === option.id ? 'text-emerald-700' : 'text-slate-700'}`}>{option.title}</span>
                        <span className="block text-xs font-600 text-slate-400">{option.subtitle}</span>
                      </span>
                      {filter === option.id && <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!selectedTab ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FileText className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-base font-900 text-slate-800">Buscá un afiliado para ver su historia clínica</h2>
              <p className="mt-1 max-w-md text-sm font-600 text-slate-400">La consulta usa la relación de atención existente y muestra las notas disponibles para ese afiliado.</p>
            </div>
          ) : (
            <div className="grid min-h-[520px] lg:grid-cols-[58%_42%]">
              <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-900 text-slate-900">Notas clínicas</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-900 text-slate-500">{filteredHistory.length} notas</span>
                </div>

                {loadingHistory ? (
                  <div className="px-5 py-12 text-center text-sm font-700 text-slate-400">Cargando historia clínica...</div>
                ) : filteredHistory.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm font-700 text-slate-400">Sin notas para mostrar.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredHistory.map((entry, index) => (
                      <button
                        key={entry.id}
                        onClick={() => setSelectedNoteId(entry.id)}
                        className={`grid w-full grid-cols-[64px_1fr_auto] gap-4 px-5 py-5 text-left transition hover:bg-emerald-50/50 ${
                          selectedNote?.id === entry.id ? 'bg-emerald-50/80' : 'bg-white'
                        }`}
                      >
                        <div className="relative flex flex-col items-center">
                          <span className="text-xs font-900 text-slate-700">{normalizeSlashDate(entry.fecha)}</span>
                          <span className="mt-1 text-xs font-700 text-slate-400">{index % 2 === 0 ? '10:30' : '09:15'}</span>
                          {index < filteredHistory.length - 1 && <span className="absolute top-9 h-16 w-px bg-slate-200" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <IconBadge entry={entry} />
                            <p className="truncate text-sm font-900 text-slate-900">{noteTitle(entry)}</p>
                            {entry.mia && <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-900 text-emerald-700">Mi nota</span>}
                          </div>
                          <p className="mt-2 text-sm font-700 text-slate-600">{entry.doctor || 'Profesional no informado'}</p>
                          <p className="mt-1 line-clamp-2 text-xs font-600 leading-relaxed text-slate-500">{compactNote(entry.nota)}</p>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="hidden max-w-32 truncate text-xs font-700 text-slate-500 sm:block">{entry.especialidad || 'Sin especialidad'}</span>
                          <MoreVertical className="h-4 w-4 shrink-0 text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredHistory.length > 0 && (
                  <div className="flex justify-center border-t border-slate-100 px-5 py-5">
                    <button className="rounded-lg border border-slate-200 px-12 py-2 text-sm font-800 text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700">
                      Ver más notas
                    </button>
                  </div>
                )}
              </div>

              <aside className="flex min-h-[520px] flex-col">
                <div className="flex-1 px-5 py-5 sm:px-7">
                  <h2 className="text-base font-900 text-slate-900">Detalle de la nota seleccionada</h2>

                  {!selectedNote ? (
                    <div className="flex min-h-[360px] items-center justify-center text-center text-sm font-700 text-slate-400">
                      Seleccioná una nota para ver el detalle.
                    </div>
                  ) : (
                    <div className="mt-6">
                      <div className="flex items-center gap-3">
                        <IconBadge entry={selectedNote} />
                        <h3 className="text-lg font-900 text-slate-900">{noteTitle(selectedNote)}</h3>
                        {selectedNote.mia && <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-900 text-emerald-700">Mi nota</span>}
                      </div>

                      <dl className="mt-6 grid gap-4 text-sm">
                        {[
                          ['Fecha y hora', `${normalizeSlashDate(selectedNote.fecha)} - 10:30`],
                          ['Profesional', selectedNote.doctor || 'Sin dato'],
                          ['Tipo de nota', selectedNote.modalidad || 'Consulta médica'],
                          ['Motivo de consulta', noteTitle(selectedNote)],
                        ].map(([label, value]) => (
                          <div key={label} className="grid grid-cols-[140px_1fr] gap-3">
                            <dt className="font-900 text-slate-500">{label}</dt>
                            <dd className="font-700 text-slate-600">{value}</dd>
                          </div>
                        ))}
                      </dl>

                      <div className="my-6 h-px bg-slate-200" />

                      <div>
                        <p className="text-sm font-900 text-slate-500">Nota clínica</p>
                        <p className="mt-4 whitespace-pre-line text-sm font-600 leading-7 text-slate-600">{selectedNote.nota || 'Sin detalle cargado.'}</p>
                      </div>

                      <div className="my-6 h-px bg-slate-200" />

                      <div>
                        <p className="text-sm font-900 text-slate-500">Archivos adjuntos</p>
                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                            <Paperclip className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-900 text-slate-700">laboratorio_16052024.pdf</p>
                            <p className="text-xs font-700 text-slate-400">PDF - 245 KB</p>
                          </div>
                          <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-7">
                  <button
                    onClick={() => setShowNewNote(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-900 text-emerald-700 transition hover:bg-emerald-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Nueva nota
                  </button>
                </div>
              </aside>
            </div>
          )}
        </section>

        {openedPatients.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {openedPatients.map(patient => (
              <button
                key={patient.id}
                onClick={() => seleccionarAfiliado(patient)}
                className={`rounded-full border px-3 py-1.5 text-xs font-900 transition ${
                  selectedTab?.id === patient.id
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                }`}
              >
                {patient.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {showNewNote && (
        <ModalNuevaNota
          selectedTab={selectedTab}
          value={nuevaNota}
          onChange={setNuevaNota}
          onClose={() => setShowNewNote(false)}
          onSave={agregarEvolucion}
          saving={savingNote}
        />
      )}
    </main>
  )
}
