import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { api, type AffiliateProfile } from "../../../services/api";

export interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  rol: "Titular" | "Conyuge" | "Hijo" | "Hermano" | "Otro";
}

interface HeaderUserProps {
  activeProfile: Persona;
  userLogueado: Persona;
  grupoFamiliar: Persona[];
  afiliadoTitular: AffiliateProfile | null;
  perfiles: AffiliateProfile[];
  loadingProfile: boolean;
  onSelectProfile: (profile: Persona) => void;
  onLogout: () => void;
  menuClassName?: string;
}

const formatDate = (value?: string | null) => {
  if (!value) return "Sin datos";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin datos";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getPasswordChecks = (password: string) => [
  {
    label: "Minimo 8 caracteres",
    valid: password.length >= 8,
  },
  {
    label: "Incluye una minuscula",
    valid: /[a-záéíóúüñ]/.test(password),
  },
  {
    label: "Incluye una mayuscula",
    valid: /[A-ZÁÉÍÓÚÜÑ]/.test(password),
  },
  {
    label: "Incluye al menos un numero",
    valid: /\d/.test(password),
  },
  {
    label: "No contiene espacios",
    valid: password.length > 0 && !/\s/.test(password),
  },
];

function PasswordChecklist({ password }: { password: string }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-3">
      {getPasswordChecks(password).map((check) => (
        <div
          key={check.label}
          className={`flex items-center gap-2 text-xs font-700 transition-colors ${
            check.valid ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
              check.valid ? "bg-emerald-100" : "bg-rose-100"
            }`}
          >
            {check.valid ? "✓" : "×"}
          </span>
          {check.label}
        </div>
      ))}
    </div>
  );
}

function PasswordInput({
  field,
  placeholder,
  value,
  visible,
  onChange,
  onToggleVisible,
}: {
  field: "actual" | "nueva" | "confirmar";
  placeholder: string;
  value: string;
  visible: boolean;
  onChange: (field: "actual" | "nueva" | "confirmar", value: string) => void;
  onToggleVisible: (field: "actual" | "nueva" | "confirmar") => void;
}) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-unahur/30 outline-none text-slate-700 placeholder:text-slate-300"
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
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-800 uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-700 leading-snug text-slate-800">{value || "Sin datos"}</p>
    </div>
  );
}

function PerfilModal({
  profile,
  familyCount,
  onClose,
  loading,
}: {
  profile: AffiliateProfile | null;
  familyCount: number;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-3 sm:p-6"
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto"
      >
        <div className="px-4 sm:px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-700 text-slate-800">Mi perfil</h2>
            <p className="text-sm text-slate-400 mt-0.5">Datos reales del afiliado registrados en el sistema</p>
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

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-12 text-center text-sm font-600 text-slate-500">
              Cargando perfil...
            </div>
          ) : !profile ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-12 text-center text-sm font-600 text-rose-600">
              No se pudo cargar la información del perfil.
            </div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-800 uppercase tracking-wide text-slate-400">Afiliado activo</p>
                    <h3 className="mt-1 text-2xl font-900 text-slate-900">
                      {profile.nombre} {profile.apellido}
                    </h3>
                    <p className="mt-1 text-sm font-600 text-slate-500">{profile.parentesco || "Titular"}</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-800 text-emerald-700">
                    {profile.estado || "Sin estado"}
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Documento" value={`${profile.tipoDocumento || "Doc."} ${profile.nroDocumento || profile.dni || ""}`.trim()} />
                <InfoItem label="Fecha de nacimiento" value={formatDate(profile.fechaNacimiento || profile.fecha_nacimiento)} />
                <InfoItem label="Credencial" value={profile.credencial} />
                <InfoItem label="Plan" value={profile.plan?.nombre} />
                <InfoItem label="Telefono" value={profile.telefono || profile.telefonos?.[0]?.telefono} />
                <InfoItem label="Email" value={profile.emailPrincipal || profile.email || profile.emails?.[0]?.email} />
                <InfoItem label="Direccion" value={profile.direccion} />
                <InfoItem label="Localidad" value={profile.localidad} />
                <InfoItem label="Provincia" value={profile.provincia} />
                <InfoItem label="Grupo familiar" value={familyCount} />
                <InfoItem label="Alta" value={formatDate(profile.fechaAlta || profile.fecha_alta)} />
                <InfoItem label="Alta programada" value={formatDate(profile.altaProgramada)} />
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfiguracionModal({
  afiliadoTitular,
  onClose,
}: {
  afiliadoTitular: AffiliateProfile | null;
  onClose: () => void;
}) {
  const { updateUsuario } = useAuth();
  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  function updatePassword(field: "actual" | "nueva" | "confirmar", value: string) {
    setMessage("");
    setMessageType("success");
    setPasswordErrors((prev) => ({ ...prev, [field]: "" }));
    setPasswords((prev) => ({ ...prev, [field]: value }));
  }

  function togglePasswordVisibility(field: "actual" | "nueva" | "confirmar") {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function validateNewPassword(value: string) {
    if (!getPasswordChecks(value).every((check) => check.valid)) {
      return "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números, y no contener espacios.";
    }
    return "";
  }

  async function savePassword() {
    const nextErrors: Record<string, string> = {};

    if (!passwords.actual.trim()) nextErrors.actual = "Primero ingresá tu contraseña actual.";
    if (!passwords.nueva) {
      nextErrors.nueva = "Ingresá una nueva contraseña.";
    } else {
      const passwordError = validateNewPassword(passwords.nueva);
      if (passwordError) nextErrors.nueva = passwordError;
    }
    if (!passwords.confirmar) {
      nextErrors.confirmar = "Confirmá la nueva contraseña.";
    } else if (passwords.nueva && passwords.nueva !== passwords.confirmar) {
      nextErrors.confirmar = "La nueva contraseña no coincide con la confirmación.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors);
      setMessageType("error");
      setMessage("Revisá los campos de contraseña.");
      return;
    }

    setPasswordErrors({});

    try {
      await api.changePassword(passwords.actual, passwords.nueva);
      updateUsuario({ debeCambiarPassword: false });
      setPasswords({ actual: "", nueva: "", confirmar: "" });
      setMessageType("success");
      setMessage("Contraseña actualizada correctamente.");
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar la contraseña.");
    }
  }

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-3 sm:p-6"
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto"
      >
        <div className="px-4 sm:px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-700 text-slate-800">Configuración</h2>
            <p className="text-sm text-slate-400 mt-0.5">Administrá tu cuenta del portal y la seguridad de acceso</p>
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
                <PasswordChecklist password={passwords.nueva} />
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
                className="px-8 py-2.5 text-sm font-700 text-white bg-unahur rounded-xl hover:bg-unahur-dark transition-colors shadow-sm"
              >
                Actualizar contraseña
              </button>
            </div>
          </section>

          <section className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-700 text-slate-800">Cuenta</h3>
            <p className="text-xs text-slate-400 mt-1">Datos vinculados a tu acceso en el portal</p>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <InfoItem label="Nombre" value={afiliadoTitular ? `${afiliadoTitular.nombre} ${afiliadoTitular.apellido}` : "Sin datos"} />
              <InfoItem label="Email principal" value={afiliadoTitular?.emailPrincipal || afiliadoTitular?.email} />
              <InfoItem label="Credencial" value={afiliadoTitular?.credencial} />
              <InfoItem label="Plan" value={afiliadoTitular?.plan?.nombre} />
              <InfoItem label="Estado" value={afiliadoTitular?.estado} />
            </div>
          </section>
        </div>

        {message && (
          <div
            className={`mx-4 sm:mx-6 mb-6 px-4 py-3 rounded-xl border text-sm font-500 ${
              messageType === "error"
                ? "border-rose-100 bg-rose-50 text-rose-700"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeaderUser({
  activeProfile,
  userLogueado,
  grupoFamiliar,
  afiliadoTitular,
  perfiles,
  loadingProfile,
  onSelectProfile,
  onLogout,
  menuClassName = "",
}: HeaderUserProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const perfilesPorId = useMemo(
    () => new Map(perfiles.map((perfil) => [String(perfil.id), perfil])),
    [perfiles]
  );

  const activeAffiliateProfile = perfilesPorId.get(activeProfile.id) ?? null;
  const displayName = activeProfile.nombre || "Afiliado";
  const displaySubtitle = activeAffiliateProfile?.credencial
    ? `Credencial ${activeAffiliateProfile.credencial}`
    : activeProfile.rol;
  const initials = displayName
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-unahur/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-700 text-unahur">{initials || "A"}</span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-600 text-slate-700 leading-tight">{displayName}</p>
          <p className="text-xs text-slate-400 leading-tight max-w-40 truncate">{displaySubtitle}</p>
        </div>
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`fixed right-3 top-32 w-64 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden z-50 sm:absolute sm:right-0 sm:top-full sm:mt-2 ${menuClassName}`}>
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-sm font-600 text-slate-800">{displayName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{displaySubtitle}</p>
          </div>

          <div className="p-2 space-y-1 border-b border-slate-100">
            <p className="px-2 pt-1 text-[11px] font-800 uppercase tracking-wide text-slate-400">Cambiar integrante activo</p>
            <button
              onClick={() => {
                onSelectProfile(userLogueado);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                activeProfile.id === userLogueado.id
                  ? "bg-unahur text-white font-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {userLogueado.nombre} (Mi perfil)
            </button>
            {grupoFamiliar.map((familiar) => (
              <button
                key={familiar.id}
                onClick={() => {
                  onSelectProfile(familiar);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeProfile.id === familiar.id
                    ? "bg-unahur text-white font-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {familiar.nombre} ({familiar.rol})
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              setProfileOpen(true);
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
              setOpen(false);
              setSettingsOpen(true);
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
            onClick={onLogout}
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
          profile={activeAffiliateProfile}
          familyCount={perfiles.length}
          onClose={() => setProfileOpen(false)}
          loading={loadingProfile}
        />
      )}

      {settingsOpen && (
        <ConfiguracionModal
          afiliadoTitular={afiliadoTitular}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
