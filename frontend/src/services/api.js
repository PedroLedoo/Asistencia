import axios from 'axios';
import toast from 'react-hot-toast';

// Configuración base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    } else if (response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
    } else if (response?.status === 404) {
      toast.error('Recurso no encontrado.');
    } else if (response?.status >= 500) {
      toast.error('Error del servidor. Intenta nuevamente más tarde.');
    } else if (response?.data?.error) {
      toast.error(response.data.error);
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      toast.error('Ha ocurrido un error inesperado.');
    }
    
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  }
};

// Servicios de cursos
export const courseService = {
  getAll: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  
  create: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },
  
  update: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
  
  getStats: async (id) => {
    const response = await api.get(`/courses/${id}/stats`);
    return response.data;
  }
};

// Servicios de estudiantes
export const studentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  
  create: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },
  
  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
  
  getStats: async (id) => {
    const response = await api.get(`/students/${id}/stats`);
    return response.data;
  }
};

// Servicios de inscripciones
export const enrollmentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/enrollments', { params });
    return response.data;
  },
  
  create: async (enrollmentData) => {
    const response = await api.post('/enrollments', enrollmentData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
  },
  
  bulkEnroll: async (data) => {
    const response = await api.post('/enrollments/bulk', data);
    return response.data;
  },
  
  getAvailableStudents: async (courseId, params = {}) => {
    const response = await api.get(`/enrollments/available/${courseId}`, { params });
    return response.data;
  }
};

// Servicios de asistencias
export const attendanceService = {
  getAll: async (params = {}) => {
    const response = await api.get('/attendances', { params });
    return response.data;
  },
  
  create: async (attendanceData) => {
    const response = await api.post('/attendances', attendanceData);
    return response.data;
  },
  
  createBulk: async (attendanceData) => {
    const response = await api.post('/attendances/bulk', attendanceData);
    return response.data;
  },
  
  update: async (id, attendanceData) => {
    const response = await api.put(`/attendances/${id}`, attendanceData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/attendances/${id}`);
    return response.data;
  },
  
  getByStudent: async (studentId, params = {}) => {
    const response = await api.get(`/attendances/student/${studentId}`, { params });
    return response.data;
  },
  
  export: async (params = {}) => {
    const response = await api.get('/attendances/export', { 
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    });
    return response.data;
  },
  
  getSummary: async (params = {}) => {
    const response = await api.get('/attendances/summary', { params });
    return response.data;
  }
};

// Función helper para descargar archivos
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Función helper para formatear fechas
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Función helper para formatear fecha y hora
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default api;
