import api from './api';

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  stockIn: (id, data) => api.post(`/products/${id}/stock-in`, data),
  stockOut: (id, data) => api.post(`/products/${id}/stock-out`, data),
  getStockMovements: (id, params) => api.get(`/products/${id}/stock-movements`, { params }),
  getAllStockMovements: (params) => api.get('/products/stock-movements', { params }),
};
