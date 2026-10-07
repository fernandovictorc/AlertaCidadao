// api.js - Concentra todas as chamadas Fetch API para o backend

const API_BASE_URL = '/api';

/**
 * Função utilitária genérica para fazer requisições à API
 * @param {string} endpoint - O caminho da rota (ex: '/denuncias')
 * @param {string} method - Método HTTP (GET, POST, etc.)
 * @param {object} data - Corpo da requisição (opcional)
 */
async function fetchAPI(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Tratamento de sessão expirada/não autorizada
    if (response.status === 401 || response.status === 403) {
      console.warn('Acesso não autorizado. Redirecionando para login...');
      // Lógica de logout ou redirecionamento pode ser acionada aqui
    }

    if (!response.ok) {
      let errorData = {};
      try {
          errorData = await response.json();
      } catch (err) {
          console.error('Falha ao fazer parse do erro como JSON', err);
      }
      throw new Error((errorData.message || `Erro HTTP: ${response.status}`) + ` na rota ${API_BASE_URL}${endpoint}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição API:', error);
    throw error;
  }
}

// Exemplo de chamadas específicas que serão implementadas:
// export const getDenuncias = () => fetchAPI('/denuncias');
// export const postDenuncia = (dados) => fetchAPI('/denuncias', 'POST', dados);

// Integração Completa - Chamadas à API

export const registerUser = (dados) => fetchAPI('/users/register', 'POST', dados);
export const loginUser = (dados) => fetchAPI('/users/login', 'POST', dados);
export const getUserProfile = () => fetchAPI('/users/profile');
export const updateUserProfile = (dados) => fetchAPI('/users/profile', 'PUT', dados);

export const getDenuncias = () => fetchAPI('/denuncias');
export const getMyDenuncias = () => fetchAPI('/denuncias/minhas');
export const getDenunciaById = (id) => fetchAPI(`/denuncias/${id}`);
export const postDenuncia = (dados) => fetchAPI('/denuncias', 'POST', dados);
export const updateDenuncia = (id, dados) => fetchAPI(`/denuncias/${id}`, 'PATCH', dados);
export const deleteDenuncia = (id) => fetchAPI(`/denuncias/${id}`, 'DELETE');
export const toggleApoio = (id) => fetchAPI(`/denuncias/${id}/apoio`, 'POST');

export const getComentarios = (idDenuncia) => fetchAPI(`/denuncias/${idDenuncia}/comentarios`);
export const postComentario = (idDenuncia, dados) => fetchAPI(`/denuncias/${idDenuncia}/comentarios`, 'POST', dados);
export const deleteComentario = (idDenuncia, id) => fetchAPI(`/denuncias/${idDenuncia}/comentarios/${id}`, 'DELETE');

// Admin
export const getAllDenunciasAdmin = () => fetchAPI('/denuncias/admin/todas');
export const updateDenunciaStatus = (id, dados) => fetchAPI(`/denuncias/${id}/estado`, 'PATCH', dados);
