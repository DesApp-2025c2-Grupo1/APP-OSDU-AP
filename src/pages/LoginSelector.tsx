import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Stethoscope, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginSelector() {
  const navigate = useNavigate();
  const { isAuthenticated, usuario } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(usuario?.tipo === "prestador" ? "/prestadores" : "/", { replace: true });
    }
  }, [isAuthenticated, usuario, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
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
                <img src="/logo.png" alt="OSDU" className="h-12 w-12 object-contain" />
              </div>
              <h1 className="text-white font-black text-2xl tracking-tighter">Obra Social de Universitarios</h1>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Selecciona tu tipo de acceso</p>
            </div>
          </div>

          <div className="px-10 py-10 flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-black text-gray-900">¿Eres afiliado o prestador?</h2>
              <p className="text-xs text-gray-400 mt-1 font-medium">Elige tu tipo de usuario para continuar.</p>
            </div>

            {/* Botones de selección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Afiliado */}
              <button
                onClick={() => navigate("/login/afiliado")}
                className="group flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border-2 border-gray-200 bg-white hover:border-unahur hover:bg-unahur/5 transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-unahur/10 rounded-2xl flex items-center justify-center group-hover:bg-unahur/20 transition-colors">
                  <Users size={24} className="text-unahur" />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">Afiliado</h3>
                  <p className="text-[10px] text-gray-400 mt-1">Acceso a turnos y servicios</p>
                </div>
              </button>

              {/* Prestador */}
              <button
                onClick={() => navigate("/login/prestador")}
                className="group flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border-2 border-gray-200 bg-white hover:border-teal-600 hover:bg-teal-50 transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Stethoscope size={24} className="text-teal-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">Prestador</h3>
                  <p className="text-[10px] text-gray-400 mt-1">Gestión de solicitudes</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-[10px] font-black text-gray-300 mt-10 text-center uppercase tracking-widest leading-relaxed">
          Unidad de Bienestar Estudiantil<br />
          OSDU - Sistema de Gestión de Obra Social<br />
          © 2024 Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
