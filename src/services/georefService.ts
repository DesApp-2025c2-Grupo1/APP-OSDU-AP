const GEOREF_API_BASE_URL = "https://apis.datos.gob.ar/georef/api";

export type GeorefProvince = {
  id: string;
  nombre: string;
};

export type GeorefLocality = {
  id: string;
  nombre: string;
  provincia?: GeorefProvince;
};

type ProvincesResponse = {
  provincias?: GeorefProvince[];
};

type LocalitiesResponse = {
  localidades?: GeorefLocality[];
};

type CensusLocalitiesResponse = {
  localidades_censales?: GeorefLocality[];
};

const CABA_PROVINCE_ID = "02";

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("No se pudo consultar Georef");
  }

  return response.json() as Promise<T>;
};

export const fetchGeorefProvinces = async (): Promise<GeorefProvince[]> => {
  const params = new URLSearchParams({
    campos: "id,nombre",
    max: "24",
    orden: "nombre",
  });
  const data = await fetchJson<ProvincesResponse>(`${GEOREF_API_BASE_URL}/provincias?${params}`);

  return data.provincias ?? [];
};

export const fetchGeorefLocalities = async (provinceId: string): Promise<GeorefLocality[]> => {
  const params = new URLSearchParams({
    provincia: provinceId,
    campos: "id,nombre,provincia.id,provincia.nombre",
    max: "5000",
    orden: "nombre",
  });
  const data = await fetchJson<LocalitiesResponse>(`${GEOREF_API_BASE_URL}/localidades?${params}`);
  const localidades = data.localidades ?? [];

  if (provinceId !== CABA_PROVINCE_ID) {
    return localidades;
  }

  const censusParams = new URLSearchParams({
    provincia: provinceId,
    campos: "id,nombre,provincia.id,provincia.nombre",
    max: "10",
    orden: "nombre",
  });
  const censusData = await fetchJson<CensusLocalitiesResponse>(`${GEOREF_API_BASE_URL}/localidades-censales?${censusParams}`);
  const cabaOptions = censusData.localidades_censales ?? [];
  const byName = new Map<string, GeorefLocality>();

  [...cabaOptions, ...localidades].forEach((locality) => {
    byName.set(locality.nombre.toLocaleLowerCase("es-AR"), locality);
  });

  return Array.from(byName.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es-AR"));
};
