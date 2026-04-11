import { useOutletContext, useNavigate } from "react-router-dom";
import { type Persona } from "./Layout";
import { ArrowLeft } from "lucide-react";

export function Reintegros() {
  const navigate = useNavigate();
  // 🔹 El perfil activo pasa automáticamente desde el Navbar a esta página
  const { activeProfile } = useOutletContext<{ activeProfile: Persona }>(); 

  return (
    <div>
      
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
        Gestión de <span className="text-unahur font-black">Reintegros</span>
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Viendo el historial médico de: <strong className="text-gray-800">{activeProfile.nombre} {activeProfile.apellido}</strong>
      </p>

      {/* Acá irá la tabla de estados próximamente */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm">
        <p className="text-gray-400">Pronto armaremos la tabla aquí...</p>
      </div>
    </div>
  );
}