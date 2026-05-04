import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const USE_MOCK = import.meta.env.VITE_USER_MOCK === "true";

export function LoginPrestador() {
  const navigate = useNavigate();
  const { isAuthenticated, usuario, loginPrestador } = useAuth();

  const [cuit, setCuit] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && usuario?.tipo === "prestador") {
      navigate("/prestadores", { replace: true });
    }
  }, [isAuthenticated, usuario, navigate]);

  const formatearCUIT = (valor: string) => {
    const soloNum = valor.replace(/\D/g, "");
    if (soloNum.length <= 2) return soloNum;
    if (soloNum.length <= 10) return `${soloNum.slice(0, 2)}-${soloNum.slice(2)}`;
    return `${soloNum.slice(0, 2)}-${soloNum.slice(2, 10)}-${soloNum.slice(10, 11)}`;
  };

  const handleChangeCuit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCuit(formatearCUIT(e.target.value));
    setError("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cuit || !password) return;

    setLoading(true);
    setError("");

    try {
      if (USE_MOCK) {
        // Modo mock: simular login exitoso
        const resultado = await loginPrestador(cuit, password);
        if (!resultado.ok) {
          // En mock igual llamamos al context para que setee el usuario
        }
        navigate("/prestadores", { replace: true });
        return;
      }

      const resultado = await loginPrestador(cuit, password);

      if (resultado.ok) {
        navigate("/prestadores", { replace: true });
      } else {
        setError(resultado.mensaje ?? "CUIT o contraseña incorrectos.");
      }
    } catch {
      setError("No se pudo conectar con el servidor. Verificá tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen min-h-screen flex overflow-hidden">

      {/* Panel izquierdo — 45% */}
      <div className="hidden lg:flex w-[45%] flex-shrink-0 flex-col justify-between bg-gradient-to-b from-teal-50 to-slate-100 p-10 border-r border-slate-200">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MediUnahur" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-base font-bold text-slate-800 leading-tight">MediUnahur</p>
            <p className="text-xs text-slate-400 leading-tight">Prestadores</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800 leading-snug">
            Gestión integral para<br />prestadores de salud
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Solicitudes, turnos, situaciones terapéuticas<br />e historias clínicas en un solo lugar.
          </p>
        </div>

        <div />
      </div>

      {/* Panel derecho — 55% */}
      <div className="flex-1 flex items-center justify-center bg-white p-4 sm:p-8 relative">

        {/* Botón ingresar como afiliado — esquina superior derecha */}
        <button
          onClick={() => navigate("/login/afiliado")}
          className="absolute top-5 right-5 text-xs font-semibold text-teal-600 border border-teal-200 hover:bg-teal-50 px-4 py-2 rounded-xl transition-colors"
        >
          Ingresar como afiliado
        </button>

        <div className="w-full max-w-sm">

          {/* Logo solo en mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="MediUnahur" className="w-8 h-8 object-contain" />
            <p className="text-sm font-bold text-slate-800">MediUnahur</p>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-1">Iniciar sesión</h1>
          <p className="text-sm text-slate-400 mb-8">Ingresá para acceder a tu cuenta</p>

          {/* Badge de modo mock */}
          {USE_MOCK && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-600 font-medium">
              ⚙️ Modo prueba (sin backend)
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* CUIT */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                CUIT del prestador
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Ingresá tu CUIT (ej. 20-12345678-3)"
                  value={cuit}
                  onChange={handleChangeCuit}
                  maxLength={13}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder:text-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Ingresá tu contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full pl-10 pr-11 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder:text-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <button
                  type="button"
                  className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !cuit || !password}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-8">
            ¿No tenés cuenta?{" "}
            <button className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
              Contactá a tu administrador
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
