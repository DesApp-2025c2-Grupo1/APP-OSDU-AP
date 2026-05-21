import { useEffect, useState } from "react";
import { User, Users, ChevronRight, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActivationWaitModal } from "../components/ActivationWaitModal";
import { api, type FamilyMember } from "../services/api";
import { fetchGeorefLocalities, fetchGeorefProvinces, type GeorefLocality, type GeorefProvince } from "../services/georefService";

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provincias, setProvincias] = useState<GeorefProvince[]>([]);
  const [localidadesPorProvincia, setLocalidadesPorProvincia] = useState<Record<string, GeorefLocality[]>>({});
  const [loadingGeoref, setLoadingGeoref] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState<Record<string, boolean>>({});

  // Form State
  const [formData, setFormData] = useState({
    idPlan: 1, // Default to BRONCE
    nroDocumento: "",
    tipoDocumento: "DNI",
    fechaNacimiento: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    localidad: "",
    provincia: "",
    codigoPostal: "",
    pais: "",
    familiares: [] as FamilyMember[],
    dni_document: null as File | null,
    payslip_document: null as File | null,
  });

  const [newFamilyMember, setNewFamilyMember] = useState<FamilyMember>({
    nombreCompleto: "",
    parentesco: "Hijo/a",
    nroDocumento: "",
  });

  useEffect(() => {
    const cargarProvincias = async () => {
      try {
        setLoadingGeoref(true);
        const provinciasData = await fetchGeorefProvinces();
        setProvincias(provinciasData);
      } catch {
        setError("No se pudieron cargar las provincias. Intentá nuevamente.");
      } finally {
        setLoadingGeoref(false);
      }
    };

    cargarProvincias();
  }, []);

  const normalizeGeorefName = (value?: string) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLocaleLowerCase("es-AR");

  const getProvinciaId = (provinciaNombre?: string) =>
    provincias.find((provincia) => {
      const provinceName = normalizeGeorefName(provincia.nombre);
      const selectedName = normalizeGeorefName(provinciaNombre);

      return provinceName === selectedName
        || (provincia.id === "02" && ["caba", "ciudad de buenos aires", "capital federal"].includes(selectedName));
    })?.id || "";

  const cargarLocalidades = async (provinciaId: string) => {
    if (!provinciaId || localidadesPorProvincia[provinciaId] || loadingLocalidades[provinciaId]) return;

    setLoadingLocalidades((prev) => ({ ...prev, [provinciaId]: true }));
    try {
      const localidades = await fetchGeorefLocalities(provinciaId);
      setLocalidadesPorProvincia((prev) => ({ ...prev, [provinciaId]: localidades }));
    } catch {
      setError("No se pudieron cargar las localidades. Intentá nuevamente.");
    } finally {
      setLoadingLocalidades((prev) => ({ ...prev, [provinciaId]: false }));
    }
  };

  const handleProvinceChange = (provinceId: string) => {
    const province = provincias.find((item) => item.id === provinceId);
    setFormData((prev) => ({
      ...prev,
      provincia: province?.nombre || "",
      localidad: "",
    }));
    void cargarLocalidades(provinceId);
  };

  const handleAddFamilyMember = () => {
    if (newFamilyMember.nombreCompleto && newFamilyMember.nroDocumento) {
      setFormData({
        ...formData,
        familiares: [...formData.familiares, newFamilyMember],
      });
      setNewFamilyMember({ nombreCompleto: "", parentesco: "Hijo/a", nroDocumento: "" });
    }
  };

  const removeFamilyMember = (index: number) => {
    const updated = [...formData.familiares];
    updated.splice(index, 1);
    setFormData({ ...formData, familiares: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.registerAffiliate({
        idPlan: formData.idPlan,
        nroDocumento: formData.nroDocumento,
        tipoDocumento: formData.tipoDocumento,
        fechaNacimiento: formData.fechaNacimiento,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion || undefined,
        localidad: formData.localidad || undefined,
        provincia: formData.provincia || undefined,
        codigoPostal: formData.codigoPostal || undefined,
        pais: formData.pais || undefined,
        grupoFamiliar: formData.familiares,
        dni_document: formData.dni_document || undefined,
        payslip_document: formData.payslip_document || undefined,
      });
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.message || "Hubo un error al procesar tu afiliación. Por favor intenta de nuevo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-black text-gray-900">
            Solicitud de <span className="text-unahur">Afiliación</span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Completa tus datos para formar parte de la comunidad OSDU.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-unahur' : 'bg-gray-200'}`}></div>
          <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-unahur' : 'bg-gray-200'}`}></div>
          <div className={`h-2 w-16 rounded-full ${step >= 3 ? 'bg-unahur' : 'bg-gray-200'}`}></div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 text-lg font-bold text-gray-800 mb-4">
                <User className="text-unahur" size={24} />
                <h3>Datos Personales</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                  <select
                    value={formData.tipoDocumento}
                    onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  >
                    <option>DNI</option>
                    <option>Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input
                    type="text"
                    required
                    value={formData.nroDocumento}
                    onChange={(e) => setFormData({ ...formData, nroDocumento: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                    placeholder="Ej: 12345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Salud</label>
                  <select
                    value={formData.idPlan}
                    onChange={(e) => setFormData({ ...formData, idPlan: parseInt(e.target.value) })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  >
                    <option value={1}>BRONCE</option>
                    <option value={2}>PLATA</option>
                    <option value={3}>ORO</option>
                    <option value={4}>PLATINO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  placeholder="Juan"
                />
                <input
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  placeholder="Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="text"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  placeholder="Ej: 2324123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Dirección (Opcional)</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Calle y Altura</label>
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                      placeholder="Ej: Calle Falsa 123"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Provincia</label>
                    <select
                      value={getProvinciaId(formData.provincia)}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      disabled={loadingGeoref}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                    >
                      <option value="">{loadingGeoref ? "Cargando provincias..." : "Seleccionar provincia"}</option>
                      {provincias.map((provincia) => (
                        <option key={provincia.id} value={provincia.id}>
                          {provincia.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Localidad</label>
                    <select
                      value={formData.localidad}
                      onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                      disabled={!getProvinciaId(formData.provincia) || Boolean(loadingLocalidades[getProvinciaId(formData.provincia)])}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                    >
                      {(() => {
                        const provinciaId = getProvinciaId(formData.provincia);
                        const localidades = localidadesPorProvincia[provinciaId] || [];
                        const cargando = Boolean(loadingLocalidades[provinciaId]);
                        return (
                          <>
                            <option value="">
                              {!provinciaId
                                ? "Seleccione provincia"
                                : cargando
                                  ? "Cargando..."
                                  : "Seleccionar localidad"}
                            </option>
                            {localidades.map((localidad) => (
                              <option key={localidad.id} value={localidad.nombre}>
                                {localidad.nombre}
                              </option>
                            ))}
                          </>
                        );
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">C. Postal</label>
                    <input
                      type="text"
                      value={formData.codigoPostal}
                      onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                      placeholder="1686"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">País</label>
                    <input
                      type="text"
                      value={formData.pais}
                      onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                      placeholder="Argentina"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-unahur text-white rounded-2xl font-bold hover:bg-unahur-dark transition-all transform hover:-translate-y-1"
              >
                Siguiente Paso
                <ChevronRight size={20} />
              </button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 text-lg font-bold text-gray-800 mb-4">
                <Users className="text-unahur" size={24} />
                <h3>Grupo Familiar <span className="text-sm font-normal text-gray-400 ml-2">(Opcional)</span></h3>
              </div>

              {/* Added Members List */}
              <div className="space-y-3 mb-6">
                {formData.familiares.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{member.nombreCompleto}</p>
                      <p className="text-sm text-gray-500">{member.parentesco} • {member.nroDocumento}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-unahur/5 rounded-3xl border-2 border-dashed border-unahur/20 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newFamilyMember.nombreCompleto}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, nombreCompleto: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                    placeholder="Nombre del familiar"
                  />
                  <input
                    type="text"
                    value={newFamilyMember.nroDocumento}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, nroDocumento: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                    placeholder="DNI"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={newFamilyMember.parentesco}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, parentesco: e.target.value })}
                    className="flex-grow p-3 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                  >
                    <option>Hijo/a</option>
                    <option>Cónyuge</option>
                    <option>Padre/Madre</option>
                    <option>Otro</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddFamilyMember}
                    className="p-3 bg-unahur text-white rounded-xl hover:bg-unahur-dark transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-grow flex items-center justify-center gap-2 py-4 bg-unahur text-white rounded-2xl font-bold hover:bg-unahur-dark transition-all transform hover:-translate-y-1"
                >
                  Siguiente Paso
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 text-lg font-bold text-gray-800 mb-4">
                <Users className="text-unahur" size={24} />
                <h3>Documentación <span className="text-sm font-normal text-red-500 ml-2">(Obligatorio)</span></h3>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documento de Identidad (DNI)
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({ ...formData, dni_document: e.target.files[0] });
                      }
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recibo de Sueldo / Monotributo
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({ ...formData, payslip_document: e.target.files[0] });
                      }
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.dni_document || !formData.payslip_document}
                  className="flex-grow py-4 bg-unahur text-white rounded-2xl font-bold hover:bg-unahur-dark shadow-lg shadow-unahur/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Procesando..." : (
                    <>
                      <CheckCircle2 size={20} />
                      Finalizar Solicitud
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <ActivationWaitModal
        isOpen={isModalOpen}
        onClose={() => navigate("/login")}
      />
    </div>
  );
}
