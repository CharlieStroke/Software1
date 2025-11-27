import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';
import { pool } from '../db.js';

export const authRequired = (req, res, next) => {
  // Intentar obtener el token de las cookies primero, luego del header Authorization
  let token = req.cookies.token;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remover 'Bearer ' del inicio
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'No token, acceso denegado' });
  }
  
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    
    // Estandarizar estructura del usuario en la request
    req.user = {
      id: decoded.id,
      nombre: decoded.nombre || 'Usuario',
      apellido: decoded.apellido || '',
      rol: decoded.rol || decoded.role || 'usuario',
      sucursal_id: decoded.sucursal_id || decoded.sucursal,
      sucursal: decoded.sucursal // mantener compatibilidad
    };
    
    // Mantener consistencia con la propiedad isAdmin
    req.isAdmin = req.user.rol === 'admin';
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido' });
  }
};

// Middleware especial para logout que es más permisivo
export const authRequiredForLogout = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    // Si no hay token, aún permitir el logout para limpiar estado
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET, { ignoreExpiration: true });
    
    req.user = {
      id: decoded.id,
      nombre: decoded.nombre || 'Usuario',
      apellido: decoded.apellido || '',
      rol: decoded.rol || decoded.role || 'usuario',
      sucursal_id: decoded.sucursal_id || decoded.sucursal,
      sucursal: decoded.sucursal
    };
    
    next();
  } catch (error) {
    // Incluso si el token es inválido, permitir el logout
    req.user = null;
    next();
  }
};

// Middleware para verificar roles específicos
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        message: 'No tienes permisos para realizar esta acción' 
      });
    }

    next();
  };
};

// Middleware solo para administradores
export const isAdmin = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token, autorización denegada' });
    }

    const decoded = jwt.verify(token, TOKEN_SECRET);
    
    // Verificar si el usuario es administrador
    const [userRole] = await pool.query(
      'SELECT rol FROM usuarios WHERE id = ?', 
      [decoded.id]
    );
    
    if (userRole.length === 0 || userRole[0].rol !== 'admin') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }

    req.user = {
      id: decoded.id,
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      rol: userRole[0].rol,
      sucursal_id: decoded.sucursal_id || decoded.sucursal,
      sucursal: decoded.sucursal
    };

    next();
  } catch (error) {
    console.error('Error en middleware isAdmin:', error);
    return res.status(401).json({ message: 'Token no válido' });
  }
};
