import { createContext, useContext, useState, useCallback } from "react";
import { usuariosAPI } from "../services/api";

export interface UsuarioAuth {
  id?: string;
  id_usuario?: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  usuario: UsuarioAuth | null;
  login: (dni: string, password: string) => Promise<{ ok: boolean; mensaje?: string }>;
  logout: () => void;
}


const MOCK_USUARIO: UsuarioAuth = {
  id: "101",
  nombre: "Octavio",
  apellido: "Pérez",
  dni: "12345678",
};
const MOCK_PASSWORD = "unahur2026";


const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Inicializa desde localStorage para que la sesión sobreviva recarga
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(() => {
    try {
      const stored = localStorage.getItem("auth_usuario");
      return stored ? (JSON.parse(stored) as UsuarioAuth) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = usuario !== null;


  const login = useCallback(
    async (dni: string, password: string): Promise<{ ok: boolean; mensaje?: string }> => {
      try {
        const response = await usuariosAPI.login(dni, password);
        const userData = response.data;

        const usuario: UsuarioAuth = {
          id_usuario: userData.id_usuario,
          id: String(userData.id_usuario),
          nombre: userData.nombre || "Usuario",
          apellido: userData.apellido || "",
          dni: userData.dni,
          email: userData.email
        };

        setUsuario(usuario);
        localStorage.setItem("auth_usuario", JSON.stringify(usuario));
        return { ok: true };
      } catch (error: any) {
        const mensaje = error.response?.status === 401
          ? "DNI o contraseña incorrectos."
          : "Error en la autenticación. Intenta de nuevo.";
        return { ok: false, mensaje };
      }
    },
    []
  );


  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem("auth_usuario");
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
