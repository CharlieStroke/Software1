import { Router } from 'express';
import {
  getPedidos,
  getPedidosBySucursal,
  getPedidosHoy,
  getComandas,
  getPedidoById,
  createPedido,
  updateEstadoPedido,
  cancelarPedido,
  getEstadisticasPedidos
} from '../controllers/Pedidos.Controller.js';
import { authRequired, checkRole } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/Validator.Middleware.js';
import { pedidoSchema, updateEstadoPedidoSchema, cancelarPedidoSchema } from '../schemas/pedido.schema.js';

const router = Router();

router.get('/pedidos', authRequired, getPedidos);
router.get('/pedidos/hoy', authRequired, getPedidosHoy);
router.get('/pedidos/sucursal/:sucursalId', authRequired, getPedidosBySucursal);
router.get('/pedidos/estadisticas', authRequired, checkRole(['admin', 'gerente', 'dueño']), getEstadisticasPedidos);
router.get('/pedidos/:id', authRequired, getPedidoById);

// Comandas (resumen de pedidos)
router.get('/comandas', authRequired, getComandas);

router.post(
  '/pedidos',
  authRequired,
  checkRole(['admin', 'gerente', 'mesero', 'cajero']),
  validateSchema(pedidoSchema),
  createPedido
);

router.patch(
  '/pedidos/:id/estado',
  authRequired,
  validateSchema(updateEstadoPedidoSchema),
  updateEstadoPedido
);

router.post(
  '/pedidos/:id/cancelar',
  authRequired,
  checkRole(['admin', 'gerente']),
  validateSchema(cancelarPedidoSchema),
  cancelarPedido
);

export default router;
