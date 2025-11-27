import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as usuariosApi from '../../../api/usuariosApi';
import * as sucursalApi from '../../../api/sucursalApi';

export const useMeseros = () => {
  const { user } = useAuth();
  const [meseros, setMeseros] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* CARGAR MESEROS DE LA SUCURSAL */
  const cargarMeseros = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si el usuario tiene sucursal asignada, cargar solo de esa sucursal
      if (user?.id_sucursal) {
        const data = await usuariosApi.getUsersBySucursal(user.id_sucursal);
        // Filtrar solo meseros
        const soloMeseros = data.usuarios?.filter(u => u.rol === 'mesero') || [];
        setMeseros(soloMeseros);
      } else {
        // Si es admin sin sucursal, cargar todos
        const data = await usuariosApi.getUsers();
        const soloMeseros = data.usuarios?.filter(u => u.rol === 'mesero') || [];
        setMeseros(soloMeseros);
      }
    } catch (err) {
      console.error('Error al cargar meseros:', err);
      setError(err.response?.data?.message || 'Error al cargar meseros');
    } finally {
      setLoading(false);
    }
  };

  /* CARGAR SUCURSALES ACTIVAS */
  const cargarSucursales = async () => {
    try {
      const data = await sucursalApi.getSucursalesActivas();
      setSucursales(data.sucursales || []);
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
    }
  };

  /* CREAR MESERO */
  const crearMesero = async (datos) => {
    try {
      const datosMesero = {
        ...datos,
        rol: 'mesero', // Forzar rol mesero
        id_sucursal: user?.id_sucursal || datos.id_sucursal, // Usar sucursal del usuario o la seleccionada
        password: datos.password || '123456' // Password por defecto
      };

      const result = await usuariosApi.createUser(datosMesero);
      await cargarMeseros(); // Recargar lista
      return { success: true, data: result };
    } catch (err) {
      console.error('Error al crear mesero:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al crear mesero'
      };
    }
  };

  /* ACTUALIZAR MESERO */
  const actualizarMesero = async (id, datos) => {
    try {
      const result = await usuariosApi.updateUser(id, datos);
      await cargarMeseros(); // Recargar lista
      return { success: true, data: result };
    } catch (err) {
      console.error('Error al actualizar mesero:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al actualizar mesero'
      };
    }
  };

  /* TOGGLE ESTADO ACTIVO/INACTIVO */
  const toggleEstado = async (id) => {
    try {
      await usuariosApi.toggleUserStatus(id);
      await cargarMeseros(); // Recargar lista
      return { success: true };
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al cambiar estado'
      };
    }
  };

  /* ELIMINAR MESERO */
  const eliminarMesero = async (id) => {
    try {
      await usuariosApi.deleteUser(id);
      await cargarMeseros(); // Recargar lista
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar mesero:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al eliminar mesero'
      };
    }
  };

  /* CARGAR DATOS AL MONTAR */
  useEffect(() => {
    if (user) {
      cargarMeseros();
      cargarSucursales();
    }
  }, [user]);

  return {
    meseros,
    sucursales,
    loading,
    error,
    crearMesero,
    actualizarMesero,
    toggleEstado,
    eliminarMesero,
    recargar: cargarMeseros,
    sucursalUsuario: user?.id_sucursal
  };
};
