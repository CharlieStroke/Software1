import api from './axiosConfig';

// Movimientos de inventario
export const getMovimientos = async (params) => {
  const response = await api.get('/movimientos', { params });
  return response.data;
};

export const getMovimientosByProducto = async (productoId) => {
  const response = await api.get(`/movimientos/producto/${productoId}`);
  return response.data;
};
