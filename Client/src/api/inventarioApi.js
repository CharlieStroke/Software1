import api from './axiosConfig';

// Inventario
export const getInventario = async () => {
  const response = await api.get('/inventario');
  return response.data;
};

export const getInventarioBySucursal = async (sucursalId) => {
  const response = await api.get(`/inventario/sucursal/${sucursalId}`);
  return response.data;
};

export const getInventarioBajo = async () => {
  const response = await api.get('/inventario/bajo');
  return response.data;
};

export const getProductoById = async (id) => {
  const response = await api.get(`/inventario/${id}`);
  return response.data;
};

export const createProducto = async (data) => {
  const response = await api.post('/inventario', data);
  return response.data;
};

export const updateProducto = async (id, data) => {
  const response = await api.put(`/inventario/${id}`, data);
  return response.data;
};

export const ajustarStock = async (id, data) => {
  const response = await api.post(`/inventario/${id}/ajustar`, data);
  return response.data;
};

export const toggleProductoStatus = async (id) => {
  const response = await api.patch(`/inventario/${id}/toggle`);
  return response.data;
};

export const deleteProducto = async (id) => {
  const response = await api.delete(`/inventario/${id}`);
  return response.data;
};
