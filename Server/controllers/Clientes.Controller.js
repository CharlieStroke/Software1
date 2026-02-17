import { pool } from "../db.js";

function logAction(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] CLIENTES: ${message}`, data);
}

export const getClientes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clientes ORDER BY fecha_registro DESC'
    );

    res.json({
      clientes: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ 
      message: 'Error al obtener clientes',
      error: error.message 
    });
  }
};

export const getClienteById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: 'Cliente no encontrado' 
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ 
      message: 'Error al obtener cliente',
      error: error.message 
    });
  }
};

export const getClientesBySucursal = async (req, res) => {
  const { sucursalId } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM clientes WHERE id_sucursal = ? ORDER BY nombre ASC',
      [sucursalId]
    );

    res.json({
      clientes: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener clientes por sucursal:', error);
    res.status(500).json({ 
      message: 'Error al obtener clientes',
      error: error.message 
    });
  }
};

export const searchClientes = async (req, res) => {
  const { q } = req.query;

  try {
    const searchTerm = `%${q}%`;
    const [rows] = await pool.query(
      'SELECT * FROM clientes WHERE nombre LIKE ? OR apellido LIKE ? OR telefono LIKE ? OR email LIKE ? LIMIT 20',
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    res.json({
      clientes: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({ 
      message: 'Error al buscar clientes',
      error: error.message 
    });
  }
};

export const createCliente = async (req, res) => {
  const { nombre, apellido, telefono, email, direccion, id_sucursal } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, apellido, telefono, email, direccion, id_sucursal) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido || null, telefono || null, email || null, direccion || null, id_sucursal || null]
    );

    logAction('Cliente creado', { 
      clienteId: result.insertId, 
      nombre,
      userId: req.user?.id 
    });

    const [newCliente] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      cliente: newCliente[0]
    });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ 
      message: 'Error al crear cliente',
      error: error.message 
    });
  }
};

export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, telefono, email, direccion, id_sucursal } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM clientes WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        message: 'Cliente no encontrado' 
      });
    }

    await pool.query(
      `UPDATE clientes 
       SET nombre = COALESCE(?, nombre),
           apellido = ?,
           telefono = ?,
           email = ?,
           direccion = ?,
           id_sucursal = ?
       WHERE id = ?`,
      [nombre, apellido, telefono, email, direccion, id_sucursal, id]
    );

    logAction('Cliente actualizado', { clienteId: id, userId: req.user?.id });

    const [updated] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Cliente actualizado exitosamente',
      cliente: updated[0]
    });

  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ 
      message: 'Error al actualizar cliente',
      error: error.message 
    });
  }
};

export const deleteCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const [cliente] = await pool.query(
      'SELECT id, nombre FROM clientes WHERE id = ?',
      [id]
    );

    if (cliente.length === 0) {
      return res.status(404).json({ 
        message: 'Cliente no encontrado' 
      });
    }

    // Verificar si tiene pedidos
    const [pedidos] = await pool.query(
      'SELECT COUNT(*) as count FROM pedidos WHERE cliente_id = ?',
      [id]
    );

    if (pedidos[0].count > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar el cliente porque tiene pedidos asociados',
        has_pedidos: true
      });
    }

    await pool.query('DELETE FROM clientes WHERE id = ?', [id]);

    logAction('Cliente eliminado', { 
      clienteId: id, 
      nombre: cliente[0].nombre,
      userId: req.user?.id 
    });

    res.json({
      message: 'Cliente eliminado exitosamente',
      deleted: true
    });

  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ 
      message: 'Error al eliminar cliente',
      error: error.message 
    });
  }
};
