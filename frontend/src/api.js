// src/api.js
import axios from "axios";
import { API_BASE_URL } from "./config";

// Zentrale Axios-Instanz: /api hängt an der baseURL
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Apps & Tabellen
export const getApplications = () => api.get("/applications");
export const getTables = (appKey) => api.get(`/applications/${appKey}/tables`);

// Rows einer Tabelle
export const getRows = (appKey, table) => api.get(`/applications/${appKey}/tables/${table}/rows`);
export const createRow = (appKey, table, data) =>
  api.post(`/applications/${appKey}/tables/${table}/rows`, data);
export const updateRow = (appKey, table, id, data) =>
  api.put(`/applications/${appKey}/tables/${table}/rows/${id}`, data);
export const deleteRow = (appKey, table, id) =>
  api.delete(`/applications/${appKey}/tables/${table}/rows/${id}`);
