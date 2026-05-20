import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, UserRound, MapPin, Phone, Clock,
  ArrowLeft, Search, Stethoscope, ChevronDown, X, ChevronRight,
} from "lucide-react";
import {
  PROVINCIAS,
  LOCALIDADES_POR_PROVINCIA,
  ESPECIALIDADES,
  mockCentrosMedicos,
  mockPrestadores,
  type CentroMedico,
  type Prestador,
} from "../data/mockData";

type TabType = "centros" | "prestadores";


function Combobox({
  options, value, onChange, placeholder, disabled = false,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleFocus = () => {
    setQuery("");
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    if (e.target.value === "") onChange("");
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          value={open ? query : value}
          placeholder={placeholder}
          onFocus={handleFocus}
          onChange={handleChange}
          className="w-full px-3 py-2.5 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-unahur/30 focus:border-unahur transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <ChevronDown
          size={14}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && !disabled && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-gray-400 text-center">Sin coincidencias</li>
          ) : (
            filtered.map((option) => (
              <li
                key={option}
                onMouseDown={() => handleSelect(option)}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors
                  ${value === option ? "bg-unahur/10 text-unahur font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function DetalleModal({
  item,
  tipo,
  onClose,
}: {
  item: CentroMedico | Prestador;
  tipo: TabType;
  onClose: () => void;
}) {
  const esCentro = tipo === "centros";
  const centro = item as CentroMedico;
  const prestador = item as Prestador;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar móvil */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-unahur/10 text-unahur p-2.5 rounded-xl flex-shrink-0">
              {esCentro ? <Building2 size={20} /> : <UserRound size={20} />}
            </div>
            <div>
              <p className="font-black text-gray-800 text-sm leading-tight">{item.nombre}</p>
              {!esCentro && (
                <p className="text-[10px] text-unahur font-bold uppercase tracking-wider mt-0.5">
                  {prestador.matricula}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Especialidades */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Especialidades
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.especialidades.map((esp) => (
                <span
                  key={esp}
                  className="text-[11px] font-semibold bg-unahur/10 text-unahur px-2.5 py-1 rounded-full"
                >
                  {esp}
                </span>
              ))}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Ubicación
            </p>
            <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                <span>{item.direccion}</span>
              </div>
              <p className="text-xs text-gray-400 pl-5">
                {item.localidad}, {item.provincia}
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Contacto
            </p>
            <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone size={14} className="text-gray-400 flex-shrink-0" />
                <span>{item.telefono}</span>
              </div>
              {esCentro && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock size={14} className="text-gray-400 flex-shrink-0" />
                  <span>{centro.horario}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}


export function ConsultarCartilla() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabType | null>(null);
  const [provincia, setProvincia] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [resultados, setResultados] = useState<CentroMedico[] | Prestador[] | null>(null);
  const [detalle, setDetalle] = useState<CentroMedico | Prestador | null>(null);

  const localidades = provincia ? LOCALIDADES_POR_PROVINCIA[provincia] ?? [] : [];
  const puedesBuscar = provincia !== "" && localidad !== "" && especialidad !== "";

  const handleTabChange = (nuevaTab: TabType) => {
    setTab(nuevaTab);
    setProvincia("");
    setLocalidad("");
    setEspecialidad("");
    setResultados(null);
  };

  const handleVolverAElegir = () => {
    setTab(null);
    setProvincia("");
    setLocalidad("");
    setEspecialidad("");
    setResultados(null);
  };

  const handleProvinciaChange = (value: string) => {
    setProvincia(value);
    setLocalidad("");
    setResultados(null);
  };

  const handleBuscar = () => {
    if (!puedesBuscar || !tab) return;

    if (tab === "centros") {
      setResultados(
        mockCentrosMedicos.filter(
          (c) => c.provincia === provincia && c.localidad === localidad && c.especialidades.includes(especialidad)
        )
      );
    } else {
      setResultados(
        mockPrestadores.filter(
          (p) => p.provincia === provincia && p.localidad === localidad && p.especialidades.includes(especialidad)
        )
      );
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Consultar <span className="text-unahur font-black">Cartilla</span>
          </h1>
          <p className="text-xs text-gray-400">Buscá centros médicos y prestadores de tu red</p>
        </div>
      </div>

      {/* Selección de categoría */}
      {!tab ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleTabChange("centros")}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-unahur/30 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="bg-gray-100 text-gray-500 p-3 rounded-xl mb-3 shadow-sm">
              <Building2 size={22} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Centro Médico
            </span>
          </button>

          <button
            onClick={() => handleTabChange("prestadores")}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-unahur/30 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="bg-gray-100 text-gray-500 p-3 rounded-xl mb-3 shadow-sm">
              <UserRound size={22} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Prestadores
            </span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-unahur/5 border border-unahur/20 rounded-xl px-4 py-3 mb-6 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="bg-unahur text-white p-1.5 rounded-lg">
              {tab === "centros" ? <Building2 size={14} /> : <UserRound size={14} />}
            </div>
            <span className="text-sm font-bold text-unahur">
              {tab === "centros" ? "Centro Médico" : "Prestadores"}
            </span>
          </div>
          <button
            onClick={handleVolverAElegir}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-unahur transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={11} /> Cambiar
          </button>
        </div>
      )}

      {/* Panel de filtros */}
      {tab && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Filtros de búsqueda
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Provincia
              </label>
              <Combobox
                options={PROVINCIAS}
                value={provincia}
                onChange={handleProvinciaChange}
                placeholder="Buscar provincia..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Localidad
              </label>
              <Combobox
                options={localidades}
                value={localidad}
                onChange={(v) => { setLocalidad(v); setResultados(null); }}
                placeholder="Buscar localidad..."
                disabled={!provincia}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Especialidad
              </label>
              <Combobox
                options={ESPECIALIDADES}
                value={especialidad}
                onChange={(v) => { setEspecialidad(v); setResultados(null); }}
                placeholder="Buscar especialidad..."
                disabled={!localidad}
              />
            </div>
          </div>

          <button
            onClick={handleBuscar}
            disabled={!puedesBuscar}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm tracking-wide transition-all
              bg-unahur text-white shadow-md shadow-unahur/20 hover:bg-unahur-dark active:scale-[0.98]
              disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Search size={16} />
            Buscar
          </button>
        </div>
      )}

      {/* Resultados */}
      {resultados !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resultados</h2>
            <span className="text-xs font-semibold text-unahur bg-unahur/10 px-2.5 py-1 rounded-full">
              {resultados.length} encontrado{resultados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {resultados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <Stethoscope size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400">Sin resultados</p>
              <p className="text-xs text-gray-300 mt-1">
                No hay {tab === "centros" ? "centros médicos" : "prestadores"} con esa combinación de filtros.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(resultados as (CentroMedico | Prestador)[]).map((item) => {
                const esCentro = tab === "centros";
                return (
                  <button
                    key={item.id}
                    onClick={() => setDetalle(item)}
                    className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                      hover:shadow-md hover:border-unahur/20 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-unahur/10 text-unahur p-2.5 rounded-xl flex-shrink-0">
                          {esCentro ? <Building2 size={18} /> : <UserRound size={18} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">{item.nombre}</p>
                          {!esCentro && (
                            <p className="text-[10px] text-unahur font-semibold uppercase tracking-wider mt-0.5">
                              {(item as Prestador).matricula}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.especialidades.map((esp) => (
                              <span
                                key={esp}
                                className="text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                              >
                                {esp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-x-4 gap-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{item.direccion}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={11} className="text-gray-400 flex-shrink-0" />
                        <span>{item.telefono}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de detalle */}
      {detalle && tab && (
        <DetalleModal
          item={detalle}
          tipo={tab}
          onClose={() => setDetalle(null)}
        />
      )}
    </>
  );
}
