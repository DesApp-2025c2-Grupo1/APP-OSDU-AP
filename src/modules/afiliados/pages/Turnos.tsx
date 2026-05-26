import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, Plus, Clock, MapPin, User,
  ChevronLeft, ChevronRight, CalendarX, Filter,
} from "lucide-react";
import { type Persona } from "../components/Layout";
import { ModalReservaTurno } from "../components/ModalReservaTurno";
import { turnosApi, type TurnoAPI } from "../../../services/api";
import { type FiltroTurno, type EstadoTurno } from "../../../data/mockData";

const ITEMS_POR_PAGINA = 5;

const MESES_CORTO: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

const ESTADO_MAP: Record<string, EstadoTurno> = {
  reservado: "Reservado",
  atendido: "Completado",
  ausente: "Completado",
  cancelado: "Cancelado",
};

interface TurnoVista {
  id: string;
  medico: string;
  especialidad: string;
  lugar: string;
  fecha: string;
  horario: string;
  estado: EstadoTurno;
}

const mapApiToVista = (t: TurnoAPI): TurnoVista => ({
  id: String(t.id),
  medico: t.prestador.nombre ?? "N/A",
  especialidad: t.prestador.especialidad ?? "",
  lugar: [t.lugar.direccion, t.lugar.localidad].filter(Boolean).join(", "),
  fecha: t.fecha ? t.fecha.split('T')[0] : t.fecha,
  horario: t.horaIni,
  estado: ESTADO_MAP[t.estado] ?? "Reservado",
});

const esCancelable = (turno: TurnoVista): boolean => {
  if (turno.estado !== "Reservado") return false;
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  manana.setHours(0, 0, 0, 0);
  return new Date(turno.fecha + "T00:00:00") > manana;
};

const FILTROS: { key: FiltroTurno; label: string }[] = [
  { key: "PROXIMOS",    label: "Próximos"    },
  { key: "COMPLETADOS", label: "Completados" },
  { key: "CANCELADOS",  label: "Cancelados"  },
];

const ESTADO_COLOR: Record<string, string> = {
  Reservado:  "bg-blue-100 text-blue-700",
  Completado: "bg-green-100 text-green-700",
  Cancelado:  "bg-red-100 text-red-500",
};

export function Turnos() {
  const navigate = useNavigate();
  const { activeProfile, userLogueado } = useOutletContext<{ activeProfile: Persona; userLogueado: Persona }>();
  const afiliadoId = activeProfile.id !== userLogueado.id ? activeProfile.id : undefined;

  const [filtro, setFiltro] = useState<FiltroTurno>("PROXIMOS");
  const [listaTurnos, setListaTurnos] = useState<TurnoVista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmCancelarId, setConfirmCancelarId] = useState<string | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [cancelando, setCancelando] = useState(false);

  const cargarTurnos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await turnosApi.getMisTurnos(afiliadoId);
      setListaTurnos(data.map(mapApiToVista));
    } catch {
      setError("No se pudieron cargar los turnos.");
    } finally {
      setLoading(false);
    }
  }, [afiliadoId]);

  useEffect(() => { cargarTurnos(); }, [cargarTurnos]);

  const datosFiltrados = listaTurnos.filter((t) => {
    if (filtro === "PROXIMOS")    return t.estado === "Reservado";
    if (filtro === "COMPLETADOS") return t.estado === "Completado";
    if (filtro === "CANCELADOS")  return t.estado === "Cancelado";
    return false;
  });

  const totalPaginas = Math.ceil(datosFiltrados.length / ITEMS_POR_PAGINA);
  const indexInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const datosPaginados = datosFiltrados.slice(indexInicio, indexInicio + ITEMS_POR_PAGINA);

  useEffect(() => { setPaginaActual(1); }, [filtro]);

  useEffect(() => {
    const max = Math.ceil(datosFiltrados.length / ITEMS_POR_PAGINA);
    if (paginaActual > max && max > 0) setPaginaActual(max);
  }, [datosFiltrados.length, paginaActual]);

  const handleCancelar = async (id: string) => {
    if (!motivoCancelacion.trim()) return;
    setCancelando(true);
    try {
      await turnosApi.cancelarTurno(id, motivoCancelacion.trim());
      setListaTurnos((prev) =>
        prev.map((t) => t.id === id ? { ...t, estado: "Cancelado" } : t)
      );
      setConfirmCancelarId(null);
      setMotivoCancelacion("");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al cancelar el turno");
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Solicitar <span className="text-unahur font-black">Turnos</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Turnos de:{" "}
              <span className="text-unahur font-bold">
                {activeProfile.nombre} {activeProfile.apellido}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-unahur hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md transition-all active:scale-95 flex-shrink-0"
        >
          <Plus size={16} /> Reservar
        </button>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTROS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFiltro(key)}
            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 ${
              filtro === key
                ? "bg-unahur text-white shadow-md shadow-unahur/20"
                : "bg-white border border-gray-200 text-gray-500 hover:border-unahur/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista de turnos */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
          <Filter size={14} className="text-gray-400" />
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Turnos {FILTROS.find((f) => f.key === filtro)?.label}
          </h2>
        </div>

        <div className="divide-y divide-gray-50 min-h-[280px]">
          {loading ? (
            <div className="flex items-center justify-center p-14 opacity-40">
              <p className="text-sm font-medium">Cargando turnos...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-14 opacity-50 text-red-500">
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : datosPaginados.length > 0 ? (
            datosPaginados.map((turno) => {
              const [, mes, dia] = turno.fecha.split("-");
              const esteConfirmando = confirmCancelarId === turno.id;

              return (
                <div key={turno.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">

                    {/* Bloque de fecha */}
                    <div className="flex-shrink-0 w-12 bg-unahur/10 rounded-xl p-2 text-center">
                      <p className="text-lg font-black text-unahur leading-none">{dia}</p>
                      <p className="text-[9px] font-bold text-unahur/70 uppercase tracking-wider mt-0.5">
                        {MESES_CORTO[mes]}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{turno.medico}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{turno.especialidad}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${ESTADO_COLOR[turno.estado]}`}>
                          {turno.estado}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={11} className="text-gray-400" />
                          <span>{turno.horario} hs</span>
                        </div>
                        {turno.lugar && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={11} className="text-gray-400" />
                            <span className="truncate">{turno.lugar}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User size={11} className="text-gray-400" />
                          <span>{activeProfile.nombre} {activeProfile.apellido}</span>
                        </div>
                      </div>

                      {/* Botón cancelar */}
                      {esCancelable(turno) && !esteConfirmando && (
                        <button
                          onClick={() => { setConfirmCancelarId(turno.id); setMotivoCancelacion(""); }}
                          className="mt-3 text-[10px] font-bold uppercase text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors tracking-wider"
                        >
                          Cancelar turno
                        </button>
                      )}

                      {/* Confirmación inline con motivo */}
                      {esteConfirmando && (
                        <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 animate-in fade-in duration-150 flex flex-col gap-2">
                          <p className="text-xs text-red-600 font-semibold">¿Confirmar cancelación?</p>
                          <input
                            type="text"
                            placeholder="Ingresá el motivo..."
                            value={motivoCancelacion}
                            onChange={(e) => setMotivoCancelacion(e.target.value)}
                            className="w-full p-2 border border-red-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-300"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCancelar(turno.id)}
                              disabled={cancelando || !motivoCancelacion.trim()}
                              className="text-[10px] font-black uppercase bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40"
                            >
                              {cancelando ? "Cancelando..." : "Sí, cancelar"}
                            </button>
                            <button
                              onClick={() => { setConfirmCancelarId(null); setMotivoCancelacion(""); }}
                              className="text-[10px] font-bold uppercase text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg transition-colors"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-14 opacity-30">
              <CalendarX size={40} className="mb-2" />
              <p className="text-sm font-medium">No hay turnos {FILTROS.find((f) => f.key === filtro)?.label.toLowerCase()}</p>
            </div>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs text-gray-500 font-medium">
              Mostrando {indexInicio + 1}–{Math.min(indexInicio + ITEMS_POR_PAGINA, datosFiltrados.length)} de {datosFiltrados.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-gray-600 px-2">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de reserva */}
      <ModalReservaTurno
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeProfile={activeProfile}
        userLogueado={userLogueado}
        onReservaExitosa={cargarTurnos}
      />
    </div>
  );
}
