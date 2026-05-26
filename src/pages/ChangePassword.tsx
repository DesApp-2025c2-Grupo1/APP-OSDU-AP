import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { ShieldAlert, Loader2, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";

const getPasswordChecks = (password: string) => [
  {
    label: "Mínimo 8 caracteres",
    valid: password.length >= 8,
  },
  {
    label: "Incluye una minúscula",
    valid: /[a-záéíóúüñ]/.test(password),
  },
  {
    label: "Incluye una mayúscula",
    valid: /[A-ZÁÉÍÓÚÜÑ]/.test(password),
  },
  {
    label: "Incluye al menos un número",
    valid: /\d/.test(password),
  },
  {
    label: "No contiene espacios",
    valid: password.length > 0 && !/\s/.test(password),
  },
];

export function ChangePassword() {
  const { logout, updateUsuario, usuario } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const passwordChecks = getPasswordChecks(newPassword);
  const isPasswordValid = passwordChecks.every((check) => check.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword.trim()) {
      setError("Ingresá tu contraseña actual.");
      return;
    }

    if (!isPasswordValid) {
      setError("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números, y no contener espacios.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setIsSuccess(true);

      updateUsuario({ debeCambiarPassword: false });

      setTimeout(() => {
        const dest = usuario?.tipo === "prestador" ? "/prestadores" : "/";
        navigate(dest);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña. Intenta de nuevo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-2xl shadow-unahur/10 text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">¡Contraseña Actualizada!</h2>
          <p className="text-gray-500 mb-8">Tu seguridad es nuestra prioridad. Redirigiendo al portal...</p>
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-unahur" size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-unahur/10 border border-gray-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lock size={120} />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-unahur/10 text-unahur rounded-2xl flex items-center justify-center mb-6">
              <ShieldAlert size={32} />
            </div>

            <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">
              Actualiza tu <span className="text-unahur">Seguridad</span>
            </h1>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Detectamos que es tu primer ingreso o se requiere un cambio de clave por seguridad. Por favor, elige una nueva contraseña.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 pr-12 text-gray-900 focus:ring-2 focus:ring-unahur/20 transition-all"
                    placeholder="Tu contraseña actual"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={showCurrentPassword ? "Ocultar contraseña actual" : "Mostrar contraseña actual"}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 pr-12 text-gray-900 focus:ring-2 focus:ring-unahur/20 transition-all"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 rounded-2xl bg-gray-50 p-3">
                  {passwordChecks.map((check) => (
                    <div
                      key={check.label}
                      className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                        check.valid ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                          check.valid ? "bg-emerald-100" : "bg-red-100"
                        }`}
                      >
                        {check.valid ? "✓" : "×"}
                      </span>
                      {check.label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirmar Contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 pr-12 text-gray-900 focus:ring-2 focus:ring-unahur/20 transition-all"
                    placeholder="Repite tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in shake duration-300">
                  <ShieldAlert size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-unahur text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest shadow-lg shadow-unahur/30 hover:bg-unahur-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Actualizar y Continuar"}
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors py-2"
              >
                Cancelar y Salir
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
