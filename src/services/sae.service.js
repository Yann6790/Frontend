import { apiClient } from "../lib/api";

export const saeService = {
  // ─────────────────────────────────────────────────────────────
  // Module SAE — CRUD
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes */
  async getSaeList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/saes?${queryString}` : "/api/saes";
    const res = await apiClient(url, { method: "GET" });
    return res.data || res;
  },

  /** GET /api/saes/archives */
  async getArchives(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `/api/saes/archives?${queryString}`
      : "/api/saes/archives";
    const res = await apiClient(url, { method: "GET" });
    return res.data || res;
  },

  /** GET /api/saes/:id */
  async getSaeById(id) {
    const res = await apiClient(`/api/saes/${id}`, { method: "GET" });
    return res.data || res;
  },

  /** POST /api/saes (ADMIN) */
  async createSae(data) {
    const res = await apiClient("/api/saes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** PATCH /api/saes/:id (TEACHER propriétaire / ADMIN) */
  async updateSae(id, data) {
    const res = await apiClient(`/api/saes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** DELETE /api/saes/:id (ADMIN) */
  async deleteSae(id) {
    const res = await apiClient(`/api/saes/${id}`, { method: "DELETE" });
    return res.data || res;
  },

  /** POST /api/saes/:id/publish (TEACHER propriétaire / ADMIN) */
  async publishSae(id) {
    const res = await apiClient(`/api/saes/${id}/publish`, { method: "POST" });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Invitations
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:id/invitations */
  async getInvitations(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/invitations`, {
      method: "GET",
    });
    return res.data || res;
  },

  /** POST /api/saes/:id/invitations */
  async addInvitation(saeId, userId) {
    const res = await apiClient(`/api/saes/${saeId}/invitations`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    return res.data || res;
  },

  /** DELETE /api/saes/:id/invitations/:invitationId */
  async removeInvitation(saeId, invitationId) {
    const res = await apiClient(
      `/api/saes/${saeId}/invitations/${invitationId}`,
      { method: "DELETE" },
    );
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Annonces
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:saeId/announcements */
  async getAnnouncements(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/announcements`, {
      method: "GET",
    });
    return res.data || res;
  },

  /** POST /api/saes/:saeId/announcements (TEACHER propriétaire/invité) */
  async createAnnouncement(saeId, data) {
    const res = await apiClient(`/api/saes/${saeId}/announcements`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** PATCH /api/saes/:saeId/announcements/:id */
  async updateAnnouncement(saeId, annId, data) {
    const res = await apiClient(`/api/saes/${saeId}/announcements/${annId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** DELETE /api/saes/:saeId/announcements/:id */
  async deleteAnnouncement(saeId, annId) {
    const res = await apiClient(`/api/saes/${saeId}/announcements/${annId}`, {
      method: "DELETE",
    });
    return res.data || res;
  },

  /** GET /api/saes/:saeId/announcements/:id (Endpoint 26) */
  async getAnnouncementById(saeId, annId) {
    const res = await apiClient(`/api/saes/${saeId}/announcements/${annId}`, {
      method: "GET",
    });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Documents
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:id/documents */
  async getSaeDocuments(id) {
    const res = await apiClient(`/api/saes/${id}/documents`, { method: "GET" });
    return res.data || res;
  },

  /** DELETE /api/saes/:saeId/documents/:documentId (TEACHER propriétaire/invité) */
  async deleteDocument(saeId, documentId) {
    const res = await apiClient(`/api/saes/${saeId}/documents/${documentId}`, {
      method: "DELETE",
    });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Rendus (Submissions)
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:saeId/submission/me (STUDENT) */
  async getMySubmission(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/submission/me`, {
      method: "GET",
    });
    return res.data || res;
  },

  /**
   * POST /api/saes/:saeId/submission (STUDENT)
   * @param {Object} data - { url, fileName, mimeType, description, imageUrl?, isPublic }
   */
  async submitSae(saeId, data) {
    const res = await apiClient(`/api/saes/${saeId}/submission`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** PATCH /api/saes/:saeId/submission/visibility (STUDENT — toggle son propre rendu) */
  async updateMySubmissionVisibility(saeId, isPublic) {
    const res = await apiClient(`/api/saes/${saeId}/submission/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ isPublic }),
    });
    return res.data || res;
  },

  /** GET /api/saes/:saeId/submissions (TEACHER/ADMIN/PUBLIC si publiée) */
  async getSubmissions(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/submissions`, {
      method: "GET",
    });
    return res.data || res;
  },

  /** PATCH /api/saes/:saeId/submissions/visibility (TEACHER/ADMIN — toggle tous les rendus) */
  async updateAllSubmissionsVisibility(saeId, isPublic) {
    const res = await apiClient(`/api/saes/${saeId}/submissions/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ isPublic }),
    });
    return res.data || res;
  },

  /** DELETE /api/saes/:saeId/submissions/:submissionId (TEACHER/ADMIN - pour modération galerie) */
  async deleteSubmission(saeId, submissionId) {
    const res = await apiClient(`/api/saes/${saeId}/submissions/${submissionId}`, {
      method: "DELETE",
    });
    return res.data || res;
  },

  /** PATCH /api/saes/:saeId/submissions/:submissionId/visibility (TEACHER/ADMIN - individual toggle, Endpoint 33) */
  async updateSubmissionVisibility(saeId, submissionId, isPublic) {
    const res = await apiClient(
      `/api/saes/${saeId}/submissions/${submissionId}/visibility`,
      {
        method: "PATCH",
        body: JSON.stringify({ isPublic }),
      },
    );
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Notation (Grades)
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:saeId/grade-categories */
  async getGradeCategories(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/grade-categories`, {
      method: "GET",
    });
    return res.data || res;
  },

  /** POST /api/saes/:saeId/grade-categories */
  async createGradeCategory(saeId, data) {
    const res = await apiClient(`/api/saes/${saeId}/grade-categories`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** GET /api/saes/:saeId/grades */
  async getGrades(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/grades`, { method: "GET" });
    return res.data || res;
  },

  /** POST /api/submissions/:submissionId/grades */
  async setSubmissionGrades(submissionId, data) {
    const res = await apiClient(`/api/submissions/${submissionId}/grades`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** GET /api/saes/:saeId/grades/export */
  async exportGrades(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/grades/export`, {
      method: "GET",
    });
    // Note: apiClient likely handles JSON by default, but this is a binary file (.xlsx).
    // If apiClient's underlying fetch doesn't handle blobs, we might need a direct fetch call.
    return res;
  },

  /** POST /api/saes/:saeId/grades/import */
  async importGrades(saeId, formData) {
    const res = await apiClient(`/api/saes/${saeId}/grades/import`, {
      method: "POST",
      body: formData,
    });
    return res.data || res;
  },

  /** GET /api/submissions/:submissionId/grades (Endpoint 42) */
  async getSubmissionGrades(submissionId) {
    const res = await apiClient(`/api/submissions/${submissionId}/grades`, {
      method: "GET",
    });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Milestones (Paliers)
  // ─────────────────────────────────────────────────────────────

  /** GET /api/saes/:id/milestones */
  async getSaeMilestones(id) {
    const res = await apiClient(`/api/saes/${id}/milestones`, {
      method: "GET",
    });
    return res.data || res;
  },

  /** POST /api/saes/:id/milestones (TEACHER propriétaire / ADMIN) */
  async createMilestone(saeId, data) {
    const res = await apiClient(`/api/saes/${saeId}/milestones`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  /** PATCH /api/saes/:saeId/milestones/:milestoneId (TEACHER propriétaire / ADMIN) */
  async updateMilestone(saeId, milestoneId, data) {
    const res = await apiClient(
      `/api/saes/${saeId}/milestones/${milestoneId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    return res.data || res;
  },

  /** DELETE /api/saes/:saeId/milestones/:milestoneId (TEACHER propriétaire / ADMIN) */
  async deleteMilestone(saeId, milestoneId) {
    const res = await apiClient(
      `/api/saes/${saeId}/milestones/${milestoneId}`,
      { method: "DELETE" },
    );
    return res.data || res;
  },

  /** GET /api/saes/:id/milestones/progress/me (STUDENT) */
  async getMyMilestoneProgress(id) {
    const res = await apiClient(`/api/saes/${id}/milestones/progress/me`, {
      method: "GET",
    });
    return res.data || res;
  },

  /** POST /api/saes/:id/milestones/:milestoneId/progress (STUDENT) */
  async postMilestoneProgress(saeId, milestoneId, data) {
    const res = await apiClient(
      `/api/saes/${saeId}/milestones/${milestoneId}/progress`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    return res.data || res;
  },

  /** GET /api/saes/:id/milestones/progress (TEACHER/ADMIN) — retourne { milestones: [...] } */
  async getMilestoneProgressDashboard(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/milestones/progress`, {
      method: "GET",
    });
    return res.data || res;
  },

  /** GET /api/saes/:id/milestones/stats (TEACHER/ADMIN) */
  async getMilestoneStats(saeId) {
    const res = await apiClient(`/api/saes/${saeId}/milestones/stats`, {
      method: "GET",
    });
    return res.data || res;
  },

  /** GET /api/saes/:saeId/milestones/:milestoneId/progress/:studentId */
  async getMilestoneProgressForStudent(saeId, milestoneId, studentId) {
    const res = await apiClient(
      `/api/saes/${saeId}/milestones/${milestoneId}/progress/${studentId}`,
      { method: "GET" },
    );
    return res.data || res;
  },

  /** GET /api/grades/me (STUDENT) */
  async getMyGrades() {
    const res = await apiClient(`/api/grades/me`, { method: "GET" });
    return res.data || res;
  },

  // ─────────────────────────────────────────────────────────────
  // Module Galerie — Aggrégation des soumissions publiques
  // ─────────────────────────────────────────────────────────────

  /**
   * Retourne TOUTES les soumissions publiques :
   *  - Les rendus archivés (SAEs passées) via /api/saes/archives
   *  - Les rendus publics des SAEs actives via /api/saes + /api/saes/:id/submissions
   */
  async getAllPublicSubmissions() {
    // ── 1. Archives (données historiques) ──
    let archiveItems = [];
    try {
      const archivesRes = await this.getArchives();
      archiveItems = Array.isArray(archivesRes)
        ? archivesRes
        : archivesRes?.data || [];
    } catch (err) {
      console.warn(
        "[Gallery] Impossible de charger les archives:",
        err.message,
      );
    }

    // ── 2. SAEs actives → soumissions publiques ──
    let liveItems = [];
    try {
      const saesRes = await this.getSaeList();
      const saes = Array.isArray(saesRes)
        ? saesRes
        : saesRes?.data || saesRes?.items || [];

      // Récupérer les soumissions de chaque SAE en parallèle
      const results = await Promise.allSettled(
        saes.map((sae) =>
          apiClient(`/api/saes/${sae.id}/submissions`, { method: "GET" })
            .then((res) => ({ sae, subs: res?.data || res }))
            .catch(() => ({ sae, subs: [] })),
        ),
      );

      const archiveIds = new Set(archiveItems.map((i) => i.id));

      results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const { sae, subs } = result.value;
        const subsArray = Array.isArray(subs)
          ? subs
          : subs?.items || subs?.data || [];

        subsArray
          .filter((sub) => sub.isPublic === true)
          .forEach((sub) => {
            if (archiveIds.has(sub.id)) return; // déjà dans les archives

            // Normaliser au format attendu par SharedGallery
            const studentName =
              sub.name ||
              sub.student?.name ||
              sub.student ||
              sub.user?.name ||
              sub.submittedBy?.name ||
              null;

            liveItems.push({
              id: sub.id,
              saeId: sae.id,
              title: sub.description || sae.title || "Sans titre",
              name: studentName,
              url: sub.url,
              imageUrl: sub.imageUrl || null,
              description: sub.description || "",
              thematic: sae.thematic || null,
              year: new Date(
                sub.submittedAt || sae.dueDate || sae.createdAt || Date.now(),
              ).getFullYear(),
            });
            archiveIds.add(sub.id);
          });
      });
    } catch (err) {
      console.warn(
        "[Gallery] Impossible de charger les soumissions live:",
        err.message,
      );
    }

    // ── 3. Fusion ──
    return [...archiveItems, ...liveItems];
  },

  // ─────────────────────────────────────────────────────────────
  // Module Upload
  // ─────────────────────────────────────────────────────────────

  /**
   * Retourne TOUTES les annonces liées aux SAEs de l'utilisateur (Étudiant ou Professeur).
   * Agrégation côté client car il n'existe pas d'endpoint global /api/announcements.
   */
  async getAllAnnouncements() {
    try {
      // 1. Récupérer la liste des SAEs (déjà filtrée par rôle et promo côté backend)
      const saesRes = await this.getSaeList();
      const saes = Array.isArray(saesRes) ? saesRes : saesRes?.data || [];

      if (saes.length === 0) return [];

      // 2. Parcourir chaque SAE pour récupérer ses annonces en parallèle
      const results = await Promise.allSettled(
        saes.map(async (sae) => {
          const annRes = await this.getAnnouncements(sae.id);
          const annList = Array.isArray(annRes) ? annRes : annRes?.data || [];

          // Injecter les métadonnées de la SAE dans chaque annonce
          return annList.map((ann) => ({
            ...ann,
            saeId: sae.id,
            saeTitle: sae.title,
            saeBanner: sae.banner || null,
            thematic: sae.thematic,
            authorName: sae.createdBy?.name || "L'équipe pédagogique",
          }));
        }),
      );

      // 3. Aplatir et trier par date (plus récent d'abord)
      const allAnn = results
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return allAnn;
    } catch (err) {
      console.warn(
        "[Announcements] Erreur lors de l'agrégation globale:",
        err.message,
      );
      return [];
    }
  },

  /**
   * POST /api/resources/upload
   * formData: file, saeId, type (TEACHER: SUJET/RESOURCE/AUTRE), description (STUDENT)
   */
  async uploadSaeResource(formData) {
    const res = await apiClient(`/api/resources/upload`, {
      method: "POST",
      body: formData,
    });
    return res.data || res;
  },
};
