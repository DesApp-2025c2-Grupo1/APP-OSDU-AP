import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../services/api";

export interface UsuarioAuth {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  usuario: UsuarioAuth | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; mensaje?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
    async (email: string, password: string): Promise<{ ok: boolean; mensaje?: string }> => {
      try {
        const data = await api.login(email, password);

        // El backend devuelve { message, user }
        const { user } = data;

        const usuarioModel: UsuarioAuth = {
          id: String(user.id),
          nombre: user.email?.split('@')[0] || "Usuario",
          apellido: "",
          dni: "",
          email: user.email,
          role: user.role
        };

        setUsuario(usuarioModel);
        localStorage.setItem("auth_usuario", JSON.stringify(usuarioModel));

        return { ok: true };
      } catch (err) {
        return { ok: false, mensaje: "Email o contraseña incorrectos, o cuenta no activada." };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem("auth_usuario");
    // Opcional: Llamar al backend para limpiar la cookie
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
