import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { UserCircle, ChevronDown, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

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

const obtenerIntegrantesVisibles = (
  usuarioLogueado: Persona,
  grupoCompleto: Persona[]
) => {
  if (usuarioLogueado.rol === "Titular") {
    return grupoCompleto.filter((p) => {
      if (p.id === usuarioLogueado.id) return false;
      if (p.rol === "Conyuge") return true;
      if (p.rol === "Hijo" && calcularEdad(p.fechaNacimiento) < 18) return true;
      return false;
    });
  }
  if (usuarioLogueado.rol === "Conyuge") {
    return grupoCompleto.filter((p) => {
      if (p.id === usuarioLogueado.id) return false;
      if (p.rol === "Hijo" && calcularEdad(p.fechaNacimiento) < 18) return true;
      return false;
    });
  }
  return [];
};

export function Layout() {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/welcome", { replace: true });
  };

  const [userLogueado] = useState<Persona>({
    id: usuario?.id || "101",
    nombre: usuario?.nombre || "Usuario",
    apellido: usuario?.apellido || "",
    fechaNacimiento: "1990-05-15",
    rol: "Titular",
  });

  const grupoFamiliar: Persona[] = [];

  const integrantesVisibles = obtenerIntegrantesVisibles(userLogueado, grupoFamiliar);
  const [activeProfile, setActiveProfile] = useState<Persona>(userLogueado);

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
    <div className="max-w-7xl mx-auto p-4 md:p-10 font-sans">
      <nav className="flex items-center justify-between mb-8 bg-white p-3 px-6 rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-50 relative">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 bg-unahur rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-unahur/20">
            U
          </Link>
          <div className="hidden sm:block">
            <span className="font-black text-gray-900 text-lg tracking-tighter">
              Obra Social de <span className="text-unahur">Universitarios</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {usuario?.role === "ADMIN" && (
            <Link
              to="/admin/affiliates"
              className={`p-2.5 rounded-xl transition-all ${
                location.pathname.includes("/admin")
                  ? "bg-unahur/10 text-unahur"
                  : "text-gray-400 hover:bg-gray-50 hover:text-unahur"
              }`}
              title="Administración"
            >
              <Shield size={20} />
            </Link>
          )}
          <Link
            to="/"
            className={`p-2.5 rounded-xl transition-all ${
              location.pathname === "/"
                ? "bg-unahur/10 text-unahur"
                : "text-gray-400 hover:bg-gray-50 hover:text-unahur"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
          </Link>

          <div className="h-8 w-[1px] bg-gray-100 mx-1" />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 p-1.5 px-3 rounded-xl border transition-all cursor-pointer ${
                isMenuOpen
                  ? "border-unahur bg-unahur/5 shadow-sm"
                  : "border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200"
              }`}
            >
              <div className="text-unahur">
                <UserCircle size={24} />
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-300 ${
                  isMenuOpen ? "rotate-180 text-unahur" : "rotate-0"
                }`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-[28px] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">
                    Perfil Activo
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    {activeProfile.nombre} {activeProfile.apellido}
                  </p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => { setActiveProfile(userLogueado); setIsMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm rounded-2xl transition-colors flex items-center justify-between group ${
                      activeProfile.id === userLogueado.id
                        ? "bg-unahur text-white font-bold shadow-md shadow-unahur/20"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{userLogueado.nombre} (Mí)</span>
                    {activeProfile.id === userLogueado.id && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </button>

                  {integrantesVisibles.map((familiar) => {
                    const isSelected = activeProfile.id === familiar.id;
                    return (
                      <button
                        key={familiar.id}
                        onClick={() => { setActiveProfile(familiar); setIsMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm rounded-2xl transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-unahur text-white font-bold shadow-md shadow-unahur/20"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{familiar.nombre} ({familiar.rol})</span>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl font-bold text-xs uppercase transition-colors tracking-widest"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Outlet context={{ activeProfile }} />
      </main>
    </div>
  );
}
