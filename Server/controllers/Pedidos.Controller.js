import { pool } from "../db.js";

function logAction(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] PEDIDOS: ${message}`, data);
}

// Generar número de pedido único
async function generarNumeroPedido() {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM pedidos WHERE DATE(fecha_pedido) = CURDATE()'
  );
  
  const correlativo = String(rows[0].count + 1).padStart(4, '0');
  return `PED-${year}${month}${day}-${correlativo}`;
}

// Obtener todos los pedidos
export const getPedidos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, 
        CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        s.nombre as sucursal_nombre
       FROM pedidos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN sucursales s ON p.sucursal_id = s.id
       ORDER BY p.fecha_pedido DESC
       LIMIT 100`
    );

    res.json({
      pedidos: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      message: 'Error al obtener pedidos',
      error: error.message 
    });
  }
};

// Obtener pedidos por sucursal
export const getPedidosBySucursal = async (req, res) => {
  const { sucursalId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT p.*, 
        CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
       FROM pedidos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.sucursal_id = ?
       ORDER BY p.fecha_pedido DESC
       LIMIT 100`,
      [sucursalId]
    );

    res.json({
      pedidos: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      message: 'Error al obtener pedidos',
      error: error.message 
    });
  }
};

// Obtener pedidos del día
export const getPedidosHoy = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, 
        CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        s.nombre as sucursal_nombre
       FROM pedidos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN sucursales s ON p.sucursal_id = s.id
       WHERE DATE(p.fecha_pedido) = CURDATE()
       ORDER BY p.fecha_pedido DESC`
    );

    res.json({
      pedidos: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener pedidos del día:', error);
    res.status(500).json({ 
      message: 'Error al obtener pedidos del día',
      error: error.message 
    });
  }
};

// Obtener comandas (resumen de pedidos en preparación)
export const getComandas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, 
        CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
        s.nombre as sucursal_nombre,
        COUNT(dp.id) as total_items
       FROM pedidos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN sucursales s ON p.sucursal_id = s.id
       LEFT JOIN detalle_pedidos dp ON p.id = dp.pedido_id
       WHERE p.estado IN ('pendiente', 'en_preparacion')
       GROUP BY p.id
       ORDER BY p.fecha_pedido DESC`
    );

    res.json({
      comandas: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener comandas:', error);
    res.status(500).json({ 
      message: 'Error al obtener comandas',
      error: error.message 
    });
  }
};

// Obtener pedido por ID con detalles
export const getPedidoById = async (req, res) => {
  const { id } = req.params;

  try {
    const [pedido] = await pool.query(
      `SELECT p.*, 
        CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
        c.telefono as cliente_telefono,
        c.direccion as cliente_direccion,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        s.nombre as sucursal_nombre
       FROM pedidos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN sucursales s ON p.sucursal_id = s.id
       WHERE p.id = ?`,
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ 
        message: 'Pedido no encontrado' 
      });
    }

    const [detalles] = await pool.query(
      `SELECT dp.*, i.nombre as producto_nombre, i.unidad_medida
       FROM detalle_pedidos dp
       LEFT JOIN inventario i ON dp.producto_id = i.id
       WHERE dp.pedido_id = ?`,
      [id]
    );

    res.json({
      ...pedido[0],
      detalles
    });

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ 
      message: 'Error al obtener pedido',
      error: error.message 
    });
  }
};

// Crear nuevo pedido
export const createPedido = async (req, res) => {
  const {
    cliente_id,
    sucursal_id,
    tipo_pedido,
    notas,
    detalles // Array de {producto_id, cantidad, precio_unitario, notas_item}
  } = req.body;

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Generar número de pedido
    const numero_pedido = await generarNumeroPedido();

    // Crear pedido
    const [resultPedido] = await connection.query(
      `INSERT INTO pedidos 
        (numero_pedido, cliente_id, usuario_id, sucursal_id, tipo_pedido, notas, estado, subtotal, impuestos, descuento, total) 
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', 0, 0, 0, 0)`,
      [numero_pedido, cliente_id || null, req.user?.id, sucursal_id, tipo_pedido || 'mesa', notas || null]
    );

    const pedidoId = resultPedido.insertId;

    // Insertar detalles y calcular totales
    let subtotal = 0;

    for (const detalle of detalles) {
      const subtotalItem = detalle.cantidad * detalle.precio_unitario;
      subtotal += subtotalItem;

      await connection.query(
        `INSERT INTO detalle_pedidos 
          (pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas_item) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pedidoId, detalle.producto_id, detalle.cantidad, detalle.precio_unitario, subtotalItem, detalle.notas_item || null]
      );

      // Registrar movimiento de inventario (salida)
      await connection.query(
        `INSERT INTO movimientos_inventario 
          (producto_id, tipo_movimiento, cantidad, motivo, usuario_id, sucursal_id, referencia_pedido_id) 
         VALUES (?, 'salida', ?, 'Venta - Pedido ${numero_pedido}', ?, ?, ?)`,
        [detalle.producto_id, -detalle.cantidad, req.user?.id, sucursal_id, pedidoId]
      );

      // Actualizar stock
      await connection.query(
        'UPDATE inventario SET stock_actual = stock_actual - ? WHERE id = ?',
        [detalle.cantidad, detalle.producto_id]
      );
    }

    // Calcular impuestos y total (ejemplo: 16% IVA)
    const impuestos = subtotal * 0.16;
    const total = subtotal + impuestos;

    // Actualizar totales del pedido
    await connection.query(
      'UPDATE pedidos SET subtotal = ?, impuestos = ?, total = ? WHERE id = ?',
      [subtotal, impuestos, total, pedidoId]
    );

    await connection.commit();

    logAction('Pedido creado', { 
      pedidoId, 
      numero_pedido,
      total,
      userId: req.user?.id 
    });

    // Obtener pedido completo
    const [pedidoCompleto] = await pool.query(
      `SELECT p.*, 
        CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre
       FROM pedidos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       WHERE p.id = ?`,
      [pedidoId]
    );

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      pedido: pedidoCompleto[0]
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear pedido:', error);
    res.status(500).json({ 
      message: 'Error al crear pedido',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Actualizar estado de pedido
export const updateEstadoPedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const [pedido] = await pool.query(
      'SELECT id, numero_pedido, estado FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ 
        message: 'Pedido no encontrado' 
      });
    }

    await pool.query(
      'UPDATE pedidos SET estado = ?, fecha_entrega = CASE WHEN ? = "entregado" THEN NOW() ELSE fecha_entrega END WHERE id = ?',
      [estado, estado, id]
    );

    logAction('Estado de pedido actualizado', { 
      pedidoId: id, 
      numero_pedido: pedido[0].numero_pedido,
      estadoAnterior: pedido[0].estado,
      estadoNuevo: estado,
      userId: req.user?.id 
    });

    res.json({
      message: 'Estado actualizado exitosamente',
      estado
    });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ 
      message: 'Error al actualizar estado',
      error: error.message 
    });
  }
};

// Cancelar pedido
export const cancelarPedido = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [pedido] = await connection.query(
      'SELECT id, numero_pedido, estado, sucursal_id FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedido.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        message: 'Pedido no encontrado' 
      });
    }

    if (pedido[0].estado === 'cancelado') {
      await connection.rollback();
      return res.status(400).json({ 
        message: 'El pedido ya está cancelado' 
      });
    }

    if (pedido[0].estado === 'entregado') {
      await connection.rollback();
      return res.status(400).json({ 
        message: 'No se puede cancelar un pedido entregado' 
      });
    }

    // Devolver stock
    const [detalles] = await connection.query(
      'SELECT producto_id, cantidad FROM detalle_pedidos WHERE pedido_id = ?',
      [id]
    );

    for (const detalle of detalles) {
      await connection.query(
        'UPDATE inventario SET stock_actual = stock_actual + ? WHERE id = ?',
        [detalle.cantidad, detalle.producto_id]
      );

      // Registrar movimiento
      await connection.query(
        `INSERT INTO movimientos_inventario 
          (producto_id, tipo_movimiento, cantidad, motivo, usuario_id, sucursal_id, referencia_pedido_id) 
         VALUES (?, 'entrada', ?, ?, ?, ?, ?)`,
        [detalle.producto_id, detalle.cantidad, `Cancelación pedido - ${motivo || 'Sin motivo'}`, req.user?.id, pedido[0].sucursal_id, id]
      );
    }

    // Actualizar estado del pedido
    await connection.query(
      'UPDATE pedidos SET estado = "cancelado", notas = CONCAT(COALESCE(notas, ""), " | CANCELADO: ", ?) WHERE id = ?',
      [motivo || 'Sin motivo especificado', id]
    );

    await connection.commit();

    logAction('Pedido cancelado', { 
      pedidoId: id, 
      numero_pedido: pedido[0].numero_pedido,
      motivo,
      userId: req.user?.id 
    });

    res.json({
      message: 'Pedido cancelado exitosamente',
      estado: 'cancelado'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({ 
      message: 'Error al cancelar pedido',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Obtener estadísticas de pedidos
export const getEstadisticasPedidos = async (req, res) => {
  const { fecha_inicio, fecha_fin, sucursal_id } = req.query;

  try {
    let query = `
      SELECT 
        COUNT(*) as total_pedidos,
        COALESCE(SUM(total), 0) as ventas_totales,
        COALESCE(AVG(total), 0) as ticket_promedio,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'en_preparacion' THEN 1 ELSE 0 END) as en_preparacion,
        SUM(CASE WHEN estado = 'listo' THEN 1 ELSE 0 END) as listos,
        SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) as entregados,
        SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados
      FROM pedidos
      WHERE 1=1
    `;

    const params = [];

    if (fecha_inicio) {
      query += ' AND fecha_pedido >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND fecha_pedido <= ?';
      params.push(fecha_fin);
    }

    if (sucursal_id) {
      query += ' AND sucursal_id = ?';
      params.push(sucursal_id);
    }

    const [stats] = await pool.query(query, params);

    res.json(stats[0]);

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};
