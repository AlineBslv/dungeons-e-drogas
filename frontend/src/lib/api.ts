/**
 * API Helper - Dungeons e Drogas
 * Centraliza requisições HTTP com autenticação JWT automática
 */

import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Obtém o token JWT do usuário autenticado
 */
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Erro ao obter token:', error);
    throw new Error('Não foi possível obter token de autenticação');
  }
}

/**
 * Faz requisição HTTP com autenticação automática
 */
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Se token expirou, força refresh e tenta novamente
  if (response.status === 401) {
    const user = auth.currentUser;
    if (user) {
      const newToken = await user.getIdToken(true); // Force refresh
      const retryHeaders = {
        ...headers,
        'Authorization': `Bearer ${newToken}`,
      };

      return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
      });
    }
  }

  return response;
}

// ==============================================
// API Methods
// ==============================================

export const api = {
  /**
   * Chat com IA Gemini
   */
  chat: {
    send: async (message: string, campaignId: string) => {
      const response = await fetchWithAuth('/gemini/chat', {
        method: 'POST',
        body: JSON.stringify({ message, campaignId, userId: auth.currentUser?.uid }),
      });
      return response.json();
    },
  },

  /**
   * Fichas de Personagem
   */
  characters: {
    list: async (campaignId?: string) => {
      const query = campaignId ? `?campaign_id=${campaignId}` : '';
      const response = await fetchWithAuth(`/characters${query}`);
      return response.json();
    },

    get: async (id: string) => {
      const response = await fetchWithAuth(`/characters/${id}`);
      return response.json();
    },

    create: async (characterData: any) => {
      const response = await fetchWithAuth('/characters', {
        method: 'POST',
        body: JSON.stringify(characterData),
      });
      return response.json();
    },

    update: async (id: string, updates: any) => {
      const response = await fetchWithAuth(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetchWithAuth(`/characters/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },

    updateHP: async (id: string, current: number, temporary: number = 0) => {
      const response = await fetchWithAuth(`/characters/${id}/hp`, {
        method: 'PATCH',
        body: JSON.stringify({ current, temporary }),
      });
      return response.json();
    },

    addItem: async (id: string, item: any) => {
      const response = await fetchWithAuth(`/characters/${id}/inventory`, {
        method: 'POST',
        body: JSON.stringify(item),
      });
      return response.json();
    },

    linkCampaign: async (id: string, campaignId: string) => {
      const response = await fetchWithAuth(`/characters/${id}/link-campaign`, {
        method: 'PATCH',
        body: JSON.stringify({ campaign_id: campaignId }),
      });
      return response.json();
    },
  },

  /**
   * Upload de PDFs
   */
  upload: {
    pdf: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return response.json();
    },
  },

  /**
   * Busca Semântica
   */
  search: {
    semantic: async (query: string) => {
      const response = await fetchWithAuth('/search/semantic', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      return response.json();
    },
  },

  /**
   * Processamento de PDFs
   */
  gemini: {
    processPdf: async (filename: string) => {
      const response = await fetchWithAuth('/gemini/process-pdf', {
        method: 'POST',
        body: JSON.stringify({ filename }),
      });
      return response.json();
    },

    embed: async (text: string, docId: string) => {
      const response = await fetchWithAuth('/gemini/embed', {
        method: 'POST',
        body: JSON.stringify({ text, docId }),
      });
      return response.json();
    },
  },
};

export default api;
