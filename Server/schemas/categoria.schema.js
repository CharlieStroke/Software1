import { z } from 'zod';

export const categoriaSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre es requerido'
  }).min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  descripcion: z.string()
    .optional()
    .nullable()
});

export const updateCategoriaSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),

  descripcion: z.string()
    .optional()
    .nullable(),

  activa: z.boolean()
    .optional()
});
