import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
<<<<<<< HEAD
import { UserCircle, ChevronDown, LogOut } from "lucide-react";
=======
import { UserCircle, ChevronDown, LogOut, LayoutDashboard, Shield } from "lucide-react";
>>>>>>> feat/login
import { useAuth } from "../context/AuthContext";
import { usuariosAPI } from "../services/api";

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

  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
    edad--;
  }

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
<<<<<<< HEAD
  const location = useLocation(); // Agregado: para obtener la ruta actual

  const [userLogueado, setUserLogueado] = useState<Persona | null>(null);
  const [grupoFamiliar, setGrupoFamiliar] = useState<Persona[]>([]);
  const [activeProfile, setActiveProfile] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
=======
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/welcome", { replace: true });
  };

  // Convertimos el usuario de AuthContext a Persona para la lógica familiar
  const [userLogueado] = useState<Persona>({
    id: usuario?.id || "101",
    nombre: usuario?.nombre || "Usuario",
    apellido: usuario?.apellido || "",
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
>>>>>>> feat/login
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUserData = async () => {
      try {
        if (!usuario?.id_usuario) {
          if (!cancelled) {
            setLoading(false);
            // CORRECCIÓN: Solo redirige si NO está ya en la página de login
            if (location.pathname !== "/login") {
              navigate("/login", { replace: true });
            }
          }
          return;
        }

        const meResponse = await usuariosAPI.getMe(usuario.id_usuario);
        const userData = meResponse.data;

        const titular: Persona = {
          id: String(userData.id_usuario),
          nombre: userData.nombre || "Usuario",
          apellido: userData.apellido || "",
          fechaNacimiento: "1990-05-15",
          rol: "Titular",
        };

        if (!cancelled) {
          setUserLogueado(titular);
          setActiveProfile(titular);
        }

        const familiaResponse = await usuariosAPI.getFamilia(usuario.id_usuario);
        const familiaData = Array.isArray(familiaResponse.data)
          ? familiaResponse.data
          : [];

        const familiaTransformed: Persona[] = familiaData
          .filter((f: any) => String(f.id_usuario) !== String(usuario.id_usuario))
          .map((f: any) => ({
            id: String(f.id_usuario),
            nombre: f.nombre || "Usuario",
            apellido: f.apellido || "",
            fechaNacimiento: "1990-05-15",
            rol:
              f.relacion === "Conyuge" || f.relacion === "Esposa"
                ? "Conyuge"
                : "Hijo",
          }));

        if (!cancelled) {
          setGrupoFamiliar(familiaTransformed);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);

        if (!cancelled) {
          setUserLogueado(null);
          setGrupoFamiliar([]);
          setActiveProfile(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      cancelled = true;
    };
  }, [usuario?.id_usuario, navigate, location.pathname]); // Agregado location.pathname a dependencias

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const integrantesVisibles =
    userLogueado ? obtenerIntegrantesVisibles(userLogueado, grupoFamiliar) : [];

  // CORRECCIÓN: Si estamos en el login y no hay perfil, mostramos el Outlet directamente (el formulario de login)
  if (!activeProfile && location.pathname === "/login") {
    return <Outlet />;
  }

  if (loading || !activeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Cargando datos del usuario...
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="max-w-4xl mx-auto p-4 md:p-10 font-sans">
      <nav className="flex items-center justify-between mb-8 bg-white p-3 px-5 rounded-xl shadow-sm border border-blue-50 relative">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="w-8 h-8 bg-unahur rounded flex items-center justify-center text-white font-black text-lg"
          >
            U
          </Link>
          <span className="font-bold text-gray-700 text-base tracking-tight">
            Medicina Integral
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-2 p-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
              isMenuOpen
                ? "border-unahur bg-blue-50/50 shadow-sm"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">
                Usuario
              </p>
              <p className="text-xs font-semibold text-gray-600">
                {activeProfile.nombre}
              </p>
            </div>

            <div className="text-unahur mx-1">
              <UserCircle size={20} />
            </div>

            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-300 ${
                isMenuOpen ? "rotate-0 text-unahur" : "rotate-90 text-gray-300"
              }`}
            />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
              {userLogueado && (
                <button
                  onClick={() => {
                    setActiveProfile(userLogueado);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm transition-colors border-l-4 ${
                    activeProfile.id === userLogueado.id
                      ? "border-unahur bg-gray-50 text-gray-900 font-bold"
                      : "border-transparent text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {userLogueado.nombre} {userLogueado.apellido}
                </button>
              )}

              {integrantesVisibles.map((familiar) => {
                const isSelected = activeProfile.id === familiar.id;

                return (
                  <button
                    key={familiar.id}
                    onClick={() => {
                      setActiveProfile(familiar);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3.5 text-sm transition-colors border-l-4 ${
                      isSelected
                        ? "border-unahur bg-gray-50 text-gray-900 font-bold"
                        : "border-transparent text-gray-600 hover:bg-gray-50 border-t border-gray-50"
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
=======
    <div className="max-w-7xl mx-auto p-4 md:p-10 font-sans">
      <nav className="flex items-center justify-between mb-8 bg-white p-3 px-6 rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-50 relative">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 bg-unahur rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-unahur/20">U</Link>
          <div className="hidden sm:block">
            <span className="font-black text-gray-900 text-lg tracking-tighter">Medicina<span className="text-unahur">Integral</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Agregar un if que valide si el usuario es admin */}
          {usuario?.role === "ADMIN" && (
            <Link
              to="/admin/affiliates"
              className={`p-2.5 rounded-xl transition-all ${location.pathname.includes('/admin') ? 'bg-unahur/10 text-unahur' : 'text-gray-400 hover:bg-gray-50 hover:text-unahur'}`}
              title="Administración"
            >
              <Shield size={20} />
            </Link>
>>>>>>> feat/login
          )}
          <Link
            to="/"
            className={`p-2.5 rounded-xl transition-all ${location.pathname === '/' ? 'bg-unahur/10 text-unahur' : 'text-gray-400 hover:bg-gray-50 hover:text-unahur'}`}
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
          </Link>

          <div className="h-8 w-[1px] bg-gray-100 mx-1"></div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 p-1.5 px-3 rounded-xl border transition-all cursor-pointer ${isMenuOpen ? "border-unahur bg-unahur/5 shadow-sm" : "border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200"
                }`}
            >
              <div className="text-unahur"><UserCircle size={24} /></div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-300 ${isMenuOpen ? "rotate-180 text-unahur" : "rotate-0"
                  }`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-[28px] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Perfil Activo</p>
                  <p className="text-sm font-black text-gray-900">{activeProfile.nombre} {activeProfile.apellido}</p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => { setActiveProfile(userLogueado); setIsMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm rounded-2xl transition-colors flex items-center justify-between group ${activeProfile.id === userLogueado.id ? "bg-unahur text-white font-bold shadow-md shadow-unahur/20" : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <span>{userLogueado.nombre} (Mí)</span>
                    {activeProfile.id === userLogueado.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </button>

                  {integrantesVisibles.map((familiar) => {
                    const isSelected = activeProfile.id === familiar.id;
                    return (
                      <button
                        key={familiar.id}
                        onClick={() => { setActiveProfile(familiar); setIsMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm rounded-2xl transition-colors flex items-center justify-between ${isSelected ? "bg-unahur text-white font-bold shadow-md shadow-unahur/20" : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <span>{familiar.nombre} ({familiar.rol})</span>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
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

<<<<<<< HEAD
      <main>
=======
      <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
>>>>>>> feat/login
        <Outlet context={{ activeProfile }} />
      </main>
    </div>
  );
}