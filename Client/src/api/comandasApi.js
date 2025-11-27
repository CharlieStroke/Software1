import axiosInstance from "./axiosConfig";

// Obtener todas las comandas con filtros opcionales
export const getComandasApi = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.estatus) params.append('estatus', filters.estatus);
  if (filters.fecha) params.append('fecha', filters.fecha);
  
  const queryString = params.toString();
  const url = `/comandas${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Obtener comandas abiertas (para asignar a pedidos)
export const getComandasAbiertasApi = async () => {
  const response = await axiosInstance.get('/comandas/abiertas');
  return response.data;
};

// Obtener una comanda por ID con sus pedidos
export const getComandaByIdApi = async (id) => {
  const response = await axiosInstance.get(`/comandas/${id}`);
  return response.data;
};

// Crear nueva comanda
export const createComandaApi = async (comandaData) => {
  const response = await axiosInstance.post('/comandas', comandaData);
  return response.data;
};

// Actualizar estatus de comanda
export const updateComandaEstatusApi = async (id, estatus) => {
  const response = await axiosInstance.put(`/comandas/${id}/estatus`, { estatus });
  return response.data;
};

// Cerrar comanda (atajo para cambiar estatus a 'cerrada')
export const cerrarComandaApi = async (id) => {
  const response = await axiosInstance.put(`/comandas/${id}/cerrar`);
  return response.data;
};

// Eliminar comanda (solo si no tiene pedidos)
export const deleteComandaApi = async (id) => {
  const response = await axiosInstance.delete(`/comandas/${id}`);
  return response.data;
};
