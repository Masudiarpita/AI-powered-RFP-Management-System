import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const rfpAPI = {
  create: (data) => api.post('/rfps/create', data),
  getAll: () => api.post('/rfps/getAll', {}),
  getById: (id) => api.post('/rfps/getById', { id }),
  update: (id, data) => api.put('/rfps/update', { id, ...data }),
  delete: (id) => api.put('/rfps/delete', { id }),
  send: (id, vendorIds) => api.post('/rfps/send', { id, vendorIds }),
  getProposals: (id) => api.post('/rfps/getProposals', { id }),
  compare: (id) => api.post('/rfps/compare', { id })
};

export const vendorAPI = {
  create: (data) => api.post('/vendors/create', data),
  getAll: () => api.post('/vendors/getAll', {}),
  getById: (id) => api.post('/vendors/getById', { id }),
  update: (id, data) => api.put('/vendors/update', { id, ...data }),
  delete: (id) => api.put('/vendors/delete', { id })
};

export default api;