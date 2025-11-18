import api from './axiosConfig';

// Pedidos
export const getPedidos = async () => {
  const response = await api.get('/pedidos');
  return response.data;
};

export const getPedidosBySucursal = async (sucursalId) => {
  const response = await api.get(`/pedidos/sucursal/${sucursalId}`);
  return response.data;
};

export const getPedidosHoy = async () => {
  const response = await api.get('/pedidos/hoy');
  return response.data;
};

export const getComandas = async () => {
  const response = await api.get('/comandas');
  return response.data;
};

export const getPedidoById = async (id) => {
  const response = await api.get(`/pedidos/${id}`);
  return response.data;
};

export const createPedido = async (data) => {
  const response = await api.post('/pedidos', data);
  return response.data;
};

export const updateEstadoPedido = async (id, estado) => {
  const response = await api.patch(`/pedidos/${id}/estado`, { estado });
  return response.data;
};

export const cancelarPedido = async (id, motivo) => {
  const response = await api.post(`/pedidos/${id}/cancelar`, { motivo });
  return response.data;
};

export const getEstadisticasPedidos = async (params) => {
  const response = await api.get('/pedidos/estadisticas', { params });
  return response.data;
};
