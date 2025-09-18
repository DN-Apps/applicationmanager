// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// ⬇️ JWT-Token automatisch anhängen
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Vorhandene API-Funktionen
export const getApplications = () => api.get('/applications');
export const getAppConfig = (appKey) => api.get(`/applications/${appKey}/config`);

export default api;
