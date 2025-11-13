import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { createToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// Función para logging de autenticación
function logAuth(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH: ${message}`, data);
}

// Registrar usuario nuevo
export const register = async (req, res) => {
  const { nombre, telefono, email, password, rol } = req.body;

  try {
    // Verificar si el email ya existe
    const [existingUser] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: 'El email ya está registrado' 
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Dividir nombre en nombre y apellido (simple)
    const nombreParts = nombre.trim().split(' ');
    const primerNombre = nombreParts[0];
    const apellido = nombreParts.slice(1).join(' ') || 'Sin apellido';

    // Insertar nuevo usuario
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, telefono, email, password, rol, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [primerNombre, apellido, telefono, email, hashedPassword, rol]
    );

    // Crear token
    const token = await createToken({
      id: result.insertId,
      nombre: primerNombre,
      apellido: apellido,
      rol: rol
    });

    logAuth('Usuario registrado exitosamente', { email, userId: result.insertId });

    // Configurar cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: false,
      secure: isProduction,
      maxAge: 60 * 60 * 1000, // 1 hora
      path: '/',
      sameSite: 'lax'
    });

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        nombre: primerNombre,
        apellido: apellido,
        email: email,
        rol: rol
      }
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ 
      message: 'Error al registrar usuario',
      error: error.message 
    });
  }
};

// Login de usuario
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      logAuth('Login fallido - Email no existe', { email, ip: req.ip });
      return res.status(400).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    const user = rows[0];

    // Verificar si el usuario está activo
    if (!user.activo) {
      logAuth('Login fallido - Usuario inactivo', { email, userId: user.id });
      return res.status(403).json({ 
        message: 'Usuario inactivo. Contacte al administrador.' 
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logAuth('Login fallido - Contraseña incorrecta', { email, ip: req.ip });
      return res.status(400).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Crear token (no incluir sucursal, tabla `usuarios` no tiene `sucursal_id`)
    const token = await createToken({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol
    });

    logAuth('Login exitoso', { email, userId: user.id, rol: user.rol });

    // Configurar cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: false,
      secure: isProduction,
      maxAge: 60 * 60 * 1000, // 1 hora
      path: '/',
      sameSite: 'lax'
    });

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error en el servidor',
      error: error.message 
    });
  }
};

// Verificar token
export const verifyToken = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const decoded = jwt.verify(token, TOKEN_SECRET);

    // Buscar usuario actualizado
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, telefono, activo FROM usuarios WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    if (!user.activo) {
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        telefono: user.telefono
      }
    });

  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      logAuth('Logout exitoso', { userId });
    }

    // Limpiar cookie
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      path: '/'
    });

    res.json({ message: 'Logout exitoso' });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ 
      message: 'Error al cerrar sesión',
      error: error.message 
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: 'No token proporcionado' });
    }

    const decoded = jwt.verify(token, TOKEN_SECRET);

    // Crear nuevo token
    const newToken = await createToken({
      id: decoded.id,
      nombre: decoded.nombre,
      rol: decoded.rol
    });

    // Configurar cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', newToken, {
      httpOnly: false,
      secure: isProduction,
      maxAge: 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });

    res.json({ token: newToken });

  } catch (error) {
    console.error('Error al renovar token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};
