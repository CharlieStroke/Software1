import { pool } from "../db.js";

// Función para logging
function logAction(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] CATEGORIAS: ${message}`, data);
}

// Obtener todas las categorías
export const getCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categorias_productos ORDER BY nombre ASC'
    );

    res.json({
      categorias: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ 
      message: 'Error al obtener categorías',
      error: error.message 
    });
  }
};

// Obtener categorías activas
export const getCategoriasActivas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categorias_productos WHERE activa = TRUE ORDER BY nombre ASC'
    );

    res.json({
      categorias: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error al obtener categorías activas:', error);
    res.status(500).json({ 
      message: 'Error al obtener categorías activas',
      error: error.message 
    });
  }
};

// Obtener categoría por ID
export const getCategoriaById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM categorias_productos WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: 'Categoría no encontrada' 
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ 
      message: 'Error al obtener categoría',
      error: error.message 
    });
  }
};

// Crear nueva categoría
export const createCategoria = async (req, res) => {
  const { nombre, descripcion, sucursal_id } = req.body;

  try {
    // Verificar si ya existe en la misma sucursal
    const [existing] = await pool.query(
      'SELECT id FROM categorias_productos WHERE nombre = ? AND (sucursal_id = ? OR sucursal_id IS NULL)',
      [nombre, sucursal_id || null]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        message: 'Ya existe una categoría con ese nombre en esta sucursal' 
      });
    }

    const [result] = await pool.query(
      'INSERT INTO categorias_productos (nombre, descripcion, sucursal_id, activa) VALUES (?, ?, ?, TRUE)',
      [nombre, descripcion || null, sucursal_id || null]
    );

    logAction('Categoría creada', { 
      categoriaId: result.insertId, 
      nombre,
      userId: req.user?.id 
    });

    const [newCategoria] = await pool.query(
      'SELECT * FROM categorias_productos WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      categoria: newCategoria[0]
    });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ 
      message: 'Error al crear categoría',
      error: error.message 
    });
  }
};

// Actualizar categoría
export const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, activa, sucursal_id } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM categorias_productos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        message: 'Categoría no encontrada' 
      });
    }

    if (nombre) {
      const [duplicate] = await pool.query(
        'SELECT id FROM categorias_productos WHERE nombre = ? AND id != ? AND (sucursal_id = ? OR sucursal_id IS NULL)',
        [nombre, id, sucursal_id || null]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({ 
          message: 'Ya existe otra categoría con ese nombre en esta sucursal' 
        });
      }
    }

    await pool.query(
      `UPDATE categorias_productos 
       SET nombre = COALESCE(?, nombre),
           descripcion = ?,
           activa = COALESCE(?, activa),
           sucursal_id = ?
       WHERE id = ?`,
      [nombre, descripcion, activa, sucursal_id, id]
    );

    logAction('Categoría actualizada', { categoriaId: id, userId: req.user?.id });

    const [updated] = await pool.query(
      'SELECT * FROM categorias_productos WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Categoría actualizada exitosamente',
      categoria: updated[0]
    });

  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ 
      message: 'Error al actualizar categoría',
      error: error.message 
    });
  }
};

// Activar/Desactivar categoría
export const toggleCategoriaStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const [categoria] = await pool.query(
      'SELECT id, nombre, activa FROM categorias_productos WHERE id = ?',
      [id]
    );

    if (categoria.length === 0) {
      return res.status(404).json({ 
        message: 'Categoría no encontrada' 
      });
    }

    const newStatus = !categoria[0].activa;

    await pool.query(
      'UPDATE categorias_productos SET activa = ? WHERE id = ?',
      [newStatus, id]
    );

    logAction('Estado de categoría cambiado', { 
      categoriaId: id, 
      nombre: categoria[0].nombre,
      nuevoEstado: newStatus ? 'activa' : 'inactiva',
      userId: req.user?.id 
    });

    res.json({
      message: `Categoría ${newStatus ? 'activada' : 'desactivada'} exitosamente`,
      activa: newStatus
    });

  } catch (error) {
    console.error('Error al cambiar estado de categoría:', error);
    res.status(500).json({ 
      message: 'Error al cambiar estado de categoría',
      error: error.message 
    });
  }
};

// Eliminar categoría
export const deleteCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const [categoria] = await pool.query(
      'SELECT id, nombre FROM categorias_productos WHERE id = ?',
      [id]
    );

    if (categoria.length === 0) {
      return res.status(404).json({ 
        message: 'Categoría no encontrada' 
      });
    }

    // Verificar si tiene productos
    const [productos] = await pool.query(
      'SELECT COUNT(*) as count FROM inventario WHERE categoria_id = ?',
      [id]
    );

    if (productos[0].count > 0) {
      await pool.query(
        'UPDATE categorias_productos SET activa = FALSE WHERE id = ?',
        [id]
      );

      logAction('Categoría desactivada (tiene productos)', { 
        categoriaId: id, 
        nombre: categoria[0].nombre,
        userId: req.user?.id 
      });

      return res.json({
        message: 'Categoría desactivada (tiene productos asociados)',
        deleted: false,
        deactivated: true
      });
    }

    await pool.query('DELETE FROM categorias_productos WHERE id = ?', [id]);

    logAction('Categoría eliminada', { 
      categoriaId: id, 
      nombre: categoria[0].nombre,
      userId: req.user?.id 
    });

    res.json({
      message: 'Categoría eliminada exitosamente',
      deleted: true
    });

  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ 
      message: 'Error al eliminar categoría',
      error: error.message 
    });
  }
};
