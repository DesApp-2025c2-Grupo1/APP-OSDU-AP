import { useState, useEffect, useRef } from "react";
import { Save, Loader2, Paperclip, X } from "lucide-react";
import { type Persona } from "./Layout";
import { autorizacionesApi, type AutorizacionAPI } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9002";

const TIPOS_AUTORIZACION = [
  "PMC",
  "Cirugía",
  "Consulta",
  "Diagnóstico por imágenes",
  "Endoscopia",
  "Laboratorio",
  "Maternidad",
  "Vacuna",
  "Tomografía",
  "Otros Estudios",
];

interface Prestador {
  id: number;
  nombreCompleto: string;
  cuit: string;
  especialidades: string[];
  lugaresAtencion: { calle?: string; localidad?: string; provincia?: string }[];
}

interface ModalCargaAutorizacionProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  onCreated: (autorizacion: AutorizacionAPI) => void;
}

export function ModalCargaAutorizacion({ isOpen, onClose, activeProfile, onCreated }: ModalCargaAutorizacionProps) {
  // Sección 1 — Paciente
  const [fechaPrevista, setFechaPrevista] = useState(() => new Date().toISOString().split("T")[0]);

  // Sección 2 — Tipo de autorización
  const [tipoAutorizacion, setTipoAutorizacion] = useState("");

  // Sección 3 — Prestador
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [especialidad, setEspecialidad] = useState("");
  const [medicoInput, setMedicoInput] = useState("");
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState<Prestador | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lugarAtencion, setLugarAtencion] = useState("");
  const [diasInternacion, setDiasInternacion] = useState(0);
  const medicoRef = useRef<HTMLDivElement>(null);

  // Sección 4 — Documentación
  const [ordenFile, setOrdenFile] = useState<File | null>(null);
  const [observaciones, setObservaciones] = useState("");

  // Estado general
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar cartilla al abrir y resetear form
  useEffect(() => {
    if (!isOpen) return;
    setFechaPrevista(new Date().toISOString().split("T")[0]);
    setTipoAutorizacion("");
    setEspecialidad("");
    setMedicoInput("");
    setPrestadorSeleccionado(null);
    setLugarAtencion("");
    setDiasInternacion(0);
    setOrdenFile(null);
    setObservaciones("");
    setError(null);

    fetch(`${API_URL}/prestadores/cartilla`)
      .then((r) => r.json())
      .then((data) => setPrestadores(Array.isArray(data) ? data : []))
      .catch(() => setPrestadores([]));
  }, [isOpen]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (medicoRef.current && !medicoRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const especialidades = Array.from(new Set(prestadores.flatMap((p) => p.especialidades))).sort();

  const prestadoresFiltrados = prestadores.filter(
    (p) =>
      (!especialidad || p.especialidades.includes(especialidad)) &&
      (!medicoInput.trim() || p.nombreCompleto.toLowerCase().includes(medicoInput.toLowerCase()))
  );

  function seleccionarPrestador(p: Prestador) {
    setPrestadorSeleccionado(p);
    setMedicoInput(p.nombreCompleto);
    setShowSuggestions(false);
    if (p.lugaresAtencion.length > 0) {
      const l = p.lugaresAtencion[0];
      setLugarAtencion([l.calle, l.localidad, l.provincia].filter(Boolean).join(", "));
    }
  }

  function handleOrdenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setOrdenFile(file);
  }

  const handleSubmit = async () => {
    setError(null);
    if (!fechaPrevista) return setError("Ingresá la fecha prevista.");
    if (!tipoAutorizacion) return setError("Seleccioná el tipo de autorización.");
    if (!especialidad) return setError("Seleccioná una especialidad.");
    if (!medicoInput.trim() || !prestadorSeleccionado) return setError("Seleccioná un médico/prestador de la lista.");
    if (!lugarAtencion.trim()) return setError("El lugar de atención es requerido.");
    if (tipoAutorizacion === "Cirugía" && (!Number.isInteger(diasInternacion) || diasInternacion < 0)) {
      return setError("Ingresá los días de internación.");
    }

    setSaving(true);
    try {
      const created = await autorizacionesApi.submitAutorizacion({
        affiliateId: activeProfile.id,
        fechaPrevista,
        subtipo: tipoAutorizacion,
        especialidad,
        medico: prestadorSeleccionado.nombreCompleto,
        lugarPrestacion: lugarAtencion.trim(),
        diasInternacion: tipoAutorizacion === "Cirugía" ? diasInternacion : 0,
        observaciones: observaciones.trim() || undefined,
        orden: ordenFile ?? undefined,
      });
      onCreated(created);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar la autorización.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">Nueva Solicitud de Autorización</h3>
          <p className="text-xs text-gray-500">
            Solicitud para:{" "}
            <span className="font-bold text-unahur">
              {activeProfile.nombre} {activeProfile.apellido}
            </span>
          </p>
        </div>

        {/* Formulario */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* ── Sección 1: Paciente ── */}
          <div>
            <div className="border-b pb-1 mb-3">
              <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Paciente</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Integrante Beneficiario</label>
                <select
                  disabled
                  className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                >
                  <option>
                    {activeProfile.nombre} {activeProfile.apellido}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha Prevista</label>
                <input
                  value={fechaPrevista}
                  onChange={(e) => setFechaPrevista(e.target.value)}
                  type="date"
                  className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── Sección 2: Tipo de autorización ── */}
          <div>
            <div className="border-b pb-1 mb-3">
              <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Tipo de Autorización</span>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo</label>
              <select
                value={tipoAutorizacion}
                onChange={(e) => { setTipoAutorizacion(e.target.value); setDiasInternacion(0); }}
                className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white"
              >
                <option value="" disabled>Seleccioná el tipo...</option>
                {TIPOS_AUTORIZACION.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Sección 3: Prestador ── */}
          <div>
            <div className="border-b pb-1 mb-3">
              <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Prestador Solicitado</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Especialidad</label>
                <select
                  value={especialidad}
                  onChange={(e) => {
                    setEspecialidad(e.target.value);
                    setMedicoInput("");
                    setPrestadorSeleccionado(null);
                    setLugarAtencion("");
                  }}
                  className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white"
                >
                  <option value="" disabled>Seleccionar...</option>
                  {especialidades.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>

              {/* Días de internación — solo para Cirugía */}
              {tipoAutorizacion === "Cirugía" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-bold text-unahur uppercase mb-1">Días de Internación</label>
                  <input
                    value={diasInternacion}
                    onChange={(e) => setDiasInternacion(Number(e.target.value))}
                    type="number"
                    min={0}
                    className="w-full p-2 border border-unahur/30 bg-green-50/30 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
                  />
                </div>
              )}
            </div>

            {/* Médico autocomplete */}
            <div className="mb-3" ref={medicoRef}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Médico / Profesional</label>
              <div className="relative">
                <input
                  type="text"
                  value={medicoInput}
                  onChange={(e) => {
                    setMedicoInput(e.target.value);
                    setPrestadorSeleccionado(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={especialidad ? "Buscar profesional..." : "Primero seleccioná una especialidad"}
                  disabled={!especialidad}
                  className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                />
                {showSuggestions && prestadoresFiltrados.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                    {prestadoresFiltrados.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); seleccionarPrestador(p); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 transition-colors flex flex-col"
                      >
                        <span className="font-semibold text-gray-800">{p.nombreCompleto}</span>
                        {p.lugaresAtencion[0] && (
                          <span className="text-xs text-gray-400">
                            {[p.lugaresAtencion[0].calle, p.lugaresAtencion[0].localidad].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lugar */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lugar de Atención</label>
              <input
                type="text"
                value={lugarAtencion}
                onChange={(e) => setLugarAtencion(e.target.value)}
                placeholder="Se completa al seleccionar un profesional"
                className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
              />
            </div>
          </div>

          {/* ── Sección 4: Documentación ── */}
          <div>
            <div className="border-b pb-1 mb-3">
              <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Documentación</span>
            </div>

            {/* Adjunto orden médica */}
            <div className="mb-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Orden Médica <span className="normal-case font-normal">(opcional — PNG, JPG o PDF, máx. 5 MB)</span>
              </label>
              {!ordenFile ? (
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 hover:border-unahur/50 rounded-xl px-4 py-3 text-sm text-gray-400 hover:text-unahur transition-colors group">
                  <Paperclip size={16} className="group-hover:text-unahur" />
                  <span>Adjuntar orden...</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    onChange={handleOrdenChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-2 border border-unahur/30 bg-green-50/40 rounded-xl px-4 py-2.5">
                  <Paperclip size={14} className="text-unahur flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate flex-1">{ordenFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setOrdenFile(null)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Mensaje opcional */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Mensaje <span className="normal-case font-normal">(opcional)</span>
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[60px] resize-none"
                placeholder="Detalle relevante, prótesis requeridas, etc..."
              />
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-unahur text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Enviando...</>
            ) : (
              <><Save size={16} /> Confirmar Solicitud</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
