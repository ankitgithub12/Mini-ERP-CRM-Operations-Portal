import api from './api';

export const challanService = {
  getAll: (params) => api.get('/challans', { params }),
  getById: (id) => api.get(`/challans/${id}`),
  create: (data) => api.post('/challans', data),
  update: (id, data) => api.put(`/challans/${id}`, data),
  confirm: (id) => api.post(`/challans/${id}/confirm`),
  cancel: (id) => api.post(`/challans/${id}/cancel`),
};
