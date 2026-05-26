import { useState, useEffect } from "react";
import { CalendarCheck, Save, Loader2 } from "lucide-react";
import { type Persona } from "./Layout";
import { turnosApi, type AgendaAPI, type EspecialidadAPI, type SlotDisponible } from "../../../services/api";

interface ModalReservaTurnoProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Persona;
  userLogueado: Persona;
  onReservaExitosa: () => void;
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

const hoy = () => new Date().toISOString().split("T")[0];

export function ModalReservaTurno({ isOpen, onClose, activeProfile, userLogueado, onReservaExitosa }: ModalReservaTurnoProps) {
  const afiliadoId = activeProfile.id !== userLogueado.id ? activeProfile.id : undefined;
  const [especialidades, setEspecialidades] = useState<EspecialidadAPI[]>([]);
  const [especialidadId, setEspecialidadId] = useState<number | "">("");
  const [agendas, setAgendas] = useState<AgendaAPI[]>([]);
  const [agendaId, setAgendaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [slotSeleccionado, setSlotSeleccionado] = useState<SlotDisponible | null>(null);
  const [motivo, setMotivo] = useState("");
  const [loadingEsp, setLoadingEsp] = useState(false);
  const [loadingAgendas, setLoadingAgendas] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset al abrir
  useEffect(() => {
    if (!isOpen) return;
    setEspecialidadId("");
    setAgendas([]);
    setAgendaId("");
    setFecha("");
    setSlots([]);
    setSlotSeleccionado(null);
    setMotivo("");
    setErrorMsg(null);

    setLoadingEsp(true);
    turnosApi.getEspecialidades()
      .then(setEspecialidades)
      .catch(() => setErrorMsg("No se pudieron cargar las especialidades."))
      .finally(() => setLoadingEsp(false));
  }, [isOpen]);

  // Cargar agendas al cambiar especialidad
  useEffect(() => {
    if (!especialidadId) { setAgendas([]); setAgendaId(""); setFecha(""); setSlots([]); setSlotSeleccionado(null); return; }
    setLoadingAgendas(true);
    setAgendaId("");
    setFecha("");
    setSlots([]);
    setSlotSeleccionado(null);
    turnosApi.getAgendas(especialidadId as number)
      .then(setAgendas)
      .catch(() => setErrorMsg("No se pudieron cargar los profesionales."))
      .finally(() => setLoadingAgendas(false));
  }, [especialidadId]);

  // Cargar slots al cambiar agenda o fecha
  useEffect(() => {
    if (!agendaId || !fecha) { setSlots([]); setSlotSeleccionado(null); return; }
    setLoadingSlots(true);
    setSlotSeleccionado(null);
    turnosApi.getTurnosDisponibles(agendaId, fecha)
      .then(setSlots)
      .catch(() => setErrorMsg("No se pudieron cargar los horarios."))
      .finally(() => setLoadingSlots(false));
  }, [agendaId, fecha]);

  const agendaSeleccionada = agendas.find((a) => a.id === agendaId) ?? null;
  const puedeConfirmar = especialidadId && agendaId && fecha && slotSeleccionado && motivo.trim();

  const handleConfirmar = async () => {
    if (!puedeConfirmar || !slotSeleccionado) return;
    setConfirmando(true);
    setErrorMsg(null);
    try {
      await turnosApi.reservarTurno({
        agendaId,
        fecha,
        horaIni: slotSeleccionado.horaIni,
        horaFin: slotSeleccionado.horaFin,
        motivo: motivo.trim(),
        ...(afiliadoId ? { afiliadoId } : {}),
      });
      onReservaExitosa();
      onClose();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Error al reservar el turno.");
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">Nueva Reserva de Turno</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Turno para: <span className="font-bold text-unahur">{activeProfile.nombre} {activeProfile.apellido}</span>
          </p>
        </div>

        {/* Formulario */}
        <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3">
              {errorMsg}
            </div>
          )}

          <div className="border-b pb-2">
            <span className="text-[10px] font-black text-unahur uppercase tracking-[2px]">Disponibilidad</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Especialidad */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Especialidad</label>
              {loadingEsp ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 p-2.5"><Loader2 size={14} className="animate-spin" /> Cargando...</div>
              ) : (
                <select
                  value={especialidadId}
                  onChange={(e) => setEspecialidadId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {especialidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              )}
            </div>

            {/* Profesional / Agenda */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Médico / Profesional</label>
              {loadingAgendas ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 p-2.5"><Loader2 size={14} className="animate-spin" /> Cargando...</div>
              ) : (
                <select
                  value={agendaId}
                  disabled={!especialidadId}
                  onChange={(e) => { setAgendaId(e.target.value); setFecha(""); setSlots([]); setSlotSeleccionado(null); }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar...</option>
                  {agendas.map((a) => (
                    <option key={a.id} value={a.id}>{a.prestador} — {a.lugar}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                disabled={!agendaId}
                min={hoy()}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Horario */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Horario</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 p-2.5"><Loader2 size={14} className="animate-spin" /> Cargando...</div>
              ) : (
                <select
                  value={slotSeleccionado ? `${slotSeleccionado.horaIni}|${slotSeleccionado.horaFin}` : ""}
                  disabled={!fecha || slots.length === 0}
                  onChange={(e) => {
                    if (!e.target.value) { setSlotSeleccionado(null); return; }
                    const [horaIni, horaFin] = e.target.value.split("|");
                    setSlotSeleccionado({ horaIni, horaFin });
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {fecha && slots.length === 0 && !loadingSlots ? "Sin horarios disponibles" : "Seleccionar..."}
                  </option>
                  {slots.map((s) => (
                    <option key={`${s.horaIni}|${s.horaFin}`} value={`${s.horaIni}|${s.horaFin}`}>
                      {s.horaIni} hs
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Motivo de la consulta</label>
            <input
              type="text"
              placeholder="Ej: Control anual, dolor de cabeza..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={!slotSeleccionado}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Resumen */}
          {puedeConfirmar && agendaSeleccionada && slotSeleccionado && (
            <div className="bg-unahur/5 border border-unahur/20 rounded-xl p-4 animate-in fade-in duration-200">
              <p className="text-[10px] font-black text-unahur uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CalendarCheck size={12} /> Resumen del turno
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600">
                <span className="text-gray-400 font-semibold">Médico:</span>
                <span className="font-bold text-gray-700">{agendaSeleccionada.prestador}</span>
                <span className="text-gray-400 font-semibold">Especialidad:</span>
                <span>{agendaSeleccionada.especialidad}</span>
                <span className="text-gray-400 font-semibold">Lugar:</span>
                <span>{agendaSeleccionada.lugar}</span>
                <span className="text-gray-400 font-semibold">Fecha:</span>
                <span>{formatearFecha(fecha)}</span>
                <span className="text-gray-400 font-semibold">Horario:</span>
                <span className="font-bold text-unahur">{slotSeleccionado.horaIni} hs</span>
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
            disabled={!puedeConfirmar || confirmando}
            className="px-6 py-2 bg-unahur text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {confirmando ? <><Loader2 size={16} className="animate-spin" /> Reservando...</> : <><Save size={16} /> Confirmar Reserva</>}
          </button>
        </div>
      </div>
    </div>
  );
}
