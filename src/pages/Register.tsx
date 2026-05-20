import { useState } from "react";
import { User, Users, ChevronRight, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActivationWaitModal } from "../components/ActivationWaitModal";
import { api, type FamilyMember } from "../services/api";

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    plan_id: 1, // Default to BRONCE
    document_number: "",
    document_type: "DNI",
    birth_date: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
    family_members: [] as FamilyMember[],
    dni_document: null as File | null,
    payslip_document: null as File | null,
  });

  const [newFamilyMember, setNewFamilyMember] = useState<FamilyMember>({
    full_name: "",
    relationship: "Hijo/a",
    document_number: "",
  });

  const handleAddFamilyMember = () => {
    if (newFamilyMember.full_name && newFamilyMember.document_number) {
      setFormData({
        ...formData,
        family_members: [...formData.family_members, newFamilyMember],
      });
      setNewFamilyMember({ full_name: "", relationship: "Hijo/a", document_number: "" });
    }
  };

  const removeFamilyMember = (index: number) => {
    const updated = [...formData.family_members];
    updated.splice(index, 1);
    setFormData({ ...formData, family_members: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.registerAffiliate({
        plan_id: formData.plan_id,
        document_number: formData.document_number,
        document_type: formData.document_type,
        birth_date: formData.birth_date,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        postal_code: formData.postal_code || undefined,
        country: formData.country || undefined,
        family_group: formData.family_members,
        dni_document: formData.dni_document || undefined,
        payslip_document: formData.payslip_document || undefined,
      });
      setIsModalOpen(true);
    } catch (err: any) {
      if (err.message === "Registration failed") {
        // Intentar extraer mensaje detallado si el error viene de Joi
        setError("Los datos ingresados son inválidos. Por favor revisa los campos.");
      } else {
        setError("Hubo un error al procesar tu afiliación. Por favor intenta de nuevo.");
      }
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
            Completa tus datos para formar parte de la comunidad UNAHUR.
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
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
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
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                    placeholder="Ej: 12345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Salud</label>
                  <select
                    value={formData.plan_id}
                    onChange={(e) => setFormData({ ...formData, plan_id: parseInt(e.target.value) })}
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
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  placeholder="Juan"
                />
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                  placeholder="Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                      placeholder="Ej: Calle Falsa 123"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                      placeholder="Ej: Hurlingham"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Provincia</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                      placeholder="Ej: Bs As"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">C. Postal</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-unahur focus:border-transparent transition-all outline-none"
                      placeholder="1686"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">País</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                {formData.family_members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{member.full_name}</p>
                      <p className="text-sm text-gray-500">{member.relationship} • {member.document_number}</p>
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
                    value={newFamilyMember.full_name}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, full_name: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                    placeholder="Nombre del familiar"
                  />
                  <input
                    type="text"
                    value={newFamilyMember.document_number}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, document_number: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                    placeholder="DNI"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={newFamilyMember.relationship}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
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
