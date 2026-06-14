import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  withCredentials: true,
});

let accessToken = '';

export function setAccessToken(token: string) {
  accessToken = token;
}

api.interceptors.request.use(config => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        accessToken = data.accessToken;
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        accessToken = '';
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
