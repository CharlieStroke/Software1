import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: agrega Authorization si hay token en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: si recibe 401, limpiar auth y dejar que el componente maneje la redirección
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Solo limpiar token, no redirigir aquí para evitar conflictos con useNavigate
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
