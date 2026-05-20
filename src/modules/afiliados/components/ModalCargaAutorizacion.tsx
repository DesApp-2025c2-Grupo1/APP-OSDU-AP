import { Save, Trash2 } from "lucide-react";
import { type Persona } from "./Layout";
import { type Autorizacion, ESPECIALIDADES } from "../../../data/mockData"; // Importamos la lista conocida

interface ModalCargaAutorizacionProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  autorizacionAEditar?: Autorizacion | null; 
  onDelete?: (id: string) => void; 
}

export function ModalCargaAutorizacion({ isOpen, onClose, activeProfile, autorizacionAEditar, onDelete }: ModalCargaAutorizacionProps) {
  
  if (!isOpen) return null;

  const isEdicion = !!autorizacionAEditar;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera dinámica */}
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {isEdicion ? "Modificar Autorización Recibida" : "Nueva Solicitud de Autorización"}
            </h3>
            <p className="text-xs text-gray-500">
              {isEdicion ? "Edite los datos y guarde los cambios." : "Complete los datos de la práctica a autorizar."}
            </p>
          </div>
          {isEdicion && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Modo Edición
            </span>
          )}
        </div>

        {/* Cuerpo Formulario */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
          
          <div className="md:col-span-2 border-b pb-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos del Paciente</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Integrante Beneficiario</label>
            <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-gray-50 text-gray-500 cursor-not-allowed" disabled>
              <option>{activeProfile.nombre} {activeProfile.apellido}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha Prevista</label>
            <input type="date" defaultValue={autorizacionAEditar?.fechaPrevista} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div className="md:col-span-2 border-b pb-2 mt-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Detalle de la Prestación</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Especialidad</label>
            <select defaultValue={autorizacionAEditar?.especialidad || ""} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white">
              <option value="" disabled>Seleccione especialidad...</option>
              {/* 🔹 Renderizamos dinámicamente la lista de especialidades conocida */}
              {ESPECIALIDADES.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Médico Solicitante</label>
            {/* 🔹 Preparado para ser un Select o un Autocomplete a futuro */}
            <input type="text" defaultValue={autorizacionAEditar?.medico} placeholder="Ej: Dr. García" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lugar de realización</label>
            <input type="text" defaultValue={autorizacionAEditar?.lugarPrestacion} placeholder="Ej: Sanatorio Central" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Días de internación</label>
            <input type="number" defaultValue={autorizacionAEditar?.diasInternacion ?? 0} min={0} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observaciones adicionales</label>
            <textarea defaultValue={autorizacionAEditar?.observaciones} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[80px]" placeholder="Prótesis requeridas, material quirúrgico, etc..."></textarea>
          </div>
        </div>

        {/* Pie de Modal Dinámico */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          {isEdicion && onDelete && (
            <button 
              onClick={() => { onDelete(autorizacionAEditar.id); onClose(); }} 
              className="flex items-center gap-1.5 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors mr-auto"
            >
              <Trash2 size={16} /> Eliminar Solicitud
            </button>
          )}

          <button onClick={onClose} className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all duration-200">
            Cancelar
          </button>
          
          <button 
            onClick={() => { alert(isEdicion ? "Simulación: Autorización Actualizada" : "Simulación: Autorización Creada"); onClose(); }} 
            className="px-6 py-2 bg-unahur text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2"
          >
            <Save size={16} /> {isEdicion ? "Guardar Cambios" : "Confirmar Solicitud"}
          </button>
        </div>

      </div>
    </div>
  );
}