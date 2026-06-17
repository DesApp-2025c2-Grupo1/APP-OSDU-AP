import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { type Persona } from "../components/Layout";
import { DashboardFiltros, type FiltroEstado } from "../components/DashboardFiltros";
import { recetasApi, type RecetaAPI } from "../../../services/api";
import { parseDisplayDate } from "../../../utils/date";
import { Filter, Calendar, Download, ChevronLeft, ChevronRight, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

function descargarReceta(receta: RecetaAPI, afiliado: Persona) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Receta ${receta.nro}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2e7d32; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { font-size: 22px; font-weight: 900; color: #2e7d32; }
    .logo span { font-size: 11px; font-weight: normal; color: #666; display: block; }
    .nro { font-size: 13px; color: #666; text-align: right; }
    .nro strong { font-size: 16px; color: #111; display: block; }
    .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 700; margin-bottom: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; display: block; margin-bottom: 3px; }
    .field p { font-size: 14px; font-weight: 600; color: #111; }
    .med-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .med-name { font-size: 20px; font-weight: 900; color: #2e7d32; }
    .med-sub { font-size: 13px; color: #666; margin-top: 4px; }
    .qty { font-size: 32px; font-weight: 900; color: #2e7d32; }
    .qty span { font-size: 12px; color: #999; font-weight: normal; }
    .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 16px; font-size: 11px; color: #aaa; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">OSDU <span>Obra Social de Universitarios</span></div>
    <div class="nro">Receta Médica<strong>${receta.nro}</strong></div>
  </div>

  <div class="badge">✓ Aprobada</div>

  <div class="section">
    <div class="section-title">Paciente</div>
    <div class="grid">
      <div class="field"><label>Nombre y apellido</label><p>${afiliado.nombre} ${afiliado.apellido}</p></div>
      <div class="field"><label>Fecha de aprobación</label><p>${receta.fechaEstado || receta.fecha}</p></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Medicamento</div>
    <div class="med-box">
      <div class="med-name">${receta.medicamento}</div>
      <div class="med-sub">${receta.presentacion}</div>
    </div>
  </div>

  <div class="section">
    <div class="grid">
      <div class="field"><label>Cantidad</label><div class="qty">${receta.cantidad}<span> unidad(es)</span></div></div>
      <div class="field"><label>Fecha de solicitud</label><p>${receta.fecha}</p></div>
    </div>
  </div>

  ${receta.observaciones ? `<div class="section"><div class="section-title">Observaciones</div><p style="font-size:13px;color:#555">${receta.observaciones}</p></div>` : ""}

  <div class="footer">
    <span>OSDU — Obra Social de Universitarios</span>
    <span>Nro. ${receta.nro} · Impreso el ${new Date().toLocaleDateString("es-AR")}</span>
  </div>
</body>
</html>`;

  const ventana = window.open("", "_blank", "width=800,height=600");
  if (!ventana) return;
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 400);
}

export function Recetas() {
  const { activeProfile } = useOutletContext<{ activeProfile: Persona }>();
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState<FiltroEstado>("PENDIENTE");
  const [listaRecetas, setListaRecetas] = useState<RecetaAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [recetaVistaDetalle, setRecetaVistaDetalle] = useState<RecetaAPI | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const ITEMS_POR_PAGINA = 5;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    recetasApi.getMisRecetas()
      .then((data) => { if (mounted) setListaRecetas(data); })
      .catch(() => { if (mounted) setError("No se pudieron cargar las recetas."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => { setPaginaActual(1); }, [filtro]);

  const obtenerDatosFiltrados = () => {
    const delUsuario = listaRecetas.filter(r => String(r.idIntegrante) === String(activeProfile.id));
    const limiteSemanas = new Date();
    limiteSemanas.setDate(limiteSemanas.getDate() - 7);
    limiteSemanas.setHours(0, 0, 0, 0);
    return delUsuario.filter(r => {
      if (filtro === "PENDIENTE") return r.estado === "Recibido" || r.estado === "En análisis";
      if (filtro === "OBSERVADA") return r.estado === "Observado";
      const fecha = parseDisplayDate(r.fechaEstado || r.fecha);
      if (!fecha) return false;
      if (filtro === "RECHAZADA") return r.estado === "Rechazado" && fecha >= limiteSemanas;
      if (filtro === "APROBADA")  return r.estado === "Aprobado"  && fecha >= limiteSemanas;
      return false;
    });
  };

  const datosFiltrados = obtenerDatosFiltrados();
  const totalPaginas = Math.ceil(datosFiltrados.length / ITEMS_POR_PAGINA);
  const indexInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const datosPaginados = datosFiltrados.slice(indexInicio, indexInicio + ITEMS_POR_PAGINA);

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

  const estadoColor = (estado: string) =>
    estado === "Aprobado"   ? "bg-green-50 text-green-600" :
    estado === "Rechazado"  ? "bg-red-50 text-red-500" :
    estado === "Observado"  ? "bg-amber-50 text-amber-600" :
    "bg-gray-100 text-gray-600";

  return (
    <div className="animate-in fade-in duration-500 relative">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate("/")} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex-shrink-0">
            <ArrowLeft size={16} className="text-gray-500" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-tight">
              Mis <span className="text-unahur font-black">Recetas</span>
            </h1>
            <p className="text-gray-500 text-xs truncate">
              Recetas de: <span className="text-unahur font-bold">{activeProfile.nombre} {activeProfile.apellido}</span>
            </p>
          </div>
        </div>
      </div>

      <DashboardFiltros filtroActual={filtro} setFiltro={setFiltro} />

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-4">
        <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
          <Filter size={14} className="text-gray-400" />
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Listado de recetas
          </h2>
          {filtro === "APROBADA" && (
            <span className="ml-auto text-[10px] text-gray-400 flex items-center gap-1">
              <Download size={11} /> Descargables
            </span>
          )}
        </div>

        <div className="min-h-[280px]">
          {loading ? (
            <div className="flex items-center justify-center p-14 opacity-40">
              <p className="text-sm font-medium">Cargando recetas...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-14 text-red-500 opacity-60">
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : datosPaginados.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-14 opacity-30">
              <Calendar size={40} className="mb-2" />
              <p className="text-sm font-medium">No se encontraron recetas</p>
            </div>
          ) : (
            <>
              {/* Cards — mobile */}
              <div className="md:hidden divide-y divide-gray-50">
                {datosPaginados.map((r) => (
                  <div key={r.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{r.medicamento}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{r.presentacion}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${estadoColor(r.estado)}`}>
                        {r.estado}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{r.fecha} · <span className="font-bold text-gray-700">{r.cantidad} ud.</span></span>
                      {r.estado === "Aprobado" ? (
                        <button
                          onClick={() => descargarReceta(r, activeProfile)}
                          className="flex items-center gap-1.5 text-xs font-bold text-unahur hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <Download size={13} /> Descargar
                        </button>
                      ) : (
                        <button
                          onClick={() => setRecetaVistaDetalle(r)}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Ver detalle
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabla — desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 text-[10px] uppercase text-gray-400">
                      <th className="px-6 py-4 font-bold">Fecha</th>
                      <th className="px-6 py-4 font-bold">Medicamento</th>
                      <th className="px-6 py-4 font-bold">Cantidad</th>
                      <th className="px-6 py-4 font-bold">Estado</th>
                      <th className="px-6 py-4 font-bold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {datosPaginados.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{r.fecha}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-800">{r.medicamento}</p>
                          <p className="text-[10px] text-gray-400 uppercase">{r.presentacion}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                            {r.cantidad}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${estadoColor(r.estado)}`}>
                            {r.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {r.estado === "Aprobado" ? (
                            <button
                              onClick={() => descargarReceta(r, activeProfile)}
                              className="flex items-center gap-1.5 ml-auto text-xs font-bold text-unahur hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors border border-unahur/20"
                            >
                              <Download size={13} /> Descargar
                            </button>
                          ) : (
                            <button
                              onClick={() => setRecetaVistaDetalle(r)}
                              className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Ver detalle
                            </button>
                          )}
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
              <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="p-1.5 rounded-md border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white transition-colors"><ChevronLeft size={16} /></button>
              <span className="text-xs font-bold text-gray-600 px-1">Pág. {paginaActual}/{totalPaginas}</span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="p-1.5 rounded-md border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-white transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {recetaVistaDetalle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => { setRecetaVistaDetalle(null); setTextoRespuesta(""); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}>

            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Detalle de Receta</h3>
                <p className="text-xs text-gray-400">{recetaVistaDetalle.nro}</p>
              </div>
              <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl ${estadoColor(recetaVistaDetalle.estado)}`}>
                {recetaVistaDetalle.estado}
              </span>
            </div>

            <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
              {recetaVistaDetalle.estado === "Observado" && recetaVistaDetalle.mensajeObservacion && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                  <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Observación:</p>
                    <p className="text-sm text-amber-900">{recetaVistaDetalle.mensajeObservacion}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Medicamento</label>
                  <p className="font-semibold text-gray-800 text-sm">{recetaVistaDetalle.medicamento}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Presentación</label>
                  <p className="font-semibold text-gray-800 text-sm">{recetaVistaDetalle.presentacion}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cantidad</label>
                  <p className="font-bold text-unahur text-lg">{recetaVistaDetalle.cantidad}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha</label>
                  <p className="font-semibold text-gray-800 text-sm">{recetaVistaDetalle.fecha}</p>
                </div>
              </div>

              {recetaVistaDetalle.estado === "Observado" && (
                <div className="pt-3 border-t border-gray-100">
                  <label className="block text-[10px] font-bold text-unahur uppercase tracking-wider mb-2">Responder observación</label>
                  <textarea
                    value={textoRespuesta}
                    onChange={(e) => setTextoRespuesta(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-unahur outline-none min-h-[90px]"
                    placeholder="Escribá su respuesta..."
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              {recetaVistaDetalle.estado === "Observado" ? (
                <>
                  <button onClick={() => { setRecetaVistaDetalle(null); setTextoRespuesta(""); }} className="px-4 py-2 text-gray-500 font-bold hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-sm">Cancelar</button>
                  <button onClick={responderObservacion} disabled={!textoRespuesta.trim() || enviandoRespuesta}
                    className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    {enviandoRespuesta ? "Enviando..." : "Enviar Respuesta"}
                  </button>
                </>
              ) : (
                <button onClick={() => setRecetaVistaDetalle(null)} className="px-5 py-2 text-gray-500 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-all text-sm">Cerrar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
