// En dev, on utilise '' (chemin relatif) pour passer par le proxy Vite.
// En production, on peut définir VITE_API_URL pour pointer vers le vrai backend.
const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Client API centralisé utilisant Fetch.
 * Gère automatiquement l'envoi des cookies de session (credentials: 'include').
 */
export const apiClient = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = { ...options.headers };
  
  // N'ajouter application/json par défaut QUE si ce n'est pas un FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const finalOptions = { 
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, finalOptions);
    
    // Tentative de récupération d'un message d'erreur clair du backend
    if (!response.ok) {
      let errorMessage = 'Erreur serveur';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Fallback
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};
