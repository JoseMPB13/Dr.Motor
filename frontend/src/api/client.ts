import axios from 'axios';

/**
 * Instancia de Axios configurada para interactuar con el backend de Python (FastAPI).
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Solicitud:
 * Inserta automáticamente el token Bearer si existe en el almacenamiento local.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuesta:
 * Maneja errores comunes como 401 (No autorizado) para limpiar la sesión.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiamos los datos locales para forzar re-autenticación
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      
      // Si estamos en el navegador y no estamos ya en la página de login, redirigir
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
