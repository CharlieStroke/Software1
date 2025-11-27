import { pool } from '../db.js';

// ============================================
// OBTENER MÉTRICAS GENERALES
// ============================================
export const getMetricasGenerales = async (req, res) => {
  try {
    const { sucursal_id } = req.query;
    const user = req.user;

    // Solo admin y dueño pueden ver métricas
    if (user.rol !== 'admin' && user.rol !== 'dueño') {
      return res.status(403).json({ 
        message: 'No tienes permisos para ver las métricas' 
      });
    }

    // Construir filtro de sucursal
    let sucursalFilter = '';
    let sucursalParams = [];
    
    if (user.rol === 'admin' && sucursal_id) {
      sucursalFilter = 'WHERE s.id = ?';
      sucursalParams = [sucursal_id];
    } else if (user.rol === 'dueño') {
      // Dueños solo ven sus sucursales
      sucursalFilter = 'WHERE s.id = ?';
      sucursalParams = [user.sucursal_id];
    }

    const [metricas] = await pool.query(`
      SELECT 
        -- Ventas totales
        COALESCE(SUM(pg.monto_total), 0) as ventas_totales,
        COALESCE(SUM(pg.propina), 0) as propinas_totales,
        
        -- Cantidad de pedidos y comandas
        COUNT(DISTINCT c.id) as total_comandas,
        COUNT(DISTINCT p.id) as total_pedidos,
        
        -- Pedidos por estado de pago
        COUNT(DISTINCT CASE WHEN p.estado_pago = 'pagado' THEN p.id END) as pedidos_pagados,
        COUNT(DISTINCT CASE WHEN p.estado_pago = 'pendiente' THEN p.id END) as pedidos_pendientes,
        
        -- Comandas por estado
        COUNT(DISTINCT CASE WHEN c.estatus = 'abierta' THEN c.id END) as comandas_abiertas,
        COUNT(DISTINCT CASE WHEN c.estatus = 'cerrada' THEN c.id END) as comandas_cerradas,
        
        -- Ticket promedio
        COALESCE(AVG(pg.monto_total), 0) as ticket_promedio
        
      FROM sucursales s
      LEFT JOIN comandas c ON c.sucursal_id = s.id
      LEFT JOIN pedidos p ON p.comanda_id = c.id
      LEFT JOIN pagos pg ON pg.comanda_id = c.id
      ${sucursalFilter}
      AND c.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, sucursalParams);

    res.json(metricas[0]);
  } catch (error) {
    console.error('Error al obtener métricas generales:', error);
    res.status(500).json({ 
      message: 'Error al obtener métricas generales',
      error: error.message 
    });
  }
};

// ============================================
// VENTAS POR DÍA (ÚLTIMOS 30 DÍAS)
// ============================================
export const getVentasPorDia = async (req, res) => {
  try {
    const { sucursal_id } = req.query;
    const user = req.user;

    if (user.rol !== 'admin' && user.rol !== 'dueño') {
      return res.status(403).json({ 
        message: 'No tienes permisos para ver las métricas' 
      });
    }

    let sucursalFilter = '';
    let sucursalParams = [];
    
    if (user.rol === 'admin' && sucursal_id) {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [sucursal_id];
    } else if (user.rol === 'dueño') {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [user.sucursal_id];
    }

    const [ventas] = await pool.query(`
      SELECT 
        DATE(pg.fecha_pago) as fecha,
        COALESCE(SUM(pg.monto_total), 0) as total_ventas,
        COALESCE(SUM(pg.propina), 0) as total_propinas,
        COUNT(DISTINCT pg.id) as cantidad_pagos
      FROM pagos pg
      INNER JOIN comandas c ON pg.comanda_id = c.id
      WHERE pg.fecha_pago >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ${sucursalFilter}
      GROUP BY DATE(pg.fecha_pago)
      ORDER BY fecha ASC
    `, sucursalParams);

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas por día:', error);
    res.status(500).json({ 
      message: 'Error al obtener ventas por día',
      error: error.message 
    });
  }
};

// ============================================
// MÉTODOS DE PAGO MÁS USADOS
// ============================================
export const getMetodosPagoStats = async (req, res) => {
  try {
    const { sucursal_id } = req.query;
    const user = req.user;

    if (user.rol !== 'admin' && user.rol !== 'dueño') {
      return res.status(403).json({ 
        message: 'No tienes permisos para ver las métricas' 
      });
    }

    let sucursalFilter = '';
    let sucursalParams = [];
    
    if (user.rol === 'admin' && sucursal_id) {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [sucursal_id];
    } else if (user.rol === 'dueño') {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [user.sucursal_id];
    }

    const [metodos] = await pool.query(`
      SELECT 
        pg.metodo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(pg.monto_total), 0) as total_monto
      FROM pagos pg
      INNER JOIN comandas c ON pg.comanda_id = c.id
      WHERE pg.fecha_pago >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ${sucursalFilter}
      GROUP BY pg.metodo_pago
      ORDER BY cantidad DESC
    `, sucursalParams);

    res.json(metodos);
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas de métodos de pago',
      error: error.message 
    });
  }
};

// ============================================
// PRODUCTOS MÁS VENDIDOS
// ============================================
export const getProductosMasVendidos = async (req, res) => {
  try {
    const { sucursal_id, limit = 10 } = req.query;
    const user = req.user;

    if (user.rol !== 'admin' && user.rol !== 'dueño') {
      return res.status(403).json({ 
        message: 'No tienes permisos para ver las métricas' 
      });
    }

    // Convertir limit a número
    const limitNum = parseInt(limit, 10);

    let sucursalFilter = '';
    let sucursalParams = [];
    
    if (user.rol === 'admin' && sucursal_id) {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [sucursal_id, limitNum];
    } else if (user.rol === 'dueño') {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [user.sucursal_id, limitNum];
    } else {
      sucursalParams = [limitNum];
    }

    const [productos] = await pool.query(`
      SELECT 
        i.nombre as producto,
        cat.nombre as categoria,
        SUM(dp.cantidad) as cantidad_vendida,
        COALESCE(SUM(dp.subtotal), 0) as ingresos_totales,
        COUNT(DISTINCT p.id) as veces_pedido
      FROM detalle_pedidos dp
      INNER JOIN pedidos p ON dp.pedido_id = p.id
      INNER JOIN comandas c ON p.comanda_id = c.id
      INNER JOIN inventario i ON dp.producto_id = i.id
      LEFT JOIN categorias_productos cat ON i.categoria_id = cat.id
      WHERE p.estado_pago = 'pagado'
      AND p.fecha_pedido >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ${sucursalFilter}
      GROUP BY i.id, i.nombre, cat.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT ?
    `, sucursalParams);

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({ 
      message: 'Error al obtener productos más vendidos',
      error: error.message 
    });
  }
};

// ============================================
// VENTAS POR CATEGORÍA
// ============================================
export const getVentasPorCategoria = async (req, res) => {
  try {
    const { sucursal_id } = req.query;
    const user = req.user;

    if (user.rol !== 'admin' && user.rol !== 'dueño') {
      return res.status(403).json({ 
        message: 'No tienes permisos para ver las métricas' 
      });
    }

    let sucursalFilter = '';
    let sucursalParams = [];
    
    if (user.rol === 'admin' && sucursal_id) {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [sucursal_id];
    } else if (user.rol === 'dueño') {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [user.sucursal_id];
    }

    const [categorias] = await pool.query(`
      SELECT 
        cat.nombre as categoria,
        COUNT(DISTINCT dp.id) as cantidad_items,
        COALESCE(SUM(dp.subtotal), 0) as total_ventas
      FROM detalle_pedidos dp
      INNER JOIN pedidos p ON dp.pedido_id = p.id
      INNER JOIN comandas c ON p.comanda_id = c.id
      INNER JOIN inventario i ON dp.producto_id = i.id
      LEFT JOIN categorias_productos cat ON i.categoria_id = cat.id
      WHERE p.estado_pago = 'pagado'
      AND p.fecha_pedido >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ${sucursalFilter}
      GROUP BY cat.id, cat.nombre
      ORDER BY total_ventas DESC
    `, sucursalParams);

    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener ventas por categoría:', error);
    res.status(500).json({ 
      message: 'Error al obtener ventas por categoría',
      error: error.message 
    });
  }
};

// ============================================
// RENDIMIENTO DE MESEROS
// ============================================
export const getRendimientoMeseros = async (req, res) => {
  try {
    const { sucursal_id } = req.query;
    const user = req.user;

    if (user.rol !== 'admin' && user.rol !== 'dueño') {
      return res.status(403).json({ 
        message: 'No tienes permisos para ver las métricas' 
      });
    }

    let sucursalFilter = '';
    let sucursalParams = [];
    
    if (user.rol === 'admin' && sucursal_id) {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [sucursal_id];
    } else if (user.rol === 'dueño') {
      sucursalFilter = 'AND c.sucursal_id = ?';
      sucursalParams = [user.sucursal_id];
    }

    const [meseros] = await pool.query(`
      SELECT 
        u.nombre,
        u.apellido,
        COUNT(DISTINCT c.id) as comandas_atendidas,
        COUNT(DISTINCT p.id) as pedidos_tomados,
        COALESCE(SUM(pg.monto_total), 0) as ventas_totales,
        COALESCE(SUM(pg.propina), 0) as propinas_totales
      FROM usuarios u
      INNER JOIN comandas c ON c.usuario_id = u.id
      LEFT JOIN pedidos p ON p.comanda_id = c.id
      LEFT JOIN pagos pg ON pg.comanda_id = c.id
      WHERE u.rol = 'mesero'
      AND c.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ${sucursalFilter}
      GROUP BY u.id, u.nombre, u.apellido
      ORDER BY ventas_totales DESC
    `, sucursalParams);

    res.json(meseros);
  } catch (error) {
    console.error('Error al obtener rendimiento de meseros:', error);
    res.status(500).json({ 
      message: 'Error al obtener rendimiento de meseros',
      error: error.message 
    });
  }
};
