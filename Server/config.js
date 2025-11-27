import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const PORT = process.env.PORT;
export const DB_HOST = process.env.MYSQLHOST;
export const DB_PORT = process.env.MYSQLPORT;
export const DB_USER = process.env.MYSQLUSER;
export const DB_PASSWORD = process.env.MYSQLPASSWORD;
export const DB_NAME = process.env.MYSQLDATABASE;
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const URLPERMITED = process.env.URLPERMITED;
export const SESSION_TIMEOUT = process.env.SESSION_TIMEOUT || 3600;
