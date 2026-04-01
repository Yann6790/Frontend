import { apiClient } from '../lib/api';

/**
 * Service pour les actions administratives.
 */
export const adminService = {
  
  /**
   * Récupérer les étudiants en attente de validation.
   * GET /api/users/pending-validation
   */
  async getPendingStudents() {
    const res = await apiClient('/api/users/pending-validation', {
      method: 'GET'
    });
    return res.data || res;
  },

  /**
   * Valider un étudiant.
   * POST /api/users/:studentId/validate
   */
  async validateStudent(studentId) {
    const res = await apiClient(`/api/users/${studentId}/validate`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    return res.data || res;
  },

  /**
   * Refuser un étudiant (le supprimer de la file d'attente).
   * POST /api/users/:studentId/unvalidate
   */
  async unvalidateStudent(studentId) {
    const res = await apiClient(`/api/users/${studentId}/unvalidate`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    return res.data || res;
  },

  /**
   * Mettre à jour les informations d'un étudiant.
   * POST /api/users/:studentId/update
   * 
   * @param {string} studentId - ID de l'étudiant
   * @param {Object} data - { firstname, lastname, promotionId, groupId }
   */
  async updateStudent(studentId, data) {
    const res = await apiClient(`/api/users/${studentId}/update`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data || res;
  },

  /**
   * Modifier la visibilité de TOUTES les soumissions d'une promotion (Endpoint 34)
   * PATCH /api/promotions/:promotionId/submissions/visibility
   * ROLE: ADMIN
   */
  async updatePromotionSubmissionsVisibility(promotionId, isPublic) {
    const res = await apiClient(`/api/promotions/${promotionId}/submissions/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic })
    });
    return res.data || res;
  }
};
