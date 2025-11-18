import { pool } from "../db.js";

export const getMovimientos = async (req, res) => {
  const { producto_id, sucursal_id, fecha_inicio, fecha_fin, tipo_movimiento } = req.query;

  try {
    let query = `
      SELECT m.*, 
        i.nombre as producto_nombre,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        s.nombre as sucursal_nombre
      FROM movimientos_inventario m
      LEFT JOIN inventario i ON m.producto_id = i.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN sucursales s ON m.sucursal_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (producto_id) {
      query += ' AND m.producto_id = ?';
      params.push(producto_id);
    }

    if (sucursal_id) {
      query += ' AND m.sucursal_id = ?';
      params.push(sucursal_id);
    }

    if (fecha_inicio) {
      query += ' AND m.fecha_movimiento >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND m.fecha_movimiento <= ?';
      params.push(fecha_fin);
    }

    if (tipo_movimiento) {
      query += ' AND m.tipo_movimiento = ?';
      params.push(tipo_movimiento);
    }

    query += ' ORDER BY m.fecha_movimiento DESC LIMIT 100';

    const [rows] = await pool.query(query, params);

    res.json({
      movimientos: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ 
      message: 'Error al obtener movimientos',
      error: error.message 
    });
  }
};

export const getMovimientosByProducto = async (req, res) => {
  const { productoId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT m.*, 
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
       FROM movimientos_inventario m
       LEFT JOIN usuarios u ON m.usuario_id = u.id
       WHERE m.producto_id = ?
       ORDER BY m.fecha_movimiento DESC
       LIMIT 50`,
      [productoId]
    );

    res.json({
      movimientos: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ 
      message: 'Error al obtener movimientos',
      error: error.message 
    });
  }
};
