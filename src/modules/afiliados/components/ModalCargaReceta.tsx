import { useRef, useState } from "react";
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
  const [motivoSolicitud, setMotivoSolicitud] = useState("");
  const [descripcionSintomas, setDescripcionSintomas] = useState("");
  const [medicamentoSolicitado, setMedicamentoSolicitado] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const motivoRef = useRef<HTMLInputElement>(null);
  const descripcionRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setMotivoSolicitud("");
    setDescripcionSintomas("");
    setMedicamentoSolicitado("");
    setObservaciones("");
    setError(null);
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    if (!motivoSolicitud.trim()) {
      setError("Ingresá el motivo de la solicitud.");
      motivoRef.current?.focus();
      return;
    }
    if (!descripcionSintomas.trim()) {
      setError("Describí los síntomas o la situación médica.");
      descripcionRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      const created = await recetasApi.submitReceta({
        affiliateId: activeProfile.id,
        motivoSolicitud: motivoSolicitud.trim(),
        descripcionSintomas: descripcionSintomas.trim(),
        medicamentoSolicitado: medicamentoSolicitado.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
      });
      onCreated(created);
      resetForm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar la solicitud de receta.");
    } finally {
      setSaving(false);
    }
  };

  const errorClass = "border-red-300 bg-red-50 focus:ring-red-100";
  const normalClass = "border-gray-200 focus:ring-unahur";
  const motivoEnError = Boolean(error && !motivoSolicitud.trim());
  const descripcionEnError = Boolean(error && motivoSolicitud.trim() && !descripcionSintomas.trim());

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">Nueva solicitud de receta médica</h3>
          <p className="text-xs text-gray-500">
            Indicá el motivo de la consulta. La evaluación, indicaciones y emisión corresponden al prestador.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="md:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <div className="md:col-span-2 border-b pb-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos del paciente</span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Integrante beneficiario</label>
            <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled>
              <option>{activeProfile.nombre} {activeProfile.apellido}</option>
            </select>
          </div>

          <div className="md:col-span-2 border-b pb-2 mt-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos de la solicitud</span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Motivo de la solicitud *</label>
            <input
              ref={motivoRef}
              value={motivoSolicitud}
              onChange={(e) => setMotivoSolicitud(e.target.value)}
              type="text"
              placeholder="Ej: renovación de tratamiento indicado por mi médico"
              className={`w-full p-2.5 border rounded-xl text-sm focus:ring-2 outline-none ${motivoEnError ? errorClass : normalClass}`}
              aria-invalid={motivoEnError}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descripción de síntomas o situación médica *</label>
            <textarea
              ref={descripcionRef}
              value={descripcionSintomas}
              onChange={(e) => setDescripcionSintomas(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:ring-2 outline-none min-h-[110px] ${descripcionEnError ? errorClass : normalClass}`}
              placeholder="Describí brevemente la situación para que el prestador pueda evaluar la solicitud."
              aria-invalid={descripcionEnError}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Medicamento solicitado como referencia</label>
            <input
              value={medicamentoSolicitado}
              onChange={(e) => setMedicamentoSolicitado(e.target.value)}
              type="text"
              placeholder="Opcional. Ej: medicamento indicado previamente"
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Este dato no define el tratamiento. El prestador evaluará si corresponde emitir una receta.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observaciones adicionales</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[80px]"
              placeholder="Información adicional opcional para el prestador."
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={handleClose} disabled={saving} className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all duration-200">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-unahur text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-60">
            <Save size={16} /> {saving ? "Enviando..." : "Solicitar receta"}
          </button>
        </div>
      </div>
    </div>
  );
}
