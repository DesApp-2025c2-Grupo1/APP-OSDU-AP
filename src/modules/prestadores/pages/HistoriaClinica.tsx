// @ts-nocheck
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useState } from 'react'
import HeaderUser from '../components/HeaderUser'

function normalizeSlashDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value).trim())
  if (!match) return value
  const [, first, second, yyyy] = match
  if (Number(first) > 12) return `${second.padStart(2, '0')}/${first.padStart(2, '0')}/${yyyy}`
  return `${first.padStart(2, '0')}/${second.padStart(2, '0')}/${yyyy}`
}

function NotaPopup({ entrada, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-3 sm:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-0 sm:mx-4 overflow-hidden">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0" />
              <span className="text-xs font-600 text-slate-500">{normalizeSlashDate(entrada.fecha)}</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0 ${entrada.color}`}>
              {entrada.iniciales}
            </div>
            <p className="text-sm font-600 text-slate-800">{entrada.doctor}</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{entrada.nota}</p>
        </div>
      </div>
    </div>
  )
}

export default function HistoriaClinica() {
  const { usuario: prestador, logout } = useAuth()
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002'

  const [query,        setQuery]        = useState('')
  const [resultado,    setResultado]    = useState(null)
  const [tabs,         setTabs]         = useState([])
  const [selectedTab,  setSelectedTab]  = useState(null)
  const [subTab,       setSubTab]       = useState('todas')
  const [popupEntrada, setPopupEntrada] = useState(null)
  const [historiaPorPaciente, setHistoriaPorPaciente] = useState({})

  async function buscar() {
    const q = query.trim()
    if (!q) return
    try {
      const res = await fetch(`${API_URL}/providers/afiliados/search?q=${q}`)
      const found = await res.json()
      setResultado(found.length > 0 ? found[0] : null)
    } catch (e) { console.error(e) }
  }

  async function cargarHistoria(id) {
    try {
      const res = await fetch(`${API_URL}/providers/historia-clinica/afiliado/${id}`)
      const data = await res.json()
      setHistoriaPorPaciente(prev => ({ ...prev, [id]: data }))
    } catch (e) { console.error(e) }
  }

  function verHistoria(afiliado) {
    if (!tabs.find(t => t.id === afiliado.id)) {
      setTabs(prev => [...prev, afiliado])
    }
    setSelectedTab(afiliado)
    setSubTab('todas')
    if (!historiaPorPaciente[afiliado.id]) {
      cargarHistoria(afiliado.id)
    }
  }

  const historia = selectedTab ? (historiaPorPaciente[selectedTab.id] ?? []) : []
  const histFiltrada = subTab === 'mis' ? historia.filter(h => h.mia) : historia

  return (
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 flex gap-3 items-start sm:items-center justify-between sticky top-0 z-10">
        <div className="min-w-0 flex-1 sm:flex-none">
          <h1 className="text-lg font-700 text-slate-800">Historia clínica</h1>
          <p className="text-xs text-slate-400">Consulta por afiliado</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 justify-end">
          <HeaderUser />
        </div>
      </header>

      <div className="p-4 sm:p-8 flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">

        {/* Left panel — search */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            {/* Search input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Buscar por nro. de afiliado..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscar()}
                className="min-w-0 flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 placeholder:text-slate-400"
              />
              <button
                onClick={buscar}
                className="flex flex-shrink-0 items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-3 sm:px-4 py-2.5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>

            {/* Search result preview */}
            {resultado && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0 ${resultado.color}`}>
                  {resultado.iniciales}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-slate-800 truncate">{resultado.nombre}</p>
                  <p className="text-xs text-slate-400">{resultado.tipo} · {resultado.edad} años</p>
                </div>
                <button
                  onClick={() => verHistoria(resultado)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  Buscar
                </button>
              </div>
            )}

            {/* Results table */}
            {tabs.length > 0 && (
              <div>
                <div className="grid grid-cols-3 text-xs font-600 text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <span>Afiliado</span>
                  <span>N°</span>
                  <span className="text-right">Acción</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {tabs.map(af => (
                    <div key={af.id} className="grid grid-cols-3 items-center py-3 gap-2">
                      <div>
                        <p className="text-xs font-600 text-slate-700 truncate">{af.nombre}</p>
                        <p className="text-xs text-slate-400 truncate">{af.nro}</p>
                      </div>
                      <span className="text-xs text-slate-500 truncate">{af.nro}</span>
                      <div className="flex justify-end">
                        <button
                          onClick={() => { setSelectedTab(af); setSubTab('todas') }}
                          className="text-xs font-500 text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-400 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!resultado && query && (
              <p className="text-xs text-slate-400 text-center py-2">Sin resultados para "{query}"</p>
            )}
          </div>
        </div>

        {/* Right panel — historia */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {!selectedTab ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <svg className="w-10 h-10 mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">Buscá un afiliado para ver su historia clínica</p>
            </div>
          ) : (
            <>
              {/* Patient tabs */}
              <div className="px-4 sm:px-6 pt-5 border-b border-slate-100 flex items-center gap-1 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setSelectedTab(tab); setSubTab('todas') }}
                    className={`flex-shrink-0 px-4 py-2.5 text-sm font-500 transition-colors border-b-2 -mb-px whitespace-nowrap
                      ${selectedTab.id === tab.id
                        ? 'border-teal-500 text-teal-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab.nombre}
                  </button>
                ))}
              </div>

              {/* Sub-tabs */}
              <div className="px-4 sm:px-6 py-4 flex items-center gap-2 border-b border-slate-100 overflow-x-auto">
                <button
                  onClick={() => setSubTab('todas')}
                  className={`px-4 py-1.5 text-xs font-600 rounded-full transition-colors
                    ${subTab === 'todas' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setSubTab('mis')}
                  className={`px-4 py-1.5 text-xs font-600 rounded-full transition-colors
                    ${subTab === 'mis' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                  Mis notas
                </button>
              </div>

              {/* Timeline */}
              <div className="px-4 sm:px-6 py-4 space-y-6">
                {histFiltrada.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-10">Sin entradas en esta categoría.</p>
                ) : (
                  histFiltrada.map((entrada, idx) => {
                    const showDate = idx === 0 || histFiltrada[idx - 1].fecha !== entrada.fecha
                    return (
                      <div key={entrada.id}>
                        {showDate && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                            <span className="text-xs font-600 text-slate-500">{normalizeSlashDate(entrada.fecha)}</span>
                          </div>
                        )}
                        <button
                          onClick={() => setPopupEntrada(entrada)}
                          className="w-full text-left group rounded-xl hover:bg-slate-50 p-3 -mx-3 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0 ${entrada.color}`}>
                              {entrada.iniciales}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-600 text-slate-800">{entrada.doctor}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{entrada.especialidad} · {entrada.modalidad}</p>
                              <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{entrada.nota}</p>
                            </div>
                          </div>
                        </button>
                        {idx < histFiltrada.length - 1 && (
                          <div className="ml-7 mt-4 border-t border-slate-100" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {popupEntrada && (
        <NotaPopup entrada={popupEntrada} onClose={() => setPopupEntrada(null)} />
      )}
    </main>
  )
}
