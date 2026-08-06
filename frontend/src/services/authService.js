import { api, axiosPrivate } from './api';

export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const verifyToken = async () => {
  const response = await axiosPrivate.get('/api/auth/verify');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosPrivate.get('/api/auth/me');
  return response.data;
};

export const changePassword = async (payload) => {
  const response = await axiosPrivate.post('/api/auth/change-password', payload);
  return response.data;
};
