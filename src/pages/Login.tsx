import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, Loader2, ChevronLeft, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError(null);
    setCargando(true);

    const resultado = await login(email, password);

    setCargando(false);

    if (resultado.ok) {
      navigate("/", { replace: true });
    } else {
      setError(resultado.mensaje ?? "Error al iniciar sesión.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <button 
          onClick={() => navigate("/welcome")}
          className="flex items-center gap-2 text-gray-400 hover:text-unahur font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Volver al Inicio
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-unahur px-8 pt-10 pb-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-12 -mb-12" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl transform -rotate-3 hover:rotate-3 transition-transform duration-300">
                <span className="text-unahur font-black text-3xl">U</span>
              </div>
              <h1 className="text-white font-black text-2xl tracking-tighter">Medicina Integral</h1>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Acceso al Portal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-10 py-10 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-black text-gray-900">Bienvenido de nuevo</h2>
              <p className="text-xs text-gray-400 mt-1 font-medium">Ingresá tus credenciales para continuar.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 animate-pulse">
                <p className="text-[11px] font-bold text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="juan@ejemplo.com"
                  disabled={cargando}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-unahur focus:border-transparent outline-none transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="••••••••"
                    disabled={cargando}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-unahur focus:border-transparent outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-unahur transition-colors p-1"
                  >
                    {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || !email.trim() || !password}
              className="w-full flex items-center justify-center gap-2 py-4 bg-unahur text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-unahur/30 hover:bg-unahur-dark active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {cargando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Ingresar
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-gray-300 bg-white px-2">¿No tienes cuenta?</div>
            </div>

            <Link 
              to="/register" 
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-unahur/30 hover:bg-unahur/5 transition-all active:scale-[0.98]"
            >
              <UserPlus size={18} />
              Solicitar Afiliación
            </Link>
          </form>
        </div>

        <p className="text-[10px] font-black text-gray-300 mt-10 text-center uppercase tracking-widest leading-relaxed">
          Unidad de Bienestar Estudiantil<br/>
          Universidad Nacional de Hurlingham
        </p>
      </div>
    </div>
  );
}
