import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { type Persona } from "./Layout";
import { autorizacionesApi, turnosApi, type AutorizacionAPI, type EspecialidadAPI } from "../../../services/api";

interface ModalCargaAutorizacionProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  onCreated: (autorizacion: AutorizacionAPI) => void;
}

export function ModalCargaAutorizacion({ isOpen, onClose, activeProfile, onCreated }: ModalCargaAutorizacionProps) {
  const [fechaPrevista, setFechaPrevista] = useState(() => new Date().toISOString().split("T")[0]);
  const [especialidad, setEspecialidad] = useState("");
  const [medico, setMedico] = useState("");
  const [lugarPrestacion, setLugarPrestacion] = useState("");
  const [diasInternacion, setDiasInternacion] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [especialidades, setEspecialidades] = useState<EspecialidadAPI[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    turnosApi.getEspecialidades()
      .then(setEspecialidades)
      .catch(() => setEspecialidades([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    if (!fechaPrevista) return setError("Ingresá la fecha prevista.");
    if (!especialidad) return setError("Seleccioná una especialidad.");
    if (!medico.trim()) return setError("Ingresá el médico solicitante.");
    if (!lugarPrestacion.trim()) return setError("Ingresá el lugar de realización.");
    if (!Number.isInteger(diasInternacion) || diasInternacion < 0) return setError("Los días de internación no son válidos.");

    setSaving(true);
    try {
      const created = await autorizacionesApi.submitAutorizacion({
        fechaPrevista,
        especialidad,
        medico: medico.trim(),
        lugarPrestacion: lugarPrestacion.trim(),
        diasInternacion,
        observaciones: observaciones.trim() || undefined,
      });
      onCreated(created);
      onClose();
      setFechaPrevista(new Date().toISOString().split("T")[0]);
      setEspecialidad("");
      setMedico("");
      setLugarPrestacion("");
      setDiasInternacion(0);
      setObservaciones("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar la autorización.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">Nueva Solicitud de Autorización</h3>
          <p className="text-xs text-gray-500">Complete los datos de la práctica a autorizar.</p>
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

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Integrante Beneficiario</label>
            <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled>
              <option>{activeProfile.nombre} {activeProfile.apellido}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha Prevista</label>
            <input value={fechaPrevista} onChange={(e) => setFechaPrevista(e.target.value)} type="date" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div className="md:col-span-2 border-b pb-2 mt-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Detalle de la Prestación</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Especialidad</label>
            <select value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white">
              <option value="" disabled>Seleccione especialidad...</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.nombre}>{esp.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Médico Solicitante</label>
            <input value={medico} onChange={(e) => setMedico(e.target.value)} type="text" placeholder="Ej: Dr. García" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lugar de realización</label>
            <input value={lugarPrestacion} onChange={(e) => setLugarPrestacion(e.target.value)} type="text" placeholder="Ej: Sanatorio Central" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Días de internación</label>
            <input value={diasInternacion} onChange={(e) => setDiasInternacion(Number(e.target.value))} type="number" min={0} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observaciones adicionales</label>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[80px]" placeholder="Prótesis requeridas, material quirúrgico, etc..." />
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
