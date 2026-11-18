import axios from 'axios';

const RAW_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const apiBaseUrl = RAW_BASE_URL.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
});

export default api;
export * from './types';