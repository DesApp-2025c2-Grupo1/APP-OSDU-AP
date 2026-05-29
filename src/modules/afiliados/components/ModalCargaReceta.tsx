import { useState } from "react";
import { Save } from "lucide-react";
import { type Persona } from "./Layout";
import { recetasApi, type RecetaAPI } from "../../../services/api";

interface ModalCargaRecetaProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  onCreated: (receta: RecetaAPI) => void;
}

export function ModalCargaReceta({ isOpen, onClose, activeProfile, onCreated }: ModalCargaRecetaProps) {
  const [medicamento, setMedicamento] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    if (!medicamento.trim()) return setError("Ingresá el nombre del medicamento.");
    if (!presentacion) return setError("Seleccioná la presentación.");
    if (!fecha) return setError("Ingresá la fecha de emisión.");
    if (!Number.isInteger(cantidad) || cantidad <= 0) return setError("La cantidad debe ser mayor a 0.");

    setSaving(true);
    try {
      const created = await recetasApi.submitReceta({
        medicamento: medicamento.trim(),
        presentacion,
        cantidad,
        fecha,
        observaciones: observaciones.trim() || undefined,
      });
      onCreated(created);
      onClose();
      setMedicamento("");
      setPresentacion("");
      setCantidad(1);
      setFecha(new Date().toISOString().split("T")[0]);
      setObservaciones("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar la receta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">Nueva Solicitud de Receta</h3>
          <p className="text-xs text-gray-500">Complete los datos del medicamento solicitado.</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="md:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <div className="md:col-span-2 border-b pb-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos del Paciente</span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Integrante Beneficiario</label>
            <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled>
              <option>{activeProfile.nombre} {activeProfile.apellido}</option>
            </select>
          </div>

          <div className="md:col-span-2 border-b pb-2 mt-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Detalle del Medicamento</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre del Medicamento</label>
            <input value={medicamento} onChange={(e) => setMedicamento(e.target.value)} type="text" placeholder="Ej: Amoxicilina 500mg" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Presentación</label>
            <select value={presentacion} onChange={(e) => setPresentacion(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white">
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
            <input value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} type="number" min={1} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha de Emisión</label>
            <input value={fecha} onChange={(e) => setFecha(e.target.value)} type="date" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observaciones adicionales</label>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[80px]" placeholder="Indicaciones, horarios, o aclaraciones..." />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all duration-200">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-unahur text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-60">
            <Save size={16} /> {saving ? "Enviando..." : "Confirmar Solicitud"}
          </button>
        </div>
      </div>
    </div>
  );
}
