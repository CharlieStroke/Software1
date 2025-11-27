import { pool } from '../db.js';

// Registrar un pago
export const registrarPago = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { 
      comanda_id,
      metodo_pago,
      monto_total,
      monto_efectivo = 0,
      monto_tarjeta = 0,
      monto_transferencia = 0,
      monto_recibido = 0,
      cambio = 0,
      propina = 0,
      referencia_pago,
      notas
    } = req.body;

    const usuario_id = req.user.id;

    console.log('Iniciando registro de pago:', {
      comanda_id,
      metodo_pago,
      monto_total,
      usuario_id
    });

    // Verificar que la comanda existe y está abierta
    const [comandas] = await connection.query(
      'SELECT id, estatus, total_pagado FROM comandas WHERE id = ?',
      [comanda_id]
    );
    console.log('Comanda encontrada:', comandas[0]);

    if (comandas.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Comanda no encontrada' });
    }

    const comanda = comandas[0];

    if (comanda.estatus === 'cerrada') {
      await connection.rollback();
      return res.status(400).json({ message: 'Esta comanda ya está cerrada' });
    }

    if (comanda.estatus === 'cancelada') {
      await connection.rollback();
      return res.status(400).json({ message: 'No se puede procesar pago de una comanda cancelada' });
    }

    // Calcular el total de la comanda (suma de pedidos pendientes de pago)
    const [totalComanda] = await connection.query(
      'SELECT COALESCE(SUM(total), 0) as total FROM pedidos WHERE comanda_id = ? AND estado_pago = "pendiente"',
      [comanda_id]
    );

    const totalAPagar = parseFloat(totalComanda[0].total);
    const totalYaPagado = parseFloat(comanda.total_pagado);
    const saldoPendiente = totalAPagar - totalYaPagado;

    // Validar que el monto del pago no exceda el saldo pendiente
    if (monto_total > saldoPendiente + 0.01) { // Tolerancia de 1 centavo
      await connection.rollback();
      return res.status(400).json({ 
        message: 'El monto del pago excede el saldo pendiente',
        saldo_pendiente: saldoPendiente.toFixed(2)
      });
    }

    // Registrar el pago
    const [result] = await connection.query(
      `INSERT INTO pagos (
        comanda_id, usuario_id, metodo_pago, monto_total,
        monto_efectivo, monto_tarjeta, monto_transferencia,
        monto_recibido, cambio, propina, referencia_pago, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        comanda_id, usuario_id, metodo_pago, monto_total,
        monto_efectivo, monto_tarjeta, monto_transferencia,
        monto_recibido, cambio, propina, referencia_pago, notas
      ]
    );

    // Verificar si el campo estado_pago existe en la tabla
    try {
      const [checkColumn] = await connection.query(
        "SHOW COLUMNS FROM pedidos LIKE 'estado_pago'"
      );
      console.log('Campo estado_pago existe:', checkColumn.length > 0);
      if (checkColumn.length === 0) {
        console.error('ERROR: El campo estado_pago NO existe en la tabla pedidos');
        console.error('Por favor ejecuta el script: Database/agregar_estado_pago.sql');
      }
    } catch (err) {
      console.error('Error al verificar campo estado_pago:', err.message);
    }

    // Verificar pedidos antes de actualizar
    const [pedidosAntes] = await connection.query(
      'SELECT id, numero_pedido, estado, IFNULL(estado_pago, "NO_EXISTE") as estado_pago FROM pedidos WHERE comanda_id = ?',
      [comanda_id]
    );
    console.log('Pedidos antes de actualizar:', pedidosAntes);

    // Marcar todos los pedidos pendientes como pagados
    const [resultUpdate] = await connection.query(
      'UPDATE pedidos SET estado_pago = "pagado" WHERE comanda_id = ? AND (estado_pago = "pendiente" OR estado_pago IS NULL)',
      [comanda_id]
    );
    console.log('Resultado del UPDATE estado_pago:', {
      affectedRows: resultUpdate.affectedRows,
      changedRows: resultUpdate.changedRows,
      comanda_id
    });

    // Verificar pedidos después de actualizar
    const [pedidosDespues] = await connection.query(
      'SELECT id, numero_pedido, estado, IFNULL(estado_pago, "NO_EXISTE") as estado_pago FROM pedidos WHERE comanda_id = ?',
      [comanda_id]
    );
    console.log('Pedidos después de actualizar:', pedidosDespues);

    // Actualizar el total pagado en la comanda
    const nuevoTotalPagado = totalYaPagado + monto_total;
    console.log('Actualizando total_pagado:', {
      totalYaPagado,
      monto_total,
      nuevoTotalPagado
    });
    
    await connection.query(
      'UPDATE comandas SET total_pagado = ? WHERE id = ?',
      [nuevoTotalPagado, comanda_id]
    );

    // Si el pago cubre el total, cerrar la comanda
    if (Math.abs(nuevoTotalPagado - totalAPagar) < 0.01) {
      await connection.query(
        'UPDATE comandas SET estatus = ?, fecha_cierre = NOW() WHERE id = ?',
        ['cerrada', comanda_id]
      );
    }

    await connection.commit();

    // Obtener el pago registrado con información adicional
    const [pagoRegistrado] = await connection.query(
      `SELECT 
        p.*,
        CONCAT(u.nombre, ' ', u.apellido) as cajero_nombre
      FROM pagos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      pago: pagoRegistrado[0],
      saldo_restante: (totalAPagar - nuevoTotalPagado).toFixed(2),
      comanda_cerrada: Math.abs(nuevoTotalPagado - totalAPagar) < 0.01
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar pago:', error);
    res.status(500).json({ message: 'Error al registrar pago', error: error.message });
  } finally {
    connection.release();
  }
};

// Obtener pagos de una comanda
export const getPagosByComanda = async (req, res) => {
  try {
    const { comanda_id } = req.params;

    const [pagos] = await pool.query(
      `SELECT 
        p.*,
        CONCAT(u.nombre, ' ', u.apellido) as cajero_nombre
      FROM pagos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.comanda_id = ?
      ORDER BY p.fecha_pago DESC`,
      [comanda_id]
    );

    // Calcular totales
    const totalPagado = pagos.reduce((sum, p) => sum + parseFloat(p.monto_total), 0);
    const totalPropina = pagos.reduce((sum, p) => sum + parseFloat(p.propina || 0), 0);

    res.json({
      pagos,
      total_pagado: totalPagado.toFixed(2),
      total_propina: totalPropina.toFixed(2),
      cantidad_pagos: pagos.length
    });

  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
};

// Obtener todos los pagos con filtros
export const getPagos = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, metodo_pago, sucursal_id } = req.query;
    const { rol, sucursal_id: userSucursalId } = req.user;

    let query = `
      SELECT 
        p.*,
        CONCAT(u.nombre, ' ', u.apellido) as cajero_nombre,
        c.id as comanda_id,
        c.estatus as comanda_estatus,
        s.nombre as sucursal_nombre
      FROM pagos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN comandas c ON p.comanda_id = c.id
      INNER JOIN sucursales s ON c.sucursal_id = s.id
      WHERE 1=1
    `;

    const params = [];

    // Filtrar por sucursal según rol
    if (rol !== 'admin') {
      query += ' AND c.sucursal_id = ?';
      params.push(userSucursalId);
    } else if (sucursal_id) {
      query += ' AND c.sucursal_id = ?';
      params.push(sucursal_id);
    }

    // Filtrar por rango de fechas
    if (fecha_inicio) {
      query += ' AND DATE(p.fecha_pago) >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND DATE(p.fecha_pago) <= ?';
      params.push(fecha_fin);
    }

    // Filtrar por método de pago
    if (metodo_pago) {
      query += ' AND p.metodo_pago = ?';
      params.push(metodo_pago);
    }

    query += ' ORDER BY p.fecha_pago DESC';

    const [pagos] = await pool.query(query, params);

    // Calcular estadísticas
    const stats = {
      total_pagos: pagos.length,
      total_efectivo: pagos.reduce((sum, p) => sum + parseFloat(p.monto_efectivo || 0), 0),
      total_tarjeta: pagos.reduce((sum, p) => sum + parseFloat(p.monto_tarjeta || 0), 0),
      total_transferencia: pagos.reduce((sum, p) => sum + parseFloat(p.monto_transferencia || 0), 0),
      total_general: pagos.reduce((sum, p) => sum + parseFloat(p.monto_total), 0),
      total_propinas: pagos.reduce((sum, p) => sum + parseFloat(p.propina || 0), 0)
    };

    res.json({ pagos, stats });

  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
};

// Obtener un pago por ID
export const getPagoById = async (req, res) => {
  try {
    const { id } = req.params;

    const [pagos] = await pool.query(
      `SELECT 
        p.*,
        CONCAT(u.nombre, ' ', u.apellido) as cajero_nombre,
        c.id as comanda_id,
        c.estatus as comanda_estatus,
        s.nombre as sucursal_nombre
      FROM pagos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN comandas c ON p.comanda_id = c.id
      INNER JOIN sucursales s ON c.sucursal_id = s.id
      WHERE p.id = ?`,
      [id]
    );

    if (pagos.length === 0) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    res.json(pagos[0]);

  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ message: 'Error al obtener pago' });
  }
};

// Cancelar un pago (solo si la comanda no está cerrada)
export const cancelarPago = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { motivo } = req.body;

    // Obtener información del pago
    const [pagos] = await connection.query(
      'SELECT * FROM pagos WHERE id = ?',
      [id]
    );

    if (pagos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    const pago = pagos[0];

    // Verificar que la comanda no esté cerrada
    const [comandas] = await connection.query(
      'SELECT estatus, total_pagado FROM comandas WHERE id = ?',
      [pago.comanda_id]
    );

    if (comandas[0].estatus === 'cerrada') {
      await connection.rollback();
      return res.status(400).json({ 
        message: 'No se puede cancelar un pago de una comanda cerrada' 
      });
    }

    // Restar el monto del pago del total pagado
    const nuevoTotalPagado = parseFloat(comandas[0].total_pagado) - parseFloat(pago.monto_total);
    await connection.query(
      'UPDATE comandas SET total_pagado = ? WHERE id = ?',
      [nuevoTotalPagado, pago.comanda_id]
    );

    // Eliminar el pago
    await connection.query('DELETE FROM pagos WHERE id = ?', [id]);

    await connection.commit();

    res.json({ 
      message: 'Pago cancelado exitosamente',
      monto_revertido: pago.monto_total
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al cancelar pago:', error);
    res.status(500).json({ message: 'Error al cancelar pago' });
  } finally {
    connection.release();
  }
};
