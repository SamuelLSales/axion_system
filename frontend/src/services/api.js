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

// Interceptor de resposta para tratamento global de erros (ex: Inadimplência ou Token Expirado)
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 403 && error.response?.data?.detail?.includes('faturas em atraso')) {
    // Redireciona para a página de escolha de plano/onboarding se estiver suspenso
    window.location.href = '/escolher-plano';
  }
  if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
    localStorage.removeItem('aldebaran_token');
    window.location.href = '/login';
  }
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

export const getHistoricoAlteracoes = async (contratoId) => {
  const response = await api.get(`/contratos/${contratoId}/historico`);
  return response.data;
};

// === EMPRESA / CONFIGURAÇÕES ===
export const getEmpresaConfig = async () => {
  const response = await api.get('/empresa/config');
  return response.data;
};

export const updateEmpresaConfig = async (configData) => {
  const response = await api.put('/empresa/config', configData);
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

// === DESPESAS ===
export const getDespesas = async (contratoId = null) => {
  let url = '/despesas';
  const params = [];
  if (contratoId) params.push(`contrato_id=${contratoId}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const createDespesa = async (despesaData) => {
  const response = await api.post('/despesas', despesaData);
  return response.data;
};

export const updateDespesa = async (id, despesaData) => {
  const response = await api.put(`/despesas/${id}`, despesaData);
  return response.data;
};

export const deleteDespesa = async (id) => {
  const response = await api.delete(`/despesas/${id}`);
  return response.data;
};

// === DASHBOARD ===
export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getDashboardFinanceiro = async (contratoId, areaId, ano) => {
  let url = '/dashboard/financeiro';
  const params = [];
  if (contratoId) params.push(`contrato_id=${contratoId}`);
  if (areaId) params.push(`area_id=${areaId}`);
  if (ano) params.push(`ano=${ano}`);
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  const response = await api.get(url);
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
export const exportarCSV = (contratoId = null) => {
  // Dispara o download nativo abrindo a rota de exportação no navegador
  const token = localStorage.getItem('aldebaran_token');
  let url = `${API_BASE_URL}/exportar/csv?`;
  if (token) url += `token=${token}&`;
  if (contratoId) url += `contrato_id=${contratoId}`;
  window.open(url, '_blank');
};

// === AUTENTICAÇÃO ===
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// Função para registrar nova conta/empresa
export const registerUser = async (dados) => {
  const response = await api.post('/auth/signup', dados);
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

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.post('/auth/change-password', passwordData);
  return response.data;
};

export const getCompanyDetails = async () => {
  const response = await api.get('/auth/company');
  return response.data;
};

export const updateCompanyDetails = async (companyData) => {
  const response = await api.put('/auth/company', companyData);
  return response.data;
};

// === ASSINATURAS (ASAAS) ===
export const obterStatusAssinatura = async () => {
  const response = await api.get('/assinaturas/status');
  return response.data;
};

export const criarCheckoutAsaas = async (plano) => {
  const response = await api.post(`/assinaturas/checkout?plano=${plano}`);
  return response.data;
};

export default api;
