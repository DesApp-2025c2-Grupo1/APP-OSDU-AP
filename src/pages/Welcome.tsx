import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVICIOS_RAPIDOS = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    titulo: "Solicitar Turno",
    descripcion: "Reserva tu turno médico online en segundos",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    titulo: "Mis Recetas",
    descripcion: "Accedé a tus prescripciones médicas digitales",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    titulo: "Reintegros",
    descripcion: "Solicitá el reintegro de tus gastos médicos",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    titulo: "Cartilla Médica",
    descripcion: "Encontrá médicos y centros de atención",
  },
];

const SERVICIOS_PRESTADORES = [
  {
    icon: SERVICIOS_RAPIDOS[0].icon,
    titulo: "Gestionar Turnos",
    descripcion: "Consultá y administrá tu agenda diaria",
  },
  {
    icon: SERVICIOS_RAPIDOS[1].icon,
    titulo: "Solicitudes",
    descripcion: "Respondé trámites y derivaciones pendientes",
  },
  {
    icon: SERVICIOS_RAPIDOS[2].icon,
    titulo: "Situaciones",
    descripcion: "Registrá el seguimiento terapéutico",
  },
  {
    icon: SERVICIOS_RAPIDOS[3].icon,
    titulo: "Historia Clínica",
    descripcion: "Accedé al historial de tus pacientes",
  },
];

const ACCESOS_RAPIDOS = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    titulo: "Urgencias y Emergencias",
    subtitulo: "0800-UNAHUR-24",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    titulo: "Atención por WhatsApp",
    subtitulo: "Consultas 24 horas",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titulo: "Información 24 hs",
    subtitulo: "Todo lo que necesitás saber",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    titulo: "Atención al Afiliado",
    subtitulo: "Lunes a Viernes 8-18 hs",
  },
];

type SitioTipo = "afiliados" | "prestadores";

export function Welcome() {
  const navigate = useNavigate();
  const [sitioAbierto, setSitioAbierto] = useState(false);
  const [sitioActual, setSitioActual] = useState<SitioTipo>("afiliados");
  const esPrestadores = sitioActual === "prestadores";

  const loginPath = esPrestadores ? "/login/prestador" : "/login/afiliado";
  const portalLabel = esPrestadores ? "Portal Oficial de Prestadores" : "Portal Oficial de Afiliados";
  const heroTitle = esPrestadores ? (
    <>
      Tu gestión,<br />
      <span className="text-unahur">más</span> simple<br />
      y segura.
    </>
  ) : (
    <>
      Tu salud,<br />
      <span className="text-unahur">nuestra</span> prioridad<br />
      más alta.
    </>
  );
  const heroDescription = esPrestadores
    ? "Accedé al portal de prestadores para gestionar turnos, solicitudes, situaciones terapéuticas e historias clínicas desde un solo lugar."
    : "Gestioná tus turnos, recetas, reintegros y autorizaciones desde la comodidad de tu hogar. La obra social de la comunidad UNAHUR.";
  const primaryCta = esPrestadores ? "Ingresar como Prestador" : "Iniciar Sesión";
  const secondaryCta = esPrestadores ? "Ir a Afiliados" : "Quiero Afiliarme";
  const serviciosMostrados = esPrestadores ? SERVICIOS_PRESTADORES : SERVICIOS_RAPIDOS;

  const handleSitioSelect = (tipo: SitioTipo) => {
    setSitioActual(tipo);
    setSitioAbierto(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Barra superior */}
      <div className="bg-white border-b border-slate-100 py-2 px-6 text-center text-xs text-slate-400 hidden md:block">
        Portal Oficial de Salud · Universidad Nacional de Hurlingham
      </div>

      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {esPrestadores ? (
              <img src="/logo.png" alt="OSDU" className="h-12 w-16 object-contain" />
            ) : (
              <div className="w-9 h-9 bg-unahur rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-lg leading-none">U</span>
              </div>
            )}
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">{esPrestadores ? "OSDU" : "MediUnahur"}</p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                {esPrestadores ? "Obra Social de Universitarios" : "Obra Social UNAHUR"}
              </p>
            </div>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button className="hover:text-unahur transition-colors">Información Útil</button>
            <button className="hover:text-unahur transition-colors">Cartilla Médica</button>
            <button className="hover:text-unahur transition-colors">Prevención</button>
            <button className="hover:text-unahur transition-colors">Beneficios</button>
          </nav>

          {/* Selector "Estoy en el sitio de" + acciones */}
          <div className="flex items-center gap-3">

            {/* Selector de sitio */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setSitioAbierto((v) => !v)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-unahur/40 px-4 py-2 rounded-xl transition-colors bg-slate-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Estoy en el sitio de: <span className="text-unahur capitalize">{sitioActual === "afiliados" ? "Afiliados" : "Prestadores"}</span>
                <svg className={`w-3 h-3 transition-transform ${sitioAbierto ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {sitioAbierto && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => handleSitioSelect("afiliados")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${sitioActual === "afiliados" ? "text-unahur font-semibold" : "text-slate-700"}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Afiliados
                  </button>
                  <button
                    onClick={() => handleSitioSelect("prestadores")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${sitioActual === "prestadores" ? "text-teal-600 font-semibold" : "text-slate-700"}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Prestadores
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate(loginPath)}
              className="text-sm font-semibold text-white bg-unahur hover:bg-green-700 px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              Ingresar
            </button>
            <button
              onClick={() => esPrestadores ? setSitioActual("afiliados") : navigate("/register")}
              className="hidden sm:block text-sm font-semibold text-unahur border border-unahur/30 hover:bg-green-50 px-5 py-2 rounded-xl transition-colors"
            >
              {esPrestadores ? "Ver afiliados" : "Afiliarme"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 bg-gradient-to-br from-slate-50 via-green-50/30 to-white overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-unahur/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100/40 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Texto principal */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-unahur/10 text-unahur text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {portalLabel}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
                {heroTitle}
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                {heroDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate(loginPath)}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-unahur text-white rounded-2xl font-bold text-base shadow-lg shadow-unahur/25 hover:bg-green-700 active:scale-[0.98] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {primaryCta}
                </button>
                <button
                  onClick={() => esPrestadores ? setSitioActual("afiliados") : navigate("/register")}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-800 border-2 border-slate-200 rounded-2xl font-bold text-base hover:border-unahur/30 hover:bg-green-50 active:scale-[0.98] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  {secondaryCta}
                </button>
              </div>
            </div>

            {/* Grid de servicios */}
            <div className="flex-1 w-full max-w-md lg:max-w-none">
              <div className="grid grid-cols-2 gap-4">
                {serviciosMostrados.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-5 min-h-40 border border-slate-100 shadow-sm hover:shadow-md hover:border-unahur/20 transition-all cursor-default"
                  >
                    <div className="w-12 h-12 bg-unahur/10 rounded-2xl flex items-center justify-center text-unahur mb-4">
                      {s.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.titulo}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barra inferior de accesos rápidos — estilo Swiss Medical */}
      <section className="bg-unahur">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ACCESOS_RAPIDOS.map((item, i) => (
              <button
                key={i}
                className="flex items-center gap-4 group text-left"
              >
                <div className="w-14 h-14 rounded-full border-2 border-white/30 flex items-center justify-center text-white flex-shrink-0 group-hover:border-white/70 group-hover:bg-white/10 transition-all">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{item.titulo}</p>
                  <p className="text-white/60 text-xs mt-0.5">{item.subtitulo}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {esPrestadores ? (
              <img src="/logo.png" alt="OSDU" className="h-9 w-12 object-contain" />
            ) : (
              <div className="w-7 h-7 bg-unahur rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">U</span>
              </div>
            )}
            <span className="text-slate-400 text-xs font-medium">
              {esPrestadores ? "OSDU · Obra Social de Universitarios" : "MediUnahur · Obra Social UNAHUR"}
            </span>
          </div>
          <p className="text-slate-600 text-xs">
            © 2026 Universidad Nacional de Hurlingham · Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
