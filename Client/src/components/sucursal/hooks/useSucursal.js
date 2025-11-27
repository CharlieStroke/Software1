import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as sucursalApi from '../../../api/sucursalApi';

export const useSucursal = () => {
  const { user } = useAuth();
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* CARGAR SUCURSALES */
  const cargarSucursales = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await sucursalApi.getSucursales();
      const sucursalesData = Array.isArray(data) ? data : (data.sucursales || []);
      setSucursales(sucursalesData);
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      setError(err.response?.data?.message || 'Error al cargar sucursales');
      setSucursales([]);
    } finally {
      setLoading(false);
    }
  };

  /* CREAR SUCURSAL */
  const crearSucursal = async (datos) => {
    try {
      const result = await sucursalApi.createSucursal(datos);
      await cargarSucursales();
      return { success: true, data: result };
    } catch (err) {
      console.error('Error al crear sucursal:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al crear sucursal'
      };
    }
  };

  /* ACTUALIZAR SUCURSAL */
  const actualizarSucursal = async (id, datos) => {
    try {
      const result = await sucursalApi.updateSucursal(id, datos);
      await cargarSucursales();
      return { success: true, data: result };
    } catch (err) {
      console.error('Error al actualizar sucursal:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al actualizar sucursal'
      };
    }
  };

  /* TOGGLE ESTADO */
  const toggleEstado = async (id) => {
    try {
      await sucursalApi.toggleSucursalStatus(id);
      await cargarSucursales();
      return { success: true };
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al cambiar estado'
      };
    }
  };

  /* ELIMINAR SUCURSAL */
  const eliminarSucursal = async (id) => {
    try {
      await sucursalApi.deleteSucursal(id);
      await cargarSucursales();
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar sucursal:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al eliminar sucursal'
      };
    }
  };

  /* OBTENER ESTADÍSTICAS */
  const obtenerEstadisticas = async (id) => {
    try {
      const stats = await sucursalApi.getSucursalStats(id);
      return { success: true, data: stats };
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al obtener estadísticas'
      };
    }
  };

  /* CARGAR AL MONTAR */
  useEffect(() => {
    cargarSucursales();
  }, []);

  return {
    sucursales,
    loading,
    error,
    crearSucursal,
    actualizarSucursal,
    toggleEstado,
    eliminarSucursal,
    obtenerEstadisticas,
    recargar: cargarSucursales
  };
};
