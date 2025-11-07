import { Router } from 'express';
import { 
  login, 
  register,
  verifyToken, 
  logout, 
  refreshToken 
} from '../controllers/Auth.Controller.js';
import { authRequired, authRequiredForLogout } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/Validator.Middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const router = Router();

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', validateSchema(registerSchema), register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', validateSchema(loginSchema), login);

// GET /api/auth/verify - Verificar token y obtener datos del usuario
router.get('/verify', authRequired, verifyToken);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authRequiredForLogout, logout);

// POST /api/auth/refresh - Renovar token
router.post('/refresh', refreshToken);

export default router;
