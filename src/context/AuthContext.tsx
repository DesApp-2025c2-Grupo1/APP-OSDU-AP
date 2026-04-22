import { createContext, useContext, useState, useCallback } from "react";


export interface UsuarioAuth {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
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
      // Simula latencia de red (~800 ms)
      await new Promise((r) => setTimeout(r, 800));

      if (dni.trim() === MOCK_USUARIO.dni && password === MOCK_PASSWORD) {
        setUsuario(MOCK_USUARIO);
        localStorage.setItem("auth_usuario", JSON.stringify(MOCK_USUARIO));
        return { ok: true };
      }
      return { ok: false, mensaje: "DNI o contraseña incorrectos." };
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
