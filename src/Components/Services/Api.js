import axios from 'axios';

const API = axios.create({
  baseURL: 'api-safehome-production.up.railway.app/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safehome_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = async ({ email, password }) => {
  const response = await API.post('/auth/login', { email, password });
  
  if (response.data && response.data.token) {
    localStorage.setItem('safehome_token', response.data.token);
  }
  
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await API.get('/users/me');
  return response.data;
};

export const saveFcmToken = async (fcmToken) => {
  const response = await API.patch('/users/fcm-token', { fcm_token: fcmToken });
  return response.data;
};

export const getHealthLogs = async (userId) => {
  const response = await API.get(`/health/logs/${userId}`);
  return response.data;
};

export const sendHealthTelemetry = async (telemetryData) => {
  const response = await API.post('/health/telemetry', telemetryData);
  return response.data;
};

export const getContacts = async () => {
  const response = await API.get('/contatos');
  return response.data;
};

export const createContact = async (contactData) => {
  const response = await API.post('/contatos', contactData);
  return response.data;
};

// No seu Services/Api.js, altere a função para:
export const getAgendaOcorrencias = async (userId) => {
  // Ajustamos a rota para seguir o padrão que vimos no seu agendaRouter.js:
  // agendaRouter.get('/ocorrencias/paciente/:id_paciente', ...)
  const response = await API.get(`/agenda/ocorrencias/paciente/${userId}`);
  return response.data;
};

export const createAgendaTemplate = async (templateData) => {
  const response = await API.post('/agenda/template', templateData);
  return response.data;
};

// Substitua APENAS esta função no seu Api.js:

export const updateAgendaOccurrenceStatus = async (id, statusAtual) => {
  const response = await API.patch(`/agenda/ocorrencias/${id}/status`, {
    status_concluido: statusAtual !== 'CONCLUIDA', // inverte o status atual
  });
  return response.data;
};
 
export const deleteAgendaTemplate = async (idEvento) => {
  const response = await API.delete(`/agenda/template/${idEvento}`);
  return response.data;
};

export const getAgendaOcorrenciasPorData = async (userId, data) => {
  const response = await API.get(`/agenda/ocorrencias/paciente/${userId}/data/${data}`);
  return response.data;
};


export const deleteContact = (idContato) =>
  API.delete(`/contatos/${idContato}`).then(r => r.data);

// Histórico de pânico do usuário
export const getPanicLogs = async (userId) => {
  const response = await API.get(`/panic/logs/${userId}`);
  return response.data;
};
 
// Acionar pânico com coordenadas opcionais
export const triggerPanic = async (latitude, longitude) => {
  const response = await API.post('/panic/trigger', { latitude, longitude, origem: 'MANUAL' });
  return response.data;
};

export default API;