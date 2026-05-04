// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import Dropdown from './Dropdown'

const ESPECIALIDADES = [
  'Médico clínico',
  'Cardiología',
  'Dermatología',
  'Ginecología',
  'Kinesiología',
  'Nutrición',
  'Odontología',
  'Oftalmología',
  'Pediatría',
  'Psicología',
  'Traumatología',
]

function getStoredProfile(cuit) {
  try {
    return JSON.parse(localStorage.getItem(`prestador-profile:${cuit}`)) ?? null
  } catch {
    return null
  }
}

function PerfilModal({ prestador, initialProfile, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    nombre: initialProfile?.nombre ?? prestador?.nombre ?? 'Prestador',
    cuit: initialProfile?.cuit ?? prestador?.cuit ?? '',
    email: initialProfile?.email ?? prestador?.email ?? 'hgomez@medicinaunahur.com.ar',
    telefono: initialProfile?.telefono ?? prestador?.telefono ?? '11 4567 8900',
    especialidades: initialProfile?.especialidades ?? ['Médico clínico'],
  }))

  const availableEspecialidades = ESPECIALIDADES.filter(e => !form.especialidades.includes(e))
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(availableEspecialidades[0] ?? '')

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function addEspecialidad() {
    if (!selectedEspecialidad || form.especialidades.includes(selectedEspecialidad)) return

    const nextEspecialidades = [...form.especialidades, selectedEspecialidad]
    const nextAvailable = ESPECIALIDADES.filter(e => !nextEspecialidades.includes(e))

    setForm(prev => ({ ...prev, especialidades: nextEspecialidades }))
    setSelectedEspecialidad(nextAvailable[0] ?? '')
  }

  function removeEspecialidad(especialidad) {
    setForm(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter(e => e !== especialidad),
    }))
    if (!selectedEspecialidad) setSelectedEspecialidad(especialidad)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-3 sm:p-6"
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={e => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto"
      >
        <div className="px-4 sm:px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-700 text-slate-800">Mi perfil</h2>
            <p className="text-sm text-slate-400 mt-0.5">Información del prestador</p>
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

        <div className="px-4 sm:px-6 py-5 space-y-5">
          <h3 className="text-sm font-700 text-slate-800">Datos personales</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <label className="block">
              <span className="block text-xs font-600 text-slate-600 mb-1.5">Nombre completo</span>
              <input
                value={form.nombre}
                onChange={e => update('nombre', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-600 text-slate-600 mb-1.5">CUIT</span>
              <input
                value={form.cuit}
                disabled
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-400"
              />
            </label>

            <div>
              <span className="block text-xs font-600 text-slate-600 mb-1.5">Especialidad</span>
              <div className="flex gap-2">
                <Dropdown
                  value={selectedEspecialidad}
                  options={availableEspecialidades.length === 0 ? [{ value: '', label: 'Sin opciones' }] : availableEspecialidades}
                  onChange={setSelectedEspecialidad}
                  placeholder="Sin opciones"
                  className="min-w-0 flex-1"
                  disabled={availableEspecialidades.length === 0}
                  maxMenuHeight="max-h-56"
                />
                <button
                  type="button"
                  onClick={addEspecialidad}
                  disabled={!selectedEspecialidad}
                  className="px-3 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Agregar especialidad"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.especialidades.map(especialidad => (
                  <span key={especialidad} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-xs font-600 text-teal-700 border border-teal-100">
                    {especialidad}
                    <button
                      type="button"
                      onClick={() => removeEspecialidad(especialidad)}
                      className="text-teal-500 hover:text-teal-700"
                      aria-label={`Quitar ${especialidad}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <label className="block lg:col-span-2">
              <span className="block text-xs font-600 text-slate-600 mb-1.5">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-600 text-slate-600 mb-1.5">Teléfono</span>
              <input
                value={form.telefono}
                onChange={e => update('telefono', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700"
              />
            </label>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-8 py-2.5 text-sm font-700 text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}

function getStoredSettings(cuit) {
  try {
    return JSON.parse(localStorage.getItem(`prestador-settings:${cuit}`)) ?? null
  } catch {
    return null
  }
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-teal-600' : 'bg-slate-300'}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute left-0 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

function PasswordInput({ field, placeholder, value, visible, onChange, onToggleVisible }) {
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 placeholder:text-slate-300"
      />
      <button
        type="button"
        onClick={() => onToggleVisible(field)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        aria-label="Mostrar u ocultar contraseña"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    </div>
  )
}

function ConfiguracionModal({ initialSettings, onClose, onSave }) {
  const [passwords, setPasswords] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  })
  const [settings, setSettings] = useState(() => ({
    solicitudes: initialSettings?.solicitudes ?? true,
    email: initialSettings?.email ?? true,
  }))
  const [message, setMessage] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({})

  function updatePassword(field, value) {
    setMessage('')
    setPasswordErrors(prev => ({ ...prev, [field]: '' }))
    setPasswords(prev => ({ ...prev, [field]: value }))
  }

  function updateSetting(field, value) {
    setMessage('')
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  function validateNewPassword(value) {
    if (value.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres.'
    if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(value) || !/\d/.test(value)) return 'La nueva contraseña debe combinar letras y números.'
    return ''
  }

  function savePassword() {
    const nextErrors = {}

    if (!passwords.actual.trim()) nextErrors.actual = 'Primero ingresá tu contraseña actual.'
    if (!passwords.nueva) {
      nextErrors.nueva = 'Ingresá una nueva contraseña.'
    } else {
      const passwordError = validateNewPassword(passwords.nueva)
      if (passwordError) nextErrors.nueva = passwordError
    }
    if (!passwords.confirmar) {
      nextErrors.confirmar = 'Confirmá la nueva contraseña.'
    } else if (passwords.nueva && passwords.nueva !== passwords.confirmar) {
      nextErrors.confirmar = 'La nueva contraseña no coincide con la confirmación.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors)
      setMessage('Revisá los campos de contraseña.')
      return
    }

    setPasswordErrors({})

    if (!passwords.actual || !passwords.nueva || !passwords.confirmar) {
      setMessage('Completá los campos de contraseña.')
      return
    }
    const passwordError = validateNewPassword(passwords.nueva)
    if (passwordError) {
      setMessage(passwordError)
      return
    }
    if (passwords.nueva !== passwords.confirmar) {
      setMessage('La nueva contraseña no coincide con la confirmación.')
      return
    }
    setPasswords({ actual: '', nueva: '', confirmar: '' })
    setMessage('Contraseña actualizada localmente.')
  }

  function savePreferences() {
    onSave(settings)
    setMessage('Preferencias guardadas.')
  }

  function togglePasswordVisibility(field) {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-3 sm:p-6"
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto"
      >
        <div className="px-4 sm:px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-700 text-slate-800">Configuración</h2>
            <p className="text-sm text-slate-400 mt-0.5">Administrá tu cuenta y preferencias</p>
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

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-700 text-slate-800">Seguridad</h3>
            <p className="text-xs text-slate-400 mt-1">Cambiar contraseña</p>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="block text-xs font-600 text-slate-600 mb-1.5">Contraseña actual</span>
                <PasswordInput
                  field="actual"
                  placeholder="Ingresá tu contraseña actual"
                  value={passwords.actual}
                  visible={showPasswords.actual}
                  onChange={updatePassword}
                  onToggleVisible={togglePasswordVisibility}
                />
                {passwordErrors.actual && <span className="block text-xs text-rose-500 mt-1.5">{passwordErrors.actual}</span>}
              </label>
              <label className="block">
                <span className="block text-xs font-600 text-slate-600 mb-1.5">Nueva contraseña</span>
                <PasswordInput
                  field="nueva"
                  placeholder="Ingresá tu nueva contraseña"
                  value={passwords.nueva}
                  visible={showPasswords.nueva}
                  onChange={updatePassword}
                  onToggleVisible={togglePasswordVisibility}
                />
                <span className="block text-xs text-slate-400 mt-1.5">Mínimo 8 caracteres, con letras y números.</span>
                {passwordErrors.nueva && <span className="block text-xs text-rose-500 mt-1.5">{passwordErrors.nueva}</span>}
              </label>
              <label className="block">
                <span className="block text-xs font-600 text-slate-600 mb-1.5">Confirmar contraseña</span>
                <PasswordInput
                  field="confirmar"
                  placeholder="Confirmá tu nueva contraseña"
                  value={passwords.confirmar}
                  visible={showPasswords.confirmar}
                  onChange={updatePassword}
                  onToggleVisible={togglePasswordVisibility}
                />
                {passwordErrors.confirmar && <span className="block text-xs text-rose-500 mt-1.5">{passwordErrors.confirmar}</span>}
              </label>
            </div>

            <div className="mt-auto pt-8 flex justify-end">
              <button
                type="button"
                onClick={savePassword}
                className="px-8 py-2.5 text-sm font-700 text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
              >
                Actualizar contraseña
              </button>
            </div>
          </section>

          <section className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-700 text-slate-800">Preferencias de la cuenta</h3>
            <p className="text-xs text-slate-400 mt-1">Configurá tus preferencias</p>

            <div className="mt-6 divide-y divide-slate-100">
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0" />
                  </svg>
                  <div>
                    <p className="text-sm font-600 text-slate-700">Recibir notificaciones de solicitudes</p>
                    <p className="text-xs text-slate-400 mt-0.5">Te avisaremos sobre nuevas solicitudes y cambios de estado.</p>
                  </div>
                </div>
                <Toggle checked={settings.solicitudes} onChange={value => updateSetting('solicitudes', value)} />
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.9 5.3a2 2 0 002.2 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-600 text-slate-700">Notificaciones por email</p>
                    <p className="text-xs text-slate-400 mt-0.5">Envío de notificaciones al correo electrónico registrado.</p>
                  </div>
                </div>
                <Toggle checked={settings.email} onChange={value => updateSetting('email', value)} />
              </div>

            </div>

            <div className="mt-auto pt-8 flex justify-end">
              <button
                type="button"
                onClick={savePreferences}
                className="px-8 py-2.5 text-sm font-700 text-teal-700 bg-white border border-teal-300 rounded-xl hover:bg-teal-50 transition-colors"
              >
                Guardar preferencias
              </button>
            </div>
          </section>
        </div>

        {message && (
          <div className="mx-4 sm:mx-6 mb-6 px-4 py-3 rounded-xl border border-teal-100 bg-teal-50 text-sm font-500 text-teal-700">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HeaderUser({ menuClassName = '' }: { menuClassName?: string }) {
  const { usuario: prestador, logout } = useAuth()
  const navigate = useNavigate()
  const nombre = prestador?.nombre ?? 'Prestador'
  const cuit = prestador?.cuit ?? ''
  const [profile, setProfile] = useState(() => getStoredProfile(cuit))
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(() => getStoredSettings(cuit))
  const ref = useRef(null)

  const displayEspecialidad = profile?.especialidades?.join(', ') ?? 'Médico clínico'
  const iniciales = nombre
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function saveProfile(nextProfile) {
    localStorage.setItem(`prestador-profile:${cuit}`, JSON.stringify(nextProfile))
    setProfile(nextProfile)
    setProfileOpen(false)
  }

  function saveSettings(nextSettings) {
    localStorage.setItem(`prestador-settings:${cuit}`, JSON.stringify(nextSettings))
    setSettings(nextSettings)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-600 text-teal-700">{iniciales}</span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-600 text-slate-700 leading-tight">{nombre}</p>
          <p className="text-xs text-slate-400 leading-tight max-w-40 truncate">{displayEspecialidad}</p>
        </div>
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`fixed right-3 top-32 w-56 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden z-50 sm:absolute sm:right-0 sm:top-full sm:mt-2 ${menuClassName}`}>
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-sm font-600 text-slate-800">{nombre}</p>
            <p className="text-xs text-slate-400 mt-0.5">CUIT {cuit}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false)
              setProfileOpen(true)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi perfil
          </button>
          <button
            onClick={() => {
              setOpen(false)
              setSettingsOpen(true)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración
          </button>
          <div className="border-t border-slate-100" />
          <button
            onClick={() => { logout(); navigate('/welcome', { replace: true }); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}

      {profileOpen && (
        <PerfilModal
          prestador={prestador}
          initialProfile={profile}
          onClose={() => setProfileOpen(false)}
          onSave={saveProfile}
        />
      )}

      {settingsOpen && (
        <ConfiguracionModal
          initialSettings={settings}
          onClose={() => setSettingsOpen(false)}
          onSave={saveSettings}
        />
      )}
    </div>
  )
}
