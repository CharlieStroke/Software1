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

// Obtener usuarios (admin ve todos, dueño ve su sucursal, gerente ve meseros/cocineros/cajeros)
router.get(
  '/usuarios',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  getUsers
);

// Obtener usuarios activos (admin ve todos, dueño ve su sucursal, gerente ve meseros/cocineros/cajeros)
router.get(
  '/usuarios/activos',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  getUsersActivos
);

// Obtener usuarios por sucursal (admin, gerente, dueño)
router.get(
  '/usuarios/sucursal/:sucursalId',
  authRequired,
  checkRole('admin', 'gerente', 'dueño'),
  getUsersBySucursal
);

// Obtener usuario por ID (admin, dueño y gerente)
router.get(
  '/usuarios/:id',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  getUserById
);

// Crear nuevo usuario (admin y dueño - dueño solo roles inferiores)
router.post(
  '/usuarios',
  authRequired,
  checkRole('admin', 'dueño'),
  validateSchema(userSchema),
  createUser
);

// Actualizar usuario (admin y dueño - dueño solo roles inferiores)
router.put(
  '/usuarios/:id',
  authRequired,
  checkRole('admin', 'dueño'),
  validateSchema(updateUserSchema),
  updateUser
);

// Activar/Desactivar usuario (admin y dueño - dueño solo roles inferiores)
router.patch(
  '/usuarios/:id/toggle',
  authRequired,
  checkRole('admin', 'dueño'),
  toggleUserStatus
);

// Eliminar usuario (admin y dueño - dueño solo roles inferiores)
router.delete(
  '/usuarios/:id',
  authRequired,
  checkRole('admin', 'dueño'),
  deleteUser
);

export default router;
