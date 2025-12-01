import { z } from 'zod';

// Esquemas de validación con Zod

// Validación para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

// Validación para registro de usuario
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['ADMIN', 'PROFESOR']).optional()
});

// Validación para curso
export const courseSchema = z.object({
  name: z.string().min(2, 'El nombre del curso debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  year: z.number().int().min(2020).max(2030),
  division: z.string().min(1, 'La división es requerida'),
  teacherId: z.string().uuid('ID de profesor inválido').optional()
});

// Validación para estudiante
export const studentSchema = z.object({
  dni: z.string().min(7, 'DNI debe tener al menos 7 caracteres').max(10, 'DNI debe tener máximo 10 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().datetime().optional().or(z.literal(''))
});

// Validación para inscripción
export const enrollmentSchema = z.object({
  studentId: z.string().uuid('ID de estudiante inválido'),
  courseId: z.string().uuid('ID de curso inválido')
});

// Validación para asistencia
export const attendanceSchema = z.object({
  studentId: z.string().uuid('ID de estudiante inválido'),
  courseId: z.string().uuid('ID de curso inválido'),
  date: z.string().datetime('Fecha inválida'),
  status: z.enum(['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO']),
  notes: z.string().optional()
});

// Validación para múltiples asistencias
export const bulkAttendanceSchema = z.object({
  courseId: z.string().uuid('ID de curso inválido'),
  date: z.string().datetime('Fecha inválida'),
  attendances: z.array(z.object({
    studentId: z.string().uuid('ID de estudiante inválido'),
    status: z.enum(['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO']),
    notes: z.string().optional()
  }))
});

// Función helper para validar datos
export const validateData = (schema, data) => {
  try {
    return schema.parse(data);
  } catch (error) {
    throw error;
  }
};
