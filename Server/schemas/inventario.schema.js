import { z } from 'zod';

export const inventarioSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre es requerido'
  }).min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),

  descripcion: z.string()
    .optional()
    .nullable(),

  categoria_id: z.coerce.number()
    .int()
    .positive()
    .optional()
    .nullable(),

  precio: z.coerce.number()
    .min(0, 'El precio no puede ser negativo')
    .optional(),

  costo: z.coerce.number()
    .min(0, 'El costo no puede ser negativo')
    .optional(),

  stock_actual: z.coerce.number()
    .int()
    .min(0, 'El stock no puede ser negativo')
    .optional(),

  stock_minimo: z.coerce.number()
    .int()
    .min(0, 'El stock mínimo no puede ser negativo')
    .optional(),

  unidad_medida: z.enum(['unidad', 'kg', 'gr', 'lt', 'ml', 'porcion'])
    .optional(),

  sucursal_id: z.coerce.number()
    .int()
    .positive()
    .optional()
    .nullable()
});

export const updateInventarioSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .optional(),

  descripcion: z.string()
    .optional()
    .nullable(),

  categoria_id: z.coerce.number()
    .int()
    .positive()
    .optional()
    .nullable(),

  precio: z.coerce.number()
    .min(0, 'El precio no puede ser negativo')
    .optional(),

  costo: z.coerce.number()
    .min(0, 'El costo no puede ser negativo')
    .optional(),

  stock_actual: z.coerce.number()
    .int()
    .min(0, 'El stock no puede ser negativo')
    .optional(),

  stock_minimo: z.coerce.number()
    .int()
    .min(0, 'El stock mínimo no puede ser negativo')
    .optional(),

  unidad_medida: z.enum(['unidad', 'kg', 'gr', 'lt', 'ml', 'porcion'])
    .optional(),

  sucursal_id: z.coerce.number()
    .int()
    .positive()
    .optional()
    .nullable(),

  activo: z.boolean()
    .optional()
});

export const ajustarStockSchema = z.object({
  cantidad: z.number({
    required_error: 'La cantidad es requerida'
  }).int('La cantidad debe ser un número entero'),

  motivo: z.string()
    .max(200)
    .optional()
});
