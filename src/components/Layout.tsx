import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserCircle, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string; 
  rol: "Titular" | "Conyuge" | "Hijo" | "Hermano" | "Otro";
}

const calcularEdad = (fechaNac: string) => {
  const hoy = new Date();
  const cumple = new Date(fechaNac);
  let edad = hoy.getFullYear() - cumple.getFullYear();
  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
  return edad;
};

const obtenerIntegrantesVisibles = (usuarioLogueado: Persona, grupoCompleto: Persona[]) => {
  if (usuarioLogueado.rol === "Titular") {
    return grupoCompleto.filter(p => {
      if (p.id === usuarioLogueado.id) return false;
      if (p.rol === "Conyuge") return true;
      if (p.rol === "Hijo" && calcularEdad(p.fechaNacimiento) < 18) return true;
      return false;
    });
  }
  if (usuarioLogueado.rol === "Conyuge") {
    return grupoCompleto.filter(p => {
      if (p.id === usuarioLogueado.id) return false;
      if (p.rol === "Hijo" && calcularEdad(p.fechaNacimiento) < 18) return true;
      return false;
    });
  }
  return [];
};

export function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const [userLogueado] = useState<Persona>({
    id: "101",
    nombre: "Octavio",
    apellido: "Pérez",
    fechaNacimiento: "1990-05-15",
    rol: "Titular"
  });

  const [grupoFamiliar] = useState<Persona[]>([
    { id: "102", nombre: "Rocío", apellido: "González", fechaNacimiento: "1992-03-20", rol: "Conyuge" },
    { id: "103", nombre: "Lucas", apellido: "Pérez", fechaNacimiento: "2018-07-10", rol: "Hijo" },
    { id: "104", nombre: "Mía", apellido: "Pérez", fechaNacimiento: "2020-02-15", rol: "Hijo" },
    { id: "105", nombre: "Santi", apellido: "Pérez", fechaNacimiento: "2002-11-20", rol: "Hijo" },
  ]);

  const integrantesVisibles = obtenerIntegrantesVisibles(userLogueado, grupoFamiliar);
  const [activeProfile, setActiveProfile] = useState<Persona>(userLogueado);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 font-sans">
      {/* 🔹 NAVBAR EXACTAMENTE IGUAL */}
      <nav className="flex items-center justify-between mb-8 bg-white p-3 px-5 rounded-xl shadow-sm border border-blue-50 relative">
        <div className="flex items-center gap-2">
          <Link to="/" className="w-8 h-8 bg-unahur rounded flex items-center justify-center text-white font-black text-lg">U</Link>
          <span className="font-bold text-gray-700 text-base tracking-tight">Medicina Integral</span>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-2 p-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
              isMenuOpen ? "border-unahur bg-blue-50/50 shadow-sm" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Usuario</p>
              <p className="text-xs font-semibold text-gray-600">{userLogueado.nombre}</p>
            </div>
            <div className="text-unahur mx-1"><UserCircle size={20} /></div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-300 ${
                isMenuOpen ? "rotate-0 text-unahur" : "rotate-90 text-gray-300"
              }`}
            />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
              <button 
                onClick={() => { setActiveProfile(userLogueado); setIsMenuOpen(false); }}
                className={`w-full text-left px-5 py-3.5 text-sm transition-colors border-l-4 ${
                  activeProfile.id === userLogueado.id ? "border-unahur bg-gray-50 text-gray-900 font-bold" : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                {userLogueado.nombre} {userLogueado.apellido}
              </button>

              {integrantesVisibles.map((familiar) => {
                const isSelected = activeProfile.id === familiar.id;
                return (
                  <button 
                    key={familiar.id} 
                    onClick={() => { setActiveProfile(familiar); setIsMenuOpen(false); }}
                    className={`w-full text-left px-5 py-3.5 text-sm transition-colors border-l-4 ${
                      isSelected ? "border-unahur bg-gray-50 text-gray-900 font-bold" : "border-transparent text-gray-600 hover:bg-gray-50 border-t border-gray-50"
                    }`}
                  >
                    {familiar.nombre} {familiar.apellido}
                  </button>
                );
              })}
              <div className="p-1.5 border-t border-gray-100 bg-gray-50/30">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg font-bold text-[10px] uppercase transition-colors tracking-widest"
                >
                  <LogOut size={14} /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 🔹 ACÁ MAGIA: Outlet renderiza las páginas hijas y les pasa el perfil activo */}
      <main>
        <Outlet context={{ activeProfile }} />
      </main>
    </div>
  );
}