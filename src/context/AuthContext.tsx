import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, AUTH_UNAUTHORIZED_EVENT } from "../services/api";

export interface UsuarioAuth {
  id?: string;
  id_usuario?: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  cuit?: string;
  genero?: string;
  sexo?: string;
  role?: string;
  tipo: "afiliado" | "prestador";
  debeCambiarPassword?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
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

function mapSessionUser(user: any): UsuarioAuth {
  const tipo = user.role === "PRESTADOR" ? "prestador" : "afiliado";
  return {
    id: String(user.id),
    nombre: user.nombre || user.email?.split("@")[0] || (tipo === "prestador" ? "Prestador" : "Usuario"),
    apellido: user.apellido || "",
    dni: user.dni || "",
    email: user.email,
    cuit: user.cuit || "",
    role: user.role,
    tipo,
    debeCambiarPassword: user.debeCambiarPassword,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(() => {
    try {
      const stored = localStorage.getItem("auth_usuario");
      return stored ? (JSON.parse(stored) as UsuarioAuth) : null;
    } catch {
      return null;
    }
  });
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const isAuthenticated = usuario !== null;

  useEffect(() => {
    let isMounted = true;
    api.getSession()
      .then((data) => {
        if (!isMounted) return;
        const { user } = data;
        
        // Ignorar si la sesión activa es de un administrador
        if (user.role !== "AFILIADO" && user.role !== "PRESTADOR") {
          throw new Error("Sesión no permitida en este portal");
        }

        const usuarioModel = mapSessionUser(user);
        setUsuario(usuarioModel);
        localStorage.setItem("auth_usuario", JSON.stringify(usuarioModel));
      })
      .catch(() => {
        if (!isMounted) return;
        setUsuario(null);
        localStorage.removeItem("auth_usuario");
      })
      .finally(() => {
        if (isMounted) setIsCheckingSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUsuario(null);
      localStorage.removeItem("auth_usuario");
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      tipo: "afiliado" | "prestador"
    ): Promise<{ ok: boolean; mensaje?: string }> => {
      try {
        await api.login(email, password);
        const { user } = await api.getSession();

        // Validar que el rol sea compatible con este portal
        if (user.role !== "AFILIADO") {
          throw new Error("Acceso denegado: solo afiliados pueden ingresar.");
        }

        const usuarioModel: UsuarioAuth = { ...mapSessionUser(user), tipo };

        setUsuario(usuarioModel);
        localStorage.setItem("auth_usuario", JSON.stringify(usuarioModel));
        return { ok: true };
      } catch (error: any) {
        setUsuario(null);
        localStorage.removeItem("auth_usuario");
        return {
          ok: false,
          mensaje:
            error.message === "No active session"
              ? "No se pudo establecer la sesión. Revisá la configuración de cookies/proxy del servidor."
              : error.message || `Email o contraseña incorrectos, o no autorizado como ${tipo}.`,
        };
      }
    },
    []
  );

  const loginPrestador = useCallback(
    async (cuit: string, _password: string): Promise<{ ok: boolean; mensaje?: string }> => {
      try {
        await api.loginPrestador(cuit, _password);
        const { user } = await api.getSession();

        const usuarioModel: UsuarioAuth = { ...mapSessionUser(user), tipo: "prestador" };

        setUsuario(usuarioModel);
        localStorage.setItem("auth_usuario", JSON.stringify(usuarioModel));
        return { ok: true };
      } catch {
        setUsuario(null);
        localStorage.removeItem("auth_usuario");
        return {
          ok: false,
          mensaje: "No se pudo establecer la sesión del prestador.",
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    api.logout().catch(() => {
      // Ignorar errores para asegurar que la sesión local se limpie igual
    });
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
    <AuthContext.Provider value={{ isAuthenticated, isCheckingSession, usuario, login, loginPrestador, logout, updateUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
