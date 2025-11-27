import { Router } from 'express';
import { 
  getMetricasGenerales,
  getVentasPorDia,
  getMetodosPagoStats,
  getProductosMasVendidos,
  getVentasPorCategoria,
  getRendimientoMeseros
} from '../controllers/Metricas.Controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Métricas generales
router.get('/generales', getMetricasGenerales);

// Ventas por día (últimos 30 días)
router.get('/ventas-dia', getVentasPorDia);

// Métodos de pago más usados
router.get('/metodos-pago', getMetodosPagoStats);

// Productos más vendidos
router.get('/productos-vendidos', getProductosMasVendidos);

// Ventas por categoría
router.get('/ventas-categoria', getVentasPorCategoria);

// Rendimiento de meseros
router.get('/rendimiento-meseros', getRendimientoMeseros);

export default router;
