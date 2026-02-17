import axiosInstance from "./axiosConfig";

// Registrar un pago
export const registrarPagoApi = async (pagoData) => {
  const response = await axiosInstance.post('/pagos', pagoData);
  return response.data;
};

// Obtener pagos de una comanda
export const getPagosByComandaApi = async (comanda_id) => {
  const response = await axiosInstance.get(`/pagos/comanda/${comanda_id}`);
  return response.data;
};

// Obtener todos los pagos con filtros
export const getPagosApi = async (filtros = {}) => {
  const params = new URLSearchParams();
  
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
  if (filtros.metodo_pago) params.append('metodo_pago', filtros.metodo_pago);
  if (filtros.sucursal_id) params.append('sucursal_id', filtros.sucursal_id);
  
  const queryString = params.toString();
  const url = `/pagos${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Obtener un pago por ID
export const getPagoByIdApi = async (id) => {
  const response = await axiosInstance.get(`/pagos/${id}`);
  return response.data;
};

// Cancelar un pago
export const cancelarPagoApi = async (id, motivo) => {
  const response = await axiosInstance.delete(`/pagos/${id}`, {
    data: { motivo }
  });
  return response.data;
};
