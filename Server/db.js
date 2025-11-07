import { createPool } from "mysql2/promise";
import {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} from "./config.js";

export const pool = createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

// Función para probar la conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al conectar con MySQL:', error.message);
    return false;
  }
};
