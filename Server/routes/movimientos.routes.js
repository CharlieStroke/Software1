import { Router } from 'express';
import {
  getMovimientos,
  getMovimientosByProducto
} from '../controllers/Movimientos.Controller.js';
import { authRequired, checkRole } from '../middlewares/validateToken.js';

const router = Router();

router.get(
  '/movimientos',
  authRequired,
  checkRole(['admin', 'gerente']),
  getMovimientos
);

router.get(
  '/movimientos/producto/:productoId',
  authRequired,
  checkRole(['admin', 'gerente']),
  getMovimientosByProducto
);

export default router;
