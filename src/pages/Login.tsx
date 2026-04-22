import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim() || !password) return;

    setError(null);
    setCargando(true);

    const resultado = await login(dni, password);

    setCargando(false);

    if (resultado.ok) {
      navigate("/", { replace: true });
    } else {
      setError(resultado.mensaje ?? "Error al iniciar sesión.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* Card de login */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">

        {/* Header con branding */}
        <div className="bg-unahur px-8 pt-8 pb-10 text-center relative overflow-hidden">
          {/* Círculos decorativos */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />

          <div className="relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-unahur font-black text-2xl">U</span>
            </div>
            <h1 className="text-white font-black text-xl tracking-tight">Medicina Integral</h1>
            <p className="text-white/70 text-xs mt-1 tracking-wider uppercase">Portal del Afiliado</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-8 py-7 flex flex-col gap-5">

          <div>
            <h2 className="text-base font-bold text-gray-800">Iniciar sesión</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ingresá tu DNI y contraseña para continuar.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-xs font-semibold text-red-600">{error}</p>
            </div>
          )}

          {/* DNI */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              DNI
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={dni}
              onChange={(e) => { setDni(e.target.value.replace(/\D/g, "")); setError(null); }}
              placeholder="12345678"
              disabled={cargando}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-unahur/30 focus:border-unahur transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-300"
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="••••••••"
                disabled={cargando}
                className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-unahur/30 focus:border-unahur transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-300"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                tabIndex={-1}
              >
                {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={cargando || !dni.trim() || !password}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-unahur text-white font-bold text-sm
              shadow-md shadow-unahur/20 hover:bg-unahur-dark active:scale-[0.98] transition-all
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none mt-1"
          >
            {cargando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Ingresar
              </>
            )}
          </button>

          {/* Hint de credenciales demo 
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Credenciales de prueba</p>
            <p className="text-xs text-gray-500">
              DNI: <span className="font-bold text-gray-700">12345678</span>
              {"  "}·{"  "}
              Contraseña: <span className="font-bold text-gray-700">unahur2026</span>
            </p>
          </div>*/}

        </form>
      </div>

      <p className="text-[10px] text-gray-300 mt-6 tracking-wider uppercase">
        © {new Date().getFullYear()} UNAHUR · Medicina Integral
      </p>
    </div>
  );
}
