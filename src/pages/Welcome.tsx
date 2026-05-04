import { useNavigate } from "react-router-dom";
import { UserPlus, LogIn, ShieldCheck, HeartPulse, ClipboardCheck } from "lucide-react";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-50 flex-grow flex items-center">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-unahur/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-unahur/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-unahur/10 text-unahur text-xs font-bold uppercase tracking-wider mb-6">
                <ShieldCheck size={14} className="mr-2" />
                Portal Oficial de Afiliados
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
                Tu salud, nuestra <span className="text-unahur">prioridad</span> más alta.
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
                Gestiona tus turnos, recetas, reintegros y más desde la comodidad de tu hogar.
                Bienvenidos al nuevo sistema de gestión integral de la UNAHUR.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-unahur text-white rounded-2xl font-bold text-lg shadow-lg shadow-unahur/30 hover:bg-unahur-dark transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  <LogIn size={20} />
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-unahur/20 hover:bg-gray-50 transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  <UserPlus size={20} />
                  Quiero Afiliarme
                </button>
              </div>
            </div>

            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transform translate-y-8">
                  <div className="bg-blue-50 text-blue-500 p-3 rounded-2xl inline-block mb-4">
                    <HeartPulse size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900">Atención 24/7</h3>
                  <p className="text-sm text-gray-500">Estamos siempre para cuidarte.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transform translate-y-8">
                  <div className="bg-unahur/10 text-unahur p-3 rounded-2xl inline-block mb-4">
                    <ClipboardCheck size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900">Gestión Digital</h3>
                  <p className="text-sm text-gray-500">Trámites rápidos y sencillos.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="bg-orange-50 text-orange-500 p-3 rounded-2xl inline-block mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900">Seguridad</h3>
                  <p className="text-sm text-gray-500">Tus datos están protegidos.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <img
                    src="https://www.unahur.edu.ar/wp-content/uploads/2021/04/Iso-Unahur-01.png"
                    alt="Logo UNAHUR"
                    className="w-12 h-12 grayscale opacity-50 mb-4"
                  />
                  <h3 className="font-bold text-gray-900">Red UNAHUR</h3>
                  <p className="text-sm text-gray-500">Formamos parte de tu comunidad.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
          © 2026 Universidad Nacional de Hurlingham - Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
