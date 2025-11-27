import { Router } from 'express';
import {
  getSucursales,
  getSucursalesActivas,
  getSucursalById,
  createSucursal,
  updateSucursal,
  toggleSucursalStatus,
  deleteSucursal,
  getSucursalStats
} from '../controllers/Sucursal.Controller.js';
import { authRequired, checkRole, isAdmin } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/Validator.Middleware.js';
import { sucursalSchema, updateSucursalSchema } from '../schemas/sucursal.schema.js';

const router = Router();

// Rutas públicas o con autenticación básica
// GET /api/sucursales - Obtener todas las sucursales (requiere autenticación)
router.get(
  '/sucursales',
  authRequired,
  getSucursales
);

// GET /api/sucursales/activas - Obtener solo sucursales activas (requiere autenticación)
router.get(
  '/sucursales/activas',
  authRequired,
  getSucursalesActivas
);

// GET /api/sucursales/:id - Obtener sucursal por ID (requiere autenticación)
router.get(
  '/sucursales/:id',
  authRequired,
  getSucursalById
);

// GET /api/sucursales/:id/stats - Obtener estadísticas de sucursal (admin, gerente, dueño)
router.get(
  '/sucursales/:id/stats',
  authRequired,
  checkRole('admin', 'gerente', 'dueño'),
  getSucursalStats
);

// Rutas que requieren permisos especiales
// POST /api/sucursales - Crear nueva sucursal (solo admin y dueño)
router.post(
  '/sucursales',
  authRequired,
  checkRole('admin', 'dueño'),
  validateSchema(sucursalSchema),
  createSucursal
);

// PUT /api/sucursales/:id - Actualizar sucursal (admin, gerente, dueño)
router.put(
  '/sucursales/:id',
  authRequired,
  checkRole('admin', 'gerente', 'dueño'),
  validateSchema(updateSucursalSchema),
  updateSucursal
);

// PATCH /api/sucursales/:id/toggle - Activar/desactivar sucursal (solo admin y dueño)
router.patch(
  '/sucursales/:id/toggle',
  authRequired,
  checkRole('admin', 'dueño'),
  toggleSucursalStatus
);

// DELETE /api/sucursales/:id - Eliminar sucursal (solo admin)
router.delete(
  '/sucursales/:id',
  authRequired,
  isAdmin,
  deleteSucursal
);

export default router;
