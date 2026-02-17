import { PORT, DB_HOST, DB_PORT, DB_USER, DB_NAME } from './config.js';
import app from './app.js';
import { testConnection } from './db.js';

// Función para inicializar el servidor
async function startServer() {
  try {
    // Mostrar configuración de DB (sin password)
    console.log('Configuración de base de datos:');
    console.log(`  Host: ${DB_HOST}`);
    console.log(`  Port: ${DB_PORT}`);
    console.log(`  User: ${DB_USER}`);
    console.log(`  Database: ${DB_NAME}`);
    
    // Probar conexión a la base de datos
    console.log('Probando conexión a la base de datos...');
    await testConnection();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('Servidor iniciado correctamente');
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
    });
    

  } catch (error) {
    console.error('Error crítico al inicializar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});
