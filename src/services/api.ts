const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:9002";

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
  plan_id: number;
  document_number: string;
  document_type: string;
  birth_date: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  family_group?: FamilyMember[];
  dni_document?: File;
  payslip_document?: File;
}

export interface Affiliate extends AffiliateData {
  id: string;
  credencial_number: string;
  status: boolean;
  plan_type?: string;
  plan_code?: string;
}

export interface FamilyMember {
  full_name: string;
  relationship: string;
  document_number: string;
}

export interface TurnoAPI {
  id: number;
  fecha: string;
  horaIni: string;
  horaFin: string;
  status: string;
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

export const turnosApi = {
  getMisTurnos: async (): Promise<TurnoAPI[]> => {
    const response = await fetch(`${API_BASE_URL}/affiliates/turnos`, {
      credentials: "include",
    });
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
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  },

  loginPrestador: async (cuit: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/prestadores/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cuit, password }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  },

  changePassword: async (newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error changing password");
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
      } else if (key === 'family_group') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/affiliates`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
  },

  getAffiliates: async (status?: boolean) => {
    const url = new URL(`${API_BASE_URL}/affiliates`);
    if (status !== undefined) url.searchParams.append("status", status.toString());

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
