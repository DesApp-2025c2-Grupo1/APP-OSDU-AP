import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { type Persona } from "../components/Layout";
import { DashboardFiltros, type FiltroEstado } from "../components/DashboardFiltros";
import { ModalCargaAutorizacion } from "../components/ModalCargaAutorizacion"; 
import { mockAutorizaciones, type Autorizacion } from "../../../data/mockData";
import { Filter, Calendar, Plus, ChevronLeft, ChevronRight, BedDouble } from "lucide-react";

export function Autorizaciones() {
  const { activeProfile } = useOutletContext<{ activeProfile: Persona }>();
  
  const [filtro, setFiltro] = useState<FiltroEstado>("PENDIENTE");
  const [listaAutorizaciones, setListaAutorizaciones] = useState<Autorizacion[]>(mockAutorizaciones);
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 5;

  // Modales
  const [autorizacionVistaDetalle, setAutorizacionVistaDetalle] = useState<Autorizacion | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  
  // Modal de Carga / Edición Total
  const [isCargaModalOpen, setIsCargaModalOpen] = useState(false);
  const [autorizacionAEditar, setAutorizacionAEditar] = useState<Autorizacion | null>(null);

  
  const obtenerDatosFiltrados = () => {
    const delUsuario = listaAutorizaciones.filter(r => r.idIntegrante === activeProfile.id);
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

  useEffect(() => {
    const maxPaginas = Math.ceil(datosFiltrados.length / ITEMS_POR_PAGINA);
    if (paginaActual > maxPaginas && maxPaginas > 0) {
      setPaginaActual(maxPaginas);
    }
  }, [datosFiltrados.length, paginaActual]);

  const simularBorrado = (id: string) => {
    setListaAutorizaciones(prev => prev.filter(r => r.id !== id));
  };

  const simularRespuestaObservacion = (id: string) => {
    setListaAutorizaciones(prev => prev.map(r => 
      r.id === id ? { ...r, estado: "En análisis", fechaEstado: new Date().toISOString().split('T')[0] } : r
    ));
    setAutorizacionVistaDetalle(null);
    setTextoRespuesta("");
  };

  const handleClicEstado = (autorizacion: Autorizacion) => {
    if (autorizacion.estado === "Recibido") {
      setAutorizacionAEditar(autorizacion);
      setIsCargaModalOpen(true);
    } else {
      setAutorizacionVistaDetalle(autorizacion);
    }
  };

  const abrirModalNuevaCarga = () => {
    setAutorizacionAEditar(null);
    setIsCargaModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          Gestión de <span className="text-unahur font-black">Autorizaciones</span>
        </h1>
        <p className="text-gray-500 text-sm">
          Prácticas e internaciones de: <span className="text-unahur font-bold">{activeProfile.nombre} {activeProfile.apellido}</span>
        </p>
      </header>

      <DashboardFiltros filtroActual={filtro} setFiltro={setFiltro} />

      <div className="flex justify-end mb-4">
        <button
          onClick={abrirModalNuevaCarga}
          className="bg-unahur hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Plus size={16} /> Cargar Autorización
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
                <th className="p-4 font-bold">Fecha Prevista / Lugar</th>
                <th className="p-4 font-bold">Médico / Especialidad</th>
                <th className="p-4 font-bold">Días de Internación</th>
                <th className="p-4 font-bold">Estado (Clic para detalle)</th>
              </tr>
            </thead>
            <tbody>
              {datosPaginados.length > 0 ? (
                datosPaginados.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800">{a.fechaPrevista}</p>
                      <p className="text-[10px] text-gray-400">{a.lugarPrestacion}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800">{a.medico}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{a.especialidad}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                        <BedDouble size={16} className={a.diasInternacion > 0 ? "text-unahur" : "text-gray-300"} />
                        {a.diasInternacion} {a.diasInternacion === 1 ? 'día' : 'días'}
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleClicEstado(a)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-gray-100 text-gray-600 hover:bg-unahur hover:text-white transition-colors cursor-pointer shadow-sm"
                      >
                        {a.estado}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Calendar size={40} className="mb-2" />
                      <p className="text-sm font-medium">No se encontraron autorizaciones</p>
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
      {autorizacionVistaDetalle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={() => { setAutorizacionVistaDetalle(null); setTextoRespuesta(""); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">Detalle de Autorización</h3>
              <p className="text-xs text-gray-500 mt-1">
                Afiliado: <strong className="text-unahur">{activeProfile.nombre} {activeProfile.apellido}</strong>
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              
              {autorizacionVistaDetalle.estado === "Observado" && autorizacionVistaDetalle.mensajeObservacion && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Motivo de observación:</p>
                  <p className="text-sm text-amber-900">{autorizacionVistaDetalle.mensajeObservacion}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Médico</label>
                  <p className="font-medium text-gray-800">{autorizacionVistaDetalle.medico}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Especialidad</label>
                  <p className="font-medium text-gray-800">{autorizacionVistaDetalle.especialidad}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha Prevista</label>
                  <p className="font-medium text-gray-800">{autorizacionVistaDetalle.fechaPrevista}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Días de Internación</label>
                  <p className="font-medium text-unahur">{autorizacionVistaDetalle.diasInternacion}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lugar de Prestación</label>
                  <p className="font-medium text-gray-800">{autorizacionVistaDetalle.lugarPrestacion}</p>
                </div>
              </div>

              {autorizacionVistaDetalle.estado === "Observado" && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <label className="block text-[10px] font-bold text-unahur uppercase tracking-wider mb-2">Escriba su respuesta</label>
                  <textarea value={textoRespuesta} onChange={(e) => setTextoRespuesta(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[100px]" placeholder="Escriba aquí..."></textarea>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              {autorizacionVistaDetalle.estado === "Observado" ? (
                <>
                  <button onClick={() => setAutorizacionVistaDetalle(null)} className="px-4 py-2 text-gray-500 font-bold hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">Cancelar</button>
                  <button onClick={() => simularRespuestaObservacion(autorizacionVistaDetalle.id)} disabled={textoRespuesta.trim() === ""} className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 disabled:opacity-50">Enviar Respuesta</button>
                </>
              ) : (
                <button onClick={() => setAutorizacionVistaDetalle(null)} className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all">Cerrar</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔹 MODAL DE CARGA (Crear Y Editar "Recibidos") */}
      <ModalCargaAutorizacion 
        isOpen={isCargaModalOpen} 
        onClose={() => setIsCargaModalOpen(false)} 
        activeProfile={activeProfile} 
        autorizacionAEditar={autorizacionAEditar}
        onDelete={simularBorrado}
      />

    </div>
  );
}