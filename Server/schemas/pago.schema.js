import { z } from 'zod';

// Schema para crear un pago
export const pagoSchema = z.object({
  comanda_id: z.coerce.number().int().positive({
    message: 'El ID de la comanda es requerido'
  }),
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'mixto'], {
    required_error: 'El método de pago es requerido',
    invalid_type_error: 'Método de pago inválido'
  }),
  monto_total: z.coerce.number().positive({
    message: 'El monto total debe ser mayor a 0'
  }),
  monto_efectivo: z.coerce.number().min(0).default(0),
  monto_tarjeta: z.coerce.number().min(0).default(0),
  monto_transferencia: z.coerce.number().min(0).default(0),
  monto_recibido: z.coerce.number().min(0).default(0),
  cambio: z.coerce.number().min(0).default(0),
  propina: z.union([z.coerce.number().min(0), z.literal('')]).transform(val => val === '' ? 0 : val).default(0),
  referencia_pago: z.union([z.string().max(100), z.literal('')]).optional().nullable(),
  notas: z.union([z.string(), z.literal('')]).optional().nullable()
}).refine((data) => {
  // Validar que los montos parciales sumen el total cuando es pago mixto
  if (data.metodo_pago === 'mixto') {
    const sumaParciales = data.monto_efectivo + data.monto_tarjeta + data.monto_transferencia;
    return Math.abs(sumaParciales - data.monto_total) < 0.01; // Tolerancia de 1 centavo
  }
  return true;
}, {
  message: 'La suma de los montos parciales debe ser igual al monto total',
  path: ['monto_total']
});

// Schema para obtener pagos con filtros
export const getPagosSchema = z.object({
  comanda_id: z.coerce.number().int().positive().optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'mixto']).optional()
});
