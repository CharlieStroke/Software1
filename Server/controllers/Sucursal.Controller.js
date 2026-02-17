import { pool } from "../db.js";

// Función para logging
function logAction(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] SUCURSAL: ${message}`, data);
}

// Obtener todas las sucursales
export const getSucursales = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sucursales ORDER BY fecha_creacion DESC'
    );

    logAction('Listado de sucursales', { count: rows.length, userId: req.user?.id });

    res.json({
      sucursales: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({ 
      message: 'Error al obtener sucursales',
      error: error.message 
    });
  }
};

// Obtener sucursales activas
export const getSucursalesActivas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sucursales WHERE activa = TRUE ORDER BY nombre ASC'
    );

    res.json({
      sucursales: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener sucursales activas:', error);
    res.status(500).json({ 
      message: 'Error al obtener sucursales activas',
      error: error.message 
    });
  }
};

// Obtener una sucursal por ID
export const getSucursalById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM sucursales WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: 'Sucursal no encontrada' 
      });
    }

    logAction('Sucursal consultada', { sucursalId: id, userId: req.user?.id });

    res.json(rows[0]);

  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    res.status(500).json({ 
      message: 'Error al obtener sucursal',
      error: error.message 
    });
  }
};

// Crear nueva sucursal
export const createSucursal = async (req, res) => {
  const {
    nombre,
    direccion,
    telefono,
    email,
    gerente,
    horario_apertura,
    horario_cierre,
    capacidad,
    fecha_apertura
  } = req.body;

  try {
    // Verificar si ya existe una sucursal con el mismo nombre
    const [existingSucursal] = await pool.query(
      'SELECT id FROM sucursales WHERE nombre = ?',
      [nombre]
    );

    if (existingSucursal.length > 0) {
      return res.status(400).json({ 
        message: 'Ya existe una sucursal con ese nombre' 
      });
    }

    // Insertar nueva sucursal
    const [result] = await pool.query(
      `INSERT INTO sucursales 
        (nombre, direccion, telefono, email, gerente, horario_apertura, horario_cierre, capacidad, fecha_apertura, activa) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [nombre, direccion, telefono || null, email || null, gerente || null, 
       horario_apertura || null, horario_cierre || null, capacidad || 0, fecha_apertura || null]
    );

    logAction('Sucursal creada', { 
      sucursalId: result.insertId, 
      nombre, 
      userId: req.user?.id 
    });

    // Obtener la sucursal recién creada
    const [newSucursal] = await pool.query(
      'SELECT * FROM sucursales WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Sucursal creada exitosamente',
      sucursal: newSucursal[0]
    });

  } catch (error) {
    console.error('Error al crear sucursal:', error);
    res.status(500).json({ 
      message: 'Error al crear sucursal',
      error: error.message 
    });
  }
};

// Actualizar sucursal
export const updateSucursal = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    direccion,
    telefono,
    email,
    gerente,
    horario_apertura,
    horario_cierre,
    capacidad,
    fecha_apertura,
    activa
  } = req.body;

  try {
    // Verificar si la sucursal existe
    const [existingSucursal] = await pool.query(
      'SELECT id FROM sucursales WHERE id = ?',
      [id]
    );

    if (existingSucursal.length === 0) {
      return res.status(404).json({ 
        message: 'Sucursal no encontrada' 
      });
    }

    // Verificar si el nuevo nombre ya existe en otra sucursal
    if (nombre) {
      const [duplicateName] = await pool.query(
        'SELECT id FROM sucursales WHERE nombre = ? AND id != ?',
        [nombre, id]
      );

      if (duplicateName.length > 0) {
        return res.status(400).json({ 
          message: 'Ya existe otra sucursal con ese nombre' 
        });
      }
    }

    // Actualizar sucursal
    await pool.query(
      `UPDATE sucursales 
       SET nombre = COALESCE(?, nombre),
           direccion = COALESCE(?, direccion),
           telefono = ?,
           email = ?,
           gerente = ?,
           horario_apertura = ?,
           horario_cierre = ?,
           capacidad = COALESCE(?, capacidad),
           fecha_apertura = ?,
           activa = COALESCE(?, activa)
       WHERE id = ?`,
      [nombre, direccion, telefono, email, gerente, 
       horario_apertura, horario_cierre, capacidad, fecha_apertura, activa, id]
    );

    logAction('Sucursal actualizada', { sucursalId: id, userId: req.user?.id });

    // Obtener la sucursal actualizada
    const [updatedSucursal] = await pool.query(
      'SELECT * FROM sucursales WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Sucursal actualizada exitosamente',
      sucursal: updatedSucursal[0]
    });

  } catch (error) {
    console.error('Error al actualizar sucursal:', error);
    res.status(500).json({ 
      message: 'Error al actualizar sucursal',
      error: error.message 
    });
  }
};

// Activar/Desactivar sucursal
export const toggleSucursalStatus = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si la sucursal existe
    const [sucursal] = await pool.query(
      'SELECT id, nombre, activa FROM sucursales WHERE id = ?',
      [id]
    );

    if (sucursal.length === 0) {
      return res.status(404).json({ 
        message: 'Sucursal no encontrada' 
      });
    }

    const newStatus = !sucursal[0].activa;

    // Actualizar estado
    await pool.query(
      'UPDATE sucursales SET activa = ? WHERE id = ?',
      [newStatus, id]
    );

    logAction('Estado de sucursal cambiado', { 
      sucursalId: id, 
      nombre: sucursal[0].nombre,
      nuevoEstado: newStatus ? 'activa' : 'inactiva',
      userId: req.user?.id 
    });

    res.json({
      message: `Sucursal ${newStatus ? 'activada' : 'desactivada'} exitosamente`,
      activa: newStatus
    });

  } catch (error) {
    console.error('Error al cambiar estado de sucursal:', error);
    res.status(500).json({ 
      message: 'Error al cambiar estado de sucursal',
      error: error.message 
    });
  }
};

// Eliminar sucursal (soft delete - desactivar)
export const deleteSucursal = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si la sucursal existe
    const [sucursal] = await pool.query(
      'SELECT id, nombre FROM sucursales WHERE id = ?',
      [id]
    );

    if (sucursal.length === 0) {
      return res.status(404).json({ 
        message: 'Sucursal no encontrada' 
      });
    }

    // Verificar si tiene datos relacionados
    const [inventario] = await pool.query(
      'SELECT COUNT(*) as count FROM inventario WHERE sucursal_id = ?',
      [id]
    );

    const [pedidos] = await pool.query(
      'SELECT COUNT(*) as count FROM pedidos WHERE sucursal_id = ?',
      [id]
    );

    if (inventario[0].count > 0 || pedidos[0].count > 0) {
      // Si tiene datos relacionados, solo desactivar
      await pool.query(
        'UPDATE sucursales SET activa = FALSE WHERE id = ?',
        [id]
      );

      logAction('Sucursal desactivada (tiene datos relacionados)', { 
        sucursalId: id, 
        nombre: sucursal[0].nombre,
        userId: req.user?.id 
      });

      return res.json({
        message: 'Sucursal desactivada (tiene datos relacionados)',
        deleted: false,
        deactivated: true
      });
    }

    // Si no tiene datos relacionados, eliminar completamente
    await pool.query('DELETE FROM sucursales WHERE id = ?', [id]);

    logAction('Sucursal eliminada', { 
      sucursalId: id, 
      nombre: sucursal[0].nombre,
      userId: req.user?.id 
    });

    res.json({
      message: 'Sucursal eliminada exitosamente',
      deleted: true
    });

  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    res.status(500).json({ 
      message: 'Error al eliminar sucursal',
      error: error.message 
    });
  }
};

// Obtener estadísticas de una sucursal
export const getSucursalStats = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si la sucursal existe
    const [sucursal] = await pool.query(
      'SELECT id, nombre FROM sucursales WHERE id = ?',
      [id]
    );

    if (sucursal.length === 0) {
      return res.status(404).json({ 
        message: 'Sucursal no encontrada' 
      });
    }

    // Obtener estadísticas
    const [productos] = await pool.query(
      'SELECT COUNT(*) as total FROM inventario WHERE sucursal_id = ? AND activo = TRUE',
      [id]
    );

    const [pedidosHoy] = await pool.query(
      'SELECT COUNT(*) as total FROM pedidos WHERE sucursal_id = ? AND DATE(fecha_pedido) = CURDATE()',
      [id]
    );

    const [pedidosMes] = await pool.query(
      'SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as monto FROM pedidos WHERE sucursal_id = ? AND MONTH(fecha_pedido) = MONTH(CURDATE()) AND YEAR(fecha_pedido) = YEAR(CURDATE())',
      [id]
    );

    const [comandasActivas] = await pool.query(
      'SELECT COUNT(*) as total FROM comandas WHERE sucursal_id = ? AND estado IN ("pendiente", "en_preparacion")',
      [id]
    );

    res.json({
      sucursal: sucursal[0],
      estadisticas: {
        productos: productos[0].total,
        pedidos_hoy: pedidosHoy[0].total,
        pedidos_mes: pedidosMes[0].total,
        ventas_mes: parseFloat(pedidosMes[0].monto || 0),
        comandas_activas: comandasActivas[0].total
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de sucursal:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};
