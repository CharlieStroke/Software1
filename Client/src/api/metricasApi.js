import axios from './axiosConfig';

// Obtener métricas generales
export const getMetricasGeneralesApi = async (sucursalId = null) => {
  const params = sucursalId ? { sucursal_id: sucursalId } : {};
  const response = await axios.get('/metricas/generales', { params });
  return response.data;
};

// Obtener ventas por día (últimos 30 días)
export const getVentasPorDiaApi = async (sucursalId = null) => {
  const params = sucursalId ? { sucursal_id: sucursalId } : {};
  const response = await axios.get('/metricas/ventas-dia', { params });
  return response.data;
};

// Obtener estadísticas de métodos de pago
export const getMetodosPagoStatsApi = async (sucursalId = null) => {
  const params = sucursalId ? { sucursal_id: sucursalId } : {};
  const response = await axios.get('/metricas/metodos-pago', { params });
  return response.data;
};

// Obtener productos más vendidos
export const getProductosMasVendidosApi = async (sucursalId = null, limit = 10) => {
  const params = { limit };
  if (sucursalId) params.sucursal_id = sucursalId;
  const response = await axios.get('/metricas/productos-vendidos', { params });
  return response.data;
};

// Obtener ventas por categoría
export const getVentasPorCategoriaApi = async (sucursalId = null) => {
  const params = sucursalId ? { sucursal_id: sucursalId } : {};
  const response = await axios.get('/metricas/ventas-categoria', { params });
  return response.data;
};

// Obtener rendimiento de meseros
export const getRendimientoMeserosApi = async (sucursalId = null) => {
  const params = sucursalId ? { sucursal_id: sucursalId } : {};
  const response = await axios.get('/metricas/rendimiento-meseros', { params });
  return response.data;
};
