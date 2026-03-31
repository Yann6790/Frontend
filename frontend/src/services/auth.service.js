import { apiClient } from '../lib/api';

/**
 * Service d'authentification centralisé.
 * Ne contient pour le moment (ÉTAPE 1) que les appels SignIn et Me.
 */
export const authService = {
  
  /**
   * Connexion (Sign In)
   * POST /api/auth/sign-in/email
   * 
   * @param {Object} credentials 
   * @param {string} credentials.email
   * @param {string} credentials.password
   */
  async signIn({ email, password }) {
    return apiClient('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Inscription (Sign Up) - ÉTAPE 2
   * POST /api/auth/sign-up
   * 
   * @param {Object} userData 
   * @param {string} userData.email
   * @param {string} userData.password
   * @param {string} userData.firstname
   * @param {string} userData.lastname
   */
  async signUp({ email, password, firstname, lastname }) {
    return apiClient('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        name: `${firstname} ${lastname}`,  // Better Auth attend "name"
        firstname, 
        lastname 
      }),
    });
  },

  /**
   * Inscription d'un Professeur (Admin uniquement)
   * POST /api/auth/sign-up/teacher
   * 
   * @param {Object} userData 
   * @param {string} userData.firstname
   * @param {string} userData.lastname
   * @param {string} userData.email
   */
  async signUpTeacher({ firstname, lastname, email }) {
    return apiClient('/api/auth/sign-up/teacher', {
      method: 'POST',
      body: JSON.stringify({ firstname, lastname, email }),
    });
  },

  /**
   * Utilisateur Actuel (Me)
   * GET /api/auth/me
   */
  async getMe() {
    return apiClient('/api/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Finalisation du profil Étudiant (Onboarding) - ÉTAPE 3
   * POST /api/auth/onboarding
   * 
   * @param {Object} onboardingData 
   * @param {string} onboardingData.promotionId
   * @param {string} onboardingData.groupId
   * @param {string} onboardingData.imageUrl
   */
  async onboardStudent({ promotionId, groupId, imageUrl }) {
    return apiClient('/api/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify({ promotionId, groupId, imageUrl }),
    });
  },

  /**
   * Déconnexion (Sign Out) - ÉTAPE 4
   * POST /api/auth/sign-out
   */
  async signOut() {
    return apiClient('/api/auth/sign-out', {
      method: 'POST',
    });
  },

  /**
   * Modifier le mot de passe - ÉTAPE 4
   * POST /api/auth/change-password
   */
  async changePassword({ oldPassword, newPassword }) {
    return apiClient('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  /**
   * Mettre à jour la photo de profil
   * POST /api/auth/profile-image
   */
  async updateProfileImage(imageUrl) {
    return apiClient('/api/auth/profile-image', {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
    });
  }

};
