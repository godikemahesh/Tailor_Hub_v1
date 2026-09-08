/**
 * TailorHub – API Client Service
 * Axios wrapper with JWT authentication interceptors.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request Interceptor: Attach JWT ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tailorhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Handle 401 ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tailorhub_token');
      localStorage.removeItem('tailorhub_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

// ── Measurement Profiles API ──
export const measurementsAPI = {
  list: () => api.get('/api/measurements/'),
  create: (data) => api.post('/api/measurements/', data),
  get: (id) => api.get(`/api/measurements/${id}`),
  update: (id, data) => api.put(`/api/measurements/${id}`, data),
  delete: (id) => api.delete(`/api/measurements/${id}`),
  listByCustomer: (customerId) => api.get(`/api/measurements/customer/${customerId}`),
};

// ── Orders API ──
export const ordersAPI = {
  list: (status) => api.get('/api/orders/', { params: status ? { status } : {} }),
  create: (data) => api.post('/api/orders/', data),
  get: (id) => api.get(`/api/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
  getStats: () => api.get('/api/orders/stats/summary'),
  triggerCall: (id, data) => api.post(`/api/orders/${id}/trigger-call`, data || {}),
  directCall: (data) => api.post('/api/orders/direct-call', data || {}),
};

// ── Shops API ──
export const shopsAPI = {
  create: (data) => api.post('/api/shops/', data),
  getMyShop: () => api.get('/api/shops/me'),
  updateMyShop: (data) => api.put('/api/shops/me', data),
};

// ── Tailor Records API (Voice AI, Dynamic Manual, Groq Multimodal OCR) ──
export const recordsAPI = {
  list: () => api.get('/api/records/'),
  create: (data) => api.post('/api/records/', data),
  get: (id) => api.get(`/api/records/${id}`),
  update: (id, data) => api.put(`/api/records/${id}`, data),
  delete: (id) => api.delete(`/api/records/${id}`),
  parseVoice: (data) => api.post('/api/records/parse-voice', data),
  scanOCR: (data) => api.post('/api/records/scan-ocr', data),
};

export default api;

