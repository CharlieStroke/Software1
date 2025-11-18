import { Router } from 'express';
import {
  getUsers,
  getUsersActivos,
  getUsersBySucursal,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
} from '../controllers/Users.Controller.js';
import { authRequired, checkRole, isAdmin } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/Validator.Middleware.js';
import { userSchema, updateUserSchema } from '../schemas/user.schema.js';

const router = Router();

// Obtener todos los usuarios (admin y gerente)
router.get(
  '/usuarios',
  authRequired,
  checkRole(['admin', 'gerente']),
  getUsers
);

// Obtener usuarios activos (admin y gerente)
router.get(
  '/usuarios/activos',
  authRequired,
  checkRole(['admin', 'gerente']),
  getUsersActivos
);

// Obtener usuarios por sucursal (admin, gerente, dueño)
router.get(
  '/usuarios/sucursal/:sucursalId',
  authRequired,
  checkRole(['admin', 'gerente', 'dueño']),
  getUsersBySucursal
);

// Obtener usuario por ID (admin y gerente)
router.get(
  '/usuarios/:id',
  authRequired,
  checkRole(['admin', 'gerente']),
  getUserById
);

// Crear nuevo usuario (solo admin)
router.post(
  '/usuarios',
  authRequired,
  isAdmin,
  validateSchema(userSchema),
  createUser
);

// Actualizar usuario (solo admin)
router.put(
  '/usuarios/:id',
  authRequired,
  isAdmin,
  validateSchema(updateUserSchema),
  updateUser
);

// Activar/Desactivar usuario (solo admin)
router.patch(
  '/usuarios/:id/toggle',
  authRequired,
  isAdmin,
  toggleUserStatus
);

// Eliminar usuario (solo admin)
router.delete(
  '/usuarios/:id',
  authRequired,
  isAdmin,
  deleteUser
);

export default router;
