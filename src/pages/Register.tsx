import { useEffect, useRef, useState } from "react";
import { User, Users, FileText, ChevronRight, Plus, Trash2, CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActivationWaitModal } from "../components/ActivationWaitModal";
import { api, type FamilyMember } from "../services/api";
import { fetchGeorefLocalities, fetchGeorefProvinces, type GeorefLocality, type GeorefProvince } from "../services/georefService";
import { validateBirthDate, validateDocument, validatePersonName } from "../utils/affiliateValidation";

// ── Validadores ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_RE = /^[\d\s+()-]{8,15}$/;

function todayDateInputValue() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateDDMMYYYY(value?: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return value || "";
  const [, yyyy, mm, dd] = match;
  return `${dd}/${mm}/${yyyy}`;
}

function validarArchivo(file: File | null): string | null {
  if (!file) return "Este documento es requerido.";
  const tiposValidos = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!tiposValidos.includes(file.type)) return "Solo se aceptan imágenes (JPG, PNG) o PDF.";
  if (file.size > 5 * 1024 * 1024) return "El archivo no puede superar los 5 MB.";
  return null;
}

type Step1Errors = {
  nombre?: string; apellido?: string; nroDocumento?: string;
  fechaNacimiento?: string; email?: string; telefono?: string;
};

type FieldRefKey =
  | keyof Step1Errors
  | keyof FamilyMember
  | "dni_document"
  | "payslip_document";

function validarPaso1(formData: {
  nombre: string; apellido: string; tipoDocumento: string;
  nroDocumento: string; fechaNacimiento: string; email: string; telefono: string;
}): Step1Errors {
  const errs: Step1Errors = {};
  const nombreErr = validatePersonName(formData.nombre, "nombre");
  if (nombreErr) errs.nombre = nombreErr;
  const apellidoErr = validatePersonName(formData.apellido, "apellido");
  if (apellidoErr) errs.apellido = apellidoErr;
  const docErr = validateDocument(formData.tipoDocumento, formData.nroDocumento);
  if (docErr) errs.nroDocumento = docErr;
  const fechaErr = validateBirthDate(formData.fechaNacimiento);
  if (fechaErr) errs.fechaNacimiento = fechaErr;
  if (!formData.email.trim()) errs.email = "El email es requerido.";
  else if (!EMAIL_RE.test(formData.email)) errs.email = "Ingresá un email válido.";
  if (!formData.telefono.trim()) errs.telefono = "El teléfono es requerido.";
  else if (!TELEFONO_RE.test(formData.telefono)) errs.telefono = "Ingresá un teléfono válido (8-15 dígitos).";
  return errs;
}

// ── Helpers de UI ──────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Datos personales", icon: User },
  { num: 2, label: "Grupo familiar", icon: Users },
  { num: 3, label: "Documentación", icon: FileText },
];

const PAISES = [
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Ecuador",
  "Paraguay",
  "Perú",
  "Uruguay",
  "Venezuela",
  "Alemania",
  "Canadá",
  "China",
  "España",
  "Estados Unidos",
  "Francia",
  "Italia",
  "Japón",
  "México",
  "Portugal",
  "Reino Unido",
  "Rusia",
  "Otro",
];

const inputBase =
  "w-full px-3.5 py-3 text-sm bg-gray-50 border rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none text-slate-700 placeholder:text-slate-300 disabled:opacity-50";
const inputOk = `${inputBase} border-gray-200 focus:ring-unahur`;
const inputErr = `${inputBase} border-red-300 bg-red-50/30 focus:ring-red-400`;

const labelClass = "block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5 font-medium">
      <AlertCircle size={12} className="flex-shrink-0" />{msg}
    </p>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingStep, setIsValidatingStep] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [provincias, setProvincias] = useState<GeorefProvince[]>([]);
  const [localidadesPorProvincia, setLocalidadesPorProvincia] = useState<Record<string, GeorefLocality[]>>({});
  const [loadingGeoref, setLoadingGeoref] = useState(true);
  const [loadingLocalidades, setLoadingLocalidades] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    idPlan: 1,
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
    pais: "Argentina",
    familiares: [] as FamilyMember[],
    dni_document: null as File | null,
    payslip_document: null as File | null,
  });

  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [fileErrors, setFileErrors] = useState<{ dni?: string; payslip?: string }>({});
  const [familiarErrors, setFamiliarErrors] = useState<{ nombre?: string; apellido?: string; nroDocumento?: string; fechaNacimiento?: string }>({});

  const nombreRef = useRef<HTMLInputElement>(null);
  const apellidoRef = useRef<HTMLInputElement>(null);
  const nroDocumentoRef = useRef<HTMLInputElement>(null);
  const fechaNacimientoRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const familyNombreRef = useRef<HTMLInputElement>(null);
  const familyApellidoRef = useRef<HTMLInputElement>(null);
  const familyNroDocumentoRef = useRef<HTMLInputElement>(null);
  const familyFechaNacimientoRef = useRef<HTMLInputElement>(null);
  const dniDocumentRef = useRef<HTMLLabelElement>(null);
  const payslipDocumentRef = useRef<HTMLLabelElement>(null);

  const [newFamilyMember, setNewFamilyMember] = useState<FamilyMember>({
    nombre: "", apellido: "", parentesco: "Hijo/a", nroDocumento: "", fechaNacimiento: "",
  });

  useEffect(() => {
    fetchGeorefProvinces()
      .then(setProvincias)
      .catch(() => setSubmitError("No se pudieron cargar las provincias."))
      .finally(() => setLoadingGeoref(false));
  }, []);

  const normalizeGeorefName = (value?: string) =>
    (value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLocaleLowerCase("es-AR");

  const getProvinciaId = (provinciaNombre?: string) =>
    provincias.find((p) => {
      const n = normalizeGeorefName(p.nombre);
      const s = normalizeGeorefName(provinciaNombre);
      return n === s || (p.id === "02" && ["caba", "ciudad de buenos aires", "capital federal"].includes(s));
    })?.id || "";

  const cargarLocalidades = async (provinciaId: string) => {
    if (!provinciaId || localidadesPorProvincia[provinciaId] || loadingLocalidades[provinciaId]) return;
    setLoadingLocalidades((prev) => ({ ...prev, [provinciaId]: true }));
    try {
      const locs = await fetchGeorefLocalities(provinciaId);
      setLocalidadesPorProvincia((prev) => ({ ...prev, [provinciaId]: locs }));
    } catch {
      setSubmitError("No se pudieron cargar las localidades.");
    } finally {
      setLoadingLocalidades((prev) => ({ ...prev, [provinciaId]: false }));
    }
  };

  const handleProvinceChange = (provinceId: string) => {
    const province = provincias.find((p) => p.id === provinceId);
    setFormData((prev) => ({ ...prev, provincia: province?.nombre || "", localidad: "" }));
    void cargarLocalidades(provinceId);
  };

  const focusField = (field: FieldRefKey | string) => {
    window.setTimeout(() => {
      if (field === "nombre") (nombreRef.current || familyNombreRef.current)?.focus();
      else if (field === "apellido") (apellidoRef.current || familyApellidoRef.current)?.focus();
      else if (field === "nroDocumento") (nroDocumentoRef.current || familyNroDocumentoRef.current)?.focus();
      else if (field === "fechaNacimiento") (fechaNacimientoRef.current || familyFechaNacimientoRef.current)?.focus();
      else if (field === "email") emailRef.current?.focus();
      else if (field === "telefono") telefonoRef.current?.focus();
      else if (field === "dni_document") dniDocumentRef.current?.focus();
      else if (field === "payslip_document") payslipDocumentRef.current?.focus();
    }, 0);
  };

  const firstErrorKey = <T extends Record<string, string | undefined>>(errors: T): keyof T | null =>
    (Object.keys(errors) as Array<keyof T>).find((key) => Boolean(errors[key])) ?? null;

  const validateCurrentFamilyMember = () => {
    const errs: typeof familiarErrors = {};
    const nombreErr = validatePersonName(newFamilyMember.nombre, "nombre");
    if (nombreErr) errs.nombre = nombreErr;
    const apellidoErr = validatePersonName(newFamilyMember.apellido, "apellido");
    if (apellidoErr) errs.apellido = apellidoErr;
    const docErr = validateDocument("DNI", newFamilyMember.nroDocumento);
    if (docErr) errs.nroDocumento = docErr;
    const fechaErr = validateBirthDate(newFamilyMember.fechaNacimiento || "");
    if (fechaErr) errs.fechaNacimiento = fechaErr;
    return errs;
  };

  const hasStartedFamilyMember = () =>
    Boolean(
      newFamilyMember.nombre.trim()
      || newFamilyMember.apellido.trim()
      || newFamilyMember.nroDocumento.trim()
      || (newFamilyMember.fechaNacimiento || "").trim()
    );

  const validateFamilyMemberDocumentAvailability = async (member: FamilyMember, currentMembers = formData.familiares) => {
    const candidateDocument = String(member.nroDocumento || "").trim();
    if (!candidateDocument) return null;

    if (candidateDocument === formData.nroDocumento.trim()) {
      return "El DNI del familiar no puede ser igual al del titular.";
    }

    if (currentMembers.some((loadedMember) => String(loadedMember.nroDocumento || "").trim() === candidateDocument)) {
      return "Este DNI ya está cargado en el grupo familiar.";
    }

    const validation = await api.validateAffiliateRegistration({
      step: 2,
      nroDocumento: formData.nroDocumento,
      tipoDocumento: formData.tipoDocumento,
      grupoFamiliar: [member],
    });

    return validation.errors.find((error) => error.field.includes("nroDocumento"))?.message ?? null;
  };

  const handleAddFamilyMember = async () => {
    setSubmitError(null);
    setIsValidatingStep(true);
    const errs = validateCurrentFamilyMember();
    if (Object.keys(errs).length > 0) {
      setFamiliarErrors(errs);
      focusField(firstErrorKey(errs) as FieldRefKey);
      setIsValidatingStep(false);
      return;
    }
    const member = {
      ...newFamilyMember,
      nombre: newFamilyMember.nombre.trim(),
      apellido: newFamilyMember.apellido.trim(),
      nombreCompleto: `${newFamilyMember.nombre.trim()} ${newFamilyMember.apellido.trim()}`,
      nroDocumento: newFamilyMember.nroDocumento.trim(),
    };

    try {
      const documentError = await validateFamilyMemberDocumentAvailability(member);
      if (documentError) {
        setFamiliarErrors({ nroDocumento: documentError });
        focusField("nroDocumento");
        return;
      }
    } catch (err: unknown) {
      setSubmitError((err as { message?: string }).message || "No se pudo validar el DNI del familiar.");
      return;
    } finally {
      setIsValidatingStep(false);
    }

    setFamiliarErrors({});
    setFormData({ ...formData, familiares: [...formData.familiares, member] });
    setNewFamilyMember({ nombre: "", apellido: "", parentesco: "Hijo/a", nroDocumento: "", fechaNacimiento: "" });
  };

  const removeFamilyMember = (index: number) => {
    const updated = [...formData.familiares];
    updated.splice(index, 1);
    setFormData({ ...formData, familiares: updated });
  };

  const handleNextStep1 = async () => {
    setSubmitError(null);
    const errs = validarPaso1(formData);
    if (Object.keys(errs).length > 0) {
      setStep1Errors(errs);
      focusField(firstErrorKey(errs) as FieldRefKey);
      return;
    }

    setIsValidatingStep(true);
    try {
      const validation = await api.validateAffiliateRegistration({
        step: 1,
        nroDocumento: formData.nroDocumento.trim(),
        tipoDocumento: formData.tipoDocumento,
        email: formData.email.trim(),
      });

      if (!validation.valid) {
        const nextErrors = validation.errors.reduce<Step1Errors>((acc, error) => {
          if (error.field === "nroDocumento" || error.field === "email") acc[error.field] = error.message;
          return acc;
        }, {});
        setStep1Errors(nextErrors);
        const field = firstErrorKey(nextErrors);
        if (field) focusField(field as FieldRefKey);
        return;
      }
    } catch (err: unknown) {
      setSubmitError((err as { message?: string }).message || "No se pudo validar la solicitud.");
      return;
    } finally {
      setIsValidatingStep(false);
    }

    setStep1Errors({});
    setStep(2);
  };

  const handleNextStep2 = async () => {
    setSubmitError(null);
    if (hasStartedFamilyMember()) {
      const errs = validateCurrentFamilyMember();
      if (Object.keys(errs).length > 0) {
        setFamiliarErrors(errs);
        focusField(firstErrorKey(errs) as FieldRefKey);
        return;
      }

      setIsValidatingStep(true);
      try {
        const documentError = await validateFamilyMemberDocumentAvailability(newFamilyMember);
        if (documentError) {
          setFamiliarErrors({ nroDocumento: documentError });
          focusField("nroDocumento");
          return;
        }
      } catch (err: unknown) {
        setSubmitError((err as { message?: string }).message || "No se pudo validar el DNI del familiar.");
        return;
      } finally {
        setIsValidatingStep(false);
      }

      setSubmitError("Agregá el integrante al grupo familiar o borrá esos datos antes de continuar.");
      focusField("nombre");
      return;
    }

    setIsValidatingStep(true);
    try {
      const validation = await api.validateAffiliateRegistration({
        step: 2,
        nroDocumento: formData.nroDocumento,
        tipoDocumento: formData.tipoDocumento,
        grupoFamiliar: formData.familiares,
      });
      const documentError = validation.errors.find((error) => error.field.includes("nroDocumento"));
      if (documentError) {
        setSubmitError(documentError.message);
        focusField("nroDocumento");
        return;
      }
    } catch (err: unknown) {
      setSubmitError((err as { message?: string }).message || "No se pudo validar el grupo familiar.");
      return;
    } finally {
      setIsValidatingStep(false);
    }

    setFamiliarErrors({});
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dniErr = validarArchivo(formData.dni_document);
    const payErr = validarArchivo(formData.payslip_document);
    if (dniErr || payErr) {
      setFileErrors({ dni: dniErr ?? undefined, payslip: payErr ?? undefined });
      focusField(dniErr ? "dni_document" : "payslip_document");
      return;
    }
    setFileErrors({});
    setIsLoading(true);
    setSubmitError(null);
    try {
      const validation = await api.validateAffiliateRegistration({
        step: "all",
        nroDocumento: formData.nroDocumento.trim(),
        tipoDocumento: formData.tipoDocumento,
        email: formData.email.trim(),
        grupoFamiliar: formData.familiares,
      });

      if (!validation.valid) {
        const holderErrors = validation.errors.reduce<Step1Errors>((acc, error) => {
          if (error.field === "nroDocumento" || error.field === "email") acc[error.field] = error.message;
          return acc;
        }, {});
        const holderField = firstErrorKey(holderErrors);
        if (holderField) {
          setStep1Errors(holderErrors);
          setStep(1);
          focusField(holderField as FieldRefKey);
          return;
        }

        const familyError = validation.errors.find((error) => error.field.includes("grupoFamiliar"));
        if (familyError) {
          setSubmitError(familyError.message);
          setStep(2);
          focusField("nroDocumento");
          return;
        }
      }

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
    } catch (err: unknown) {
      const apiError = err as { message?: string; field?: string; errors?: Array<{ field: string; message: string }> };
      const fieldError = apiError.errors?.[0] ?? (apiError.field && apiError.message ? { field: apiError.field, message: apiError.message } : null);
      if (fieldError?.field === "nroDocumento" || fieldError?.field === "email") {
        setStep1Errors({ [fieldError.field]: fieldError.message });
        setStep(1);
        focusField(fieldError.field);
        return;
      }
      setSubmitError(apiError.message || "Hubo un error al procesar tu afiliación. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const provinciaId = getProvinciaId(formData.provincia);
  const localidades = localidadesPorProvincia[provinciaId] || [];
  const cargandoLocalidades = Boolean(loadingLocalidades[provinciaId]);

  const clearStep1Error = (field: keyof Step1Errors) =>
    setStep1Errors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  return (
    <div className="w-screen min-h-screen flex overflow-hidden">

      {/* Panel izquierdo */}
      <div className="hidden lg:flex w-[40%] flex-shrink-0 flex-col justify-between bg-gradient-to-b from-green-50 to-slate-100 p-10 border-r border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-green-100">
            <img src="/logo.png" alt="OSDU" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 leading-tight">OSDU</p>
            <p className="text-xs text-slate-400 leading-tight">Obra Social de Universitarios</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-unahur uppercase tracking-widest mb-3">Nueva afiliación</p>
            <h2 className="text-3xl font-black text-slate-800 leading-snug">
              Unite a la<br />comunidad<br /><span className="text-unahur">OSDU.</span>
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mt-3">
              Completá el formulario en 3 pasos simples y accedé a todos los beneficios de tu obra social.
            </p>
          </div>

          <div className="space-y-3">
            {STEPS.map(({ num, label, icon: Icon }) => (
              <div
                key={num}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${step === num ? "bg-unahur/10 border border-unahur/20" : step > num ? "opacity-60" : "opacity-40"}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black ${step === num ? "bg-unahur text-white" : step > num ? "bg-green-200 text-unahur" : "bg-slate-200 text-slate-500"}`}>
                  {step > num ? <CheckCircle2 size={16} /> : num}
                </div>
                <p className={`text-sm font-semibold flex-1 ${step === num ? "text-slate-800" : "text-slate-500"}`}>{label}</p>
                <Icon size={14} className={step === num ? "text-unahur" : "text-slate-400"} />
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          ¿Ya tenés cuenta?{" "}
          <button onClick={() => navigate("/login/afiliado")} className="text-unahur font-semibold hover:underline">
            Iniciá sesión
          </button>
        </p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <button
            onClick={() => navigate("/welcome")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Inicio
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            {STEPS.map(({ num }) => (
              <div key={num} className={`h-2 w-8 rounded-full transition-all ${step >= num ? "bg-unahur" : "bg-gray-200"}`} />
            ))}
          </div>
          <button
            onClick={() => navigate("/login/afiliado")}
            className="text-xs font-semibold text-unahur border border-green-200 hover:bg-green-50 px-4 py-2 rounded-xl transition-colors"
          >
            Ya tengo cuenta
          </button>
        </div>

        {/* Formulario */}
        <div className="flex-1 flex items-start justify-center px-6 py-10">
          <div className="w-full max-w-lg">

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-unahur rounded-xl flex items-center justify-center text-white text-sm font-black">{step}</div>
                <p className="text-xs font-bold text-unahur uppercase tracking-widest">Paso {step} de 3</p>
              </div>
              <h1 className="text-2xl font-black text-slate-800">
                {step === 1 ? "Datos personales" : step === 2 ? "Grupo familiar" : "Documentación"}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {step === 1
                  ? "Completá tus datos para crear tu solicitud de afiliación."
                  : step === 2
                  ? "Agregá integrantes de tu grupo familiar. Este paso es opcional."
                  : "Adjuntá los documentos requeridos para completar tu solicitud."}
              </p>
            </div>

            {submitError && (
              <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                <AlertCircle size={16} className="flex-shrink-0" />{submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* ── Paso 1 ── */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nombre</label>
                      <input
                        ref={nombreRef}
                        type="text" value={formData.nombre}
                        onChange={(e) => { setFormData({ ...formData, nombre: e.target.value }); clearStep1Error("nombre"); }}
                        className={step1Errors.nombre ? inputErr : inputOk}
                        placeholder="Juan"
                      />
                      <FieldError msg={step1Errors.nombre} />
                    </div>
                    <div>
                      <label className={labelClass}>Apellido</label>
                      <input
                        ref={apellidoRef}
                        type="text" value={formData.apellido}
                        onChange={(e) => { setFormData({ ...formData, apellido: e.target.value }); clearStep1Error("apellido"); }}
                        className={step1Errors.apellido ? inputErr : inputOk}
                        placeholder="Pérez"
                      />
                      <FieldError msg={step1Errors.apellido} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Tipo de documento</label>
                      <select
                        value={formData.tipoDocumento}
                        onChange={(e) => { setFormData({ ...formData, tipoDocumento: e.target.value, nroDocumento: "" }); clearStep1Error("nroDocumento"); }}
                        className={inputOk}
                      >
                        <option>DNI</option>
                        <option>Pasaporte</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Número</label>
                      <input
                        ref={nroDocumentoRef}
                        type="text" value={formData.nroDocumento}
                        onChange={(e) => { setFormData({ ...formData, nroDocumento: e.target.value }); clearStep1Error("nroDocumento"); }}
                        className={step1Errors.nroDocumento ? inputErr : inputOk}
                        placeholder={formData.tipoDocumento === "DNI" ? "12345678" : "AAB123456"}
                      />
                      <FieldError msg={step1Errors.nroDocumento} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Fecha de nacimiento</label>
                      <input
                        ref={fechaNacimientoRef}
                        type="date" value={formData.fechaNacimiento}
                        onChange={(e) => { setFormData({ ...formData, fechaNacimiento: e.target.value }); clearStep1Error("fechaNacimiento"); }}
                        className={step1Errors.fechaNacimiento ? inputErr : inputOk}
                        max={todayDateInputValue()}
                      />
                      <FieldError msg={step1Errors.fechaNacimiento} />
                    </div>
                    <div>
                      <label className={labelClass}>Plan de salud</label>
                      <select
                        value={formData.idPlan}
                        onChange={(e) => setFormData({ ...formData, idPlan: parseInt(e.target.value) })}
                        className={inputOk}
                      >
                        <option value={1}>BRONCE</option>
                        <option value={2}>PLATA</option>
                        <option value={3}>ORO</option>
                        <option value={4}>PLATINO</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Correo electrónico</label>
                    <input
                      ref={emailRef}
                      type="email" value={formData.email}
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value }); clearStep1Error("email"); }}
                      className={step1Errors.email ? inputErr : inputOk}
                      placeholder="juan@ejemplo.com"
                    />
                    <FieldError msg={step1Errors.email} />
                  </div>

                  <div>
                    <label className={labelClass}>Teléfono</label>
                    <input
                      ref={telefonoRef}
                      type="tel" value={formData.telefono}
                      onChange={(e) => { setFormData({ ...formData, telefono: e.target.value }); clearStep1Error("telefono"); }}
                      className={step1Errors.telefono ? inputErr : inputOk}
                      placeholder="2324123456"
                    />
                    <FieldError msg={step1Errors.telefono} />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Dirección <span className="font-normal text-slate-300">(Opcional)</span>
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Calle y altura</label>
                        <input
                          type="text" value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                          className={inputOk} placeholder="Calle Falsa 123"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Provincia</label>
                          <select
                            value={provinciaId}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            disabled={loadingGeoref}
                            className={inputOk}
                          >
                            <option value="">{loadingGeoref ? "Cargando..." : "Seleccionar"}</option>
                            {provincias.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Localidad</label>
                          <select
                            value={formData.localidad}
                            onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                            disabled={!provinciaId || cargandoLocalidades}
                            className={inputOk}
                          >
                            <option value="">
                              {!provinciaId ? "Elegí provincia" : cargandoLocalidades ? "Cargando..." : "Seleccionar"}
                            </option>
                            {localidades.map((l) => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Código postal</label>
                          <input
                            type="text" value={formData.codigoPostal}
                            onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                            className={inputOk} placeholder="1686"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>País</label>
                          <select
                            value={formData.pais}
                            onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                            className={inputOk}
                          >
                            {PAISES.map((pais) => (
                              <option key={pais} value={pais}>{pais}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep1}
                    disabled={isValidatingStep}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-unahur text-white rounded-xl font-bold text-sm shadow-lg shadow-unahur/20 hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidatingStep ? "Validando..." : <>Siguiente paso <ChevronRight size={18} /></>}
                  </button>
                </div>
              )}

              {/* ── Paso 2 ── */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

                  {formData.familiares.length > 0 && (
                    <div className="space-y-2">
                      {formData.familiares.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{member.nombre} {member.apellido}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {member.parentesco} · DNI {member.nroDocumento} · Nac. {formatDateDDMMYYYY(member.fechaNacimiento)}
                            </p>
                          </div>
                          <button type="button" onClick={() => removeFamilyMember(index)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

	                  <div className="p-5 bg-unahur/5 rounded-2xl border-2 border-dashed border-unahur/20 space-y-3">
	                    <p className="text-xs font-bold text-unahur uppercase tracking-wide">Agregar integrante</p>
	                    <div className="grid grid-cols-2 gap-3">
	                      <div>
	                        <input
                            ref={familyNombreRef}
	                          type="text" value={newFamilyMember.nombre}
	                          onChange={(e) => { setNewFamilyMember({ ...newFamilyMember, nombre: e.target.value }); setFamiliarErrors((p) => ({ ...p, nombre: undefined })); }}
	                          className={familiarErrors.nombre ? inputErr : inputOk}
	                          placeholder="Nombre"
	                        />
	                        <FieldError msg={familiarErrors.nombre} />
	                      </div>
	                      <div>
	                        <input
                            ref={familyApellidoRef}
	                          type="text" value={newFamilyMember.apellido}
	                          onChange={(e) => { setNewFamilyMember({ ...newFamilyMember, apellido: e.target.value }); setFamiliarErrors((p) => ({ ...p, apellido: undefined })); }}
	                          className={familiarErrors.apellido ? inputErr : inputOk}
	                          placeholder="Apellido"
	                        />
	                        <FieldError msg={familiarErrors.apellido} />
	                      </div>
	                    </div>
	                    <div className="grid grid-cols-2 gap-3">
	                      <div>
	                        <input
                            ref={familyNroDocumentoRef}
	                          type="text" value={newFamilyMember.nroDocumento}
                          onChange={(e) => { setNewFamilyMember({ ...newFamilyMember, nroDocumento: e.target.value }); setFamiliarErrors((p) => ({ ...p, nroDocumento: undefined })); }}
                          className={familiarErrors.nroDocumento ? inputErr : inputOk}
                          placeholder="DNI (sin puntos)"
                        />
                        <FieldError msg={familiarErrors.nroDocumento} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newFamilyMember.parentesco}
                        onChange={(e) => setNewFamilyMember({ ...newFamilyMember, parentesco: e.target.value })}
                        className={inputOk}
                      >
                        <option>Hijo/a</option>
                        <option>Cónyuge</option>
                        <option>Padre/Madre</option>
                        <option>Otro</option>
                      </select>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-500">
                          Fecha de nacimiento
                        </label>
                        <input
                          ref={familyFechaNacimientoRef}
                          type="date"
                          value={newFamilyMember.fechaNacimiento || ""}
                          onChange={(e) => {
                            setNewFamilyMember({ ...newFamilyMember, fechaNacimiento: e.target.value });
                            setFamiliarErrors((p) => ({ ...p, fechaNacimiento: undefined }));
                          }}
                          className={familiarErrors.fechaNacimiento ? inputErr : inputOk}
                          max={todayDateInputValue()}
                        />
                        <FieldError msg={familiarErrors.fechaNacimiento} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddFamilyMember}
                        disabled={isValidatingStep}
                        className="px-4 py-3 bg-unahur text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-1.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} /> {isValidatingStep ? "Validando..." : "Agregar"}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                      Volver
                    </button>
                    <button type="button" onClick={handleNextStep2} disabled={isValidatingStep} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-unahur text-white rounded-xl font-bold text-sm shadow-lg shadow-unahur/20 hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {isValidatingStep ? "Validando..." : <>Siguiente paso <ChevronRight size={18} /></>}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Paso 3 ── */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

                  {[
                    { key: "dni_document" as const, errKey: "dni" as const, label: "Documento de identidad (DNI)", hint: "Frente y dorso · JPG, PNG o PDF · Máx. 5 MB" },
                    { key: "payslip_document" as const, errKey: "payslip" as const, label: "Recibo de sueldo / Monotributo", hint: "Último recibo · JPG, PNG o PDF · Máx. 5 MB" },
                  ].map(({ key, errKey, label, hint }) => (
                    <div key={key}>
                      <label className={labelClass}>{label}</label>
                      <label
                        ref={key === "dni_document" ? dniDocumentRef : payslipDocumentRef}
                        tabIndex={0}
                        className={`flex items-center gap-4 w-full px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all
                          ${fileErrors[errKey] ? "border-red-300 bg-red-50/30" : formData[key] ? "border-unahur/40 bg-unahur/5" : "border-slate-200 bg-gray-50 hover:border-unahur/30 hover:bg-unahur/5"}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${fileErrors[errKey] ? "bg-red-100 text-red-400" : formData[key] ? "bg-unahur/10 text-unahur" : "bg-slate-100 text-slate-400"}`}>
                          {fileErrors[errKey] ? <AlertCircle size={20} /> : formData[key] ? <CheckCircle2 size={20} /> : <Upload size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${fileErrors[errKey] ? "text-red-500" : formData[key] ? "text-unahur" : "text-slate-500"}`}>
                            {formData[key] ? formData[key]!.name : "Seleccionar archivo"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
                        </div>
                        <input
                          type="file" accept="image/*,.pdf" className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setFormData({ ...formData, [key]: file });
                            setFileErrors((p) => ({ ...p, [errKey]: undefined }));
                          }}
                        />
                      </label>
                      <FieldError msg={fileErrors[errKey]} />
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(2)} className="w-1/3 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-unahur text-white rounded-xl font-bold text-sm shadow-lg shadow-unahur/20 hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Procesando..." : <><CheckCircle2 size={18} /> Finalizar solicitud</>}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <ActivationWaitModal isOpen={isModalOpen} onClose={() => navigate("/login")} />
    </div>
  );
}
