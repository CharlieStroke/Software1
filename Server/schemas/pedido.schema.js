import { z } from 'zod';

const detallePedidoSchema = z.object({
  producto_id: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  precio_unitario: z.number().min(0),
  notas_item: z.string().optional().nullable()
});

export const pedidoSchema = z.object({
  cliente_id: z.number().int().positive().optional().nullable(),
  sucursal_id: z.number({
    required_error: 'La sucursal es requerida'
  }).int().positive(),
  tipo_pedido: z.enum(['mesa', 'domicilio', 'para_llevar']).optional(),
  notas: z.string().optional().nullable(),
  detalles: z.array(detallePedidoSchema).min(1, 'Debe incluir al menos un producto')
});

export const updateEstadoPedidoSchema = z.object({
  estado: z.enum(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'], {
    required_error: 'El estado es requerido'
  })
});

export const cancelarPedidoSchema = z.object({
  motivo: z.string().max(500).optional()
});
