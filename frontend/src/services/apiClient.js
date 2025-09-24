import axios from 'axios';

const getApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl && envBaseUrl.trim().length > 0) {
    return envBaseUrl;
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }

  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }

  return '';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

export default apiClient;
