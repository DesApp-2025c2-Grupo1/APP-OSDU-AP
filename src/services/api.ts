const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:9002";

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
    const response = await fetch(`${API_BASE_URL}/providers/prestadores/login`, {
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
