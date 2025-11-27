import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as inventarioApi from '../../../api/inventarioApi';
import * as categoriasApi from '../../../api/categoriasApi';

export const useInventario = () => {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    bajoStock: 0,
    agotados: 0
  });

  /* CARGAR PRODUCTOS DEL INVENTARIO */
  const cargarInventario = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      // Si el usuario tiene sucursal, cargar solo de esa sucursal
      if (user?.sucursal_id) {
        data = await inventarioApi.getInventarioBySucursal(user.sucursal_id);
      } else {
        // Admin sin sucursal, cargar todo
        data = await inventarioApi.getInventario();
      }

      const productosData = data.productos || [];
      setProductos(productosData);

      // Calcular estadísticas
      calcularStats(productosData);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError(err.response?.data?.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  /* CARGAR CATEGORÍAS */
  const cargarCategorias = async () => {
    try {
      // Cargar TODAS las categorías (activas e inactivas) para poder gestionarlas
      const data = await categoriasApi.getCategorias();
      setCategorias(data.categorias || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  /* CALCULAR ESTADÍSTICAS */
  const calcularStats = (productosData) => {
    const stats = {
      total: productosData.length,
      bajoStock: productosData.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0).length,
      agotados: productosData.filter(p => p.stock_actual === 0).length
    };
    setStats(stats);
  };

  /* CREAR PRODUCTO */
  const crearProducto = async (datosProducto) => {
    try {
      // Agregar sucursal_id si el usuario tiene sucursal
      const data = {
        ...datosProducto,
        sucursal_id: user?.sucursal_id || datosProducto.sucursal_id
      };

      console.log('🔍 DEBUG - Creando producto:', {
        user: user,
        sucursal_id_usuario: user?.sucursal_id,
        datos_enviados: data
      });

      const response = await inventarioApi.createProducto(data);
      await cargarInventario(); // Recargar lista
      
      // El backend devuelve directamente el producto creado
      return { success: true, data: response };
    } catch (err) {
      console.error('Error al crear producto:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al crear producto' 
      };
    }
  };

  /* ACTUALIZAR PRODUCTO */
  const actualizarProducto = async (id, datosProducto) => {
    try {
      const response = await inventarioApi.updateProducto(id, datosProducto);
      await cargarInventario(); // Recargar lista
      
      return { success: true, data: response };
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al actualizar producto' 
      };
    }
  };

  /* AJUSTAR STOCK (AGREGAR O QUITAR) */
  const ajustarStock = async (id, cantidad, tipo_movimiento = 'ajuste', observaciones = '') => {
    try {
      const response = await inventarioApi.ajustarStock(id, {
        cantidad,
        tipo_movimiento,
        observaciones
      });
      
      await cargarInventario(); // Recargar lista
      return { success: true };
    } catch (err) {
      console.error('Error al ajustar stock:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al ajustar stock' 
      };
    }
  };

  /* ALTERNAR ESTADO DEL PRODUCTO */
  const toggleEstado = async (id) => {
    try {
      await inventarioApi.toggleProductoStatus(id);
      await cargarInventario(); // Recargar lista
      
      return { success: true };
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al cambiar estado' 
      };
    }
  };

  /* ELIMINAR PRODUCTO */
  const eliminarProducto = async (id) => {
    try {
      await inventarioApi.deleteProducto(id);
      await cargarInventario(); // Recargar lista
      
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al eliminar producto' 
      };
    }
  };

  /* CREAR CATEGORÍA */
  const crearCategoria = async (datosCategoria) => {
    try {
      // Agregar sucursal_id si el usuario tiene sucursal
      const data = {
        ...datosCategoria,
        sucursal_id: user?.sucursal_id || datosCategoria.sucursal_id
      };

      const response = await categoriasApi.createCategoria(data);
      await cargarCategorias(); // Recargar lista de categorías
      
      // El backend devuelve directamente la categoría creada, no un objeto con success
      return { success: true, data: response };
    } catch (err) {
      console.error('Error al crear categoría:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al crear categoría' 
      };
    }
  };

  /* TOGGLE ESTADO CATEGORÍA */
  const toggleEstadoCategoria = async (id) => {
    try {
      await categoriasApi.toggleCategoriaStatus(id);
      await cargarCategorias(); // Recargar lista
      return { success: true };
    } catch (err) {
      console.error('Error al cambiar estado de categoría:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al cambiar estado de categoría' 
      };
    }
  };

  /* ELIMINAR CATEGORÍA */
  const eliminarCategoria = async (id) => {
    try {
      await categoriasApi.deleteCategoria(id);
      await cargarCategorias(); // Recargar lista
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al eliminar categoría' 
      };
    }
  };

  /* CARGAR DATOS AL MONTAR */
  useEffect(() => {
    cargarInventario();
    cargarCategorias();
  }, [user?.id_sucursal]);

  return {
    productos,
    categorias,
    loading,
    error,
    stats,
    crearProducto,
    crearCategoria,
    actualizarProducto,
    ajustarStock,
    toggleEstado,
    eliminarProducto,
    toggleEstadoCategoria,
    eliminarCategoria,
    recargar: cargarInventario,
    recargarCategorias: cargarCategorias
  };
};
