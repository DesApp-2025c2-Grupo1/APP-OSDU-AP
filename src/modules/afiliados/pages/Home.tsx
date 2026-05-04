import { Calendar, DollarSign, FileText, ClipboardList, Search, ArrowRight } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { type Persona } from "../components/Layout";

export function Home() {
  const navigate = useNavigate();
  const { activeProfile } = useOutletContext<{ activeProfile: Persona }>();

  const menuItems = [
    { title: "Solicitar Turnos", icon: <Calendar size={24} />, route: "/turnos", color: "bg-blue-50 text-blue-600", desc: "Reserva tu cita médica" },
    { title: "Gestionar Reintegros", icon: <DollarSign size={24} />, route: "/reintegros", color: "bg-green-50 text-green-600", desc: "Solicita devoluciones" },
    { title: "Autorizaciones", icon: <FileText size={24} />, route: "/autorizaciones", color: "bg-purple-50 text-purple-600", desc: "Estado de tus trámites" },
    { title: "Registrar Receta", icon: <ClipboardList size={24} />, route: "/recetas", color: "bg-orange-50 text-orange-600", desc: "Sube tus prescripciones" },
    { title: "Consultar Cartilla", icon: <Search size={24} />, route: "/cartilla", color: "bg-unahur/10 text-unahur", desc: "Busca profesionales" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-unahur/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="relative z-10 w-full md:w-auto text-center md:text-left">
          <h1 className="text-3xl font-black text-gray-900 leading-tight">
            Panel de <span className="text-unahur">Gestión</span>
          </h1>
          <p className="text-gray-400 mt-1 font-medium italic">
            Hola, <span className="text-gray-900 font-bold">{activeProfile.nombre}</span> 👋 ¿Qué trámite realizamos hoy?
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-2 h-2 bg-unahur rounded-full animate-pulse"></div>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sistema Operativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {menuItems.map((item) => (
          <button 
            key={item.title}
            onClick={() => navigate(item.route)}
            className="group flex flex-col items-start p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-unahur/20 transition-all duration-300 active:scale-[0.98] text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[64px] transition-colors group-hover:bg-unahur/5 -mr-4 -mt-4"></div>
            
            <div className={`${item.color} p-4 rounded-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}>
              {item.icon}
            </div>
            
            <h2 className="text-lg font-black text-gray-900 mb-2 relative z-10">
              {item.title}
            </h2>
            <p className="text-sm text-gray-400 font-medium mb-6 relative z-10">
              {item.desc}
            </p>
            
            <div className="flex items-center gap-2 text-unahur font-bold text-xs uppercase tracking-widest relative z-10">
              Comenzar
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
