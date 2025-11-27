import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as comandasApi from '../../../api/comandasApi';
import * as pedidosApi from '../../../api/pedidosApi';

export const useComandas = (fecha = null, estatus = null) => {
  const { user } = useAuth();
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    abiertas: 0,
    cerradas: 0,
    canceladas: 0
  });

  /* CARGAR COMANDAS CON FILTROS */
  const cargarComandas = async (fechaFiltro = fecha, estatusFiltro = estatus) => {
    try {
      setLoading(true);
      setError(null);

      console.log('cargarComandas llamada con:', { fechaFiltro, estatusFiltro });
      console.log('Tipo de fechaFiltro:', typeof fechaFiltro);

      const filtros = {};
      // Asegurarse de que fechaFiltro sea un string válido
      if (fechaFiltro && typeof fechaFiltro === 'string') {
        filtros.fecha = fechaFiltro;
      }
      if (estatusFiltro) filtros.estatus = estatusFiltro;
      
      console.log('Filtros a enviar:', filtros);

      // Obtener comandas con filtros
      const response = await comandasApi.getComandasApi(filtros);
      
      console.log('Respuesta recibida:', response);
      
      // La API devuelve un objeto {comandas: [], total: n}
      const comandasData = response.comandas || (Array.isArray(response) ? response : []);
      
      console.log('Comandas procesadas:', comandasData.length);

      setComandas(comandasData);

      // Calcular estadísticas
      const estadisticas = {
        total: comandasData.length,
        abiertas: comandasData.filter(c => c.estatus === 'abierta').length,
        cerradas: comandasData.filter(c => c.estatus === 'cerrada').length,
        canceladas: comandasData.filter(c => c.estatus === 'cancelada').length
      };

      setStats(estadisticas);
    } catch (err) {
      console.error('Error al cargar comandas:', err);
      setError(err.response?.data?.message || 'Error al cargar comandas');
      setComandas([]); // Asegurar que comandas sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  /* ACTUALIZAR ESTATUS DE COMANDA */
  const actualizarEstatus = async (id, nuevoEstatus) => {
    try {
      await comandasApi.updateComandaEstatusApi(id, nuevoEstatus);
      await cargarComandas(fecha, estatus); // Recargar con filtros actuales
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar estatus:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al actualizar estatus'
      };
    }
  };

  /* CERRAR COMANDA */
  const cerrarComanda = async (id) => {
    try {
      await comandasApi.cerrarComandaApi(id);
      await cargarComandas(fecha, estatus); // Recargar con filtros actuales
      return { success: true };
    } catch (err) {
      console.error('Error al cerrar comanda:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al cerrar comanda'
      };
    }
  };

  /* CARGAR AL MONTAR */
  useEffect(() => {
    if (user) {
      cargarComandas(fecha, estatus);
    }
  }, [user, fecha, estatus]);

  /* FUNCIÓN RECARGAR QUE USA LOS FILTROS ACTUALES */
  const recargar = () => {
    cargarComandas(fecha, estatus);
  };

  return {
    comandas,
    loading,
    error,
    stats,
    actualizarEstatus,
    cerrarComanda,
    recargar
  };
};

