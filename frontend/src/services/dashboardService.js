import api from './api';

export const dashboardService = {
  getData: () => api.get('/dashboard'),
};

export const userService = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
};
