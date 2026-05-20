import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { type Persona } from "../components/Layout";
import { DashboardFiltros, type FiltroEstado } from "../components/DashboardFiltros";
import { ModalCargaReintegro } from "../components/ModalCargaReintegro";
import { reintegrosApi, type ReintegroAPI } from "../../../services/api";
import { Calendar, Plus, ChevronLeft, ChevronRight, FileSearch, CheckCircle2, AlertCircle } from "lucide-react";

const ITEMS_POR_PAGINA = 6;

export function Reintegros() {
  const { activeProfile } = useOutletContext<{ activeProfile: Persona }>();

  const [filtro, setFiltro] = useState<FiltroEstado>("PENDIENTE");
  const [listaReintegros, setListaReintegros] = useState<ReintegroAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);

  const [reintegroVistaDetalle, setReintegroVistaDetalle] = useState<ReintegroAPI | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [isCargaModalOpen, setIsCargaModalOpen] = useState(false);

  const cargarReintegros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reintegrosApi.getMisReintegros();
      setListaReintegros(data);
    } catch {
      setError("No se pudieron cargar los reintegros.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarReintegros(); }, [cargarReintegros]);
  useEffect(() => { setPaginaActual(1); }, [filtro]);

  const obtenerDatosFiltrados = () => {
    const limiteSemanas = new Date();
    limiteSemanas.setDate(limiteSemanas.getDate() - 7);
    limiteSemanas.setHours(0, 0, 0, 0);

    return listaReintegros.filter(r => {
      if (filtro === "PENDIENTE") return r.estado === "Recibido" || r.estado === "En análisis";
      if (filtro === "OBSERVADA") return r.estado === "Observado";
      const fechaDelTramite = new Date((r.fechaEstado || r.fechaPrestacion) + "T00:00:00");
      if (filtro === "RECHAZADA") return r.estado === "Rechazado" && fechaDelTramite >= limiteSemanas;
      if (filtro === "APROBADA")  return r.estado === "Aprobado"  && fechaDelTramite >= limiteSemanas;
      return false;
    });
  };

  const datosFiltrados = obtenerDatosFiltrados();
  const totalPaginas = Math.ceil(datosFiltrados.length / ITEMS_POR_PAGINA);
  const indexInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const datosPaginados = datosFiltrados.slice(indexInicio, indexInicio + ITEMS_POR_PAGINA);

  const handleClicEstado = (reintegro: ReintegroAPI) => {
    setReintegroVistaDetalle(reintegro);
  };

  const handleEnviarRespuesta = async () => {
    if (!reintegroVistaDetalle || !textoRespuesta.trim()) return;
    setEnviandoRespuesta(true);
    try {
      const actualizado = await reintegrosApi.responderObservacion(reintegroVistaDetalle.id, textoRespuesta.trim());
      setListaReintegros(prev => prev.map(r => r.id === actualizado.id ? actualizado : r));
      setReintegroVistaDetalle(null);
      setTextoRespuesta("");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al enviar la respuesta");
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">
            Gestión de <span className="text-unahur">Reintegros</span>
          </h1>
          <p className="text-gray-400 mt-1 font-medium">
            Historial de trámites de <span className="text-gray-900 font-bold">{activeProfile.nombre}</span>
          </p>
        </div>

        <button
          onClick={() => setIsCargaModalOpen(true)}
          className="bg-unahur hover:bg-unahur-dark text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-unahur/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Nueva Solicitud
        </button>
      </div>

      <div className="bg-white p-2 rounded-[32px] border border-gray-100 shadow-sm">
        <DashboardFiltros filtroActual={filtro} setFiltro={setFiltro} />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-unahur/10 p-2 rounded-xl text-unahur">
              <FileSearch size={18} />
            </div>
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Listado de Solicitudes
            </h2>
          </div>
          <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-unahur border border-unahur/20 shadow-sm shadow-unahur/5">
            {datosFiltrados.length} TRÁMITES
          </span>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center p-20 opacity-40">
              <p className="text-sm font-medium">Cargando reintegros...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-20 text-red-500 opacity-60">
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] uppercase text-gray-400">
                  <th className="px-8 py-5 font-black tracking-widest">Fecha / Lugar</th>
                  <th className="px-8 py-5 font-black tracking-widest">Médico</th>
                  <th className="px-8 py-5 font-black tracking-widest">Monto</th>
                  <th className="px-8 py-5 font-black tracking-widest text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {datosPaginados.length > 0 ? (
                  datosPaginados.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-gray-900 group-hover:text-unahur transition-colors">{r.fechaPrestacion}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{r.lugarAtencion}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-gray-900">{r.medico}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{r.especialidad}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-green-600">${r.factura.valorTotal.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{r.formaPago}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleClicEstado(r)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm active:scale-95 ${
                            r.estado === "Aprobado"  ? "bg-green-50 text-green-600 hover:bg-green-100" :
                            r.estado === "Rechazado" ? "bg-red-50 text-red-600 hover:bg-red-100" :
                            r.estado === "Observado" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" :
                            "bg-gray-50 text-gray-600 hover:bg-unahur hover:text-white"
                          }`}
                        >
                          {r.estado}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <Calendar size={64} className="mb-4 opacity-20" />
                        <p className="text-lg font-black uppercase tracking-widest text-gray-300">Sin Solicitudes</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Página {paginaActual} de {totalPaginas}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white hover:border-unahur hover:text-unahur shadow-sm transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white hover:border-unahur hover:text-unahur shadow-sm transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalle / respuesta observación */}
      {reintegroVistaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => { setReintegroVistaDetalle(null); setTextoRespuesta(""); }}
          />
          <div className="relative bg-white max-w-lg w-full rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-unahur font-black uppercase tracking-widest mb-1">Detalle del Trámite</p>
                <h3 className="text-xl font-black text-gray-900">{reintegroVistaDetalle.medico}</h3>
              </div>
              <div className={`p-2 rounded-xl text-xs font-black uppercase ${
                reintegroVistaDetalle.estado === "Aprobado"  ? "bg-green-50 text-green-600" :
                reintegroVistaDetalle.estado === "Rechazado" ? "bg-red-50 text-red-600" :
                "bg-amber-50 text-amber-600"
              }`}>
                {reintegroVistaDetalle.estado}
              </div>
            </div>

            <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto">
              {reintegroVistaDetalle.estado === "Observado" && reintegroVistaDetalle.mensajeObservacion && (
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                  <div className="bg-amber-100 text-amber-600 p-2 h-fit rounded-xl">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Observación del Auditor</p>
                    <p className="text-sm text-amber-900 font-medium">{reintegroVistaDetalle.mensajeObservacion}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Especialidad</p>
                  <p className="text-sm font-bold text-gray-800">{reintegroVistaDetalle.especialidad}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Lugar</p>
                  <p className="text-sm font-bold text-gray-800">{reintegroVistaDetalle.lugarAtencion}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Fecha Prestación</p>
                  <p className="text-sm font-bold text-gray-800">{reintegroVistaDetalle.fechaPrestacion}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Monto Solicitado</p>
                  <p className="text-sm font-black text-green-600">${reintegroVistaDetalle.factura.valorTotal.toLocaleString()}</p>
                </div>
              </div>

              {reintegroVistaDetalle.estado === "Observado" && (
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <p className="text-[10px] text-unahur font-black uppercase tracking-widest">Responder a Observación</p>
                  <textarea
                    value={textoRespuesta}
                    onChange={(e) => setTextoRespuesta(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-unahur transition-all min-h-[120px]"
                    placeholder="Escriba su descargo o adjunte información adicional..."
                  />
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50/50 flex gap-4">
              {reintegroVistaDetalle.estado === "Observado" ? (
                <>
                  <button
                    onClick={() => { setReintegroVistaDetalle(null); setTextoRespuesta(""); }}
                    className="w-1/3 py-4 bg-white text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleEnviarRespuesta}
                    disabled={enviandoRespuesta || !textoRespuesta.trim()}
                    className="flex-grow py-4 bg-unahur text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-unahur/30 hover:bg-unahur-dark disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    {enviandoRespuesta ? "Enviando..." : "Enviar Respuesta"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setReintegroVistaDetalle(null)}
                  className="w-full py-4 bg-white text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Cerrar Detalle
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ModalCargaReintegro
        isOpen={isCargaModalOpen}
        onClose={() => setIsCargaModalOpen(false)}
        activeProfile={activeProfile}
        onReintegroExitoso={cargarReintegros}
      />
    </div>
  );
}
