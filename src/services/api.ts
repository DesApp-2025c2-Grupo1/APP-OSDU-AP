const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:9002";

// Wrapper local de fetch para inyectar los roles válidos para este portal en los headers
const customFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const headers = new Headers(init?.headers);
  headers.set("X-Session-Allowed-Roles", "AFILIADO,PRESTADOR");
  return window.fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
    headers,
  });
};
const fetch = customFetch;


export interface PrestadorProfile {
  cuitCuil: string;
  nombreCompleto: string;
  tipoPrestador: string;
  estado: string;
  telefonos?: string[];
  mails?: string[];
  emailPrincipal?: string;
  telefonoPrincipal?: string;
  especialidades?: Array<{ id: number; nombre: string }>;
  lugaresAtencion?: Array<{
    idLugar?: number;
    calle?: string;
    localidad?: string;
    provincia?: string;
    cp?: string;
  }>;
  centroMedico?: {
    cuitCuil?: string;
    nombreCompleto?: string;
  } | null;
  cuenta?: {
    email?: string;
    rol?: string;
    debeCambiarPassword?: boolean;
    credencialesEnviadasAt?: string | null;
    passwordReseteadaAt?: string | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AffiliateData {
  idPlan: number;
  nroDocumento: string;
  tipoDocumento: string;
  fechaNacimiento: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  pais?: string;
  grupoFamiliar?: FamilyMember[];
  dni_document?: File;
  payslip_document?: File;
}

export interface Affiliate extends AffiliateData {
  id: string;
  credencial: string;
  activo: boolean;
  plan?: { nombre?: string };
}

export interface FamilyMember {
  nombreCompleto: string;
  parentesco: string;
  nroDocumento: string;
}

export interface TurnoAPI {
  id: number;
  fecha: string;
  horaIni: string;
  horaFin: string;
  estado: string;
  motivo: string | null;
  nota: string | null;
  motivoCancelacion: string | null;
  prestador: { nombre: string | null; especialidad: string | null };
  lugar: { direccion: string | null; localidad: string | null };
}

export interface AgendaAPI {
  id: string;
  prestador: string;
  especialidad: string;
  idEspecialidad: number;
  lugar: string;
  duracion: number;
  dias: number[];
  bloques: Array<{ dias: number[]; desde: string; hasta: string }>;
}

export interface EspecialidadAPI {
  id: number;
  nombre: string;
}

export interface SlotDisponible {
  horaIni: string;
  horaFin: string;
}

export interface ReintegroAPI {
  id: number;
  nro: string;
  idIntegrante: string;
  fechaPrestacion: string;
  medico: string;
  especialidad: string;
  lugarAtencion: string;
  factura: { cuit: string; valorTotal: number };
  formaPago: string;
  cbu: string | null;
  observaciones: string;
  estado: string;
  fechaEstado: string;
  mensajeObservacion: string | null;
}

export interface RecetaAPI {
  id: number;
  nro: string;
  idIntegrante: string;
  medicamento: string;
  presentacion: string;
  cantidad: number;
  fecha: string;
  observaciones: string;
  estado: string;
  fechaEstado: string;
  mensajeObservacion: string | null;
}

export interface SubmitRecetaBody {
  affiliateId?: string | number;
  medicamento: string;
  presentacion: string;
  cantidad: number;
  fecha: string;
  observaciones?: string;
}

export interface AutorizacionAPI {
  id: number;
  nro: string;
  idIntegrante: string;
  fechaPrevista: string;
  subtipo: string | null;
  especialidad: string;
  medico: string;
  lugarPrestacion: string;
  diasInternacion: number;
  observaciones: string;
  estado: string;
  estadoRaw: string;
  fechaEstado: string;
  mensajeObservacion: string | null;
  motivoEstado: string | null;
  respuestaAfiliado: string | null;
  adjuntoNombre: string | null;
  adjuntoRuta: string | null;
}

export interface SubmitReintegroBody {
  affiliateId?: string | number;
  fechaPrestacion: string;
  medico: string;
  especialidad: string;
  lugarAtencion: string;
  facturaCuit: string;
  facturaValor: number;
  formaPago: string;
  cbu?: string;
  observaciones?: string;
}

export interface CartillaLugar {
  calle: string;
  localidad: string;
  provincia: string;
  horarios: string[];
}

export interface CartillaPrestadorAPI {
  id: number;
  nombreCompleto: string;
  tipoPrestador: 'profesional' | 'centro_medico';
  telefono: string;
  especialidades: string[];
  lugaresAtencion: CartillaLugar[];
}

export const cartillaApi = {
  buscar: async (params: {
    especialidad?: string;
    localidad?: string;
    tipoPrestador?: string;
    page?: number;
    limit?: number;
  }): Promise<CartillaPrestadorAPI[]> => {
    const url = new URL(`${API_BASE_URL}/prestadores/cartilla`);
    if (params.especialidad) url.searchParams.set("especialidad", params.especialidad);
    if (params.localidad) url.searchParams.set("localidad", params.localidad);
    if (params.tipoPrestador) url.searchParams.set("tipoPrestador", params.tipoPrestador);
    if (params.page !== undefined) url.searchParams.set("page", String(params.page));
    if (params.limit !== undefined) url.searchParams.set("limit", String(params.limit));
    const response = await fetch(url.toString(), { credentials: "include" });
    if (!response.ok) throw new Error("Error al buscar en la cartilla");
    return response.json();
  },
};

export const reintegrosApi = {
  getMisReintegros: async (): Promise<ReintegroAPI[]> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/reintegros`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error al obtener los reintegros");
    return response.json();
  },

  submitReintegro: async (body: SubmitReintegroBody): Promise<ReintegroAPI> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/reintegros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Error al enviar el reintegro");
    }
    return response.json();
  },

  responderObservacion: async (id: string | number, respuesta: string): Promise<ReintegroAPI> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/reintegros/${id}/respuesta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respuesta }),
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Error al enviar la respuesta");
    }
    return response.json();
  },
};

export const recetasApi = {
  getMisRecetas: async (): Promise<RecetaAPI[]> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/recetas`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error al obtener las recetas");
    return response.json();
  },

  submitReceta: async (body: SubmitRecetaBody): Promise<RecetaAPI> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/recetas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Error al enviar la receta");
    }
    return response.json();
  },

  responderObservacion: async (id: string | number, respuesta: string): Promise<RecetaAPI> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/recetas/${id}/respuesta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respuesta }),
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Error al enviar la respuesta");
    }
    return response.json();
  },
};

export const autorizacionesApi = {
  getMisAutorizaciones: async (): Promise<AutorizacionAPI[]> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/autorizaciones`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error al obtener las autorizaciones");
    return response.json();
  },

  submitAutorizacion: async (data: {
    affiliateId?: string | number;
    fechaPrevista: string;
    subtipo: string;
    especialidad: string;
    medico: string;
    lugarPrestacion: string;
    diasInternacion?: number;
    observaciones?: string;
    orden?: File | null;
  }): Promise<AutorizacionAPI> => {
    const fd = new FormData();
    if (data.affiliateId !== undefined) fd.append("affiliateId", String(data.affiliateId));
    fd.append("fechaPrevista", data.fechaPrevista);
    fd.append("subtipo", data.subtipo);
    fd.append("especialidad", data.especialidad);
    fd.append("medico", data.medico);
    fd.append("lugarPrestacion", data.lugarPrestacion);
    if (data.diasInternacion !== undefined) fd.append("diasInternacion", String(data.diasInternacion));
    if (data.observaciones) fd.append("observaciones", data.observaciones);
    if (data.orden) fd.append("orden", data.orden);

    const response = await fetch(`${API_BASE_URL}/affiliates/autorizaciones`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Error al enviar la autorización");
    }
    return response.json();
  },

  responderObservacion: async (id: string | number, respuesta: string): Promise<AutorizacionAPI> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/autorizaciones/${id}/respuesta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respuesta }),
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Error al enviar la respuesta");
    }
    return response.json();
  },
};

export const turnosApi = {
  getMisTurnos: async (afiliadoId?: string): Promise<TurnoAPI[]> => {
    const url = new URL(`${API_BASE_URL}/affiliates/turnos`);
    if (afiliadoId) url.searchParams.set("afiliadoId", afiliadoId);
    const response = await fetch(url.toString(), { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener turnos");
    return response.json();
  },

  getTurnosDisponibles: async (agendaId: string, fecha: string): Promise<SlotDisponible[]> => {
    const url = new URL(`${API_BASE_URL}/affiliates/turnos/disponibles`);
    url.searchParams.set("agendaId", agendaId);
    url.searchParams.set("fecha", fecha);
    const response = await fetch(url.toString(), { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener horarios disponibles");
    return response.json();
  },

  reservarTurno: async (body: {
    agendaId: string;
    fecha: string;
    horaIni: string;
    horaFin: string;
    motivo: string;
    afiliadoId?: string;
  }): Promise<TurnoAPI> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/turnos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message ?? "Error al reservar el turno");
    }
    return response.json();
  },

  cancelarTurno: async (id: string, motivo: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/turnos/${id}/cancelar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message ?? "Error al cancelar el turno");
    }
  },

  getAgendas: async (idEspecialidad?: number): Promise<AgendaAPI[]> => {
    const url = new URL(`${API_BASE_URL}/agendas`);
    if (idEspecialidad) url.searchParams.set("idEspecialidad", String(idEspecialidad));
    const response = await fetch(url.toString(), { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener agendas");
    return response.json();
  },

  getEspecialidades: async (): Promise<EspecialidadAPI[]> => {
    const response = await fetch(`${API_BASE_URL}/specialties`, { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener especialidades");
    return response.json();
  },
};

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", //para que se envie la cookie
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Login failed");
    }
    return response.json();
  },

  loginPrestador: async (cuit: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/prestadores/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cuit, password }),
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Login failed");
    }
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Logout failed");
    return response.json();
  },

  getSession: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("No active session");
    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: "include",
    });
    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      const err = contentType.includes("application/json")
        ? await response.json().catch(() => ({}))
        : { message: await response.text().catch(() => "") };
      throw new Error(err.message || "Error changing password");
    }
    return response.json();
  },

  getPrestadorProfile: async (): Promise<PrestadorProfile> => {
    const response = await fetch(`${API_BASE_URL}/prestadores/profile`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error fetching provider profile");
    return response.json();
  },

  // Affiliates
  registerAffiliate: async (data: AffiliateData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (key === 'dni_document' || key === 'payslip_document') {
        formData.append(key, value as File);
      } else if (key === 'grupoFamiliar') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/affiliates/register`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message ?? "Registration failed");
    }
    return response.json();
  },

  getMyProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/affiliates/me`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error al obtener el perfil");
    return response.json();
  },

  getAffiliates: async (activo?: boolean) => {
    const url = new URL(`${API_BASE_URL}/affiliates`);
    if (activo !== undefined) url.searchParams.append("status", activo.toString());

    const response = await fetch(url.toString(), {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error fetching affiliates");
    return response.json();
  },

  activateAffiliate: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/affiliates/${id}/activate`, {
      method: "PUT",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error activating affiliate");
    return response.json();
  },

  deactivateAffiliate: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/affiliates/${id}/deactivate`, {
      method: "PUT",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error deactivating affiliate");
    return response.json();
  },
};
