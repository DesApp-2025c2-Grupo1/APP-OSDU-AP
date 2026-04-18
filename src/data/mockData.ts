//TIPOS COMPARTIDOS

export type EstadoOperacion = "Recibido" | "En análisis" | "Observado" | "Aprobado" | "Rechazado";

export const ESPECIALIDADES = [
  "Clínica Médica", "Pediatría", "Odontología", "Oftalmología",
  "Traumatología", "Cardiología", "Dermatología"
];

export const PROVINCIAS = [
  "Buenos Aires", "CABA", "Córdoba", "Santa Fe", "Mendoza"
];

export const LOCALIDADES_POR_PROVINCIA: Record<string, string[]> = {
  "Buenos Aires": ["Hurlingham", "Morón", "Haedo", "Ituzaingó", "Castelar", "Ramos Mejía", "Merlo"],
  "CABA": ["Palermo", "Belgrano", "Caballito", "Flores", "San Telmo", "Recoleta"],
  "Córdoba": ["Córdoba Capital", "Villa Carlos Paz", "Río Cuarto"],
  "Santa Fe": ["Rosario", "Santa Fe Capital", "Venado Tuerto"],
  "Mendoza": ["Mendoza Capital", "San Rafael", "Godoy Cruz"],
};

export interface CentroMedico {
  id: string;
  nombre: string;
  direccion: string;
  provincia: string;
  localidad: string;
  especialidades: string[];
  telefono: string;
  horario: string;
}

export interface Prestador {
  id: string;
  nombre: string;
  matricula: string;
  direccion: string;
  provincia: string;
  localidad: string;
  especialidades: string[];
  telefono: string;
}

export const mockCentrosMedicos: CentroMedico[] = [
  { id: "CM-001", nombre: "Clínica del Sol", direccion: "Av. Vergara 1250", provincia: "Buenos Aires", localidad: "Morón", especialidades: ["Clínica Médica", "Pediatría", "Cardiología"], telefono: "011-4629-0001", horario: "Lun–Vie 8–20hs" },
  { id: "CM-002", nombre: "Centro Médico Hurlingham", direccion: "Gdor. Vergara 350", provincia: "Buenos Aires", localidad: "Hurlingham", especialidades: ["Odontología", "Traumatología", "Clínica Médica"], telefono: "011-4665-0200", horario: "Lun–Sáb 7–21hs" },
  { id: "CM-003", nombre: "Sanatorio Oeste", direccion: "Rivadavia 4850", provincia: "Buenos Aires", localidad: "Castelar", especialidades: ["Cardiología", "Clínica Médica", "Dermatología"], telefono: "011-4628-1100", horario: "Lun–Dom 0–24hs" },
  { id: "CM-004", nombre: "Instituto Pediátrico Ramos", direccion: "Victorino de la Plaza 1090", provincia: "Buenos Aires", localidad: "Ramos Mejía", especialidades: ["Pediatría", "Odontología"], telefono: "011-4654-5500", horario: "Lun–Vie 9–18hs" },
  { id: "CM-005", nombre: "Centro Oftalmológico Palermo", direccion: "Av. Santa Fe 3620", provincia: "CABA", localidad: "Palermo", especialidades: ["Oftalmología"], telefono: "011-4832-7700", horario: "Lun–Vie 8–19hs" },
  { id: "CM-006", nombre: "Sanatorio Belgrano", direccion: "Echeverría 2456", provincia: "CABA", localidad: "Belgrano", especialidades: ["Clínica Médica", "Cardiología", "Traumatología"], telefono: "011-4788-3300", horario: "Lun–Dom 0–24hs" },
  { id: "CM-007", nombre: "Clínica Caballito", direccion: "Av. Rivadavia 5100", provincia: "CABA", localidad: "Caballito", especialidades: ["Dermatología", "Clínica Médica", "Pediatría"], telefono: "011-4902-6600", horario: "Lun–Sáb 8–20hs" },
  { id: "CM-008", nombre: "Centro Médico Córdoba Sur", direccion: "Humberto Primo 2340", provincia: "Córdoba", localidad: "Córdoba Capital", especialidades: ["Traumatología", "Clínica Médica", "Odontología"], telefono: "0351-422-8800", horario: "Lun–Vie 7–20hs" },
  { id: "CM-009", nombre: "Instituto Cardiovascular Rosario", direccion: "Mitre 1820", provincia: "Santa Fe", localidad: "Rosario", especialidades: ["Cardiología", "Clínica Médica"], telefono: "0341-488-1200", horario: "Lun–Dom 0–24hs" },
  { id: "CM-010", nombre: "Clínica Mendoza Norte", direccion: "San Martín 1540", provincia: "Mendoza", localidad: "Mendoza Capital", especialidades: ["Clínica Médica", "Pediatría", "Dermatología"], telefono: "0261-423-5500", horario: "Lun–Sáb 8–21hs" },
  { id: "CM-011", nombre: "Centro de Traumatología Merlo", direccion: "Libertad 890", provincia: "Buenos Aires", localidad: "Merlo", especialidades: ["Traumatología", "Clínica Médica"], telefono: "0220-482-3300", horario: "Lun–Vie 8–18hs" },
  { id: "CM-012", nombre: "Clínica Recoleta", direccion: "Posadas 1540", provincia: "CABA", localidad: "Recoleta", especialidades: ["Cardiología", "Dermatología", "Oftalmología"], telefono: "011-4807-9900", horario: "Lun–Vie 8–20hs" },
];

export const mockPrestadores: Prestador[] = [
  { id: "P-001", nombre: "Dr. Alejandro Ferreyra", matricula: "MN 58432", direccion: "Gdor. Vergara 410, Of. 3", provincia: "Buenos Aires", localidad: "Hurlingham", especialidades: ["Clínica Médica"], telefono: "011-4665-1001" },
  { id: "P-002", nombre: "Dra. Valeria Montero", matricula: "MN 72110", direccion: "Av. Vergara 870, Piso 1", provincia: "Buenos Aires", localidad: "Morón", especialidades: ["Pediatría"], telefono: "011-4629-2002" },
  { id: "P-003", nombre: "Dr. Nicolás Bravo", matricula: "MN 61540", direccion: "Rivadavia 3120", provincia: "Buenos Aires", localidad: "Castelar", especialidades: ["Cardiología", "Clínica Médica"], telefono: "011-4628-3003" },
  { id: "P-004", nombre: "Dra. Sofía Paredes", matricula: "MN 80045", direccion: "Av. Santa Fe 4010, Of. 7", provincia: "CABA", localidad: "Palermo", especialidades: ["Dermatología"], telefono: "011-4832-4004" },
  { id: "P-005", nombre: "Dr. Ernesto Giménez", matricula: "MN 55230", direccion: "Echeverría 1900", provincia: "CABA", localidad: "Belgrano", especialidades: ["Traumatología"], telefono: "011-4788-5005" },
  { id: "P-006", nombre: "Dra. Claudia Ríos", matricula: "MN 69870", direccion: "Av. Rivadavia 5540, Piso 2", provincia: "CABA", localidad: "Caballito", especialidades: ["Oftalmología"], telefono: "011-4902-6006" },
  { id: "P-007", nombre: "Dr. Marcelo Aguirre", matricula: "MP 34120", direccion: "Colón 780", provincia: "Córdoba", localidad: "Córdoba Capital", especialidades: ["Odontología"], telefono: "0351-422-7007" },
  { id: "P-008", nombre: "Dra. Patricia Vidal", matricula: "MP 41300", direccion: "Mitre 2100, Of. 4", provincia: "Santa Fe", localidad: "Rosario", especialidades: ["Cardiología"], telefono: "0341-488-8008" },
  { id: "P-009", nombre: "Dr. Luis Herrera", matricula: "MM 22540", direccion: "San Martín 1200", provincia: "Mendoza", localidad: "Mendoza Capital", especialidades: ["Clínica Médica", "Pediatría"], telefono: "0261-423-9009" },
  { id: "P-010", nombre: "Dra. Florencia Méndez", matricula: "MN 77660", direccion: "Posadas 1600, Of. 12", provincia: "CABA", localidad: "Recoleta", especialidades: ["Dermatología", "Clínica Médica"], telefono: "011-4807-1010" },
  { id: "P-011", nombre: "Dr. Sebastián Romero", matricula: "MN 63450", direccion: "Libertad 1020", provincia: "Buenos Aires", localidad: "Merlo", especialidades: ["Traumatología"], telefono: "0220-482-1111" },
  { id: "P-012", nombre: "Dra. Ana Kovalev", matricula: "MN 85210", direccion: "Victorino de la Plaza 980", provincia: "Buenos Aires", localidad: "Ramos Mejía", especialidades: ["Pediatría", "Clínica Médica"], telefono: "011-4654-1212" },
];

// INTERFACES (Modelos de la Base de Datos)
export interface Factura {
  fecha: string;
  cuit: string;
  valorTotal: number;
  personaFacturada: string;
}

export interface Reintegro {
  id: string;
  fechaPrestacion: string;
  idIntegrante: string; 
  medico: string;
  especialidad: string;
  lugarAtencion: string;
  factura: Factura;
  formaPago: "Cheque" | "Efectivo" | "Transferencia";
  cbu?: string; 
  observaciones: string;
  estado: EstadoOperacion;
  fechaEstado: string; 
  mensajeObservacion?: string; 
}

export interface Autorizacion {
  id: string;
  fechaPrevista: string;
  idIntegrante: string;
  medico: string;
  especialidad: string;
  lugarPrestacion: string;
  diasInternacion: number;
  observaciones: string;
  estado: EstadoOperacion;
  fechaEstado: string;
  mensajeObservacion?: string;
}

export interface Receta {
  id: string;
  fecha: string;
  idIntegrante: string;
  medicamento: string;
  cantidad: number;
  presentacion: "Blister" | "Cápsulas" | "Pastillas" | "Inyectable" | "Gotas" | "Otro";
  observaciones: string;
  estado: EstadoOperacion;
  fechaEstado: string; 
  mensajeObservacion?: string;
}

// 3. DATOS DE PRUEBA (MOCKS)

// REINTEGROS
export const mockReintegros: Reintegro[] = [
  {
    id: "R-001", fechaPrestacion: "2026-03-20", idIntegrante: "101", medico: "Dr. Pérez", especialidad: "Odontología", lugarAtencion: "Consultorio Centro",
    factura: { fecha: "2026-03-20", cuit: "20-12345678-9", valorTotal: 15000, personaFacturada: "Octavio Pérez" },
    formaPago: "Transferencia", cbu: "0140000000000000000001", observaciones: "Arreglo de caries",
    estado: "Recibido", fechaEstado: "2026-04-10"
  },
  {
    id: "R-002", fechaPrestacion: "2026-03-25", idIntegrante: "102", medico: "Dra. Silva", especialidad: "Clínica Médica", lugarAtencion: "Hospital Alemán",
    factura: { fecha: "2026-03-25", cuit: "27-55555555-5", valorTotal: 8000, personaFacturada: "Rocío González" },
    formaPago: "Efectivo", observaciones: "Consulta general",
    estado: "En análisis", fechaEstado: "2026-04-11"
  },
  {
    id: "R-003", fechaPrestacion: "2026-03-15", idIntegrante: "103", medico: "Dra. Gómez", especialidad: "Pediatría", lugarAtencion: "Clínica Trinidad",
    factura: { fecha: "2026-03-15", cuit: "27-98765432-1", valorTotal: 25000, personaFacturada: "Octavio Pérez" },
    formaPago: "Transferencia", cbu: "0140000000000000000001", observaciones: "Control mensual",
    estado: "Observado", fechaEstado: "2026-04-05", mensajeObservacion: "La factura adjunta no es legible. Resubir."
  },
  {
    id: "R-004", fechaPrestacion: "2026-04-01", idIntegrante: "101", medico: "Dr. López", especialidad: "Traumatología", lugarAtencion: "Sanatorio Oeste",
    factura: { fecha: "2026-04-01", cuit: "20-11111111-2", valorTotal: 50000, personaFacturada: "Octavio Pérez" },
    formaPago: "Cheque", observaciones: "Radiografías",
    estado: "Aprobado", fechaEstado: "2026-04-13" 
  },
  {
    id: "R-005", fechaPrestacion: "2026-04-02", idIntegrante: "102", medico: "Dra. Ruiz", especialidad: "Dermatología", lugarAtencion: "Centro Piel",
    factura: { fecha: "2026-04-02", cuit: "27-22222222-3", valorTotal: 12000, personaFacturada: "Rocío González" },
    formaPago: "Transferencia", cbu: "0140000000000000000001", observaciones: "Tratamiento estético",
    estado: "Rechazado", fechaEstado: "2026-04-12", mensajeObservacion: "Práctica no cubierta por el plan actual."
  },
  // DATOS EXTRA PARA PROBAR COMPORTAMIENTO CON MUCHOS REINTEGROS
  {
    id: "R-EXTRA-1", fechaPrestacion: "2026-04-05", idIntegrante: "101", medico: "Dr. Test 1", especialidad: "Odontología", lugarAtencion: "Clínica Prueba",
    factura: { fecha: "2026-04-05", cuit: "20-11111111-1", valorTotal: 1000, personaFacturada: "Octavio Pérez" },
    formaPago: "Efectivo", observaciones: "Prueba paginación", estado: "Recibido", fechaEstado: "2026-04-10"
  },
  {
    id: "R-EXTRA-2", fechaPrestacion: "2026-04-06", idIntegrante: "101", medico: "Dr. Test 2", especialidad: "Pediatría", lugarAtencion: "Clínica Prueba",
    factura: { fecha: "2026-04-06", cuit: "20-11111111-1", valorTotal: 2000, personaFacturada: "Octavio Pérez" },
    formaPago: "Efectivo", observaciones: "Prueba paginación", estado: "Recibido", fechaEstado: "2026-04-10"
  },
  {
    id: "R-EXTRA-3", fechaPrestacion: "2026-04-07", idIntegrante: "101", medico: "Dr. Test 3", especialidad: "Cardiología", lugarAtencion: "Clínica Prueba",
    factura: { fecha: "2026-04-07", cuit: "20-11111111-1", valorTotal: 3000, personaFacturada: "Octavio Pérez" },
    formaPago: "Efectivo", observaciones: "Prueba paginación", estado: "Recibido", fechaEstado: "2026-04-10"
  },
  {
    id: "R-EXTRA-4", fechaPrestacion: "2026-04-08", idIntegrante: "101", medico: "Dr. Test 4", especialidad: "Dermatología", lugarAtencion: "Clínica Prueba",
    factura: { fecha: "2026-04-08", cuit: "20-11111111-1", valorTotal: 4000, personaFacturada: "Octavio Pérez" },
    formaPago: "Efectivo", observaciones: "Prueba paginación", estado: "Recibido", fechaEstado: "2026-04-10"
  },
  {
    id: "R-EXTRA-5", fechaPrestacion: "2026-04-09", idIntegrante: "101", medico: "Dr. Test 5", especialidad: "Oftalmología", lugarAtencion: "Clínica Prueba",
    factura: { fecha: "2026-04-09", cuit: "20-11111111-1", valorTotal: 5000, personaFacturada: "Octavio Pérez" },
    formaPago: "Efectivo", observaciones: "Prueba paginación", estado: "Recibido", fechaEstado: "2026-04-10"
  },
  {
    id: "R-EXTRA-6", fechaPrestacion: "2026-04-10", idIntegrante: "101", medico: "Dr. Test 6", especialidad: "Traumatología", lugarAtencion: "Clínica Prueba",
    factura: { fecha: "2026-04-10", cuit: "20-11111111-1", valorTotal: 6000, personaFacturada: "Octavio Pérez" },
    formaPago: "Efectivo", observaciones: "Prueba paginación", estado: "Recibido", fechaEstado: "2026-04-10"
  }
];

//AUTORIZACIONES
export const mockAutorizaciones: Autorizacion[] = [
  {
    id: "A-001", fechaPrevista: "2026-05-10", idIntegrante: "101", medico: "Dr. Rossi", especialidad: "Traumatología",
    lugarPrestacion: "Sanatorio Finochietto", diasInternacion: 2, observaciones: "Cirugía de meniscos",
    estado: "Recibido", fechaEstado: "2026-04-10"
  },
  {
    id: "A-002", fechaPrevista: "2026-05-15", idIntegrante: "102", medico: "Dra. Paz", especialidad: "Cardiología",
    lugarPrestacion: "Instituto Cardiovascular", diasInternacion: 1, observaciones: "Estudio Holter",
    estado: "En análisis", fechaEstado: "2026-04-11"
  },
  {
    id: "A-003", fechaPrevista: "2026-05-20", idIntegrante: "103", medico: "Dr. Justo", especialidad: "Oftalmología",
    lugarPrestacion: "Clínica de Ojos", diasInternacion: 0, observaciones: "Operación láser",
    estado: "Observado", fechaEstado: "2026-04-09", mensajeObservacion: "Falta historia clínica previa."
  },
  {
    id: "A-004", fechaPrevista: "2026-05-01", idIntegrante: "101", medico: "Dra. Vega", especialidad: "Clínica Médica",
    lugarPrestacion: "Hospital Italiano", diasInternacion: 0, observaciones: "Chequeo preventivo",
    estado: "Aprobado", fechaEstado: "2026-04-14"
  },
  {
    id: "A-005", fechaPrevista: "2026-04-25", idIntegrante: "102", medico: "Dr. Blanco", especialidad: "Odontología",
    lugarPrestacion: "Consultorio Norte", diasInternacion: 0, observaciones: "Implante dental",
    estado: "Rechazado", fechaEstado: "2026-04-13", mensajeObservacion: "Requiere auditoría presencial."
  }
];

//RECETAS
export const mockRecetas: Receta[] = [
  {
    id: "REC-001", fecha: "2026-04-05", idIntegrante: "103", medicamento: "Ibuprofeno Pediátrico 2%",
    cantidad: 1, presentacion: "Gotas", observaciones: "Para la fiebre",
    estado: "Recibido", fechaEstado: "2026-04-05" 
  },
  {
    id: "REC-002", fecha: "2026-04-08", idIntegrante: "101", medicamento: "Losartán 50mg",
    cantidad: 2, presentacion: "Pastillas", observaciones: "Hipertensión",
    estado: "En análisis", fechaEstado: "2026-04-09" 
  },
  {
    id: "REC-003", fecha: "2026-04-07", idIntegrante: "102", medicamento: "Clonazepam 0.5mg",
    cantidad: 1, presentacion: "Pastillas", observaciones: "Tomar de noche",
    estado: "Observado", fechaEstado: "2026-04-08", mensajeObservacion: "La receta no tiene la firma del profesional clara."
  },
  {
    id: "REC-004", fecha: "2026-04-10", idIntegrante: "101", medicamento: "Amoxicilina 500mg",
    cantidad: 2, presentacion: "Cápsulas", observaciones: "Cada 8 horas",
    estado: "Aprobado", fechaEstado: "2026-04-12" 
  },
  {
    id: "REC-005", fecha: "2026-04-09", idIntegrante: "103", medicamento: "Vitamina C",
    cantidad: 3, presentacion: "Gotas", observaciones: "Suplemento",
    estado: "Rechazado", fechaEstado: "2026-04-13", mensajeObservacion: "Venta libre, no requiere autorización médica."
  },
  {
    id: "REC-006", fecha: "2026-04-08", idIntegrante: "101", medicamento: "Tafirol 500mg",
    cantidad: 2, presentacion: "Pastillas", observaciones: "Hipertensión",
    estado: "Recibido", fechaEstado: "2026-04-09" 
  },
  {
    id: "REC-007", fecha: "2026-04-08", idIntegrante: "101", medicamento: "Tafirol 500mg",
    cantidad: 2, presentacion: "Pastillas", observaciones: "Hipertensión",
    estado: "Recibido", fechaEstado: "2026-04-09" 
  },
  {
    id: "REC-008", fecha: "2026-04-08", idIntegrante: "101", medicamento: "Tafirol 500mg",
    cantidad: 2, presentacion: "Pastillas", observaciones: "Hipertensión",
    estado: "Recibido", fechaEstado: "2026-04-09" 
  },
  {
    id: "REC-009", fecha: "2026-04-08", idIntegrante: "101", medicamento: "Tafirol 500mg",
    cantidad: 2, presentacion: "Pastillas", observaciones: "Hipertensión",
    estado: "Recibido", fechaEstado: "2026-04-09" 
  },
  {
    id: "REC-010", fecha: "2026-04-08", idIntegrante: "101", medicamento: "Tafirol 500mg",
    cantidad: 2, presentacion: "Pastillas", observaciones: "Hipertensión",
    estado: "Recibido", fechaEstado: "2026-04-09" 
  },
  {
    id: "REC-011", fecha: "2026-04-08", idIntegrante: "101", medicamento: "Tafirol 500mg",
    cantidad: 2, presentacion: "Pastillas", observaciones: "Hipertensión",
    estado: "Recibido", fechaEstado: "2026-04-09" 
  },
  {
    id: "REC-012", fecha: "2026-04-08", idIntegrante: "101", medicamento: "Tafirol 500mg",
    cantidad: 2, presentacion: "Pastillas", observaciones: "Hipertensión",
    estado: "Recibido", fechaEstado: "2026-04-09" 
  }
];