import { Clock, AlertCircle, XCircle, CheckCircle, ChevronRight } from "lucide-react";


export type FiltroEstado = "PENDIENTE" | "OBSERVADA" | "RECHAZADA" | "APROBADA";

interface DashboardFiltrosProps {
  filtroActual: FiltroEstado;
  setFiltro: (filtro: FiltroEstado) => void;
}

export function DashboardFiltros({ filtroActual, setFiltro }: DashboardFiltrosProps) {
  const opcionesFiltro = [
    { id: "PENDIENTE" as FiltroEstado, label: "Pendientes", icon: <Clock size={20} />, color: "border-blue-500 text-blue-600 bg-blue-50" },
    { id: "OBSERVADA" as FiltroEstado, label: "Observadas", icon: <AlertCircle size={20} />, color: "border-amber-500 text-amber-600 bg-amber-50" },
    { id: "RECHAZADA" as FiltroEstado, label: "Rechazadas", icon: <XCircle size={20} />, color: "border-red-500 text-red-600 bg-red-50" },
    { id: "APROBADA" as FiltroEstado, label: "Aprobadas", icon: <CheckCircle size={20} />, color: "border-unahur text-unahur bg-green-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {opcionesFiltro.map((opcion) => {
        const isActive = filtroActual === opcion.id;
        return (
          <button
            key={opcion.id}
            onClick={() => setFiltro(opcion.id)}
            className={`flex flex-col p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden cursor-pointer ${
              isActive ? `${opcion.color} shadow-md scale-[1.02]` : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
            }`}
          >
            <div className="mb-2">{opcion.icon}</div>
            <span className="text-xs font-black uppercase tracking-wider">{opcion.label}</span>
            {isActive && <div className="absolute right-2 bottom-2 opacity-20"><ChevronRight size={20} /></div>}
          </button>
        );
      })}
    </div>
  );
}