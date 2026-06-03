import { useState, useEffect, useRef } from "react";
import { Save, Loader2, PenLine, Search } from "lucide-react";
import { type Persona } from "./Layout";
import { reintegrosApi } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9002";

interface Prestador {
  id: number;
  nombreCompleto: string;
  cuit: string;
  especialidades: string[];
  lugaresAtencion: { calle?: string; localidad?: string; provincia?: string }[];
}

interface ModalCargaReintegroProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  onReintegroExitoso: () => void;
}

function formatCuit(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

export function ModalCargaReintegro({ isOpen, onClose, activeProfile, onReintegroExitoso }: ModalCargaReintegroProps) {
  const [fechaPrestacion, setFechaPrestacion] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [medicoInput, setMedicoInput] = useState("");
  const [lugarAtencion, setLugarAtencion] = useState("");
  const [facturaCuit, setFacturaCuit] = useState("");
  const [facturaValorStr, setFacturaValorStr] = useState("");
  const [formaPago, setFormaPago] = useState("Efectivo");
  const [cbu, setCbu] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modo manual (prestador fuera de cartilla)
  const [modoManual, setModoManual] = useState(false);

  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const medicoRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setFechaPrestacion(""); setEspecialidad(""); setMedicoInput("");
    setLugarAtencion(""); setFacturaCuit(""); setFacturaValorStr("");
    setFormaPago("Efectivo"); setCbu(""); setObservaciones(""); setErrorMsg(null);
    setModoManual(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    fetch(`${API_URL}/prestadores/cartilla`)
      .then(r => r.json())
      .then(data => setPrestadores(Array.isArray(data) ? data : []))
      .catch(() => setPrestadores([]));
  }, [isOpen]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (medicoRef.current && !medicoRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const especialidadesCartilla = Array.from(new Set(prestadores.flatMap(p => p.especialidades))).sort();

  const prestadoresFiltrados = prestadores.filter(p =>
    (!especialidad || p.especialidades.includes(especialidad)) &&
    (!medicoInput.trim() || p.nombreCompleto.toLowerCase().includes(medicoInput.toLowerCase()))
  );

  function seleccionarPrestador(p: Prestador) {
    setMedicoInput(p.nombreCompleto);
    setShowSuggestions(false);
    if (p.cuit) setFacturaCuit(p.cuit);
    if (p.lugaresAtencion.length > 0) {
      const l = p.lugaresAtencion[0];
      setLugarAtencion([l.calle, l.localidad, l.provincia].filter(Boolean).join(", "));
    }
  }

  function toggleModoManual() {
    setModoManual(m => !m);
    setMedicoInput("");
    setLugarAtencion("");
    setFacturaCuit("");
    setEspecialidad("");
    setErrorMsg(null);
  }

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFacturaCuit(formatCuit(e.target.value));
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, "").replace(/[^0-9,]/g, "");
    const [intPart, ...decParts] = raw.split(",");
    const dec = decParts.join("").slice(0, 2);
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setFacturaValorStr(dec !== undefined && raw.includes(",") ? `${intFormatted},${dec}` : intFormatted);
  };

  const handleConfirmar = async () => {
    setErrorMsg(null);
    const facturaValor = parseFloat(facturaValorStr.replace(/\./g, "").replace(",", "."));

    if (!fechaPrestacion) return setErrorMsg("La fecha de prestación es requerida");
    if (!especialidad.trim()) return setErrorMsg("La especialidad es requerida");
    if (!medicoInput.trim()) return setErrorMsg("El médico / prestador es requerido");
    if (!lugarAtencion.trim()) return setErrorMsg("El lugar de atención es requerido");
    if (!facturaCuit.trim()) return setErrorMsg("El CUIT emisor es requerido");
    const cuitDigits = facturaCuit.replace(/\D/g, "");
    if (cuitDigits.length !== 11) return setErrorMsg("El CUIT debe tener 11 dígitos");
    if (!facturaValorStr || isNaN(facturaValor) || facturaValor <= 0) return setErrorMsg("El valor total debe ser mayor a 0");
    if (formaPago === "Transferencia" && cbu.replace(/\D/g, "").length < 22) return setErrorMsg("El CBU/CVU debe tener 22 dígitos");

    setConfirmando(true);
    try {
      await reintegrosApi.submitReintegro({
        affiliateId: activeProfile.id,
        fechaPrestacion,
        medico: medicoInput.trim(),
        especialidad: especialidad.trim(),
        lugarAtencion: lugarAtencion.trim(),
        facturaCuit: facturaCuit.trim(),
        facturaValor,
        formaPago,
        cbu: formaPago === "Transferencia" ? cbu.trim() : undefined,
        observaciones: observaciones.trim() || undefined,
      });
      onReintegroExitoso();
      onClose();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Error al enviar el reintegro");
    } finally {
      setConfirmando(false);
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
          <h3 className="font-bold text-gray-800 text-base">Nueva Solicitud de Reintegro</h3>
          <p className="text-xs text-gray-500">
            Solicitud para:{" "}
            <span className="font-bold text-unahur">{activeProfile.nombre} {activeProfile.apellido}</span>
          </p>
        </div>

        {/* Formulario */}
        <div className="p-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-3 py-2">
              {errorMsg}
            </div>
          )}

          {/* ── Sección Prestación ── */}
          <div className="border-b pb-1 mb-3">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos de la Prestación</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha de Prestación</label>
              <input
                type="date"
                value={fechaPrestacion}
                onChange={(e) => setFechaPrestacion(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Especialidad</label>
              {modoManual ? (
                <input
                  type="text"
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  placeholder="Ej: Farmacia, Kinesiología..."
                  className="w-full p-2 border border-amber-200 bg-amber-50/30 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                />
              ) : (
                <select
                  value={especialidad}
                  onChange={(e) => { setEspecialidad(e.target.value); setMedicoInput(""); setLugarAtencion(""); }}
                  className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white"
                >
                  <option value="" disabled>Seleccionar...</option>
                  {especialidadesCartilla.map(e => <option key={e}>{e}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Médico / Prestador */}
          {modoManual ? (
            /* ── Modo manual: campos de texto libre ── */
            <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-3 mb-3 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                  <PenLine size={11} /> Carga manual
                </span>
                <button
                  type="button"
                  onClick={toggleModoManual}
                  className="text-[10px] font-bold text-unahur hover:underline flex items-center gap-1"
                >
                  <Search size={11} /> Buscar en cartilla
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre del Médico / Prestador</label>
                <input
                  type="text"
                  value={medicoInput}
                  onChange={(e) => setMedicoInput(e.target.value)}
                  placeholder="Ej: Farmacity, Dr. García, Laboratorio Central..."
                  className="w-full p-2 border border-amber-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lugar de Atención</label>
                <input
                  type="text"
                  value={lugarAtencion}
                  onChange={(e) => setLugarAtencion(e.target.value)}
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  className="w-full p-2 border border-amber-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                />
              </div>
            </div>
          ) : (
            /* ── Modo cartilla: autocomplete ── */
            <>
              <div className="mb-1" ref={medicoRef}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Médico / Profesional</label>
                <div className="relative">
                  <input
                    type="text"
                    value={medicoInput}
                    onChange={(e) => { setMedicoInput(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={especialidad ? "Buscar profesional..." : "Primero seleccioná una especialidad"}
                    disabled={!especialidad}
                    className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  {showSuggestions && prestadoresFiltrados.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                      {prestadoresFiltrados.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); seleccionarPrestador(p); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 transition-colors flex flex-col"
                        >
                          <span className="font-semibold text-gray-800">{p.nombreCompleto}</span>
                          {p.lugaresAtencion[0] && (
                            <span className="text-xs text-gray-400">{[p.lugaresAtencion[0].calle, p.lugaresAtencion[0].localidad].filter(Boolean).join(", ")}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Toggle a modo manual */}
              <div className="mb-3 text-right">
                <button
                  type="button"
                  onClick={toggleModoManual}
                  className="text-[11px] text-gray-400 hover:text-amber-600 font-semibold transition-colors flex items-center gap-1 ml-auto"
                >
                  <PenLine size={11} />
                  ¿No está en la cartilla? Cargar manualmente
                </button>
              </div>

              {/* Lugar de atención */}
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lugar de Atención</label>
                <input
                  type="text"
                  value={lugarAtencion}
                  onChange={(e) => setLugarAtencion(e.target.value)}
                  placeholder="Se completa al seleccionar un profesional"
                  className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
                />
              </div>
            </>
          )}

          {/* ── Sección Facturación ── */}
          <div className="border-b pb-1 mb-3 mt-1">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos de Facturación</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CUIT Emisor</label>
              <input
                type="text"
                value={facturaCuit}
                onChange={handleCuitChange}
                placeholder="20-12345678-9"
                maxLength={13}
                className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Valor Total ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 font-bold">$</span>
                <input
                  type="text"
                  value={facturaValorStr}
                  onChange={handleMontoChange}
                  placeholder="0,00"
                  className="w-full p-2 pl-7 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── Sección Devolución ── */}
          <div className="border-b pb-1 mb-3">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Forma de Devolución</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Método de Pago</label>
              <select
                value={formaPago}
                onChange={(e) => { setFormaPago(e.target.value); setCbu(""); }}
                className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque</option>
                <option value="Transferencia">Transferencia Bancaria</option>
              </select>
            </div>

            {formaPago === "Transferencia" && (
              <div className="animate-in slide-in-from-left-2 duration-300">
                <label className="block text-[10px] font-bold text-unahur uppercase mb-1">CBU / CVU</label>
                <input
                  type="text"
                  value={cbu}
                  onChange={(e) => setCbu(e.target.value.replace(/\D/g, "").slice(0, 22))}
                  maxLength={22}
                  placeholder="22 dígitos"
                  className="w-full p-2 border border-unahur/30 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
              Observaciones <span className="normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[52px] resize-none"
              placeholder="Algún detalle relevante..."
            />
          </div>
        </div>

        {/* Pie */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={confirmando}
            className="px-6 py-2 bg-unahur text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {confirmando
              ? <><Loader2 size={16} className="animate-spin" /> Enviando...</>
              : <><Save size={16} /> Confirmar Solicitud</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
