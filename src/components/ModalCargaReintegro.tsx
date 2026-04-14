import { useState, useEffect } from "react";
import { Save, Trash2 } from "lucide-react";
import { type Persona } from "./Layout";
import { type Reintegro } from "../data/mockData";

interface ModalCargaReintegroProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  reintegroAEditar?: Reintegro | null; // 🔹 Si viene con datos, es Edición
  onDelete?: (id: string) => void; // 🔹 Función para borrar si estamos editando
}

export function ModalCargaReintegro({ isOpen, onClose, activeProfile, reintegroAEditar, onDelete }: ModalCargaReintegroProps) {
  // Estados del formulario (se inicializan vacíos o con los datos a editar)
  const [nuevaFormaPago, setNuevaFormaPago] = useState("Efectivo");
  const [valorTotalStr, setValorTotalStr] = useState("");

  // Cuando se abre el modal, cargamos los datos si estamos en modo edición
  useEffect(() => {
    if (isOpen) {
      if (reintegroAEditar) {
        setNuevaFormaPago(reintegroAEditar.formaPago);
        // Formateamos el número a string para el input de texto (ej: "15000" -> "15.000,00")
        setValorTotalStr(reintegroAEditar.factura.valorTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 }));
      } else {
        setNuevaFormaPago("Efectivo");
        setValorTotalStr("");
      }
    }
  }, [isOpen, reintegroAEditar]);

  // Función para manejar el input de moneda (solo números, comas y puntos)
  const handleMonedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value;
    // Permite solo números, punto y coma. Elimina letras u otros caracteres.
    valor = valor.replace(/[^0-9.,]/g, '');
    setValorTotalStr(valor);
  };

  if (!isOpen) return null;

  const isEdicion = !!reintegroAEditar;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera dinámica */}
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {isEdicion ? "Modificar Reintegro Recibido" : "Nueva Solicitud de Reintegro"}
            </h3>
            <p className="text-xs text-gray-500">
              {isEdicion ? "Edite los datos y guarde los cambios." : "Complete los datos de la prestación y la factura."}
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
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos de la Prestación</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha de Prestación</label>
            <input type="date" defaultValue={reintegroAEditar?.fechaPrestacion} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Integrante Beneficiario</label>
            <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-gray-50 text-gray-500 cursor-not-allowed" disabled>
              {/* Deshabilitado para simplificar, siempre es el perfil activo en este prototipo */}
              <option>{activeProfile.nombre} {activeProfile.apellido}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Médico / Profesional</label>
            <input type="text" defaultValue={reintegroAEditar?.medico} placeholder="Ej: Dr. García" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Especialidad</label>
            <select defaultValue={reintegroAEditar?.especialidad || ""} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white">
              <option value="" disabled>Seleccione especialidad...</option>
              <option>Odontología</option>
              <option>Pediatría</option>
              <option>Clínica Médica</option>
              <option>Cardiología</option>
              <option>Traumatología</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lugar de Atención</label>
            <input type="text" defaultValue={reintegroAEditar?.lugarAtencion} placeholder="Ej: Clínica Central" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div className="md:col-span-2 border-b pb-2 mt-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos de Facturación</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CUIT Emisor</label>
            <input type="text" defaultValue={reintegroAEditar?.factura.cuit} placeholder="00-00000000-0" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Valor Total ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
              <input 
                type="text" 
                value={valorTotalStr}
                onChange={handleMonedaChange}
                placeholder="0,00" 
                className="w-full p-2.5 pl-8 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" 
              />
            </div>
          </div>

          <div className="md:col-span-2 border-b pb-2 mt-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Forma de Devolución</span>
          </div>

          <div className={nuevaFormaPago === "Transferencia" ? "md:col-span-1" : "md:col-span-2"}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Método de Pago</label>
            <select value={nuevaFormaPago} onChange={(e) => setNuevaFormaPago(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white">
              <option value="Efectivo">Efectivo</option>
              <option value="Cheque">Cheque</option>
              <option value="Transferencia">Transferencia Bancaria</option>
            </select>
          </div>
          
          {nuevaFormaPago === "Transferencia" && (
            <div className="animate-in slide-in-from-left-2 duration-300">
              <label className="block text-[10px] font-bold text-unahur uppercase mb-1">CBU / CVU</label>
              <input type="text" defaultValue={reintegroAEditar?.cbu} maxLength={22} placeholder="Ingrese los 22 dígitos" className="w-full p-2.5 border border-unahur/30 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observaciones adicionales</label>
            <textarea defaultValue={reintegroAEditar?.observaciones} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[80px]" placeholder="Algún detalle relevante..."></textarea>
          </div>
        </div>

        {/* Pie de Modal Dinámico */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          
          {/* Si es edición, mostramos el botón de borrar a la izquierda */}
          {isEdicion && onDelete && (
            <button 
              onClick={() => { onDelete(reintegroAEditar.id); onClose(); }} 
              className="flex items-center gap-1.5 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors mr-auto"
            >
              <Trash2 size={16} /> Eliminar Solicitud
            </button>
          )}

          <button onClick={onClose} className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all duration-200">
            Cancelar
          </button>
          
          <button 
            onClick={() => { alert(isEdicion ? "Simulación: Cambios guardados" : "Simulación: Reintegro Creado"); onClose(); }} 
            className="px-6 py-2 bg-unahur text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2"
          >
            <Save size={16} /> {isEdicion ? "Guardar Cambios" : "Confirmar Solicitud"}
          </button>
        </div>

      </div>
    </div>
  );
}