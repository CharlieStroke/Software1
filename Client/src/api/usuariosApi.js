import api from './axiosConfig';

// Usuarios
export const getUsers = async () => {
  const response = await api.get('/usuarios');
  return response.data;
};

export const getUsersActivos = async () => {
  const response = await api.get('/usuarios/activos');
  return response.data;
};

export const getUsersBySucursal = async (sucursalId) => {
  const response = await api.get(`/usuarios/sucursal/${sucursalId}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/usuarios', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/usuarios/${id}`, data);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/usuarios/${id}/toggle`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};
