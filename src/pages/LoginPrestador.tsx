import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  const handleChangeCuit = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCuit(formatearCUIT(event.target.value));
    setError("");
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!cuit || !password) return;

    setLoading(true);
    setError("");

    try {
      const resultado = await loginPrestador(cuit, password);

      if (resultado.ok) {
        navigate("/prestadores", { replace: true });
        return;
      }

      setError(resultado.mensaje ?? "CUIT o contraseña incorrectos.");
    } catch {
      setError("No se pudo conectar con el servidor. Verificá tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-screen overflow-hidden bg-[#f7fbf8] text-slate-800">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-100/80 to-transparent" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/login/afiliado")}
          className="absolute right-4 top-4 rounded-xl border border-emerald-200 bg-white/90 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 sm:right-6 sm:top-6"
        >
          Ingresar como afiliado
        </button>

        <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="self-start">
            <img
              src="/logo.png"
              alt="OSDU - Obra Social de Universitarios"
              className="h-52 w-[19rem] rounded-2xl bg-white/95 object-contain p-2 shadow-xl shadow-emerald-950/20"
            />
              <p className="mt-3 w-[19rem] text-center text-sm font-semibold uppercase tracking-[0.28em] text-emerald-50">
                Portal prestadores
              </p>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-black leading-tight">
                Gestioná tu atención profesional en OSDU
              </h1>
              <p className="max-w-md text-sm leading-6 text-emerald-50">
                Acceso seguro a turnos, solicitudes, situaciones terapéuticas e historias clínicas.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-emerald-50">
              <span className="rounded-2xl bg-white/10 px-3 py-3 text-center">Turnos</span>
              <span className="rounded-2xl bg-white/10 px-3 py-3 text-center">Solicitudes</span>
              <span className="rounded-2xl bg-white/10 px-3 py-3 text-center">Historias</span>
            </div>
          </aside>

          <div className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
            <div className="w-full max-w-sm">
              <div className="mb-8 flex flex-col items-center text-center lg:hidden">
                <img src="/logo.png" alt="OSDU" className="h-44 w-auto object-contain" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Portal prestadores
                </p>
              </div>

              <div className="mb-8">
                <p className="text-sm font-bold text-emerald-700">OSDU Prestadores</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Iniciar sesión</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ingresá con el CUIT registrado para acceder a tu cuenta.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    CUIT del prestador
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="20-12345678-3"
                      value={cuit}
                      onChange={handleChangeCuit}
                      maxLength={13}
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Ingresá tu contraseña"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-700 outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((value) => !value)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPass ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !cuit || !password}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-slate-400">
                ¿No tenés cuenta?{" "}
                <span className="font-semibold text-emerald-700">Contactá a tu administrador</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
