import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const api = axios.create({ baseURL: API_URL });

// Apps & Tabellen
export const getApplications = () => api.get('/api/applications');
export const getTables = (appKey) => api.get(`/api/applications/${appKey}/tables`);

// Rows einer Tabelle
export const getRows = (appKey, table) => api.get(`/api/applications/${appKey}/tables/${table}/rows`);
export const createRow = (appKey, table, data) => api.post(`/api/applications/${appKey}/tables/${table}/rows`, data);
export const updateRow = (appKey, table, id, data) => api.put(`/api/applications/${appKey}/tables/${table}/rows/${id}`, data);
export const deleteRow = (appKey, table, id) => api.delete(`/api/applications/${appKey}/tables/${table}/rows/${id}`);
