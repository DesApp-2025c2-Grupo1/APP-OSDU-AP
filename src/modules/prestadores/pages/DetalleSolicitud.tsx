// @ts-nocheck
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useState } from 'react'
import HeaderUser from '../components/HeaderUser'

const facturas = [
  { nombre: 'Factura_consulta_1.pdf', kb: 175 },
  { nombre: 'Factura_consulta_2.pdf', kb: 192 },
  { nombre: 'Factura_consulta_3.pdf', kb: 158 },
]

function FacturasModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-0 sm:mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-5">
          <h2 className="text-base font-600 text-slate-800">Facturas adjuntas</h2>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Descargar todo
          </button>
        </div>

        {/* File list */}
        <div className="px-4 sm:px-6 pb-2 space-y-2">
          {facturas.map((f, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-500 text-slate-700">{f.nombre}</p>
                <p className="text-xs text-slate-400">{f.kb} KB</p>
              </div>
              <button className="flex items-center gap-1 text-sm font-500 text-teal-600 hover:text-teal-700 transition-colors">
                Descargar
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-500 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

const PASOS = [
  {
    key: 'Recibido',
    label: 'Recibido',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: 'En análisis',
    label: 'En análisis',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8" />
      </svg>
    ),
  },
  {
    key: 'Observado',
    label: 'Observado',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    key: 'Aprobada',
    label: 'Aprobado',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: 'Rechazada',
    label: 'Rechazado',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
]

const ORDEN = ['Recibido', 'En análisis', 'Observado', 'Aprobada', 'Rechazada']

const tipoColor = {
  'Reintegro':    'bg-pink-100 text-pink-700 border-pink-200',
  'Autorización': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Receta':       'bg-violet-100 text-violet-700 border-violet-200',
}

const estadoColor = {
  'Pendiente':   'bg-amber-100 text-amber-700 border-amber-200',
  'En análisis': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Observada':   'bg-violet-100 text-violet-700 border-violet-200',
  'Aprobada':    'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rechazada':   'bg-rose-100 text-rose-700 border-rose-200',
}

const descripciones = {
  'Reintegro':    'Solicitud de reintegro por gastos de consultas con especialista. Se adjuntan tres facturas detalladas.',
  'Autorización': 'Solicitud de autorización para práctica médica programada. Se adjunta orden médica y estudios previos.',
  'Receta':       'Solicitud de cobertura de medicación crónica. Se adjunta receta médica vigente y diagnóstico.',
}

function pasoActualIdx(estado) {
  const map = {
    'Pendiente':   0,
    'En análisis': 1,
    'Observada':   2,
    'Aprobada':    3,
    'Rechazada':   4,
  }
  return map[estado] ?? 0
}

function StepCircle({ paso, idx, actualIdx }) {
  const isAprobado  = paso.key === 'Aprobada'
  const isRechazado = paso.key === 'Rechazada'
  const isCurrent   = idx === actualIdx
  const isPast      = idx < actualIdx

  let circleClass = 'border-2 border-slate-200 bg-white text-slate-300'
  if (isCurrent) {
    if (isAprobado)  circleClass = 'bg-teal-500 text-white border-teal-500'
    else if (isRechazado) circleClass = 'bg-rose-400 text-white border-rose-400'
    else circleClass = 'bg-slate-800 text-white border-slate-800'
  } else if (isPast) {
    circleClass = 'bg-slate-700 text-white border-slate-700'
  }

  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${circleClass}`}>
      {paso.icon}
    </div>
  )
}

export default function DetalleSolicitud({ solicitud, onVolver, onCambiarEstado }: { solicitud: any; onVolver: () => void; onCambiarEstado: (id: string, estado: string) => void }) {
  const { usuario: prestador, logout } = useAuth()
  const navigate = useNavigate()
  const actualIdx = pasoActualIdx(solicitud.estado)
  const [showFacturas, setShowFacturas] = useState(false)

  return (
    <>
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 flex flex-wrap gap-3 items-start sm:items-center sm:justify-between sticky top-0 z-10">
        <div className="min-w-0 flex-1 sm:flex-none flex items-center gap-2 text-sm">
          <button onClick={onVolver} className="font-600 text-teal-600 hover:text-teal-700 transition-colors">
            Solicitudes
          </button>
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-500">Detalle de solicitud</span>
        </div>
        <div className="sm:hidden">
          <HeaderUser />
        </div>
        <div className="order-3 sm:order-none flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
          <div className="relative w-full sm:w-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Buscar afiliado o nro..." className="pl-9 pr-4 py-2 text-xs bg-slate-100 border-0 rounded-lg outline-none w-full sm:w-52" readOnly />
          </div>
          <div className="hidden sm:block">
            <HeaderUser />
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-8 py-6 space-y-6">

            {/* Afiliado + nro + badges */}
            <div>
              <h2 className="text-xl sm:text-2xl font-700 text-slate-800">{solicitud.afiliado}</h2>
              <p className="text-sm text-slate-400 mt-1">
                <span className="text-slate-600 font-500">Solicitud:</span>{'  '}{solicitud.nro}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-500 border ${tipoColor[solicitud.tipo]}`}>
                  {solicitud.tipo}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-500 border ${estadoColor[solicitud.estado]}`}>
                  {solicitud.estado}
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="relative flex items-start gap-0 pt-2 overflow-x-auto pb-2">
              {PASOS.map((paso, idx) => {
                const isLast    = idx === PASOS.length - 1
                const isCurrent = idx === actualIdx
                const isPast    = idx < actualIdx

                const labelColor = isCurrent
                  ? paso.key === 'Aprobada' ? 'text-teal-600 font-700'
                  : paso.key === 'Rechazada' ? 'text-rose-500 font-700'
                  : 'text-slate-800 font-700'
                  : isPast ? 'text-slate-500 font-500'
                  : 'text-slate-400 font-400'

                return (
                  <div key={paso.key} className="flex items-center flex-1 min-w-24">
                    <div className="flex flex-col items-center">
                      <StepCircle paso={paso} idx={idx} actualIdx={actualIdx} />
                      {isCurrent && (
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-800" />
                      )}
                      <span className={`mt-2 text-xs text-center whitespace-nowrap ${labelColor}`}>
                        {paso.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-px mx-2 mb-5 ${idx < actualIdx ? 'bg-slate-400' : 'bg-slate-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="border-t border-slate-100" />

            {/* Datos */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
              <div className="space-y-3 flex-1">
                <h3 className="text-base font-600 text-slate-800">Datos de la solicitud</h3>
                <div className="space-y-1.5 text-sm">
                  <p>
                    <span className="text-slate-500 font-500">Tipo de solicitud:</span>
                    {'  '}
                    <span className="text-slate-700">{solicitud.tipo}</span>
                  </p>
                  <p>
                    <span className="text-slate-500 font-500">Fecha de registro:</span>
                    {'  '}
                    <span className="text-slate-700">{solicitud.fecha}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-600 text-slate-700 mb-1">Descripción:</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {descripciones[solicitud.tipo]}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Foto 3 ecos acto del 20/95</p>
                </div>
              </div>
              <button
                onClick={() => setShowFacturas(true)}
                className="text-sm font-500 text-teal-600 hover:text-teal-700 hover:underline transition-colors flex-shrink-0 lg:ml-8 mt-0.5 text-left"
              >
                Ver facturas adjuntas
              </button>
            </div>

            <div className="border-t border-slate-100" />

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onCambiarEstado(solicitud.id, 'En análisis')}
                className="px-5 py-2.5 text-sm font-500 text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Pasar a análisis
              </button>
              <button
                onClick={() => onCambiarEstado(solicitud.id, 'Observada')}
                className="px-5 py-2.5 text-sm font-500 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
              >
                Observar
              </button>
              <button
                onClick={() => onCambiarEstado(solicitud.id, 'Aprobada')}
                className="px-5 py-2.5 text-sm font-600 text-white bg-teal-600 border border-teal-600 rounded-xl hover:bg-teal-700 transition-colors"
              >
                Aprobar
              </button>
              <button
                onClick={() => onCambiarEstado(solicitud.id, 'Rechazada')}
                className="px-5 py-2.5 text-sm font-500 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors"
              >
                Rechazar
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>

    {showFacturas && <FacturasModal onClose={() => setShowFacturas(false)} />}
  </>
  )
}
