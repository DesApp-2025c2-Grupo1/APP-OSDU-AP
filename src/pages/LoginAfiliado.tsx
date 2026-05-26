import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginAfiliado() {
  const navigate = useNavigate();
  const { login, isAuthenticated, usuario } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && usuario?.tipo === "afiliado") {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, usuario, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError(null);
    setCargando(true);

    const resultado = await login(email, password, "afiliado");

    setCargando(false);

    if (resultado.ok) {
      navigate("/", { replace: true });
    } else {
      setError(resultado.mensaje ?? "Email o contraseña incorrectos.");
    }
  };

  return (
    <div className="w-screen min-h-screen flex overflow-hidden">

      {/* Panel izquierdo — 45% */}
      <div className="hidden lg:flex w-[45%] flex-shrink-0 flex-col justify-between bg-gradient-to-b from-green-50 to-slate-100 p-10 border-r border-slate-200">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MediUnahur" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-base font-bold text-slate-800 leading-tight">OSDU</p>
            <p className="text-xs text-slate-400 leading-tight">Afiliados</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800 leading-snug">
            Tu salud,<br />nuestra prioridad.
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Gestioná tus turnos, recetas, reintegros<br />y más desde un solo lugar.
          </p>
        </div>

        <div />
      </div>

      {/* Panel derecho — 55% */}
      <div className="flex-1 flex items-center justify-center bg-white p-4 sm:p-8 relative">

        {/* Acciones esquina superior derecha */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <button
            onClick={() => navigate("/welcome")}
            className="text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Inicio
          </button>
          <button
            onClick={() => navigate("/login/prestador")}
            className="text-xs font-semibold text-unahur border border-green-200 hover:bg-green-50 px-4 py-2 rounded-xl transition-colors"
          >
            Ingresar como prestador
          </button>
        </div>

        <div className="w-full max-w-sm">

          {/* Logo solo en mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="MediUnahur" className="w-8 h-8 object-contain" />
            <p className="text-sm font-bold text-slate-800">MediUnahur</p>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-1">Iniciar sesión</h1>
          <p className="text-sm text-slate-400 mb-8">Ingresá para acceder a tu cuenta</p>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="juan@ejemplo.com"
                  disabled={cargando}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent outline-none text-slate-700 placeholder:text-slate-300 bg-white disabled:opacity-50"
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
                  type={mostrarPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="Ingresá tu contraseña"
                  disabled={cargando}
                  className="w-full pl-10 pr-11 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent outline-none text-slate-700 placeholder:text-slate-300 bg-white disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {mostrarPassword ? (
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
            </div>

            <button
              type="submit"
              disabled={cargando || !email.trim() || !password}
              className="w-full py-3 bg-unahur hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {cargando ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">¿No tenés cuenta?</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Solicitar Afiliación */}
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3 border-2 border-slate-200 hover:border-unahur/30 hover:bg-green-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Solicitar Afiliación
          </button>
        </div>
      </div>
    </div>
  );
}
