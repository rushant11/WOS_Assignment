import axios, { AxiosError, AxiosResponse } from 'axios';

const BASE_URL = 'https://rickandmortyapi.com/api';
const TIMEOUT_MS = 10_000;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return Promise.reject(new Error('Resource not found'));
      }
      if (status >= 500) {
        return Promise.reject(new Error('Server error. Please try again later.'));
      }
    } else if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Check your connection.'));
    } else if (!error.response) {
      return Promise.reject(new Error('Network error. You may be offline.'));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
