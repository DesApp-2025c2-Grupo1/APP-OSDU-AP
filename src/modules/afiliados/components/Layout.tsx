import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { api, type AffiliateProfile } from "../../../services/api";
import HeaderUser, { type Persona } from "./HeaderUser";

export type { Persona } from "./HeaderUser";

const normalizarParentesco = (parentesco: string): Persona["rol"] => {
  const p = (parentesco || "").toLowerCase();
  if (p === "titular") return "Titular";
  if (p.includes("conyuge") || p.includes("cónyuge") || p.includes("esposo") || p.includes("esposa")) return "Conyuge";
  if (p.includes("hijo") || p.includes("hija")) return "Hijo";
  if (p.includes("hermano") || p.includes("hermana")) return "Hermano";
  return "Otro";
};


const obtenerIntegrantesVisibles = (
  usuarioLogueado: Persona,
  grupoCompleto: Persona[]
) => {
  return grupoCompleto.filter((p) => p.id !== usuarioLogueado.id);
};

export function Layout() {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [afiliadoTitular, setAfiliadoTitular] = useState<AffiliateProfile | null>(null);
  const [perfilesAfiliado, setPerfilesAfiliado] = useState<AffiliateProfile[]>([]);

  const handleLogout = () => {
    logout();
    navigate("/welcome", { replace: true });
  };

  const [userLogueado, setUserLogueado] = useState<Persona>({
    id: usuario?.id || "101",
    nombre: usuario?.nombre || "Usuario",
    apellido: usuario?.apellido || "",
    fechaNacimiento: "1990-01-01",
    rol: "Titular",
  });

  const [grupoFamiliar, setGrupoFamiliar] = useState<Persona[]>([]);
  const [activeProfile, setActiveProfile] = useState<Persona>(userLogueado);

  useEffect(() => {
    let mounted = true;
    setLoadingProfile(true);
    api.getMyProfile()
      .then(({ afiliado, grupoFamiliar: miembros }) => {
        if (!mounted) return;
        const yo: Persona = {
          id: String(afiliado.id),
          nombre: afiliado.nombre,
          apellido: afiliado.apellido,
          fechaNacimiento: afiliado.fechaNacimiento || afiliado.fecha_nacimiento || "1990-01-01",
          rol: normalizarParentesco(afiliado.parentesco || ""),
        };
        const familia: Persona[] = miembros.map((m: any) => ({
          id: String(m.id),
          nombre: m.nombre,
          apellido: m.apellido,
          fechaNacimiento: m.fechaNacimiento || m.fecha_nacimiento || "2000-01-01",
          rol: normalizarParentesco(m.parentesco || ""),
        }));
        setUserLogueado(yo);
        setActiveProfile(yo);
        setGrupoFamiliar(familia);
        setAfiliadoTitular(afiliado);
        setPerfilesAfiliado(miembros);
      })
      .catch(() => {
        if (!mounted) return;
        setAfiliadoTitular(null);
        setPerfilesAfiliado([]);
      })
      .finally(() => {
        if (mounted) setLoadingProfile(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const integrantesVisibles = obtenerIntegrantesVisibles(userLogueado, grupoFamiliar);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 font-sans">
      <nav className="flex items-center justify-between mb-8 bg-white p-3 px-6 rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-50 relative">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-unahur/20 border border-unahur/10 overflow-hidden">
            <img src="/logo.png" alt="OSDU" className="h-8 w-8 object-contain" />
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

          <HeaderUser
            activeProfile={activeProfile}
            userLogueado={userLogueado}
            grupoFamiliar={integrantesVisibles}
            afiliadoTitular={afiliadoTitular}
            perfiles={perfilesAfiliado}
            loadingProfile={loadingProfile}
            onSelectProfile={setActiveProfile}
            onLogout={handleLogout}
          />
        </div>
      </nav>

      <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Outlet context={{ activeProfile, userLogueado }} />
      </main>
    </div>
  );
}
