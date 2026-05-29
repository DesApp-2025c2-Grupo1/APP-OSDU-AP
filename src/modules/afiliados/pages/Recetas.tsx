import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { type Persona } from "../components/Layout";
import { DashboardFiltros, type FiltroEstado } from "../components/DashboardFiltros";
import { ModalCargaReceta } from "../components/ModalCargaReceta";
import { recetasApi, type RecetaAPI } from "../../../services/api";
import { Filter, Calendar, Plus, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export function Recetas() {
  const { activeProfile } = useOutletContext<{ activeProfile: Persona }>();
  const navigate = useNavigate();
  
  const [filtro, setFiltro] = useState<FiltroEstado>("PENDIENTE");
  const [listaRecetas, setListaRecetas] = useState<RecetaAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 5;

  // Modales
  const [recetaVistaDetalle, setRecetaVistaDetalle] = useState<RecetaAPI | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  
  // Modal de Carga / Edición Total
  const [isCargaModalOpen, setIsCargaModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    recetasApi.getMisRecetas()
      .then((data) => { if (mounted) setListaRecetas(data); })
      .catch(() => { if (mounted) setError("No se pudieron cargar las recetas."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const obtenerDatosFiltrados = () => {
    const delUsuario = listaRecetas.filter(r => String(r.idIntegrante) === String(activeProfile.id));
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

    useEffect(() => {
        setPaginaActual(1);
    }, [filtro]);

    // Agregado para volver a pág 1 si borro todo lo que hay en otras paginas... 
    useEffect(() => {
        const maxPaginas = Math.ceil(datosFiltrados.length / ITEMS_POR_PAGINA);
        if (paginaActual > maxPaginas && maxPaginas > 0) {
            setPaginaActual(maxPaginas);
        }
    }, [datosFiltrados.length, paginaActual]);

  const responderObservacion = async () => {
    if (!recetaVistaDetalle || !textoRespuesta.trim()) return;
    setEnviandoRespuesta(true);
    try {
      const actualizada = await recetasApi.responderObservacion(recetaVistaDetalle.id, textoRespuesta.trim());
      setListaRecetas(prev => prev.map(r => r.id === actualizada.id ? actualizada : r));
      setRecetaVistaDetalle(null);
      setTextoRespuesta("");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al enviar la respuesta");
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  // Lógica de clic en el estado de la tabla
  const handleClicEstado = (receta: RecetaAPI) => {
    setRecetaVistaDetalle(receta);
  };

  const abrirModalNuevaCarga = () => {
    setIsCargaModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Gestión de <span className="text-unahur font-black">Recetas</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Historial de medicamentos de: <span className="text-unahur font-bold">{activeProfile.nombre} {activeProfile.apellido}</span>
          </p>
        </div>
      </div>

      <DashboardFiltros filtroActual={filtro} setFiltro={setFiltro} />

      <div className="flex justify-end mb-4">
        <button
          onClick={abrirModalNuevaCarga}
          className="bg-unahur hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Plus size={16} /> Cargar Receta
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
          <Filter size={14} className="text-gray-400" />
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Listado: {filtro}S
          </h2>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] uppercase text-gray-400">
                <th className="p-4 font-bold">Fecha</th>
                <th className="p-4 font-bold">Medicamento / Presentación</th>
                <th className="p-4 font-bold">Cantidad</th>
                <th className="p-4 font-bold">Estado (Clic para detalle)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400">
                    <p className="text-sm font-medium">Cargando recetas...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-red-500">
                    <p className="text-sm font-medium">{error}</p>
                  </td>
                </tr>
              ) : datosPaginados.length > 0 ? (
                datosPaginados.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800">{r.fecha}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800">{r.medicamento}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{r.presentacion}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold shadow-sm border border-gray-200">
                        {r.cantidad}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleClicEstado(r)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-gray-100 text-gray-600 hover:bg-unahur hover:text-white transition-colors cursor-pointer shadow-sm"
                      >
                        {r.estado}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Calendar size={40} className="mb-2" />
                      <p className="text-sm font-medium">No se encontraron recetas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs text-gray-500 font-medium">
              Mostrando {indexInicio + 1} a {Math.min(indexInicio + ITEMS_POR_PAGINA, datosFiltrados.length)} de {datosFiltrados.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="p-1.5 rounded-md border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white transition-colors"><ChevronLeft size={16} /></button>
              <span className="text-xs font-bold text-gray-600 px-2">Página {paginaActual} de {totalPaginas}</span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="p-1.5 rounded-md border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          MODAL DE VISTA DETALLE (Solo lectura / Observados)
          ========================================= */}
      {recetaVistaDetalle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={() => { setRecetaVistaDetalle(null); setTextoRespuesta(""); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">Detalle de Receta</h3>
              <p className="text-xs text-gray-500 mt-1">
                Afiliado: <strong className="text-unahur">{activeProfile.nombre} {activeProfile.apellido}</strong>
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              
              {recetaVistaDetalle.estado === "Observado" && recetaVistaDetalle.mensajeObservacion && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Motivo de observación:</p>
                  <p className="text-sm text-amber-900">{recetaVistaDetalle.mensajeObservacion}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Medicamento</label>
                  <p className="font-medium text-gray-800">{recetaVistaDetalle.medicamento}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Presentación</label>
                  <p className="font-medium text-gray-800">{recetaVistaDetalle.presentacion}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cantidad</label>
                  <p className="font-medium text-unahur text-lg">{recetaVistaDetalle.cantidad}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha</label>
                  <p className="font-medium text-gray-800">{recetaVistaDetalle.fecha}</p>
                </div>
              </div>

              {recetaVistaDetalle.estado === "Observado" && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <label className="block text-[10px] font-bold text-unahur uppercase tracking-wider mb-2">Escriba su respuesta</label>
                  <textarea value={textoRespuesta} onChange={(e) => setTextoRespuesta(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[100px]" placeholder="Escriba aquí..."></textarea>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              {recetaVistaDetalle.estado === "Observado" ? (
                <>
                  <button onClick={() => setRecetaVistaDetalle(null)} className="px-4 py-2 text-gray-500 font-bold hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">Cancelar</button>
                  <button onClick={responderObservacion} disabled={textoRespuesta.trim() === "" || enviandoRespuesta} className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 disabled:opacity-50">{enviandoRespuesta ? "Enviando..." : "Enviar Respuesta"}</button>
                </>
              ) : (
                <button onClick={() => setRecetaVistaDetalle(null)} className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all">Cerrar</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔹 MODAL DE CARGA (Crear Y Editar "Recibidos") */}
      <ModalCargaReceta 
        isOpen={isCargaModalOpen} 
        onClose={() => setIsCargaModalOpen(false)} 
        activeProfile={activeProfile} 
        onCreated={(receta) => setListaRecetas((prev) => [receta, ...prev])}
      />

    </div>
  );
}
