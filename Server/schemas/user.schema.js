import { z } from 'zod';

// Schema para crear usuario
export const userSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre es requerido'
  }).min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  apellido: z.string({
    required_error: 'El apellido es requerido'
  }).min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),

  email: z.string({
    required_error: 'El email es requerido'
  }).email('Email inválido')
    .max(150, 'El email no puede exceder 150 caracteres'),

  password: z.string({
    required_error: 'La contraseña es requerida'
  }).min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres'),

  telefono: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .nullable(),

  rol: z.enum(['admin', 'gerente', 'mesero', 'cocinero', 'cajero', 'dueño'], {
    errorMap: () => ({ message: 'Rol inválido' })
  }).optional(),

  id_sucursal: z.number()
    .int('El ID de sucursal debe ser un número entero')
    .positive('El ID de sucursal debe ser positivo')
    .optional()
    .nullable()
});

// Schema para actualizar usuario
export const updateUserSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),

  apellido: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional(),

  email: z.string()
    .email('Email inválido')
    .max(150, 'El email no puede exceder 150 caracteres')
    .optional(),

  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres')
    .optional(),

  telefono: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .nullable(),

  rol: z.enum(['admin', 'gerente', 'mesero', 'cocinero', 'cajero', 'dueño'])
    .optional(),

  id_sucursal: z.number()
    .int('El ID de sucursal debe ser un número entero')
    .positive('El ID de sucursal debe ser positivo')
    .optional()
    .nullable(),

  activo: z.boolean()
    .optional()
});
