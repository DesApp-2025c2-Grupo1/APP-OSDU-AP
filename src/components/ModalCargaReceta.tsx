import { Save, Trash2 } from "lucide-react";
import { type Persona } from "./Layout";
import { type Receta } from "../data/mockData";

interface ModalCargaRecetaProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  recetaAEditar?: Receta | null; 
  onDelete?: (id: string) => void; 
}

export function ModalCargaReceta({ isOpen, onClose, activeProfile, recetaAEditar, onDelete }: ModalCargaRecetaProps) {
  
  if (!isOpen) return null;

  const isEdicion = !!recetaAEditar;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera dinámica */}
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {isEdicion ? "Modificar Receta Recibida" : "Nueva Solicitud de Receta"}
            </h3>
            <p className="text-xs text-gray-500">
              {isEdicion ? "Edite los datos y guarde los cambios." : "Complete los datos del medicamento solicitado."}
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

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Integrante Beneficiario</label>
            <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-gray-50 text-gray-500 cursor-not-allowed" disabled>
              <option>{activeProfile.nombre} {activeProfile.apellido}</option>
            </select>
          </div>

          <div className="md:col-span-2 border-b pb-2 mt-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Detalle del Medicamento</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre del Medicamento</label>
            <input type="text" defaultValue={recetaAEditar?.medicamento} placeholder="Ej: Amoxicilina 500mg" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Presentación</label>
            <select defaultValue={recetaAEditar?.presentacion || ""} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white">
              <option value="" disabled>Seleccione presentación...</option>
              <option value="Blister">Blister</option>
              <option value="Cápsulas">Cápsulas</option>
              <option value="Pastillas">Pastillas</option>
              <option value="Inyectable">Inyectable</option>
              <option value="Gotas">Gotas</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cantidad solicitada</label>
            <input type="number" defaultValue={recetaAEditar?.cantidad} min={1} placeholder="Ej: 2" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha de Emisión</label>
            <input type="date" defaultValue={recetaAEditar?.fecha} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observaciones adicionales</label>
            <textarea defaultValue={recetaAEditar?.observaciones} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[80px]" placeholder="Indicaciones, horarios, o aclaraciones..."></textarea>
          </div>
        </div>

        {/* Pie de Modal Dinámico */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          {isEdicion && onDelete && (
            <button 
              onClick={() => { onDelete(recetaAEditar.id); onClose(); }} 
              className="flex items-center gap-1.5 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors mr-auto"
            >
              <Trash2 size={16} /> Eliminar Solicitud
            </button>
          )}

          <button onClick={onClose} className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all duration-200">
            Cancelar
          </button>
          
          <button 
            onClick={() => { alert(isEdicion ? "Simulación: Receta Actualizada" : "Simulación: Receta Creada"); onClose(); }} 
            className="px-6 py-2 bg-unahur text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2"
          >
            <Save size={16} /> {isEdicion ? "Guardar Cambios" : "Confirmar Solicitud"}
          </button>
        </div>

      </div>
    </div>
  );
}