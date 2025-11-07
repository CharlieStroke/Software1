import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DB_HOST = process.env.MYSQLHOST || 'localhost';
export const DB_PORT = process.env.MYSQLPORT || 3306;
export const DB_USER = process.env.MYSQLUSER || 'root';
export const DB_PASSWORD = process.env.MYSQLPASSWORD || '';
export const DB_NAME = process.env.MYSQLDATABASE || 'restaurante_db';
export const TOKEN_SECRET = process.env.TOKEN_SECRET || 'secret_key_default';
export const URLPERMITED = process.env.URLPERMITED || 'http://localhost:5173';
export const SESSION_TIMEOUT = process.env.SESSION_TIMEOUT || 3600;
