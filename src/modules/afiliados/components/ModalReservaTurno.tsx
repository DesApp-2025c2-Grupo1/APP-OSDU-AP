import { useState, useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { CalendarCheck, Save, Loader2, Search, MapPin, ChevronDown, Clock } from "lucide-react";
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

const getSlotKey = (slot: SlotDisponible) => `${slot.horaIni}|${slot.horaFin}`;

const getHourFromSlot = (slot: SlotDisponible) => Number(slot.horaIni.split(":")[0] ?? 0);

const groupSlotsByDayPeriod = (slots: SlotDisponible[]) => {
  const groups = [
    { id: "manana", label: "Mañana", slots: [] as SlotDisponible[] },
    { id: "tarde", label: "Tarde", slots: [] as SlotDisponible[] },
    { id: "noche", label: "Noche", slots: [] as SlotDisponible[] },
  ];

  slots.forEach((slot) => {
    const hour = getHourFromSlot(slot);
    if (hour < 12) {
      groups[0].slots.push(slot);
      return;
    }

    if (hour < 18) {
      groups[1].slots.push(slot);
      return;
    }

    groups[2].slots.push(slot);
  });

  return groups.filter((group) => group.slots.length > 0);
};

function SpecialtyAutocomplete({
  especialidades,
  value,
  disabled,
  onSelect,
}: {
  especialidades: EspecialidadAPI[];
  value: number | "";
  disabled: boolean;
  onSelect: (especialidadId: number | "") => void;
}) {
  const selectedSpecialty = especialidades.find((especialidad) => especialidad.id === value) ?? null;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSpecialties = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return especialidades;
    return especialidades.filter((especialidad) => especialidad.nombre.toLowerCase().includes(text));
  }, [especialidades, query]);

  const selectSpecialty = (especialidad: EspecialidadAPI) => {
    onSelect(especialidad.id);
    setQuery(especialidad.nombre);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, Math.max(filteredSpecialties.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (!open) return;
      event.preventDefault();
      const especialidad = filteredSpecialties[activeIndex];
      if (especialidad) selectSpecialty(especialidad);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setQuery(selectedSpecialty?.nombre || "");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={open ? query : selectedSpecialty?.nombre || ""}
          disabled={disabled}
          onFocus={() => {
            setQuery("");
            setActiveIndex(0);
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
            if (value) onSelect("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Cargando especialidades..." : "Buscar especialidad..."}
          role="combobox"
          aria-expanded={open}
          aria-controls="specialty-autocomplete-options"
          aria-activedescendant={open && filteredSpecialties[activeIndex] ? `specialty-option-${filteredSpecialties[activeIndex].id}` : undefined}
          className="w-full min-w-0 rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-700 outline-none transition-all
            placeholder:text-gray-400 focus:border-unahur focus:ring-2 focus:ring-unahur/20 disabled:cursor-not-allowed disabled:opacity-40"
        />
        <ChevronDown
          size={15}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && !disabled && (
        <div
          id="specialty-autocomplete-options"
          role="listbox"
          className="absolute left-0 right-0 z-40 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          {filteredSpecialties.length === 0 ? (
            <div className="px-3 py-3 text-center text-xs font-semibold text-gray-400">
              No se encontraron especialidades
            </div>
          ) : (
            filteredSpecialties.map((especialidad, index) => (
              <button
                key={especialidad.id}
                id={`specialty-option-${especialidad.id}`}
                type="button"
                role="option"
                aria-selected={especialidad.id === value}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectSpecialty(especialidad);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full min-w-0 items-center gap-2 px-3 py-2.5 text-left transition-colors ${
                  index === activeIndex ? "bg-unahur/10" : "hover:bg-gray-50"
                }`}
              >
                <div className="rounded-lg bg-unahur/10 p-1.5 text-unahur">
                  <Search size={13} />
                </div>
                <p className="truncate text-sm font-bold text-gray-700">{especialidad.nombre}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AgendaAutocomplete({
  agendas,
  value,
  disabled,
  onSelect,
}: {
  agendas: AgendaAPI[];
  value: string;
  disabled: boolean;
  onSelect: (agendaId: string) => void;
}) {
  const selectedAgenda = agendas.find((agenda) => agenda.id === value) ?? null;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAgendas = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return agendas;
    return agendas.filter((agenda) =>
      `${agenda.prestador} ${agenda.lugar}`.toLowerCase().includes(text)
    );
  }, [agendas, query]);

  const selectAgenda = (agenda: AgendaAPI) => {
    onSelect(agenda.id);
    setQuery(agenda.prestador);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, Math.max(filteredAgendas.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (!open) return;
      event.preventDefault();
      const agenda = filteredAgendas[activeIndex];
      if (agenda) selectAgenda(agenda);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setQuery(selectedAgenda?.prestador || "");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={open ? query : selectedAgenda?.prestador || ""}
          disabled={disabled}
          onFocus={() => {
            setQuery("");
            setActiveIndex(0);
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
            if (value) onSelect("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Seleccioná una especialidad primero" : "Buscar profesional..."}
          role="combobox"
          aria-expanded={open}
          aria-controls="agenda-autocomplete-options"
          aria-activedescendant={open && filteredAgendas[activeIndex] ? `agenda-option-${filteredAgendas[activeIndex].id}` : undefined}
          className="w-full min-w-0 rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-700 outline-none transition-all
            placeholder:text-gray-400 focus:border-unahur focus:ring-2 focus:ring-unahur/20 disabled:cursor-not-allowed disabled:opacity-40"
        />
        <ChevronDown
          size={15}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && !disabled && (
        <div
          id="agenda-autocomplete-options"
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          {filteredAgendas.length === 0 ? (
            <div className="px-3 py-3 text-center text-xs font-semibold text-gray-400">
              No se encontraron profesionales
            </div>
          ) : (
            filteredAgendas.map((agenda, index) => (
              <button
                key={agenda.id}
                id={`agenda-option-${agenda.id}`}
                type="button"
                role="option"
                aria-selected={agenda.id === value}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectAgenda(agenda);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full min-w-0 items-start gap-2 px-3 py-2.5 text-left transition-colors ${
                  index === activeIndex ? "bg-unahur/10" : "hover:bg-gray-50"
                }`}
              >
                <div className="mt-0.5 rounded-lg bg-unahur/10 p-1.5 text-unahur">
                  <MapPin size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-700">{agenda.prestador}</p>
                  <p className="mt-0.5 truncate text-xs font-medium text-gray-400">{agenda.lugar || "Lugar de atención sin informar"}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

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
      .catch((e: unknown) => setErrorMsg(e instanceof Error ? e.message : "No se pudieron cargar los profesionales."))
      .finally(() => setLoadingAgendas(false));
  }, [especialidadId]);

  // Cargar slots al cambiar agenda o fecha
  useEffect(() => {
    if (!agendaId || !fecha) { setSlots([]); setSlotSeleccionado(null); return; }
    setLoadingSlots(true);
    setSlotSeleccionado(null);
    turnosApi.getTurnosDisponibles(agendaId, fecha)
      .then(setSlots)
      .catch((e: unknown) => setErrorMsg(e instanceof Error ? e.message : "No se pudieron cargar los horarios."))
      .finally(() => setLoadingSlots(false));
  }, [agendaId, fecha]);

  const agendaSeleccionada = agendas.find((a) => a.id === agendaId) ?? null;
  const slotsAgrupados = useMemo(() => groupSlotsByDayPeriod(slots), [slots]);
  const puedeConfirmar = especialidadId && agendaId && fecha && slotSeleccionado;

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
                <SpecialtyAutocomplete
                  especialidades={especialidades}
                  value={especialidadId}
                  disabled={loadingEsp}
                  onSelect={setEspecialidadId}
                />
              )}
            </div>

            {/* Profesional / Agenda */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Médico / Profesional</label>
              {loadingAgendas ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 p-2.5"><Loader2 size={14} className="animate-spin" /> Cargando...</div>
              ) : (
                <AgendaAutocomplete
                  agendas={agendas}
                  value={agendaId}
                  disabled={!especialidadId}
                  onSelect={(nextAgendaId) => {
                    setAgendaId(nextAgendaId);
                    setFecha("");
                    setSlots([]);
                    setSlotSeleccionado(null);
                  }}
                />
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

          </div>

          {/* Horario */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">Horario</label>
              {slotSeleccionado && (
                <span className="rounded-full bg-unahur/10 px-2.5 py-1 text-[10px] font-black text-unahur">
                  {slotSeleccionado.horaIni} hs seleccionado
                </span>
              )}
            </div>

            {loadingSlots ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 p-2.5">
                <Loader2 size={14} className="animate-spin" /> Cargando horarios...
              </div>
            ) : !fecha ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-center text-xs font-semibold text-gray-400">
                Seleccioná una fecha para ver los horarios disponibles.
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-4 text-center text-xs font-bold text-amber-700">
                No hay horarios disponibles para la fecha seleccionada.
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
                  <Clock size={14} className="text-unahur" />
                  Horarios disponibles
                </div>

                <div className="space-y-4">
                  {slotsAgrupados.map((group) => (
                    <div key={group.id}>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[1.5px] text-gray-400">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {group.slots.map((slot) => {
                          const selected = slotSeleccionado ? getSlotKey(slotSeleccionado) === getSlotKey(slot) : false;

                          return (
                            <button
                              key={getSlotKey(slot)}
                              type="button"
                              onClick={() => setSlotSeleccionado(slot)}
                              aria-pressed={selected}
                              className={`rounded-xl border px-3 py-2.5 text-sm font-black transition-all ${
                                selected
                                  ? "border-unahur bg-unahur text-white shadow-lg shadow-green-100"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-unahur hover:bg-unahur/5 hover:text-unahur"
                              }`}
                            >
                              {slot.horaIni}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Motivo de la consulta <span className="normal-case font-normal">(opcional)</span></label>
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
