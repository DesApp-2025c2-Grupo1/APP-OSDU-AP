// @ts-nocheck
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import HeaderUser from '../components/HeaderUser'
import Dropdown from '../components/Dropdown'
import CalendarDateInput from '../components/CalendarDateInput'

function estadoBadge(activa) {
  return activa
    ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-500 bg-emerald-100 text-emerald-700">Activo</span>
    : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-500 bg-slate-100 text-slate-500">Finalizado</span>
}

function ConfirmDeleteModal({ item, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-0 sm:mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-600 text-slate-800">Eliminar situación</h2>
          <p className="text-sm text-slate-500 mt-2">
            ¿Seguro que querés eliminar {item?.tipo ? `"${item.tipo}"` : 'esta situación'}?
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-600 text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-600 text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

function Modal({ title, form, onChange, onClose, onSave, saveLabel = 'Guardar', opciones = [] }) {
  const [errors, setErrors] = useState({})

  function validate(nextForm = form) {
    const nextErrors = {}
    const inicio = nextForm.fechaInicio ? parseDate(nextForm.fechaInicio) : null
    const fin = nextForm.fechaFin ? parseDate(nextForm.fechaFin) : null

    if (!nextForm.tipo) nextErrors.tipo = 'Seleccioná una situación.'
    if (!nextForm.fechaInicio) nextErrors.fechaInicio = 'Ingresá la fecha de inicio.'
    else if (!inicio) nextErrors.fechaInicio = 'Usá una fecha de inicio válida.'
    if (!nextForm.fechaFin) nextErrors.fechaFin = 'Ingresá la fecha de fin.'
    else if (nextForm.fechaFin && !fin) nextErrors.fechaFin = 'Usá una fecha de fin válida.'
    if (inicio && fin && fin < inicio) nextErrors.fechaFin = 'La fecha de fin no puede ser anterior al inicio.'

    return nextErrors
  }

  function update(nextForm) {
    if (Object.keys(errors).length > 0) {
      setErrors(validate(nextForm))
    }
    onChange(nextForm)
  }

  function parseDate(value) {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
    if (!match) return null
    const [, mm, dd, yyyy] = match
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    const valid = date.getFullYear() === Number(yyyy) && date.getMonth() === Number(mm) - 1 && date.getDate() === Number(dd)
    return valid ? date : null
  }

  function formatDateMMDDYYYY(date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${mm}/${dd}/${yyyy}`
  }

  function toDateInputValue(value) {
    const date = value ? parseDate(value) : null
    if (!date) return ''
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${yyyy}-${mm}-${dd}`
  }

  function fromDateInputValue(value) {
    if (!value) return ''
    const [yyyy, mm, dd] = value.split('-')
    return formatDateMMDDYYYY(new Date(Number(yyyy), Number(mm) - 1, Number(dd)))
  }

  function DateTextPicker({ value, onChange, hasError }) {
    return (
      <CalendarDateInput
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 outline-none text-slate-700 ${hasError ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'}`}
      />
    )
  }

  function handleSave() {
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-600 text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-4">
          {/* Situación */}
          <div>
            <label className="block text-xs font-600 text-slate-600 mb-1.5">Situación</label>
            <Dropdown
              value={form.tipo}
              options={opciones.map(op => ({ value: op.nombre, label: op.nombre }))}
              onChange={value => update({ ...form, tipo: value })}
              placeholder="Seleccionar..."
              buttonClassName={`py-2.5 ${errors.tipo ? 'border-rose-300 ring-0' : ''}`}
              maxMenuHeight="max-h-56"
            />
            {errors.tipo && <p className="text-xs text-rose-500 mt-1.5">{errors.tipo}</p>}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-slate-600 mb-1.5">Fecha de inicio</label>
              <DateTextPicker
                value={form.fechaInicio}
                onChange={value => update({ ...form, fechaInicio: value })}
                hasError={Boolean(errors.fechaInicio)}
              />
              {errors.fechaInicio && <p className="text-xs text-rose-500 mt-1.5">{errors.fechaInicio}</p>}
            </div>
            <div>
              <label className="block text-xs font-600 text-slate-600 mb-1.5">Fecha de fin</label>
              <DateTextPicker
                value={form.fechaFin}
                onChange={value => update({ ...form, fechaFin: value })}
                hasError={Boolean(errors.fechaFin)}
              />
              {errors.fechaFin && <p className="text-xs text-rose-500 mt-1.5">{errors.fechaFin}</p>}
            </div>
          </div>

          {/* Toggle activa */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="activa"
              checked={form.activa}
              onChange={e => update({ ...form, activa: e.target.checked })}
              className="w-4 h-4 accent-teal-600 rounded"
            />
            <label htmlFor="activa" className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer select-none">
              Mantener situación activa
              <button
                type="button"
                onClick={() => update({ ...form, activa: !form.activa })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.activa ? 'bg-teal-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.activa ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={handleSave} className="px-8 py-2.5 text-sm font-600 text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors">
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const emptyForm = { tipo: '', fechaInicio: '', fechaFin: '', activa: true }

const demoAfiliados = [
  { id: 1, nombre: 'Juan Suarez', nro: 'AFI-0001' },
  { id: 2, nombre: 'María Sáez', nro: 'AFI-0002' },
  { id: 3, nombre: 'Lucía Suarez', nro: 'AFI-0003' },
  { id: 4, nombre: 'Pedro Suarez', nro: 'AFI-0004' },
  { id: 5, nombre: 'Romina Suarez', nro: 'AFI-0005' },
]

const demoSituaciones = {
  1: [
    { id: 101, tipo: 'Tratamiento psicológico', fechaInicio: '02/01/2024', fechaFin: '01/06/2024', activa: true },
    { id: 102, tipo: 'Rehabilitación post-operatoria', fechaInicio: '03/20/2023', fechaFin: '07/10/2023', activa: false },
  ],
  2: [
    { id: 201, tipo: 'Control nutricional', fechaInicio: '04/12/2024', fechaFin: '09/12/2024', activa: true },
  ],
  3: [
    { id: 301, tipo: 'Kinesiología respiratoria', fechaInicio: '01/15/2024', fechaFin: '06/15/2024', activa: true },
  ],
  4: [
    { id: 401, tipo: 'Tratamiento psicológico', fechaInicio: '08/05/2023', fechaFin: '12/05/2023', activa: false },
  ],
  5: [
    { id: 501, tipo: 'Rehabilitación post-operatoria', fechaInicio: '02/10/2024', fechaFin: '08/10/2024', activa: true },
  ],
}

export default function Situaciones() {
  const { usuario: prestador, logout } = useAuth()
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002'

  const [opcionesSit, setOpcionesSit] = useState([])
  const [query, setQuery]           = useState('')
  const [tabs, setTabs]             = useState(demoAfiliados)
  const [selectedTab, setSelectedTab] = useState(demoAfiliados[0])
  const [situaciones, setSituaciones] = useState(demoSituaciones)
  const [modal, setModal]           = useState(null) // null | 'nueva' | 'editar'
  const [form, setForm]             = useState(emptyForm)
  const [editingId, setEditingId]   = useState(null)
  const [editingAfiliado, setEditingAfiliado] = useState(demoAfiliados[0])
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/providers/situaciones/tipos`)
      .then(r => r.json())
      .then(d => setOpcionesSit(d))
      .catch(e => console.error(e))
  }, [API_URL])

  function cargarSituacionesAfiliado(afiliadoId) {
    fetch(`${API_URL}/providers/situaciones/afiliado/${afiliadoId}`)
      .then(r => r.json())
      .then(d => setSituaciones(prev => ({ ...prev, [afiliadoId]: d })))
      .catch(e => console.error(e))
  }

  function buscar(q) {
    const val = q.trim()
    if (!val) {
      setTabs(demoAfiliados)
      setSelectedTab(demoAfiliados[0])
      return
    }
    const lower = val.toLowerCase()
    const found = demoAfiliados.filter(afiliado =>
      afiliado.nombre.toLowerCase().includes(lower) ||
      afiliado.nro.toLowerCase().includes(lower)
    )
    setTabs(found)
    setSelectedTab(found[0] ?? null)
  }

  function handleQueryChange(e) {
    const v = e.target.value
    setQuery(v)
    buscar(v)
  }

  function clearSearch() {
    setQuery('')
    setTabs(demoAfiliados)
    setSelectedTab(demoAfiliados[0])
  }

  function openNueva() {
    const afiliado = selectedTab ?? tabs[0] ?? demoAfiliados[0]
    setForm(emptyForm)
    setEditingId(null)
    setEditingAfiliado(afiliado)
    setSelectedTab(afiliado)
    setModal('nueva')
  }

  function openEditar(sit, afiliado) {
    setForm({ tipo: sit.tipo, fechaInicio: sit.fechaInicio, fechaFin: sit.fechaFin, activa: sit.activa })
    setEditingId(sit.id)
    setEditingAfiliado(afiliado)
    setSelectedTab(afiliado)
    setModal('editar')
  }

  async function guardar() {
    if (!form.tipo || !editingAfiliado) return
    const idAfil = editingAfiliado.id
    try {
      if (modal === 'editar') {
        fetch(`${API_URL}/providers/situaciones/afiliado/${idAfil}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }).catch(e => console.error(e))
      } else {
        fetch(`${API_URL}/providers/situaciones/afiliado/${idAfil}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }).catch(e => console.error(e))
      }
      setSituaciones(prev => {
        const actuales = prev[idAfil] ?? []
        if (modal === 'editar') {
          return {
            ...prev,
            [idAfil]: actuales.map(sit => sit.id === editingId ? { ...sit, ...form } : sit),
          }
        }
        return {
          ...prev,
          [idAfil]: [{ ...form, id: Date.now() }, ...actuales],
        }
      })
      setModal(null)
    } catch (e) { console.error(e) }
  }

  async function darDeBaja(sitId, afiliadoId) {
    try {
      fetch(`${API_URL}/providers/situaciones/afiliado/${afiliadoId}/${sitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: false })
      }).catch(e => console.error(e))
      setSituaciones(prev => ({
        ...prev,
        [afiliadoId]: (prev[afiliadoId] ?? []).map(sit => sit.id === sitId ? { ...sit, activa: false } : sit),
      }))
    } catch (e) { console.error(e) }
  }

  async function eliminar(sitId, afiliadoId) {
    // Si tuvieramos DELETE, haríamos un DELETE, por ahora simulémoslo si no hay mock. 
    // Wait, mock service updateSituacion can't delete right now. So I will just hide it locally for demo.
    setSituaciones(prev => ({
      ...prev,
      [afiliadoId]: (prev[afiliadoId] ?? []).filter(s => s.id !== sitId),
    }))
  }

  function confirmarEliminar() {
    if (!deleteTarget) return
    eliminar(deleteTarget.id, deleteTarget.afiliado.id)
    setDeleteTarget(null)
  }

  const sitRows = tabs.flatMap(afiliado =>
    (situaciones[afiliado.id] ?? []).map(sit => ({ ...sit, afiliado }))
  )

  return (
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 flex gap-3 items-start sm:items-center justify-between sticky top-0 z-10">
        <div className="min-w-0 flex-1 sm:flex-none">
          <h1 className="text-lg font-700 text-slate-800">Situaciones terapéuticas</h1>
          <p className="text-xs text-slate-400">Bandeja de entrada</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 justify-end">
          <HeaderUser />
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Search bar inside card */}
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar afiliado por nombre o nro..."
                  value={query}
                  onChange={handleQueryChange}
                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700"
                />
                {query && (
                  <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="text-xs font-500 text-slate-400">
              Mostrando {sitRows.length} situaciones
            </div>
            <button
              onClick={openNueva}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva situación
            </button>
          </div>

          <div className="overflow-x-visible md:overflow-x-auto">
            <table className="w-full table-fixed md:table-auto">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-3">Afiliado</th>
                  <th className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-3">Situación</th>
                  <th className="hidden sm:table-cell text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-6 py-3">Fecha inicio</th>
                  <th className="hidden sm:table-cell text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-6 py-3">Fecha fin</th>
                  <th className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-3">Estado</th>
                  <th className="hidden sm:table-cell text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sitRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                      No hay situaciones terapéuticas que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  sitRows.map(sit => (
                    <tr key={`${sit.afiliado.id}-${sit.id}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <p className="text-sm font-600 text-slate-700">{sit.afiliado.nombre}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{sit.afiliado.nro}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-500 text-slate-700">
                        <span>{sit.tipo}</span>
                        <div className="sm:hidden mt-2 flex justify-center">
                          {sit.activa ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <button
                                onClick={() => openEditar(sit, sit.afiliado)}
                                className="w-20 text-center text-xs font-500 text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-400 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => darDeBaja(sit.id, sit.afiliado.id)}
                                className="w-20 text-center text-xs font-500 leading-tight text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                Dar de baja
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteTarget(sit)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500">{sit.fechaInicio}</td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500">{sit.fechaFin}</td>
                      <td className="px-4 sm:px-6 py-4">{estadoBadge(sit.activa)}</td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                        {sit.activa ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <button
                              onClick={() => openEditar(sit, sit.afiliado)}
                              className="text-xs font-500 text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-400 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => darDeBaja(sit.id, sit.afiliado.id)}
                              className="text-xs font-500 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Dar de baja
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteTarget(sit)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          title={modal === 'nueva' ? 'Nueva situación' : 'Editar situación'}
          form={form}
          onChange={setForm}
          onClose={() => setModal(null)}
          onSave={guardar}
          saveLabel={modal === 'nueva' ? 'Guardar' : 'Guardar cambios'}
          opciones={opcionesSit}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          item={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmarEliminar}
        />
      )}
    </main>
  )
}
