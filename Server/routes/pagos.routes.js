import { Router } from 'express';
import {
  registrarPago,
  getPagos,
  getPagosByComanda,
  getPagoById,
  cancelarPago
} from '../controllers/Pagos.Controller.js';
import { authRequired, checkRole } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/Validator.Middleware.js';
import { pagoSchema, getPagosSchema } from '../schemas/pago.schema.js';

const router = Router();

// Registrar un nuevo pago
router.post(
  '/pagos',
  authRequired,
  checkRole('admin', 'dueño', 'gerente', 'cajero', 'mesero'),
  validateSchema(pagoSchema),
  registrarPago
);

// Obtener todos los pagos con filtros
router.get(
  '/pagos',
  authRequired,
  checkRole('admin', 'dueño', 'gerente', 'cajero'),
  getPagos
);

// Obtener pagos de una comanda específica
router.get(
  '/pagos/comanda/:comanda_id',
  authRequired,
  checkRole('admin', 'dueño', 'gerente', 'cajero', 'mesero'),
  getPagosByComanda
);

// Obtener un pago por ID
router.get(
  '/pagos/:id',
  authRequired,
  checkRole('admin', 'dueño', 'gerente', 'cajero'),
  getPagoById
);

// Cancelar un pago
router.delete(
  '/pagos/:id',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  cancelarPago
);

export default router;
