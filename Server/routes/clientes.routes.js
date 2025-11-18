import { Router } from 'express';
import {
  getClientes,
  getClienteById,
  getClientesBySucursal,
  searchClientes,
  createCliente,
  updateCliente,
  deleteCliente
} from '../controllers/Clientes.Controller.js';
import { authRequired, checkRole } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/Validator.Middleware.js';
import { clienteSchema, updateClienteSchema } from '../schemas/cliente.schema.js';

const router = Router();

router.get('/clientes', authRequired, getClientes);
router.get('/clientes/search', authRequired, searchClientes);
router.get('/clientes/sucursal/:sucursalId', authRequired, getClientesBySucursal);
router.get('/clientes/:id', authRequired, getClienteById);

router.post(
  '/clientes',
  authRequired,
  validateSchema(clienteSchema),
  createCliente
);

router.put(
  '/clientes/:id',
  authRequired,
  validateSchema(updateClienteSchema),
  updateCliente
);

router.delete(
  '/clientes/:id',
  authRequired,
  checkRole(['admin', 'gerente']),
  deleteCliente
);

export default router;
