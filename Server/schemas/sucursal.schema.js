import { z } from 'zod';

// Schema para crear sucursal
export const sucursalSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre es requerido'
  }).min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),

  direccion: z.string({
    required_error: 'La dirección es requerida'
  }).min(10, 'La dirección debe tener al menos 10 caracteres'),

  telefono: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .nullable(),

  email: z.string()
    .email('Email inválido')
    .max(150, 'El email no puede exceder 150 caracteres')
    .optional()
    .nullable(),

  gerente: z.string()
    .max(200, 'El nombre del gerente no puede exceder 200 caracteres')
    .optional()
    .nullable(),

  horario_apertura: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Formato de hora inválido (HH:MM:SS)')
    .optional()
    .nullable(),

  horario_cierre: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Formato de hora inválido (HH:MM:SS)')
    .optional()
    .nullable(),

  capacidad: z.coerce.number()
    .int('La capacidad debe ser un número entero')
    .min(0, 'La capacidad no puede ser negativa')
    .optional()
    .nullable(),

  fecha_apertura: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional()
    .nullable()
});

// Schema para actualizar sucursal (todos los campos opcionales)
export const updateSucursalSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .optional(),

  direccion: z.string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .optional(),

  telefono: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .nullable(),

  email: z.string()
    .email('Email inválido')
    .max(150, 'El email no puede exceder 150 caracteres')
    .optional()
    .nullable(),

  gerente: z.string()
    .max(200, 'El nombre del gerente no puede exceder 200 caracteres')
    .optional()
    .nullable(),

  horario_apertura: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Formato de hora inválido (HH:MM:SS)')
    .optional()
    .nullable(),

  horario_cierre: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Formato de hora inválido (HH:MM:SS)')
    .optional()
    .nullable(),

  capacidad: z.coerce.number()
    .int('La capacidad debe ser un número entero')
    .min(0, 'La capacidad no puede ser negativa')
    .optional()
    .nullable(),

  fecha_apertura: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional()
    .nullable(),

  activa: z.boolean()
    .optional()
});
