import { pool } from "../db.js";
import bcrypt from "bcryptjs";

// Función para logging
function logAction(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] USUARIOS: ${message}`, data);
}

// Obtener todos los usuarios (con filtros según rol)
export const getUsers = async (req, res) => {
  try {
    const userRole = req.user.rol;
    const userSucursal = req.user.id_sucursal;
    let query = 'SELECT id, nombre, apellido, email, telefono, rol, id_sucursal, activo, fecha_creacion FROM usuarios';
    let params = [];

    // Admin: ve todos los usuarios
    if (userRole === 'admin') {
      query += ' ORDER BY fecha_creacion DESC';
    }
    // Dueño: ve solo usuarios de su sucursal (todos los roles)
    else if (userRole === 'dueño') {
      query += ' WHERE id_sucursal = ? ORDER BY fecha_creacion DESC';
      params.push(userSucursal);
    }
    // Gerente: ve solo meseros, cocineros y cajeros de su sucursal
    else if (userRole === 'gerente') {
      query += ' WHERE id_sucursal = ? AND rol IN (?, ?, ?) ORDER BY fecha_creacion DESC';
      params.push(userSucursal, 'mesero', 'cocinero', 'cajero');
    }
    // Otros roles: no tienen acceso
    else {
      return res.status(403).json({ 
        message: 'No tienes permisos para ver usuarios' 
      });
    }

    const [rows] = await pool.query(query, params);

    logAction('Listado de usuarios', { 
      count: rows.length, 
      userId: req.user?.id, 
      userRole,
      filteredBy: userRole 
    });

    res.json({
      usuarios: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuarios',
      error: error.message 
    });
  }
};

// Obtener usuarios activos (con filtros según rol)
export const getUsersActivos = async (req, res) => {
  try {
    const userRole = req.user.rol;
    const userSucursal = req.user.id_sucursal;
    let query = 'SELECT id, nombre, apellido, email, telefono, rol, id_sucursal, activo FROM usuarios WHERE activo = TRUE';
    let params = [];

    // Admin: ve todos los usuarios activos
    if (userRole === 'admin') {
      query += ' ORDER BY nombre ASC';
    }
    // Dueño: ve solo usuarios activos de su sucursal
    else if (userRole === 'dueño') {
      query += ' AND id_sucursal = ? ORDER BY nombre ASC';
      params.push(userSucursal);
    }
    // Gerente: ve solo meseros, cocineros y cajeros activos de su sucursal
    else if (userRole === 'gerente') {
      query += ' AND id_sucursal = ? AND rol IN (?, ?, ?) ORDER BY nombre ASC';
      params.push(userSucursal, 'mesero', 'cocinero', 'cajero');
    }
    // Otros roles: no tienen acceso
    else {
      return res.status(403).json({ 
        message: 'No tienes permisos para ver usuarios' 
      });
    }

    const [rows] = await pool.query(query, params);

    res.json({
      usuarios: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener usuarios activos:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuarios activos',
      error: error.message 
    });
  }
};

// Obtener usuarios por sucursal
export const getUsersBySucursal = async (req, res) => {
  const { sucursalId } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, rol, id_sucursal, activo FROM usuarios WHERE id_sucursal = ? ORDER BY nombre ASC',
      [sucursalId]
    );

    res.json({
      usuarios: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener usuarios por sucursal:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuarios',
      error: error.message 
    });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, rol, id_sucursal, activo, fecha_creacion FROM usuarios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuario',
      error: error.message 
    });
  }
};

// Crear nuevo usuario
export const createUser = async (req, res) => {
  const { nombre, apellido, email, password, telefono, rol, id_sucursal } = req.body;
  const userRole = req.user.rol;
  const userSucursal = req.user.id_sucursal;

  try {
    // VALIDACIÓN DE PERMISOS: Dueño solo puede crear roles inferiores
    if (userRole === 'dueño') {
      const rolesPermitidos = ['gerente', 'mesero', 'cocinero', 'cajero'];
      if (!rolesPermitidos.includes(rol)) {
        return res.status(403).json({ 
          message: 'No tienes permisos para crear usuarios con ese rol' 
        });
      }
      // Dueño solo puede crear en su sucursal
      if (id_sucursal !== userSucursal) {
        return res.status(403).json({ 
          message: 'Solo puedes crear usuarios en tu sucursal' 
        });
      }
    }

    // Verificar si el email ya existe
    const [existingUser] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: 'El email ya está registrado' 
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol, id_sucursal, activo) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)',
      [nombre, apellido, email, hashedPassword, telefono || null, rol || 'mesero', id_sucursal || null]
    );

    logAction('Usuario creado', { 
      userId: result.insertId, 
      email, 
      rol,
      createdBy: req.user?.id,
      createdByRole: userRole
    });

    // Obtener el usuario recién creado (sin password)
    const [newUser] = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, rol, id_sucursal, activo FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: newUser[0]
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      message: 'Error al crear usuario',
      error: error.message 
    });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, telefono, rol, id_sucursal, activo, password } = req.body;
  const userRole = req.user.rol;
  const userSucursal = req.user.id_sucursal;

  try {
    // Verificar si el usuario existe y obtener sus datos
    const [existingUser] = await pool.query(
      'SELECT id, rol, id_sucursal FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    const targetUser = existingUser[0];

    // VALIDACIÓN DE PERMISOS: Dueño solo puede editar usuarios de roles inferiores en su sucursal
    if (userRole === 'dueño') {
      const rolesPermitidos = ['gerente', 'mesero', 'cocinero', 'cajero'];
      if (!rolesPermitidos.includes(targetUser.rol)) {
        return res.status(403).json({ 
          message: 'No tienes permisos para editar usuarios con ese rol' 
        });
      }
      if (targetUser.id_sucursal !== userSucursal) {
        return res.status(403).json({ 
          message: 'Solo puedes editar usuarios de tu sucursal' 
        });
      }
      // Si intenta cambiar el rol, verificar que el nuevo rol sea permitido
      if (rol && !rolesPermitidos.includes(rol)) {
        return res.status(403).json({ 
          message: 'No tienes permisos para asignar ese rol' 
        });
      }
    }

    // Verificar si el nuevo email ya existe en otro usuario
    if (email) {
      const [duplicateEmail] = await pool.query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );

      if (duplicateEmail.length > 0) {
        return res.status(400).json({ 
          message: 'El email ya está en uso por otro usuario' 
        });
      }
    }

    // Preparar campos a actualizar
    let updateFields = [];
    let updateValues = [];

    if (nombre !== undefined) {
      updateFields.push('nombre = ?');
      updateValues.push(nombre);
    }
    if (apellido !== undefined) {
      updateFields.push('apellido = ?');
      updateValues.push(apellido);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (telefono !== undefined) {
      updateFields.push('telefono = ?');
      updateValues.push(telefono);
    }
    if (rol !== undefined) {
      updateFields.push('rol = ?');
      updateValues.push(rol);
    }
    if (id_sucursal !== undefined) {
      updateFields.push('id_sucursal = ?');
      updateValues.push(id_sucursal);
    }
    if (activo !== undefined) {
      updateFields.push('activo = ?');
      updateValues.push(activo);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        message: 'No hay campos para actualizar' 
      });
    }

    updateValues.push(id);

    await pool.query(
      `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    logAction('Usuario actualizado', { userId: id, updatedBy: req.user?.id });

    // Obtener el usuario actualizado
    const [updatedUser] = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, rol, id_sucursal, activo FROM usuarios WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: updatedUser[0]
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      message: 'Error al actualizar usuario',
      error: error.message 
    });
  }
};

// Activar/Desactivar usuario
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.rol;
  const userSucursal = req.user.id_sucursal;

  try {
    const [user] = await pool.query(
      'SELECT id, nombre, apellido, email, activo, rol, id_sucursal FROM usuarios WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    const targetUser = user[0];

    // VALIDACIÓN DE PERMISOS: Dueño solo puede toggle usuarios de roles inferiores en su sucursal
    if (userRole === 'dueño') {
      const rolesPermitidos = ['gerente', 'mesero', 'cocinero', 'cajero'];
      if (!rolesPermitidos.includes(targetUser.rol)) {
        return res.status(403).json({ 
          message: 'No tienes permisos para cambiar el estado de usuarios con ese rol' 
        });
      }
      if (targetUser.id_sucursal !== userSucursal) {
        return res.status(403).json({ 
          message: 'Solo puedes cambiar el estado de usuarios de tu sucursal' 
        });
      }
    }

    const newStatus = !targetUser.activo;

    await pool.query(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [newStatus, id]
    );

    logAction('Estado de usuario cambiado', { 
      userId: id, 
      email: user[0].email,
      nuevoEstado: newStatus ? 'activo' : 'inactivo',
      changedBy: req.user?.id 
    });

    res.json({
      message: `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
      activo: newStatus
    });

  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    res.status(500).json({ 
      message: 'Error al cambiar estado de usuario',
      error: error.message 
    });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.rol;
  const userSucursal = req.user.id_sucursal;

  try {
    const [user] = await pool.query(
      'SELECT id, email, rol, id_sucursal FROM usuarios WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    const targetUser = user[0];

    // VALIDACIÓN DE PERMISOS: Dueño solo puede eliminar usuarios de roles inferiores en su sucursal
    if (userRole === 'dueño') {
      const rolesPermitidos = ['gerente', 'mesero', 'cocinero', 'cajero'];
      if (!rolesPermitidos.includes(targetUser.rol)) {
        return res.status(403).json({ 
          message: 'No tienes permisos para eliminar usuarios con ese rol' 
        });
      }
      if (targetUser.id_sucursal !== userSucursal) {
        return res.status(403).json({ 
          message: 'Solo puedes eliminar usuarios de tu sucursal' 
        });
      }
    }

    // Verificar si tiene datos relacionados
    const [pedidos] = await pool.query(
      'SELECT COUNT(*) as count FROM pedidos WHERE usuario_id = ?',
      [id]
    );

    if (pedidos[0].count > 0) {
      // Si tiene datos relacionados, solo desactivar
      await pool.query(
        'UPDATE usuarios SET activo = FALSE WHERE id = ?',
        [id]
      );

      logAction('Usuario desactivado (tiene datos relacionados)', { 
        userId: id, 
        email: user[0].email,
        deletedBy: req.user?.id 
      });

      return res.json({
        message: 'Usuario desactivado (tiene datos relacionados)',
        deleted: false,
        deactivated: true
      });
    }

    // Si no tiene datos relacionados, eliminar completamente
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

    logAction('Usuario eliminado', { 
      userId: id, 
      email: user[0].email,
      deletedBy: req.user?.id 
    });

    res.json({
      message: 'Usuario eliminado exitosamente',
      deleted: true
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      message: 'Error al eliminar usuario',
      error: error.message 
    });
  }
};

