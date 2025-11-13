import api from './axiosConfig';

// Obtener todas las sucursales
export const getSucursales = async () => {
  const response = await api.get('/sucursales');
  return response.data;
};

// Obtener solo sucursales activas
export const getSucursalesActivas = async () => {
  const response = await api.get('/sucursales/activas');
  return response.data;
};

// Obtener sucursal por ID
export const getSucursalById = async (id) => {
  const response = await api.get(`/sucursales/${id}`);
  return response.data;
};

// Obtener estadísticas de una sucursal
export const getSucursalStats = async (id) => {
  const response = await api.get(`/sucursales/${id}/stats`);
  return response.data;
};

// Crear nueva sucursal
export const createSucursal = async (data) => {
  const response = await api.post('/sucursales', data);
  return response.data;
};

// Actualizar sucursal
export const updateSucursal = async (id, data) => {
  const response = await api.put(`/sucursales/${id}`, data);
  return response.data;
};

// Activar/Desactivar sucursal
export const toggleSucursalStatus = async (id) => {
  const response = await api.patch(`/sucursales/${id}/toggle`);
  return response.data;
};

// Eliminar sucursal
export const deleteSucursal = async (id) => {
  const response = await api.delete(`/sucursales/${id}`);
  return response.data;
};
