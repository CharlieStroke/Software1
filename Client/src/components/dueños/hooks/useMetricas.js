import { useState, useEffect } from 'react';
import {
  getMetricasGeneralesApi,
  getVentasPorDiaApi,
  getMetodosPagoStatsApi,
  getProductosMasVendidosApi,
  getVentasPorCategoriaApi,
  getRendimientoMeserosApi
} from '../../../api/metricasApi';

export const useMetricas = (sucursalId = null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para cada tipo de métrica
  const [metricasGenerales, setMetricasGenerales] = useState(null);
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
  const [rendimientoMeseros, setRendimientoMeseros] = useState([]);

  // Cargar todas las métricas
  const cargarMetricas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ejecutar todas las peticiones en paralelo
      const [
        generales,
        ventas,
        metodos,
        productos,
        categorias,
        meseros
      ] = await Promise.all([
        getMetricasGeneralesApi(sucursalId),
        getVentasPorDiaApi(sucursalId),
        getMetodosPagoStatsApi(sucursalId),
        getProductosMasVendidosApi(sucursalId, 10),
        getVentasPorCategoriaApi(sucursalId),
        getRendimientoMeserosApi(sucursalId)
      ]);

      setMetricasGenerales(generales);
      setVentasPorDia(ventas);
      setMetodosPago(metodos);
      setProductosVendidos(productos);
      setVentasPorCategoria(categorias);
      setRendimientoMeseros(meseros);

    } catch (err) {
      console.error('Error al cargar métricas:', err);
      setError(err.response?.data?.message || 'Error al cargar las métricas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar métricas al montar el componente o cambiar sucursal
  useEffect(() => {
    cargarMetricas();
  }, [sucursalId]);

  // Función para recargar manualmente
  const recargar = () => {
    cargarMetricas();
  };

  return {
    loading,
    error,
    metricasGenerales,
    ventasPorDia,
    metodosPago,
    productosVendidos,
    ventasPorCategoria,
    rendimientoMeseros,
    recargar
  };
};
