import { z } from 'zod';

export const clienteSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre es requerido'
  }).min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  apellido: z.string()
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional()
    .nullable(),

  telefono: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .nullable(),

  email: z.string()
    .email('Email inválido')
    .max(150, 'El email no puede exceder 150 caracteres')
    .optional()
    .nullable(),

  direccion: z.string()
    .optional()
    .nullable(),

  id_sucursal: z.number()
    .int()
    .positive()
    .optional()
    .nullable()
});

export const updateClienteSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),

  apellido: z.string()
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional()
    .nullable(),

  telefono: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .nullable(),

  email: z.string()
    .email('Email inválido')
    .max(150, 'El email no puede exceder 150 caracteres')
    .optional()
    .nullable(),

  direccion: z.string()
    .optional()
    .nullable(),

  id_sucursal: z.number()
    .int()
    .positive()
    .optional()
    .nullable()
});
