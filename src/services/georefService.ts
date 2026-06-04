import {
  ARGENTINA_LOCALITIES_BY_PROVINCE,
  ARGENTINA_PROVINCES,
  type ArgentinaLocality,
  type ArgentinaProvince,
} from "../data/argentinaLocations";

export type GeorefProvince = ArgentinaProvince;
export type GeorefLocality = ArgentinaLocality;

export const fetchGeorefProvinces = async (): Promise<GeorefProvince[]> => {
  return ARGENTINA_PROVINCES;
};

export const fetchGeorefLocalities = async (provinceId: string): Promise<GeorefLocality[]> => {
  const province = ARGENTINA_PROVINCES.find((p) => p.id === provinceId);
  const localities = ARGENTINA_LOCALITIES_BY_PROVINCE[provinceId] ?? [];

  return localities
    .map((nombre, index) => ({
      id: `${provinceId}-${index + 1}`,
      nombre: nombre.trim(),
      provincia: province,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es-AR"));
};
