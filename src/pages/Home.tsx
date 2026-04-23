import { Calendar, DollarSign, FileText, ClipboardList, Search } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { type Persona } from "../components/Layout";

export function Home() {
  const navigate = useNavigate();
  const { activeProfile } = useOutletContext<{ activeProfile: Persona | null }>();

  if (!activeProfile) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Cargando perfil...
      </div>
    );
  }

  const menuItems = [
    { title: "Solicitar Turnos", icon: <Calendar size={24} />, route: "/turnos" },
    { title: "Gestionar Reintegros", icon: <DollarSign size={24} />, route: "/reintegros" },
    { title: "Autorizaciones", icon: <FileText size={24} />, route: "/autorizaciones" },
    { title: "Registrar Receta", icon: <ClipboardList size={24} />, route: "/recetas" },
    { title: "Consultar Cartilla", icon: <Search size={24} />, route: "/cartilla" },
  ];

  return (
    <>
      <div className="mb-10 text-center">
        <div className="inline-block">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Panel de <span className="text-unahur font-black">Gestión</span>
          </h1>
          <div className="h-[2px] bg-unahur/30 rounded-full mt-2 mb-2 w-full"></div>
          <p className="text-gray-500 text-sm">
            Gestionando cuenta de:{" "}
            <span className="text-unahur font-semibold">
              {activeProfile.nombre} {activeProfile.apellido}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.route)}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-unahur/30 transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="bg-unahur text-white p-3.5 rounded-xl mb-4 shadow-md shadow-unahur/20">
              {item.icon}
            </div>
            <h2 className="text-[11px] font-normal text-black text-center uppercase tracking-[0.15em]">
              {item.title}
            </h2>
          </button>
        ))}
      </div>
    </>
  );
}