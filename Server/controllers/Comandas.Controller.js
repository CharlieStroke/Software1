import { pool } from '../db.js';

// Obtener todas las comandas (con filtros opcionales)
export const getComandas = async (req, res) => {
  try {
    const { rol, sucursal_id: userSucursalId } = req.user;
    const { estatus, fecha } = req.query;
    
    console.log('getComandas - req.query:', req.query);
    console.log('getComandas - fecha:', fecha, 'tipo:', typeof fecha);
    console.log('getComandas - estatus:', estatus);
    console.log('getComandas - user:', { rol, sucursal_id: userSucursalId });

    let query = `
      SELECT 
        c.id,
        c.sucursal_id,
        c.usuario_id,
        c.estatus,
        c.fecha_creacion,
        c.fecha_actualizacion,
        s.nombre as sucursal_nombre,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        COUNT(CASE WHEN p.estado_pago = 'pendiente' THEN p.id END) as total_pedidos,
        COALESCE(SUM(CASE WHEN p.estado_pago = 'pendiente' THEN p.total ELSE 0 END), 0) as total_comanda
      FROM comandas c
      INNER JOIN sucursales s ON c.sucursal_id = s.id
      INNER JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN pedidos p ON c.id = p.comanda_id
      WHERE 1=1
    `;

    const params = [];

    // Filtrar por sucursal según el rol
    if (rol !== 'admin') {
      query += ' AND c.sucursal_id = ?';
      params.push(userSucursalId);
    }

    // Filtrar por estatus si se proporciona
    if (estatus) {
      query += ' AND c.estatus = ?';
      params.push(estatus);
    }

    // Filtrar por fecha si se proporciona
    if (fecha) {
      query += ' AND DATE(c.fecha_creacion) = ?';
      params.push(fecha);
    }

    query += ' GROUP BY c.id ORDER BY c.fecha_creacion DESC';

    console.log('SQL Query:', query);
    console.log('SQL Params:', params);

    const [comandas] = await pool.query(query, params);
    
    console.log('Comandas encontradas:', comandas.length);
    if (comandas.length > 0) {
      console.log('Primera comanda:', comandas[0]);
    }
    
    res.json({ comandas, total: comandas.length });
  } catch (error) {
    console.error('Error al obtener comandas:', error);
    res.status(500).json({ message: 'Error al obtener comandas' });
  }
};

// Obtener una comanda por ID con sus pedidos
export const getComandaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, sucursal_id: userSucursalId } = req.user;

    // Obtener información de la comanda
    let query = `
      SELECT 
        c.id,
        c.sucursal_id,
        c.usuario_id,
        c.estatus,
        c.fecha_creacion,
        c.fecha_actualizacion,
        s.nombre as sucursal_nombre,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
      FROM comandas c
      INNER JOIN sucursales s ON c.sucursal_id = s.id
      INNER JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = ?
    `;

    const params = [id];

    // Validar acceso por sucursal
    if (rol !== 'admin') {
      query += ' AND c.sucursal_id = ?';
      params.push(userSucursalId);
    }

    const [comandas] = await pool.query(query, params);

    if (comandas.length === 0) {
      return res.status(404).json({ message: 'Comanda no encontrada' });
    }

    // Obtener los pedidos de la comanda
    const [pedidos] = await pool.query(
      `SELECT 
        p.id,
        p.numero_pedido,
        p.cliente_id,
        p.usuario_id,
        p.sucursal_id,
        p.comanda_id,
        p.estado,
        p.tipo_pedido,
        p.subtotal,
        p.impuestos,
        p.descuento,
        p.total,
        p.notas,
        p.fecha_pedido,
        CONCAT(c.nombre, ' ', c.apellido) as cliente_nombre,
        c.telefono as cliente_telefono
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.comanda_id = ?
      ORDER BY p.fecha_pedido DESC`,
      [id]
    );

    // Obtener el detalle de cada pedido
    for (let pedido of pedidos) {
      const [detalle] = await pool.query(
        `SELECT 
          dp.id,
          dp.producto_id,
          dp.cantidad,
          dp.precio_unitario,
          dp.subtotal,
          dp.notas_item,
          i.nombre as producto_nombre
        FROM detalle_pedidos dp
        INNER JOIN inventario i ON dp.producto_id = i.id
        WHERE dp.pedido_id = ?
        ORDER BY dp.id`,
        [pedido.id]
      );
      pedido.detalle = detalle;
    }

    // Calcular total solo de pedidos pendientes de pago
    const pedidosPendientesPago = pedidos.filter(p => p.estado_pago === 'pendiente');
    
    const comanda = {
      ...comandas[0],
      pedidos,
      total_pedidos: pedidosPendientesPago.length,
      total_comanda: pedidosPendientesPago.reduce((sum, p) => sum + parseFloat(p.total || 0), 0)
    };

    res.json(comanda);
  } catch (error) {
    console.error('Error al obtener comanda:', error);
    res.status(500).json({ message: 'Error al obtener comanda' });
  }
};

// Obtener comandas abiertas (activas)
export const getComandasAbiertas = async (req, res) => {
  try {
    const { rol, sucursal_id: userSucursalId } = req.user;

    let query = `
      SELECT 
        c.id,
        c.sucursal_id,
        c.usuario_id,
        c.estatus,
        c.fecha_creacion,
        s.nombre as sucursal_nombre,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        COUNT(p.id) as total_pedidos,
        COALESCE(SUM(p.total), 0) as total_comanda
      FROM comandas c
      INNER JOIN sucursales s ON c.sucursal_id = s.id
      INNER JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN pedidos p ON c.id = p.comanda_id
      WHERE c.estatus = 'abierta'
    `;

    const params = [];

    if (rol !== 'admin') {
      query += ' AND c.sucursal_id = ?';
      params.push(userSucursalId);
    }

    query += ' GROUP BY c.id ORDER BY c.fecha_creacion DESC';

    const [comandas] = await pool.query(query, params);
    console.log(`Comandas abiertas encontradas: ${comandas.length}`, comandas.map(c => ({ id: c.id, sucursal: c.sucursal_nombre, usuario: c.usuario_nombre })));
    res.json(comandas);
  } catch (error) {
    console.error('Error al obtener comandas abiertas:', error);
    res.status(500).json({ message: 'Error al obtener comandas abiertas' });
  }
};

// Crear una nueva comanda
export const createComanda = async (req, res) => {
  try {
    const { sucursal_id, usuario_id } = req.body;
    const { rol, sucursal_id: userSucursalId, id: userId } = req.user;

    // Validar que la sucursal pertenezca al usuario (excepto admin)
    if (rol !== 'admin' && sucursal_id != userSucursalId) {
      return res.status(403).json({ 
        message: 'No tienes permiso para crear comandas en esta sucursal' 
      });
    }

    // Si no se proporciona usuario_id, usar el usuario actual
    const finalUsuarioId = usuario_id || userId;

    const [result] = await pool.query(
      'INSERT INTO comandas (sucursal_id, usuario_id, estatus) VALUES (?, ?, ?)',
      [sucursal_id, finalUsuarioId, 'abierta']
    );

    // Obtener la comanda creada
    const [comanda] = await pool.query(
      `SELECT 
        c.id,
        c.sucursal_id,
        c.usuario_id,
        c.estatus,
        c.fecha_creacion,
        c.fecha_actualizacion,
        s.nombre as sucursal_nombre,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
      FROM comandas c
      INNER JOIN sucursales s ON c.sucursal_id = s.id
      INNER JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Comanda creada exitosamente',
      comanda: comanda[0]
    });
  } catch (error) {
    console.error('Error al crear comanda:', error);
    res.status(500).json({ message: 'Error al crear comanda' });
  }
};

// Actualizar estatus de una comanda
export const updateComandaEstatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estatus } = req.body;
    const { rol, sucursal_id: userSucursalId } = req.user;

    // Validar estatus
    const estatusValidos = ['abierta', 'cerrada', 'cancelada'];
    if (!estatusValidos.includes(estatus)) {
      return res.status(400).json({ 
        message: 'Estatus inválido. Debe ser: abierta, cerrada o cancelada' 
      });
    }

    // Verificar que la comanda existe y pertenece a la sucursal del usuario
    let query = 'SELECT * FROM comandas WHERE id = ?';
    const params = [id];

    if (rol !== 'admin') {
      query += ' AND sucursal_id = ?';
      params.push(userSucursalId);
    }

    const [comandas] = await pool.query(query, params);

    if (comandas.length === 0) {
      return res.status(404).json({ message: 'Comanda no encontrada' });
    }

    // Actualizar estatus
    await pool.query(
      'UPDATE comandas SET estatus = ? WHERE id = ?',
      [estatus, id]
    );

    // Obtener la comanda actualizada
    const [comanda] = await pool.query(
      `SELECT 
        c.id,
        c.sucursal_id,
        c.usuario_id,
        c.estatus,
        c.fecha_creacion,
        c.fecha_actualizacion,
        s.nombre as sucursal_nombre,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
      FROM comandas c
      INNER JOIN sucursales s ON c.sucursal_id = s.id
      INNER JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    res.json({
      message: 'Estatus de comanda actualizado exitosamente',
      comanda: comanda[0]
    });
  } catch (error) {
    console.error('Error al actualizar estatus de comanda:', error);
    res.status(500).json({ message: 'Error al actualizar estatus de comanda' });
  }
};

// Cerrar una comanda
export const cerrarComanda = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, sucursal_id: userSucursalId } = req.user;

    // Verificar que la comanda existe y está abierta
    let query = 'SELECT * FROM comandas WHERE id = ? AND estatus = ?';
    const params = [id, 'abierta'];

    if (rol !== 'admin') {
      query += ' AND sucursal_id = ?';
      params.push(userSucursalId);
    }

    const [comandas] = await pool.query(query, params);

    if (comandas.length === 0) {
      return res.status(404).json({ 
        message: 'Comanda no encontrada o ya está cerrada' 
      });
    }

    // Cerrar la comanda
    await pool.query(
      'UPDATE comandas SET estatus = ? WHERE id = ?',
      ['cerrada', id]
    );

    res.json({ message: 'Comanda cerrada exitosamente' });
  } catch (error) {
    console.error('Error al cerrar comanda:', error);
    res.status(500).json({ message: 'Error al cerrar comanda' });
  }
};

// Eliminar una comanda (solo si no tiene pedidos)
export const deleteComanda = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, sucursal_id: userSucursalId } = req.user;

    // Verificar que la comanda existe
    let query = 'SELECT * FROM comandas WHERE id = ?';
    const params = [id];

    if (rol !== 'admin') {
      query += ' AND sucursal_id = ?';
      params.push(userSucursalId);
    }

    const [comandas] = await pool.query(query, params);

    if (comandas.length === 0) {
      return res.status(404).json({ message: 'Comanda no encontrada' });
    }

    // Verificar que no tenga pedidos
    const [pedidos] = await pool.query(
      'SELECT COUNT(*) as total FROM pedidos WHERE comanda_id = ?',
      [id]
    );

    if (pedidos[0].total > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar una comanda con pedidos asociados' 
      });
    }

    // Eliminar la comanda
    await pool.query('DELETE FROM comandas WHERE id = ?', [id]);

    res.json({ message: 'Comanda eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar comanda:', error);
    res.status(500).json({ message: 'Error al eliminar comanda' });
  }
};
