import { apiClient } from '../lib/api';

/**
 * Service pour gérer les ressources publiques (Promotions, Groupes, Upload d'images).
 */
export const resourcesService = {
  
  /**
   * Récupérer les promotions (Rôle: PUBLIC)
   * GET /api/resources/promotions
   */
  async getPromotions() {
    const res = await apiClient('/api/resources/promotions', {
      method: 'GET',
    });
    return res.data || res;
  },

  /**
   * Récupérer les groupes (Rôle: PUBLIC)
   * GET /api/resources/groups
   */
  async getGroups() {
    const res = await apiClient('/api/resources/groups', {
      method: 'GET',
    });
    return res.data || res;
  },

  /**
   * Récupérer l'annuaire des étudiants
   * GET /api/users/students
   * 
   * @returns {Promise<Array>} Liste des étudiants avec promo et groupe
   */
  async getStudents() {
    const res = await apiClient('/api/users/students', {
      method: 'GET',
    });
    return res.data || res;
  },

  /**
   * Uploader une image de profil
   * POST /api/resources/upload-image
   * 
   * @param {File} file - Le fichier image sélectionné
   * @returns {Promise<{ url: string }>} - L'URL de l'image stockée
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient('/api/resources/upload-image', {
      method: 'POST',
      body: formData,
    });
    return res.data || res;
  },

  /**
   * Récupérer tous les utilisateurs
   * GET /api/users
   * 
   * @param {string} [q] - Terme de recherche (nom ou email)
   * @param {string} [role] - Filtrer par rôle ('STUDENT' ou 'TEACHER')
   */
  async getUsers(q = '', role = '') {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (role && role !== 'Tous') {
      params.append('role', role === 'Étudiant' ? 'STUDENT' : role === 'Professeur' ? 'TEACHER' : role);
    }

    const res = await apiClient(`/api/users?${params.toString()}`, {
      method: 'GET',
    });
    return res.data || res;
  },

  /**
   * Supprimer un compte utilisateur (professeur ou étudiant)
   * DELETE /api/users/:userId
   * 
   * @param {string} userId - ID de l'utilisateur
   */
  async deleteUser(userId) {
    const res = await apiClient(`/api/users/${userId}`, {
      method: 'DELETE',
    });
    return res.data || res;
  },

  /**
   * Récupérer les semestres disponibles (pour formulaires SAE)
   * GET /api/resources/semesters
   */
  async getSemesters() {
    const res = await apiClient('/api/resources/semesters', { method: 'GET' });
    return res.data || res;
  },

  /**
   * Récupérer les thématiques disponibles (pour formulaires SAE)
   * GET /api/resources/thematics
   */
  async getThematics() {
    const res = await apiClient('/api/resources/thematics', { method: 'GET' });
    return res.data || res;
  },

  /**
   * Récupérer les bannières disponibles (pour formulaires SAE)
   * GET /api/resources/banners
   */
  async getBanners() {
    const res = await apiClient('/api/resources/banners', { method: 'GET' });
    return res.data || res;
  },

  /**
   * Récupérer la liste des professeurs (pour formulaires d'assignation SAE)
   * GET /api/users?role=TEACHER
   */
  async getTeachers() {
    const res = await apiClient('/api/users?role=TEACHER', { method: 'GET' });
    return res.data || res;
  },
};
