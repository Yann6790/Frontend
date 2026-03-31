import { apiClient } from '../lib/api';

export const saeService = {

  // ─────────────────────────────────────────────────────────────
  // Module SAE — CRUD
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes */
  async getSaeList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/saes?${queryString}` : '/api/saes';
    const res = await apiClient(url, { method: 'GET' });
    return res.data || res;
  },

  /** GET /api/saes/archives */
  async getArchives(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/saes/archives?${queryString}` : '/api/saes/archives';
    const res = await apiClient(url, { method: 'GET' });
    return res.data || res;
  },

  /** GET /api/saes/:id */
  async getSaeById(id) {
    const res = await apiClient(`/api/saes/${id}`, { method: 'GET' });
    return res.data || res;
  },

  /** POST /api/saes (ADMIN) */
  async createSae(data) {
    const res = await apiClient('/api/saes', { method: 'POST', body: JSON.stringify(data) });
    return res.data || res;
  },

  /** PATCH /api/saes/:id (TEACHER propriétaire / ADMIN) */
  async updateSae(id, data) {
    const res = await apiClient(`/api/saes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    return res.data || res;
  },

  /** DELETE /api/saes/:id (ADMIN) */
  async deleteSae(id) {
    const res = await apiClient(`/api/saes/${id}`, { method: 'DELETE' });
    return res.data || res;
  },

  /** POST /api/saes/:id/publish (TEACHER propriétaire / ADMIN) */
  async publishSae(id) {
    const res = await apiClient(`/api/saes/${id}/publish`, { method: 'POST' });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Invitations
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:id/invitations */
  async getInvitations(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/invitations`, { method: 'GET' });
    return res.data || res;
  },

  /** POST /api/saes/:id/invitations */
  async addInvitation(saeId, userId) {
    const res = await apiClient(`/api/saes/${saeId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return res.data || res;
  },

  /** DELETE /api/saes/:id/invitations/:invitationId */
  async removeInvitation(saeId, invitationId) {
    const res = await apiClient(`/api/saes/${saeId}/invitations/${invitationId}`, { method: 'DELETE' });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Annonces
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:saeId/announcements */
  async getAnnouncements(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/announcements`, { method: 'GET' });
    return res.data || res;
  },

  /** POST /api/saes/:saeId/announcements (TEACHER propriétaire/invité) */
  async createAnnouncement(saeId, data) {
    const res = await apiClient(`/api/saes/${saeId}/announcements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** PATCH /api/saes/:saeId/announcements/:id */
  async updateAnnouncement(saeId, annId, data) {
    const res = await apiClient(`/api/saes/${saeId}/announcements/${annId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** DELETE /api/saes/:saeId/announcements/:id */
  async deleteAnnouncement(saeId, annId) {
    const res = await apiClient(`/api/saes/${saeId}/announcements/${annId}`, { method: 'DELETE' });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Documents
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:id/documents */
  async getSaeDocuments(id) {
    const res = await apiClient(`/api/saes/${id}/documents`, { method: 'GET' });
    return res.data || res;
  },

  /** DELETE /api/saes/:saeId/documents/:documentId (TEACHER propriétaire/invité) */
  async deleteDocument(saeId, documentId) {
    const res = await apiClient(`/api/saes/${saeId}/documents/${documentId}`, { method: 'DELETE' });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Rendus (Submissions)
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:saeId/submission/me (STUDENT) */
  async getMySubmission(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/submission/me`, { method: 'GET' });
    return res.data || res;
  },

  /**
   * POST /api/saes/:saeId/submission (STUDENT)
   * @param {Object} data - { url, fileName, mimeType, description, imageUrl?, isPublic }
   */
  async submitSae(saeId, data) {
    const res = await apiClient(`/api/saes/${saeId}/submission`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** PATCH /api/saes/:saeId/submission/visibility (STUDENT — toggle son propre rendu) */
  async updateMySubmissionVisibility(saeId, isPublic) {
    const res = await apiClient(`/api/saes/${saeId}/submission/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    });
    return res.data || res;
  },

  /** GET /api/saes/:saeId/submissions (TEACHER/ADMIN/PUBLIC si publiée) */
  async getSubmissions(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/submissions`, { method: 'GET' });
    return res.data || res;
  },

  /** PATCH /api/saes/:saeId/submissions/visibility (TEACHER/ADMIN — toggle tous les rendus) */
  async updateAllSubmissionsVisibility(saeId, isPublic) {
    const res = await apiClient(`/api/saes/${saeId}/submissions/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    });
    return res.data || res;
  },

  /** DELETE /api/submissions/:submissionId (TEACHER/ADMIN - pour modération galerie) */
  async deleteSubmission(submissionId) {
    const res = await apiClient(`/api/submissions/${submissionId}`, { method: 'DELETE' });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Milestones (Paliers)
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:id/milestones */
  async getSaeMilestones(id) {
    const res = await apiClient(`/api/saes/${id}/milestones`, { method: 'GET' });
    return res.data || res;
  },

  /** POST /api/saes/:id/milestones (TEACHER propriétaire / ADMIN) */
  async createMilestone(saeId, data) {
    const res = await apiClient(`/api/saes/${saeId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** DELETE /api/saes/:saeId/milestones/:milestoneId (TEACHER propriétaire / ADMIN) */
  async deleteMilestone(saeId, milestoneId) {
    const res = await apiClient(`/api/saes/${saeId}/milestones/${milestoneId}`, { method: 'DELETE' });
    return res.data || res;
  },

  /** GET /api/saes/:id/milestones/progress/me (STUDENT) */
  async getMyMilestoneProgress(id) {
    const res = await apiClient(`/api/saes/${id}/milestones/progress/me`, { method: 'GET' });
    return res.data || res;
  },

  /** POST /api/saes/:id/milestones/:milestoneId/progress (STUDENT) */
  async postMilestoneProgress(saeId, milestoneId, data) {
    const res = await apiClient(`/api/saes/${saeId}/milestones/${milestoneId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** GET /api/saes/:id/milestones/progress (TEACHER/ADMIN) */
  async getMilestoneProgressStats(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/milestones/progress`, { method: 'GET' });
    return res.data || res;
  },

  /** GET /api/grades/me (STUDENT) */
  async getMyGrades() {
    const res = await apiClient(`/api/grades/me`, { method: 'GET' });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Upload
  // ─────────────────────────────────────────────────────────────

  /**
   * POST /api/resources/upload
   * formData: file, saeId, type (TEACHER: SUJET/RESOURCE/AUTRE), description (STUDENT)
   */
  async uploadSaeResource(formData) {
    const res = await apiClient(`/api/resources/upload`, { method: 'POST', body: formData });
    return res.data || res;
  },
};
