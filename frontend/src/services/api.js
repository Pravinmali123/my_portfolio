import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosPrivate = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosPrivate.interceptors.request.use((config) => {
  const stored = sessionStorage.getItem('portfolio_auth');
  const token = stored ? JSON.parse(stored)?.token : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever rejects our token as invalid/expired (e.g. it was
// issued before JWT_SECRET got rotated, or the session simply expired),
// every protected request from here on fails with a generic-looking 401 —
// e.g. Settings/About save just shows a vague "save na thai shaki" toast,
// with no clue that the real fix is "log in again". Catch that here once,
// centrally: clear the stale session and hard-redirect to /admin/login so
// the person gets a clear "please sign in again" moment instead of
// repeatedly hitting confusing save failures.
axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/admin/login') {
      sessionStorage.removeItem('portfolio_auth');
      window.location.href = '/admin/login?sessionExpired=1';
    }
    return Promise.reject(error);
  }
);

// Builds a full URL for a file/image served from the backend's /uploads folder.
// Handles both '/uploads/...' relative paths and full 'http(s)://...' values,
// and avoids accidental double slashes when joining with the API base URL.
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const base = apiUrl.replace(/\/$/, '');
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${base}${cleanPath}`;
};

// Builds the URL for the dedicated resume download endpoint. The backend
// sets a Content-Disposition: attachment header on this route, which is
// what actually forces a PDF download instead of opening it in a new tab.
export const getResumeDownloadUrl = () => {
  const base = apiUrl.replace(/\/$/, '');
  return `${base}/api/resume/primary/download`;
};

export default api;