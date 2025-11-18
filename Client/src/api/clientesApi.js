import api from './axiosConfig';

// Clientes
export const getClientes = async () => {
  const response = await api.get('/clientes');
  return response.data;
};

export const getClienteById = async (id) => {
  const response = await api.get(`/clientes/${id}`);
  return response.data;
};

export const getClientesBySucursal = async (sucursalId) => {
  const response = await api.get(`/clientes/sucursal/${sucursalId}`);
  return response.data;
};

export const searchClientes = async (query) => {
  const response = await api.get('/clientes/search', { params: { q: query } });
  return response.data;
};

export const createCliente = async (data) => {
  const response = await api.post('/clientes', data);
  return response.data;
};

export const updateCliente = async (id, data) => {
  const response = await api.put(`/clientes/${id}`, data);
  return response.data;
};

export const deleteCliente = async (id) => {
  const response = await api.delete(`/clientes/${id}`);
  return response.data;
};
