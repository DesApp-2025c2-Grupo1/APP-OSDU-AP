import { useState, useEffect } from "react";
import { UserCheck, UserX, Search, Loader2, AlertCircle } from "lucide-react";
import { api, type Affiliate } from "../../../services/api";

export function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ status?: boolean }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAffiliates = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAffiliates(filter.status);
      setAffiliates(data);
    } catch (err) {
      setError("No se pudieron cargar los afiliados.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, [filter]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      if (currentStatus) {
        await api.deactivateAffiliate(id);
      } else {
        await api.activateAffiliate(id);
      }
      await fetchAffiliates();
    } catch (err) {
      alert("Error al cambiar el estado del afiliado.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Gestión de <span className="text-unahur">Afiliados</span>
          </h1>
          <p className="text-gray-500">Administra y valida los nuevos ingresos al portal.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setFilter({})}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!filter.hasOwnProperty('status') ? 'bg-unahur text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter({ status: true })}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter.status === true ? 'bg-unahur text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilter({ status: false })}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter.status === false ? 'bg-unahur text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Pendientes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-4">
            <Loader2 className="animate-spin text-unahur" size={40} />
            <p className="font-medium">Cargando afiliados...</p>
          </div>
        ) : error ? (
          <div className="p-20 flex flex-col items-center justify-center text-red-400 gap-4">
            <AlertCircle size={40} />
            <p className="font-medium">{error}</p>
          </div>
        ) : affiliates.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-4">
            <Search size={40} />
            <p className="font-medium">No se encontraron afiliados con estos criterios.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Afiliado</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Credencial / Plan</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Documento</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-6">
                    <p className="font-bold text-gray-900">{affiliate.first_name + " " + affiliate.last_name || "Sin Nombre"}</p>
                    <p className="text-sm text-gray-400">{affiliate.email || "Sin Email"}</p>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-sm font-bold text-unahur">{affiliate.credencial_number}</p>
                    <p className="text-xs font-medium text-gray-400">{affiliate.plan_type || "Sin Plan"}</p>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-sm font-semibold text-gray-600">{affiliate.document_type + " " + affiliate.document_number}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${affiliate.status ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {affiliate.status ? 'Activo' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button
                      onClick={() => handleToggleStatus(affiliate.id, affiliate.status)}
                      disabled={processingId === affiliate.id}
                      className={`p-3 rounded-2xl transition-all active:scale-95 ${affiliate.status ? 'bg-orange-50 text-orange-500 hover:bg-orange-100' : 'bg-unahur/10 text-unahur hover:bg-unahur/20'} ${processingId === affiliate.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={affiliate.status ? "Desactivar" : "Activar"}
                    >
                      {processingId === affiliate.id ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : affiliate.status ? (
                        <UserX size={20} />
                      ) : (
                        <UserCheck size={20} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
