import api from './axiosConfig';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const verify = async () => {
  const response = await api.get('/auth/verify');
  return response.data;
};

export const refresh = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};