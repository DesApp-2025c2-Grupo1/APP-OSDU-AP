export const NAME_RE = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ][a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]{1,}$/;
export const DNI_RE = /^\d{7,8}$/;
export const PASAPORTE_RE = /^[a-zA-Z0-9]{6,9}$/;

export const validationMessages = {
  nombreRequired: "El nombre es requerido.",
  apellidoRequired: "El apellido es requerido.",
  nameInvalid: "Solo letras, mínimo 2 caracteres.",
  documentRequired: "El número de documento es requerido.",
  dniInvalid: "El DNI debe tener 7 u 8 dígitos numéricos.",
  passportInvalid: "El pasaporte debe tener entre 6 y 9 caracteres alfanuméricos.",
  birthDateRequired: "La fecha de nacimiento es requerida.",
  dateInvalid: "Fecha inválida.",
  futureDate: "La fecha no puede ser futura.",
  unrealisticBirthDate: "Fecha de nacimiento no válida.",
};

export function validatePersonName(value: string, field: "nombre" | "apellido") {
  if (!value.trim()) {
    return field === "apellido" ? validationMessages.apellidoRequired : validationMessages.nombreRequired;
  }
  if (!NAME_RE.test(value.trim())) return validationMessages.nameInvalid;
  return null;
}

export function validateDocument(tipo: string, nro: string) {
  const clean = nro.replace(/\s/g, "");
  if (!clean) return validationMessages.documentRequired;
  if (tipo === "DNI" && !DNI_RE.test(clean)) return validationMessages.dniInvalid;
  if (tipo === "Pasaporte" && !PASAPORTE_RE.test(clean)) return validationMessages.passportInvalid;
  return null;
}

export function validateBirthDate(fecha: string) {
  if (!fecha) return validationMessages.birthDateRequired;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!match) return validationMessages.dateInvalid;
  const [, yyyy, mm, dd] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd)
  ) return validationMessages.dateInvalid;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) return validationMessages.futureDate;
  const age = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age > 120) return validationMessages.unrealisticBirthDate;
  return null;
}
