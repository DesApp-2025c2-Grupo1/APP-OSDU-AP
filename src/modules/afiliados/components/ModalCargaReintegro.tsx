import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { type Persona } from "./Layout";
import { reintegrosApi } from "../../../services/api";

interface ModalCargaReintegroProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  onReintegroExitoso: () => void;
}

export function ModalCargaReintegro({ isOpen, onClose, activeProfile, onReintegroExitoso }: ModalCargaReintegroProps) {
  const [fechaPrestacion, setFechaPrestacion] = useState("");
  const [medico, setMedico] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [lugarAtencion, setLugarAtencion] = useState("");
  const [facturaCuit, setFacturaCuit] = useState("");
  const [facturaValorStr, setFacturaValorStr] = useState("");
  const [formaPago, setFormaPago] = useState("Efectivo");
  const [cbu, setCbu] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset al abrir
  useEffect(() => {
    if (!isOpen) return;
    setFechaPrestacion("");
    setMedico("");
    setEspecialidad("");
    setLugarAtencion("");
    setFacturaCuit("");
    setFacturaValorStr("");
    setFormaPago("Efectivo");
    setCbu("");
    setObservaciones("");
    setErrorMsg(null);
  }, [isOpen]);

  const handleMonedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFacturaValorStr(e.target.value.replace(/[^0-9.,]/g, ""));
  };

  const handleConfirmar = async () => {
    setErrorMsg(null);
    const facturaValor = parseFloat(facturaValorStr.replace(",", "."));

    if (!fechaPrestacion) return setErrorMsg("La fecha de prestación es requerida");
    if (!medico.trim()) return setErrorMsg("El médico es requerido");
    if (!especialidad) return setErrorMsg("La especialidad es requerida");
    if (!lugarAtencion.trim()) return setErrorMsg("El lugar de atención es requerido");
    if (!facturaCuit.trim()) return setErrorMsg("El CUIT emisor es requerido");
    if (!facturaValorStr || isNaN(facturaValor) || facturaValor <= 0) return setErrorMsg("El valor total debe ser mayor a 0");
    if (formaPago === "Transferencia" && cbu.replace(/\D/g, "").length < 22) return setErrorMsg("El CBU/CVU debe tener 22 dígitos");

    setConfirmando(true);
    try {
      await reintegrosApi.submitReintegro({
        fechaPrestacion,
        medico: medico.trim(),
        especialidad,
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">Nueva Solicitud de Reintegro</h3>
          <p className="text-xs text-gray-500">
            Solicitud para:{" "}
            <span className="font-bold text-unahur">{activeProfile.nombre} {activeProfile.apellido}</span>
          </p>
        </div>

        {/* Formulario */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">

          {errorMsg && (
            <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3">
              {errorMsg}
            </div>
          )}

          <div className="md:col-span-2 border-b pb-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos de la Prestación</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha de Prestación</label>
            <input
              type="date"
              value={fechaPrestacion}
              onChange={(e) => setFechaPrestacion(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Integrante Beneficiario</label>
            <select
              disabled
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
            >
              <option>{activeProfile.nombre} {activeProfile.apellido}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Médico / Profesional</label>
            <input
              type="text"
              value={medico}
              onChange={(e) => setMedico(e.target.value)}
              placeholder="Ej: Dr. García"
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Especialidad</label>
            <select
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white"
            >
              <option value="" disabled>Seleccione especialidad...</option>
              <option>Odontología</option>
              <option>Pediatría</option>
              <option>Clínica Médica</option>
              <option>Cardiología</option>
              <option>Traumatología</option>
              <option>Dermatología</option>
              <option>Oftalmología</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lugar de Atención</label>
            <input
              type="text"
              value={lugarAtencion}
              onChange={(e) => setLugarAtencion(e.target.value)}
              placeholder="Ej: Clínica Central"
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
            />
          </div>

          <div className="md:col-span-2 border-b pb-2 mt-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Datos de Facturación</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CUIT Emisor</label>
            <input
              type="text"
              value={facturaCuit}
              onChange={(e) => setFacturaCuit(e.target.value)}
              placeholder="00-00000000-0"
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Valor Total ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
              <input
                type="text"
                value={facturaValorStr}
                onChange={handleMonedaChange}
                placeholder="0,00"
                className="w-full p-2.5 pl-8 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2 border-b pb-2 mt-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Forma de Devolución</span>
          </div>

          <div className={formaPago === "Transferencia" ? "md:col-span-1" : "md:col-span-2"}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Método de Pago</label>
            <select
              value={formaPago}
              onChange={(e) => { setFormaPago(e.target.value); setCbu(""); }}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white"
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
                placeholder="Ingrese los 22 dígitos"
                className="w-full p-2.5 border border-unahur/30 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observaciones adicionales</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[80px]"
              placeholder="Algún detalle relevante..."
            />
          </div>
        </div>

        {/* Pie */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all"
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
