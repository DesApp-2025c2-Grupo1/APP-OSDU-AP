import { useState, useEffect } from "react";
import { CalendarCheck, Save } from "lucide-react";
import { type Persona } from "./Layout";
import { type TurnoDisponible } from "../data/mockData";

interface ModalReservaTurnoProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  integrantesSeleccionables: Persona[];
  turnosDisponibles: TurnoDisponible[];
  onReservar: (idIntegrante: string, disponible: TurnoDisponible, horario: string) => void;
}

const MESES: Record<string, string> = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
};

const formatearFecha = (fecha: string) => {
  const [, mes, dia] = fecha.split("-");
  return `${dia} de ${MESES[mes]}`;
};

export function ModalReservaTurno({
  isOpen, onClose, activeProfile, integrantesSeleccionables, turnosDisponibles, onReservar,
}: ModalReservaTurnoProps) {
  const [integranteId, setIntegranteId] = useState(activeProfile.id);
  const [especialidad, setEspecialidad] = useState("");
  const [medico, setMedico] = useState("");
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIntegranteId(activeProfile.id);
      setEspecialidad("");
      setMedico("");
      setFecha("");
      setHorario("");
    }
  }, [isOpen, activeProfile.id]);

  // Opciones encadenadas
  const especialidades = [...new Set(turnosDisponibles.map((t) => t.especialidad))].sort();

  const medicosDisponibles = especialidad
    ? [...new Set(turnosDisponibles.filter((t) => t.especialidad === especialidad).map((t) => t.medico))].sort()
    : [];

  const fechasDisponibles = medico
    ? turnosDisponibles.filter((t) => t.especialidad === especialidad && t.medico === medico).map((t) => t.fecha).sort()
    : [];

  const horariosDisponibles = fecha
    ? turnosDisponibles.find((t) => t.especialidad === especialidad && t.medico === medico && t.fecha === fecha)?.horarios ?? []
    : [];

  const disponibleSeleccionado = turnosDisponibles.find(
    (t) => t.especialidad === especialidad && t.medico === medico && t.fecha === fecha
  );

  const puedeConfirmar = integranteId && especialidad && medico && fecha && horario;

  const handleEspecialidadChange = (v: string) => { setEspecialidad(v); setMedico(""); setFecha(""); setHorario(""); };
  const handleMedicoChange = (v: string) => { setMedico(v); setFecha(""); setHorario(""); };
  const handleFechaChange = (v: string) => { setFecha(v); setHorario(""); };

  const handleConfirmar = () => {
    if (!puedeConfirmar || !disponibleSeleccionado) return;
    onReservar(integranteId, disponibleSeleccionado, horario);
    onClose();
  };

  if (!isOpen) return null;

  const todosIntegrantes = [activeProfile, ...integrantesSeleccionables];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">Nueva Reserva de Turno</h3>
          <p className="text-xs text-gray-500 mt-0.5">Seleccioná el integrante, especialidad y horario disponible.</p>
        </div>

        {/* Formulario */}
        <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">

          <div className="border-b pb-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">¿Para quién es el turno?</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Integrante</label>
            <select
              value={integranteId}
              onChange={(e) => setIntegranteId(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white"
            >
              {todosIntegrantes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido} ({p.rol})
                </option>
              ))}
            </select>
          </div>

          <div className="border-b pb-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Disponibilidad</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Especialidad</label>
              <select
                value={especialidad}
                onChange={(e) => handleEspecialidadChange(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white"
              >
                <option value="">Seleccionar...</option>
                {especialidades.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Médico / Profesional</label>
              <select
                value={medico}
                disabled={!especialidad}
                onChange={(e) => handleMedicoChange(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {medicosDisponibles.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha disponible</label>
              <select
                value={fecha}
                disabled={!medico}
                onChange={(e) => handleFechaChange(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {fechasDisponibles.map((f) => (
                  <option key={f} value={f}>{formatearFecha(f)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Horario</label>
              <select
                value={horario}
                disabled={!fecha}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {horariosDisponibles.map((h) => <option key={h} value={h}>{h} hs</option>)}
              </select>
            </div>
          </div>

          {/* Resumen cuando todo está completo */}
          {puedeConfirmar && disponibleSeleccionado && (
            <div className="bg-unahur/5 border border-unahur/20 rounded-xl p-4 animate-in fade-in duration-200">
              <p className="text-[10px] font-black text-unahur uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CalendarCheck size={12} /> Resumen del turno
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600">
                <span className="text-gray-400 font-semibold">Médico:</span>
                <span className="font-bold text-gray-700">{medico}</span>
                <span className="text-gray-400 font-semibold">Especialidad:</span>
                <span>{especialidad}</span>
                <span className="text-gray-400 font-semibold">Lugar:</span>
                <span>{disponibleSeleccionado.lugar}</span>
                <span className="text-gray-400 font-semibold">Fecha:</span>
                <span>{formatearFecha(fecha)}</span>
                <span className="text-gray-400 font-semibold">Horario:</span>
                <span className="font-bold text-unahur">{horario} hs</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!puedeConfirmar}
            className="px-6 py-2 bg-unahur text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Save size={16} /> Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  );
}
