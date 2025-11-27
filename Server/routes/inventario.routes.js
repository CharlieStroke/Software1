import { Router } from 'express';
import {
  getInventario,
  getInventarioBySucursal,
  getInventarioBajo,
  getProductoById,
  createProducto,
  updateProducto,
  ajustarStock,
  toggleProductoStatus,
  deleteProducto
} from '../controllers/Inventario.Controller.js';
import { authRequired, checkRole } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/Validator.Middleware.js';
import { inventarioSchema, updateInventarioSchema, ajustarStockSchema } from '../schemas/inventario.schema.js';

const router = Router();

router.get('/inventario', authRequired, getInventario);
router.get('/inventario/sucursal/:sucursalId', authRequired, getInventarioBySucursal);
router.get('/inventario/bajo', authRequired, getInventarioBajo);
router.get('/inventario/:id', authRequired, getProductoById);

router.post(
  '/inventario',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  validateSchema(inventarioSchema),
  createProducto
);

router.put(
  '/inventario/:id',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  validateSchema(updateInventarioSchema),
  updateProducto
);

router.post(
  '/inventario/:id/ajustar',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  validateSchema(ajustarStockSchema),
  ajustarStock
);

router.patch(
  '/inventario/:id/toggle',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  toggleProductoStatus
);

router.delete(
  '/inventario/:id',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  deleteProducto
);

export default router;
