// src/data/mockData.ts
// Archivo de prueba para probar funcionalidades. Borrar para conectar con el back

// ==========================================
// 1. TIPOS COMPARTIDOS
// ==========================================
export type EstadoOperacion = "Recibido" | "En análisis" | "Observado" | "Aprobado" | "Rechazado";

export const ESPECIALIDADES = [
  "Clínica Médica", "Pediatría", "Odontología", "Oftalmología", 
  "Traumatología", "Cardiología", "Dermatología"
];

// ==========================================
// 2. INTERFACES (Modelos de la Base de Datos)
// ==========================================
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

// ==========================================
// 3. DATOS DE PRUEBA (MOCKS)
// ==========================================

// 🔹 REINTEGROS
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
  // --- DATOS EXTRA PARA PROBAR COMPORTAMIENTO CON MUCHOS REINTEGROS ---
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

// 🔹 AUTORIZACIONES
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

// 🔹 RECETAS
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
  }
];