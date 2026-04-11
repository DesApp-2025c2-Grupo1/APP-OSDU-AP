// archivo de prueba para probar funcionalidades. Borrar para conectar con el back

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
  idIntegrante: string; // 🔹 Se conecta con el ID de la Persona (Ej: "101")
  medico: string;
  especialidad: string;
  lugarAtencion: string;
  factura: Factura;
  formaPago: "Cheque" | "Efectivo" | "Transferencia";
  cbu?: string; // Solo si la forma de pago es Transferencia
  observaciones: string;
  estado: EstadoOperacion;
  fechaEstado: string; // Para calcular lo de "última semana"
  mensajeObservacion?: string; // Lo que audita la obra social
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
}

// ==========================================
// 3. DATOS DE PRUEBA (MOCKS)
// ==========================================

// 🔹 REINTEGROS DE PRUEBA
export const mockReintegros: Reintegro[] = [
  {
    id: "R-001",
    fechaPrestacion: "2026-03-20",
    idIntegrante: "101", // Octavio
    medico: "Dr. Pérez",
    especialidad: "Odontología",
    lugarAtencion: "Consultorio Centro",
    factura: { fecha: "2026-03-20", cuit: "20-12345678-9", valorTotal: 15000, personaFacturada: "Octavio Pérez" },
    formaPago: "Transferencia",
    cbu: "0140000000000000000001",
    observaciones: "Arreglo de caries",
    estado: "Recibido", // Se puede modificar/eliminar
    fechaEstado: "2026-04-10"
  },
  {
    id: "R-002",
    fechaPrestacion: "2026-03-15",
    idIntegrante: "103", // Lucas (Hijo)
    medico: "Dra. Gómez",
    especialidad: "Pediatría",
    lugarAtencion: "Clínica de la Trinidad",
    factura: { fecha: "2026-03-15", cuit: "27-98765432-1", valorTotal: 25000, personaFacturada: "Octavio Pérez" },
    formaPago: "Transferencia",
    cbu: "0140000000000000000001",
    observaciones: "Control mensual",
    estado: "Observado", // Requiere respuesta del usuario
    fechaEstado: "2026-04-05",
    mensajeObservacion: "La factura adjunta no es legible. Por favor, vuelva a subir el documento."
  },
  {
    id: "R-003",
    fechaPrestacion: "2026-04-01",
    idIntegrante: "102", // Rocío
    medico: "Dra. Silva",
    especialidad: "Clínica Médica",
    lugarAtencion: "Hospital Alemán",
    factura: { fecha: "2026-04-01", cuit: "30-55555555-5", valorTotal: 8000, personaFacturada: "Rocío González" },
    formaPago: "Efectivo",
    observaciones: "Consulta general",
    estado: "Aprobado", // Ya cerrado
    fechaEstado: new Date().toISOString().split('T')[0] // Hoy (simulando última semana)
  }
];

// 🔹 AUTORIZACIONES DE PRUEBA
export const mockAutorizaciones: Autorizacion[] = [
  {
    id: "A-001",
    fechaPrevista: "2026-05-10",
    idIntegrante: "101",
    medico: "Dr. Rossi",
    especialidad: "Traumatología",
    lugarPrestacion: "Sanatorio Finochietto",
    diasInternacion: 2,
    observaciones: "Cirugía de meniscos",
    estado: "En análisis", // Pendiente
    fechaEstado: "2026-04-08"
  }
];

// 🔹 RECETAS DE PRUEBA
export const mockRecetas: Receta[] = [
  {
    id: "REC-001",
    fecha: "2026-04-02",
    idIntegrante: "101",
    medicamento: "Amoxicilina 500mg",
    cantidad: 2,
    presentacion: "Pastillas",
    observaciones: "Tomar cada 8 horas",
    estado: "Aprobado"
  },
  {
    id: "REC-002",
    fecha: "2026-04-05",
    idIntegrante: "103", // Lucas
    medicamento: "Ibuprofeno Pediátrico 2%",
    cantidad: 1,
    presentacion: "Gotas",
    observaciones: "Para la fiebre",
    estado: "Recibido"
  }
];