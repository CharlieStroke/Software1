import { Router } from 'express';
import { 
  getComandas, 
  getComandaById, 
  getComandasAbiertas,
  createComanda, 
  updateComandaEstatus,
  cerrarComanda,
  deleteComanda 
} from '../controllers/Comandas.Controller.js';
import { authRequired } from '../middlewares/validateToken.js';
import { checkRole } from '../middlewares/validateToken.js';

const router = Router();

// Obtener todas las comandas (con filtros opcionales)
router.get('/comandas', authRequired, checkRole('admin', 'dueño', 'gerente', 'mesero', 'cajero'), getComandas);

// Obtener comandas abiertas (para asignar a pedidos)
router.get('/comandas/abiertas', authRequired, checkRole('admin', 'dueño', 'gerente', 'mesero', 'cajero'), getComandasAbiertas);

// Obtener una comanda específica con sus pedidos
router.get('/comandas/:id', authRequired, checkRole('admin', 'dueño', 'gerente', 'mesero', 'cajero'), getComandaById);

// Crear nueva comanda
router.post('/comandas', authRequired, checkRole('admin', 'dueño', 'gerente', 'mesero'), createComanda);

// Actualizar estatus de comanda
router.put('/comandas/:id/estatus', authRequired, checkRole('admin', 'dueño', 'gerente', 'mesero', 'cajero'), updateComandaEstatus);

// Cerrar comanda (atajo para cambiar estatus a 'cerrada')
router.put('/comandas/:id/cerrar', authRequired, checkRole('admin', 'dueño', 'gerente', 'cajero'), cerrarComanda);

// Eliminar comanda (solo si no tiene pedidos)
router.delete('/comandas/:id', authRequired, checkRole('admin', 'dueño'), deleteComanda);

export default router;
