// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { api } from '../../../services/api'

function formatDate(value) {
  if (!value) return 'Sin registro'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin registro'
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function InfoItem({ label, value, icon, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-500 border-slate-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tones[tone] || tones.slate}`}>
          {icon}
        </span>
        <span className="min-w-0">
          <p className="text-[11px] font-800 uppercase text-slate-400">{label}</p>
          <p className="mt-1 break-words text-sm font-700 leading-snug text-slate-800">{value || 'Sin datos'}</p>
        </span>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-800 text-slate-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Icon({ children }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {children}
    </svg>
  )
}

function EstadoBadge({ estado }) {
  const normalized = estado || 'activo'
  const classes = {
    activo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    suspendido: 'bg-amber-50 text-amber-700 border-amber-200',
    baja: 'bg-rose-50 text-rose-700 border-rose-200',
  }[normalized] || 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-700 capitalize ${classes}`}>
      {normalized}
    </span>
  )
}

function PerfilModal({ prestador, onClose }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.getPrestadorProfile()
      .then(data => {
        if (!mounted) return
        setProfile(data)
        setError('')
      })
      .catch(() => {
        if (mounted) setError('No se pudo cargar la información del perfil.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const phones = profile?.telefonos?.filter(Boolean) || []
  const emails = profile?.mails?.filter(Boolean) || []
  const specialties = profile?.especialidades || []
  const places = profile?.lugaresAtencion || []

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-3 sm:p-6"
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-700 text-slate-800">Mi perfil</h2>
            <p className="text-sm text-slate-400 mt-0.5">Información registrada del prestador</p>
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

        <div className="max-h-[calc(92vh-5.5rem)] space-y-5 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
          {loading && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center text-sm font-600 text-slate-500">
              Cargando perfil...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-600 text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && profile && (
            <>
              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-lg font-900 text-teal-700">
                      {(profile.nombreCompleto || prestador?.nombre || 'P')
                        .split(' ')
                        .map(part => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-900 leading-tight text-slate-900">{profile.nombreCompleto || prestador?.nombre || 'Prestador'}</h3>
                      <p className="mt-1 text-sm font-600 text-slate-500">{profile.tipoPrestador === 'centro_medico' ? 'Centro médico' : 'Profesional'}</p>
                    </div>
                  </div>
                  <EstadoBadge estado={profile.estado} />
                </div>
                <div className="grid border-t border-slate-100 bg-slate-50/70 sm:grid-cols-3">
                  <div className="border-b border-slate-100 px-5 py-3 sm:border-b-0 sm:border-r">
                    <p className="text-[11px] font-800 uppercase text-slate-400">CUIT/CUIL</p>
                    <p className="mt-0.5 text-sm font-800 text-slate-800">{profile.cuitCuil || prestador?.cuit || 'Sin datos'}</p>
                  </div>
                  <div className="border-b border-slate-100 px-5 py-3 sm:border-b-0 sm:border-r">
                    <p className="text-[11px] font-800 uppercase text-slate-400">Email principal</p>
                    <p className="mt-0.5 truncate text-sm font-800 text-slate-800">{profile.emailPrincipal || profile.cuenta?.email || prestador?.email || 'Sin datos'}</p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-[11px] font-800 uppercase text-slate-400">Centro médico</p>
                    <p className="mt-0.5 truncate text-sm font-800 text-slate-800">{profile.centroMedico?.nombreCompleto || 'No asociado'}</p>
                  </div>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  label="Teléfono principal"
                  value={profile.telefonoPrincipal}
                  tone="teal"
                  icon={<Icon><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293a1.125 1.125 0 01-1.21.38 12.035 12.035 0 01-7.143-7.143 1.125 1.125 0 01.38-1.21l1.293-.97a1.125 1.125 0 00.417-1.173L6.963 3.102A1.125 1.125 0 005.872 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></Icon>}
                />
                <InfoItem
                  label="Alta"
                  value={formatDate(profile.createdAt)}
                  tone="emerald"
                  icon={<Icon><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 9h16.5M6.75 13.5l2.25 2.25 4.5-4.5M5.25 5.25h13.5A1.5 1.5 0 0120.25 6.75v11.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z" /></Icon>}
                />
                <InfoItem
                  label="Última modificación"
                  value={formatDate(profile.updatedAt)}
                  tone="amber"
                  icon={<Icon><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></Icon>}
                />
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <Section title="Contacto">
                  <div className="grid gap-3">
                    <InfoItem
                      label="Emails"
                      value={emails.length ? emails.join(', ') : profile.emailPrincipal}
                      tone="teal"
                      icon={<Icon><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" /></Icon>}
                    />
                    <InfoItem
                      label="Teléfonos"
                      value={phones.length ? phones.join(', ') : profile.telefonoPrincipal}
                      tone="teal"
                      icon={<Icon><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5h3A2.25 2.25 0 0115.75 3.75v16.5A2.25 2.25 0 0113.5 22.5h-3a2.25 2.25 0 01-2.25-2.25V3.75A2.25 2.25 0 0110.5 1.5zM12 18.75h.008v.008H12v-.008z" /></Icon>}
                    />
                  </div>
                </Section>

                <Section title="Estado de cuenta">
                  <div className="grid gap-3">
                    <InfoItem
                      label="Usuario"
                      value={profile.cuenta?.email || profile.emailPrincipal}
                      icon={<Icon><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975M15 9.75a3 3 0 11-6 0 3 3 0 016 0zM2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0z" /></Icon>}
                    />
                    <InfoItem
                      label="Cambio de contraseña"
                      value={profile.cuenta?.debeCambiarPassword ? 'Pendiente' : 'No requerido'}
                      tone={profile.cuenta?.debeCambiarPassword ? 'amber' : 'emerald'}
                      icon={<Icon><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5A2.25 2.25 0 0019.5 19.5v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75A2.25 2.25 0 006.75 21.75z" /></Icon>}
                    />
                    <InfoItem
                      label="Credenciales enviadas"
                      value={formatDate(profile.cuenta?.credencialesEnviadasAt)}
                      icon={<Icon><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>}
                    />
                  </div>
                </Section>
              </section>

              <Section title="Especialidades">
                <div className="flex flex-wrap gap-2">
                  {specialties.length > 0 ? specialties.map(specialty => (
                    <span key={specialty.id} className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-800 text-teal-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      {specialty.nombre}
                    </span>
                  )) : (
                    <p className="text-sm text-slate-500">Sin especialidades registradas.</p>
                  )}
                </div>
              </Section>

              <Section title="Lugares de atención">
                <div className="grid gap-3 md:grid-cols-2">
                  {places.length > 0 ? places.map(place => (
                    <div key={place.idLugar || `${place.calle}-${place.localidad}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-white text-teal-600">
                          <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6.75-5.03 6.75-11.25a6.75 6.75 0 10-13.5 0C5.25 15.97 12 21 12 21zM12 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /></Icon>
                        </span>
                        <div className="min-w-0">
                          <p className="break-words text-sm font-900 text-slate-800">{place.calle || 'Dirección sin informar'}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {[place.localidad, place.provincia, place.cp].filter(Boolean).join(', ') || 'Ubicación sin informar'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-500">Sin lugares de atención registrados.</p>
                  )}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
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

  async function savePassword() {
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
    try {
      await api.changePassword(passwords.nueva)
      setPasswords({ actual: '', nueva: '', confirmar: '' })
      setMessage('Contraseña actualizada correctamente.')
    } catch {
      setMessage('No se pudo actualizar la contraseña.')
    }
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
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(() => getStoredSettings(cuit))
  const ref = useRef(null)

  const displaySubtitle = cuit ? `CUIT ${cuit}` : 'Prestador'
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
          <p className="text-xs text-slate-400 leading-tight max-w-40 truncate">{displaySubtitle}</p>
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
          onClose={() => setProfileOpen(false)}
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
