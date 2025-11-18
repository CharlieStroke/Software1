import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from "cookie-parser";
import { URLPERMITED } from './config.js';
// Importar rutas
import authRoutes from "./routes/auth.routes.js";
import sucursalRoutes from "./routes/sucursal.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import inventarioRoutes from "./routes/inventario.routes.js";
import pedidosRoutes from "./routes/pedidos.routes.js";
import movimientosRoutes from "./routes/movimientos.routes.js";

const app = express();

// Configuración de CORS
app.use(cors({
  origin: URLPERMITED,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', sucursalRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', categoriasRoutes);
app.use('/api', clientesRoutes);
app.use('/api', inventarioRoutes);
app.use('/api', pedidosRoutes);
app.use('/api', movimientosRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});



// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.path 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;
