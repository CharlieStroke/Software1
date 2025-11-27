import { pool } from "../db.js";

function logAction(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] INVENTARIO: ${message}`, data);
}

export const getInventario = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, c.nombre as categoria_nombre, s.nombre as sucursal_nombre
       FROM inventario i
       LEFT JOIN categorias_productos c ON i.categoria_id = c.id
       LEFT JOIN sucursales s ON i.sucursal_id = s.id
       ORDER BY i.nombre ASC`
    );

    res.json({
      productos: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ 
      message: 'Error al obtener inventario',
      error: error.message 
    });
  }
};

export const getInventarioBySucursal = async (req, res) => {
  const { sucursalId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT i.*, c.nombre as categoria_nombre, s.nombre as sucursal_nombre
       FROM inventario i
       LEFT JOIN categorias_productos c ON i.categoria_id = c.id
       LEFT JOIN sucursales s ON i.sucursal_id = s.id
       WHERE i.sucursal_id = ?
       ORDER BY i.nombre ASC`,
      [sucursalId]
    );

    res.json({
      productos: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ 
      message: 'Error al obtener inventario',
      error: error.message 
    });
  }
};

export const getInventarioBajo = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, c.nombre as categoria_nombre, s.nombre as sucursal_nombre
       FROM inventario i
       LEFT JOIN categorias_productos c ON i.categoria_id = c.id
       LEFT JOIN sucursales s ON i.sucursal_id = s.id
       WHERE i.stock_actual <= i.stock_minimo AND i.activo = TRUE
       ORDER BY i.stock_actual ASC`
    );

    res.json({
      productos: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener stock bajo:', error);
    res.status(500).json({ 
      message: 'Error al obtener stock bajo',
      error: error.message 
    });
  }
};

export const getProductoById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT i.*, c.nombre as categoria_nombre, s.nombre as sucursal_nombre
       FROM inventario i
       LEFT JOIN categorias_productos c ON i.categoria_id = c.id
       LEFT JOIN sucursales s ON i.sucursal_id = s.id
       WHERE i.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ 
      message: 'Error al obtener producto',
      error: error.message 
    });
  }
};

export const createProducto = async (req, res) => {
  const {
    nombre,
    descripcion,
    categoria_id,
    precio,
    costo,
    stock_actual,
    stock_minimo,
    unidad_medida,
    sucursal_id
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO inventario 
        (nombre, descripcion, categoria_id, precio, costo, stock_actual, stock_minimo, unidad_medida, sucursal_id, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [nombre, descripcion || null, categoria_id || null, precio || 0, costo || 0, 
       stock_actual || 0, stock_minimo || 0, unidad_medida || 'unidad', sucursal_id || null]
    );

    logAction('Producto creado', { 
      productoId: result.insertId, 
      nombre,
      userId: req.user?.id 
    });

    const [newProducto] = await pool.query(
      `SELECT i.*, c.nombre as categoria_nombre, s.nombre as sucursal_nombre
       FROM inventario i
       LEFT JOIN categorias_productos c ON i.categoria_id = c.id
       LEFT JOIN sucursales s ON i.sucursal_id = s.id
       WHERE i.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Producto creado exitosamente',
      producto: newProducto[0]
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ 
      message: 'Error al crear producto',
      error: error.message 
    });
  }
};

export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    categoria_id,
    precio,
    costo,
    stock_actual,
    stock_minimo,
    unidad_medida,
    sucursal_id,
    activo
  } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM inventario WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    await pool.query(
      `UPDATE inventario 
       SET nombre = COALESCE(?, nombre),
           descripcion = ?,
           categoria_id = ?,
           precio = COALESCE(?, precio),
           costo = COALESCE(?, costo),
           stock_actual = COALESCE(?, stock_actual),
           stock_minimo = COALESCE(?, stock_minimo),
           unidad_medida = COALESCE(?, unidad_medida),
           sucursal_id = ?,
           activo = COALESCE(?, activo)
       WHERE id = ?`,
      [nombre, descripcion, categoria_id, precio, costo, stock_actual, 
       stock_minimo, unidad_medida, sucursal_id, activo, id]
    );

    logAction('Producto actualizado', { productoId: id, userId: req.user?.id });

    const [updated] = await pool.query(
      `SELECT i.*, c.nombre as categoria_nombre, s.nombre as sucursal_nombre
       FROM inventario i
       LEFT JOIN categorias_productos c ON i.categoria_id = c.id
       LEFT JOIN sucursales s ON i.sucursal_id = s.id
       WHERE i.id = ?`,
      [id]
    );

    res.json({
      message: 'Producto actualizado exitosamente',
      producto: updated[0]
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ 
      message: 'Error al actualizar producto',
      error: error.message 
    });
  }
};

export const ajustarStock = async (req, res) => {
  const { id } = req.params;
  const { cantidad, motivo } = req.body;

  try {
    const [producto] = await pool.query(
      'SELECT stock_actual, nombre FROM inventario WHERE id = ?',
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    const nuevoStock = producto[0].stock_actual + cantidad;

    if (nuevoStock < 0) {
      return res.status(400).json({ 
        message: 'El stock no puede ser negativo' 
      });
    }

    await pool.query(
      'UPDATE inventario SET stock_actual = ? WHERE id = ?',
      [nuevoStock, id]
    );

    // Registrar movimiento
    await pool.query(
      `INSERT INTO movimientos_inventario 
        (producto_id, tipo_movimiento, cantidad, motivo, usuario_id, sucursal_id) 
       SELECT ?, 'ajuste', ?, ?, ?, sucursal_id 
       FROM inventario WHERE id = ?`,
      [id, cantidad, motivo || 'Ajuste manual', req.user?.id, id]
    );

    logAction('Stock ajustado', { 
      productoId: id, 
      nombre: producto[0].nombre,
      cantidad,
      stockAnterior: producto[0].stock_actual,
      stockNuevo: nuevoStock,
      userId: req.user?.id 
    });

    res.json({
      message: 'Stock ajustado exitosamente',
      stock_anterior: producto[0].stock_actual,
      stock_nuevo: nuevoStock
    });

  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({ 
      message: 'Error al ajustar stock',
      error: error.message 
    });
  }
};

export const toggleProductoStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const [producto] = await pool.query(
      'SELECT id, nombre, activo FROM inventario WHERE id = ?',
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    const newStatus = !producto[0].activo;

    await pool.query(
      'UPDATE inventario SET activo = ? WHERE id = ?',
      [newStatus, id]
    );

    logAction('Estado de producto cambiado', { 
      productoId: id, 
      nombre: producto[0].nombre,
      nuevoEstado: newStatus ? 'activo' : 'inactivo',
      userId: req.user?.id 
    });

    res.json({
      message: `Producto ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
      activo: newStatus
    });

  } catch (error) {
    console.error('Error al cambiar estado de producto:', error);
    res.status(500).json({ 
      message: 'Error al cambiar estado de producto',
      error: error.message 
    });
  }
};

export const deleteProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const [producto] = await pool.query(
      'SELECT id, nombre FROM inventario WHERE id = ?',
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    // Verificar si tiene detalles de pedidos
    const [detalles] = await pool.query(
      'SELECT COUNT(*) as count FROM detalle_pedidos WHERE producto_id = ?',
      [id]
    );

    if (detalles[0].count > 0) {
      await pool.query(
        'UPDATE inventario SET activo = FALSE WHERE id = ?',
        [id]
      );

      logAction('Producto desactivado (tiene pedidos)', { 
        productoId: id, 
        nombre: producto[0].nombre,
        userId: req.user?.id 
      });

      return res.json({
        message: 'Producto desactivado (tiene pedidos asociados)',
        deleted: false,
        deactivated: true
      });
    }

    await pool.query('DELETE FROM inventario WHERE id = ?', [id]);

    logAction('Producto eliminado', { 
      productoId: id, 
      nombre: producto[0].nombre,
      userId: req.user?.id 
    });

    res.json({
      message: 'Producto eliminado exitosamente',
      deleted: true
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      message: 'Error al eliminar producto',
      error: error.message 
    });
  }
};
