import { Router } from 'express';
import {
  getCategorias,
  getCategoriasActivas,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  toggleCategoriaStatus,
  deleteCategoria
} from '../controllers/Categorias.Controller.js';
import { authRequired, checkRole, isAdmin } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/Validator.Middleware.js';
import { categoriaSchema, updateCategoriaSchema } from '../schemas/categoria.schema.js';

const router = Router();

router.get('/categorias', authRequired, getCategorias);
router.get('/categorias/activas', authRequired, getCategoriasActivas);
router.get('/categorias/:id', authRequired, getCategoriaById);

router.post(
  '/categorias',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  validateSchema(categoriaSchema),
  createCategoria
);

router.put(
  '/categorias/:id',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  validateSchema(updateCategoriaSchema),
  updateCategoria
);

router.patch(
  '/categorias/:id/toggle',
  authRequired,
  checkRole('admin', 'dueño', 'gerente'),
  toggleCategoriaStatus
);

router.delete(
  '/categorias/:id',
  authRequired,
  checkRole('admin', 'dueño'),
  deleteCategoria
);

export default router;
