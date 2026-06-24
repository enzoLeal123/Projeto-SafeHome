// src/services/api.js
import axios from 'axios';

// ============================================================================
// Parte 1 — Configuração
// ============================================================================
export const API_BASE_URL = 'http://localhost:3000/v1';

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safehome_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// Parte 2 — Funções auxiliares 
// ============================================================================
export const setApiToken = (token) => {
  localStorage.setItem('safehome_token', token);
};

export const getApiToken = () => {
  return localStorage.getItem('safehome_token');
};

export const saveCurrentUser = (user) => {
  localStorage.setItem('safehome_user', JSON.stringify(user));
};

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

const handleRequestError = (erro) => {
  throw new Error(erro.response?.data?.message || 'Erro de conexão com o servidor');
};

// ============================================================================
// Parte 3 — Funções de requisição (Endpoints)
// ============================================================================

export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiInstance.post('/auth/login', { email, password });
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const registerUser = async ({ email, senha, nome, sobrenome }) => {
  try {
    const response = await apiInstance.post('/auth/register', {
      email, password: senha, name: nome, lastName: sobrenome,
    });
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const getUserProfile = async () => {
  try {
    const response = await apiInstance.get('/users/me');
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const saveFcmToken = async (token) => {
  try {
    const response = await apiInstance.patch('/users/fcm-token', { fcm_token: token });
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const triggerPanic = async (data) => {
  try {
    const response = await apiInstance.post('/panic/trigger', data);
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const getPanicLogs = async (userId) => {
  try {
    const response = await apiInstance.get(`/panic/logs/${userId}`);
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const getHealthLogs = async (userId) => {
  try {
    const response = await apiInstance.get(`/health/logs/${userId}`);
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const updateAgendaOccurrenceStatus = async (id, isConcluido) => {
  try {
    const response = await apiInstance.patch(`/agenda/ocorrencias/${id}/status`, { 
      status_concluido: isConcluido 
    });
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const getContacts = async () => {
  try {
    const response = await apiInstance.get('/users/contacts');
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const createContact = async ({ idContato, whatsappNumero, nivelPermissao }) => {
  try {
    const response = await apiInstance.post('/users/contact', {
      id_contato: idContato,
      whatsapp_numero: whatsappNumero,
      nivel_permissao: nivelPermissao,
    });
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const sendHealthTelemetry = async ({ type, value, isEmergency = false }) => {
  try {
    const response = await apiInstance.post('/health/telemetry', {
      type,
      value: Number(value),
      isEmergency,
    });
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const createAgendaTemplate = async ({ idPaciente, titulo, descricao, dataHora, dataInicio, dataFim, tipo }) => {
  try {
    const response = await apiInstance.post('/agenda/template', {
      id_paciente: idPaciente,
      titulo,
      descricao: descricao || '',
      data_hora: dataHora,
      data_inicio: dataInicio,
      data_fim: dataFim,
      tipo,
    });
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};

export const getAgendaOcorrencias = async (userId) => {
  try {
    const response = await apiInstance.get(`/agenda/ocorrencias/${userId}`);
    return response.data;
  } catch (erro) { handleRequestError(erro); }
};