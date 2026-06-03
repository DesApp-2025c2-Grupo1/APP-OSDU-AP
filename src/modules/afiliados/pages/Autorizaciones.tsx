import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { type Persona } from "../components/Layout";
import { DashboardFiltros, type FiltroEstado } from "../components/DashboardFiltros";
import { ModalCargaAutorizacion } from "../components/ModalCargaAutorizacion";
import { autorizacionesApi, type AutorizacionAPI } from "../../../services/api";
import { Filter, Calendar, Plus, ChevronLeft, ChevronRight, BedDouble, ArrowLeft, Paperclip } from "lucide-react";

export function Autorizaciones() {
  const { activeProfile } = useOutletContext<{ activeProfile: Persona }>();
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState<FiltroEstado>("PENDIENTE");
  const [listaAutorizaciones, setListaAutorizaciones] = useState<AutorizacionAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 5;

  const [autorizacionVistaDetalle, setAutorizacionVistaDetalle] = useState<AutorizacionAPI | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [isCargaModalOpen, setIsCargaModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    autorizacionesApi.getMisAutorizaciones()
      .then((data) => { if (mounted) setListaAutorizaciones(data); })
      .catch(() => { if (mounted) setError("No se pudieron cargar las autorizaciones."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const obtenerDatosFiltrados = () => {
    const delUsuario = listaAutorizaciones.filter(r => String(r.idIntegrante) === String(activeProfile.id));
    const limiteSemanas = new Date();
    limiteSemanas.setDate(limiteSemanas.getDate() - 7);
    limiteSemanas.setHours(0, 0, 0, 0);

    return delUsuario.filter(r => {
      if (filtro === "PENDIENTE") return r.estado === "Recibido" || r.estado === "En análisis";
      if (filtro === "OBSERVADA") return r.estado === "Observado";
      const fechaDelTramite = new Date(r.fechaEstado + "T00:00:00");
      if (filtro === "RECHAZADA") return r.estado === "Rechazado" && fechaDelTramite >= limiteSemanas;
      if (filtro === "APROBADA") return r.estado === "Aprobado" && fechaDelTramite >= limiteSemanas;
      return false;
    });
  };

  const datosFiltrados = obtenerDatosFiltrados();
  const totalPaginas = Math.ceil(datosFiltrados.length / ITEMS_POR_PAGINA);
  const indexInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const datosPaginados = datosFiltrados.slice(indexInicio, indexInicio + ITEMS_POR_PAGINA);

  useEffect(() => { setPaginaActual(1); }, [filtro]);

  useEffect(() => {
    const maxPaginas = Math.ceil(datosFiltrados.length / ITEMS_POR_PAGINA);
    if (paginaActual > maxPaginas && maxPaginas > 0) setPaginaActual(maxPaginas);
  }, [datosFiltrados.length, paginaActual]);

  const responderObservacion = async () => {
    if (!autorizacionVistaDetalle || !textoRespuesta.trim()) return;
    setEnviandoRespuesta(true);
    try {
      const actualizada = await autorizacionesApi.responderObservacion(autorizacionVistaDetalle.id, textoRespuesta.trim());
      setListaAutorizaciones(prev => prev.map(a => a.id === actualizada.id ? actualizada : a));
      setAutorizacionVistaDetalle(null);
      setTextoRespuesta("");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al enviar la respuesta");
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const colorEstado = (estado: string) =>
    estado === "Aprobado"  ? "bg-green-50 text-green-600" :
    estado === "Rechazado" ? "bg-red-50 text-red-600" :
    estado === "Observado" ? "bg-amber-50 text-amber-600" :
    "bg-gray-50 text-gray-600";

  const colorEstadoHover = (estado: string) =>
    estado === "Aprobado"  ? "bg-green-50 text-green-600 hover:bg-green-100" :
    estado === "Rechazado" ? "bg-red-50 text-red-600 hover:bg-red-100" :
    estado === "Observado" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" :
    "bg-gray-50 text-gray-600 hover:bg-unahur hover:text-white";

  return (
    <div className="space-y-4 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} className="text-gray-500" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              Gestión de <span className="text-unahur">Autorizaciones</span>
            </h1>
            <p className="text-gray-400 text-xs font-medium truncate">
              Prácticas de <span className="text-gray-900 font-bold">{activeProfile.nombre}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCargaModalOpen(true)}
          className="bg-unahur hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md transition-all active:scale-95 flex-shrink-0"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Cargar Autorización</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* ── Tabs de estado ── */}
      <DashboardFiltros filtroActual={filtro} setFiltro={setFiltro} />

      {/* ── Listado ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
          <Filter size={13} className="text-gray-400" />
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Listado: {filtro}S
          </h2>
        </div>

        <div className="min-h-[280px]">
          {loading ? (
            <div className="flex items-center justify-center p-16 opacity-40">
              <p className="text-sm font-medium">Cargando autorizaciones...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-16 text-red-500 opacity-60">
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : datosPaginados.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-gray-300">
              <Calendar size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-black uppercase tracking-widest">Sin Solicitudes</p>
            </div>
          ) : (
            <>
              {/* ── Cards — mobile ── */}
              <div className="md:hidden divide-y divide-gray-50">
                {datosPaginados.map((a) => (
                  <div key={a.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{a.medico}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{a.especialidad}</p>
                      </div>
                      <button
                        onClick={() => setAutorizacionVistaDetalle(a)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex-shrink-0 ${colorEstado(a.estado)}`}
                      >
                        {a.estado}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>{a.fechaPrevista}</span>
                      {a.subtipo && (
                        <span className="bg-unahur/10 text-unahur font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {a.subtipo}
                        </span>
                      )}
                      {a.diasInternacion > 0 && (
                        <span className="flex items-center gap-1">
                          <BedDouble size={12} className="text-unahur" />
                          {a.diasInternacion}d
                        </span>
                      )}
                      {a.adjuntoNombre && <Paperclip size={11} className="text-gray-400" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Tabla — desktop ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 text-[10px] uppercase text-gray-400">
                      <th className="px-6 py-4 font-black tracking-widest">Fecha / Lugar</th>
                      <th className="px-6 py-4 font-black tracking-widest">Médico / Especialidad</th>
                      <th className="px-6 py-4 font-black tracking-widest">Tipo</th>
                      <th className="px-6 py-4 font-black tracking-widest">Internación</th>
                      <th className="px-6 py-4 font-black tracking-widest text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {datosPaginados.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-sm font-black text-gray-900 group-hover:text-unahur transition-colors">{a.fechaPrevista}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1 truncate max-w-[200px]">{a.lugarPrestacion}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-black text-gray-900">{a.medico}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{a.especialidad}</p>
                        </td>
                        <td className="px-6 py-5">
                          {a.subtipo ? (
                            <span className="inline-block bg-unahur/10 text-unahur text-[10px] font-bold px-2.5 py-1 rounded-full">
                              {a.subtipo}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                            <BedDouble size={15} className={a.diasInternacion > 0 ? "text-unahur" : "text-gray-200"} />
                            {a.diasInternacion > 0 ? `${a.diasInternacion} día${a.diasInternacion === 1 ? "" : "s"}` : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => setAutorizacionVistaDetalle(a)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm active:scale-95 ${colorEstadoHover(a.estado)}`}
                          >
                            {a.estado}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs text-gray-500 font-medium">
              {indexInicio + 1}–{Math.min(indexInicio + ITEMS_POR_PAGINA, datosFiltrados.length)} de {datosFiltrados.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="p-1.5 rounded-md border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs font-bold text-gray-600 px-1">{paginaActual} / {totalPaginas}</span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="p-1.5 rounded-md border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal detalle ── */}
      {autorizacionVistaDetalle && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => { setAutorizacionVistaDetalle(null); setTextoRespuesta(""); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="font-bold text-gray-800 text-base">Detalle de Autorización</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Afiliado: <strong className="text-unahur">{activeProfile.nombre} {activeProfile.apellido}</strong>
              </p>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">

              {/* Observación activa */}
              {autorizacionVistaDetalle.estado === "Observado" && autorizacionVistaDetalle.mensajeObservacion && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Motivo de observación:</p>
                  <p className="text-sm text-amber-900">{autorizacionVistaDetalle.mensajeObservacion}</p>
                </div>
              )}

              {/* Nro + Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nro. Solicitud</label>
                  <p className="font-mono text-sm font-semibold text-gray-700">{autorizacionVistaDetalle.nro}</p>
                </div>
                {autorizacionVistaDetalle.subtipo && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo</label>
                    <span className="inline-block bg-unahur/10 text-unahur text-xs font-bold px-2.5 py-1 rounded-full">
                      {autorizacionVistaDetalle.subtipo}
                    </span>
                  </div>
                )}
              </div>

              {/* Médico + Especialidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Médico</label>
                  <p className="font-medium text-gray-800 text-sm">{autorizacionVistaDetalle.medico}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Especialidad</label>
                  <p className="font-medium text-gray-800 text-sm">{autorizacionVistaDetalle.especialidad}</p>
                </div>
              </div>

              {/* Fecha + Internación */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha Prevista</label>
                  <p className="font-medium text-gray-800 text-sm">{autorizacionVistaDetalle.fechaPrevista}</p>
                </div>
                {autorizacionVistaDetalle.diasInternacion > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Días de Internación</label>
                    <p className="font-medium text-unahur text-sm">{autorizacionVistaDetalle.diasInternacion}</p>
                  </div>
                )}
              </div>

              {/* Lugar */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lugar de Prestación</label>
                <p className="font-medium text-gray-800 text-sm">{autorizacionVistaDetalle.lugarPrestacion}</p>
              </div>

              {/* Observaciones */}
              {autorizacionVistaDetalle.observaciones && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observaciones</label>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">{autorizacionVistaDetalle.observaciones}</p>
                </div>
              )}

              {/* Adjunto */}
              {autorizacionVistaDetalle.adjuntoNombre && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Orden Adjunta</label>
                  {autorizacionVistaDetalle.adjuntoRuta ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL || "http://localhost:9002"}${autorizacionVistaDetalle.adjuntoRuta}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-unahur font-semibold hover:underline"
                    >
                      <Paperclip size={14} />
                      {autorizacionVistaDetalle.adjuntoNombre}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                      <Paperclip size={14} className="text-gray-400" />
                      {autorizacionVistaDetalle.adjuntoNombre}
                    </p>
                  )}
                </div>
              )}

              {/* Respuesta a observación */}
              {autorizacionVistaDetalle.estado === "Observado" && (
                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-[10px] font-bold text-unahur uppercase tracking-wider mb-2">Escriba su respuesta</label>
                  <textarea
                    value={textoRespuesta}
                    onChange={(e) => setTextoRespuesta(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[90px]"
                    placeholder="Escriba aquí..."
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
              {autorizacionVistaDetalle.estado === "Observado" ? (
                <>
                  <button onClick={() => setAutorizacionVistaDetalle(null)} className="px-4 py-2 text-gray-500 font-bold hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-sm">
                    Cancelar
                  </button>
                  <button
                    onClick={responderObservacion}
                    disabled={!textoRespuesta.trim() || enviandoRespuesta}
                    className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 disabled:opacity-50"
                  >
                    {enviandoRespuesta ? "Enviando..." : "Enviar Respuesta"}
                  </button>
                </>
              ) : (
                <button onClick={() => setAutorizacionVistaDetalle(null)} className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all text-sm">
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de carga ── */}
      <ModalCargaAutorizacion
        isOpen={isCargaModalOpen}
        onClose={() => setIsCargaModalOpen(false)}
        activeProfile={activeProfile}
        onCreated={(autorizacion) => setListaAutorizaciones((prev) => [autorizacion, ...prev])}
      />
    </div>
  );
}
