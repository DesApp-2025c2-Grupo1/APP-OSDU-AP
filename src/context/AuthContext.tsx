import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../services/api";

export interface UsuarioAuth {
  id?: string;
  id_usuario?: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  cuit?: string;
  role?: string;
  tipo: "afiliado" | "prestador";
  mustChangePassword?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  usuario: UsuarioAuth | null;
  login: (
    email: string,
    password: string,
    tipo: "afiliado" | "prestador"
  ) => Promise<{ ok: boolean; mensaje?: string }>;
  loginPrestador: (cuit: string, password: string) => Promise<{ ok: boolean; mensaje?: string }>;
  logout: () => void;
  updateUsuario: (datos: Partial<UsuarioAuth>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USE_MOCK = import.meta.env.VITE_USER_MOCK === "true";

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
    async (
      email: string,
      password: string,
      tipo: "afiliado" | "prestador"
    ): Promise<{ ok: boolean; mensaje?: string }> => {
      try {
        const data = await api.login(email, password);
        const { user } = data;

        const usuarioModel: UsuarioAuth = {
          id: String(user.id),
          nombre: user.nombre || user.email?.split("@")[0] || "Usuario",
          apellido: user.apellido || "",
          dni: user.dni || "",
          email: user.email,
          cuit: user.cuit || "",
          role: user.role,
          tipo,
          mustChangePassword: user.must_change_password,
        };

        setUsuario(usuarioModel);
        localStorage.setItem("auth_usuario", JSON.stringify(usuarioModel));
        return { ok: true };
      } catch {
        return {
          ok: false,
          mensaje: `Email o contraseña incorrectos, o no autorizado como ${tipo}.`,
        };
      }
    },
    []
  );

  const loginPrestador = useCallback(
    async (cuit: string, _password: string): Promise<{ ok: boolean; mensaje?: string }> => {
      if (USE_MOCK) {
        const mockUser: UsuarioAuth = {
          id: "mock-prestador-1",
          nombre: "Juan",
          apellido: "Pérez",
          dni: "12345678",
          cuit,
          role: "prestador",
          tipo: "prestador",
          mustChangePassword: false,
        };
        setUsuario(mockUser);
        localStorage.setItem("auth_usuario", JSON.stringify(mockUser));
        return { ok: true };
      }

      try {
        const data = await api.loginPrestador(cuit, _password);
        const { user } = data;

        const usuarioModel: UsuarioAuth = {
          id: String(user.id),
          nombre: user.nombre || user.cuit || "Prestador",
          apellido: user.apellido || "",
          dni: user.dni || "",
          email: user.email || "",
          cuit: user.cuit,
          role: user.role,
          tipo: "prestador",
          mustChangePassword: user.must_change_password,
        };

        setUsuario(usuarioModel);
        localStorage.setItem("auth_usuario", JSON.stringify(usuarioModel));
        return { ok: true };
      } catch {
        return {
          ok: false,
          mensaje: "CUIT o contraseña incorrectos.",
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem("auth_usuario");
  }, []);

  const updateUsuario = useCallback((datos: Partial<UsuarioAuth>) => {
    setUsuario((prev) => {
      if (!prev) return null;
      const nuevo = { ...prev, ...datos };
      localStorage.setItem("auth_usuario", JSON.stringify(nuevo));
      return nuevo;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, usuario, login, loginPrestador, logout, updateUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
