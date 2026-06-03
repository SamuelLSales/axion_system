// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aldebaran_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// === CONTRATOS ===
export const getContratos = async () => {
  const response = await api.get('/contratos');
  return response.data;
};

export const getContrato = async (id) => {
  const response = await api.get(`/contratos/${id}`);
  return response.data;
};

export const createContrato = async (contratoData) => {
  const response = await api.post('/contratos', contratoData);
  return response.data;
};

export const updateContrato = async (id, contratoData) => {
  const response = await api.put(`/contratos/${id}`, contratoData);
  return response.data;
};

export const deleteContrato = async (id) => {
  const response = await api.delete(`/contratos/${id}`);
  return response.data;
};

// === FASES ===
export const createFase = async (faseData) => {
  const response = await api.post('/fases', faseData);
  return response.data;
};

export const updateFase = async (id, faseData) => {
  const response = await api.put(`/fases/${id}`, faseData);
  return response.data;
};

export const deleteFase = async (id) => {
  const response = await api.delete(`/fases/${id}`);
  return response.data;
};

// === ETAPAS ===
export const createEtapa = async (etapaData) => {
  const response = await api.post('/etapas', etapaData);
  return response.data;
};

export const updateEtapa = async (id, etapaData) => {
  const response = await api.put(`/etapas/${id}`, etapaData);
  return response.data;
};

export const deleteEtapa = async (id) => {
  const response = await api.delete(`/etapas/${id}`);
  return response.data;
};

// === DASHBOARD ===
export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

// === RESPONSÁVEIS ===
export const getResponsaveis = async () => {
  const response = await api.get('/responsaveis');
  return response.data;
};

export const createResponsavel = async (responsavelData) => {
  const response = await api.post('/responsaveis', responsavelData);
  return response.data;
};

export const updateResponsavel = async (id, responsavelData) => {
  const response = await api.put(`/responsaveis/${id}`, responsavelData);
  return response.data;
};

export const deleteResponsavel = async (id) => {
  const response = await api.delete(`/responsaveis/${id}`);
  return response.data;
};

// === AREAS DE ATUACAO ===
export const getAreasAtuacao = async () => {
  const response = await api.get('/areas');
  return response.data;
};

export const createAreaAtuacao = async (areaData) => {
  const response = await api.post('/areas', areaData);
  return response.data;
};

export const deleteAreaAtuacao = async (id) => {
  const response = await api.delete(`/areas/${id}`);
  return response.data;
};

// === EXPORTAR CSV ===
export const exportarCSV = () => {
  // Dispara o download nativo abrindo a rota de exportação no navegador
  const token = localStorage.getItem('aldebaran_token');
  const url = token
    ? `${API_BASE_URL}/exportar/csv?token=${token}`
    : `${API_BASE_URL}/exportar/csv`;
  window.open(url, '_blank');
};

// === AUTENTICAÇÃO ===
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// Função para registrar nova conta/empresa
export const registerUser = async (dados) => {
  const response = await api.post('/auth/register', dados);
  return response.data;
};

export const apiLogout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const activateUser = async (token) => {
  const response = await api.get(`/auth/activate?token=${token}`);
  return response.data;
};

export default api;
