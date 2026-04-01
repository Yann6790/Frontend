import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PendingValidation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Le nom de l'utilisateur pour personnaliser le message
  const firstName = user?.name?.firstname || user?.firstname || '';

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Icône horloge */}
        <div style={styles.iconWrapper}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Titre */}
        <h2 style={styles.title}>Compte en attente de validation</h2>

        {/* Texte explicatif */}
        <p style={styles.text}>
          {firstName ? `${firstName}, votre` : 'Votre'} demande d'affectation a bien été transmise.
        </p>
        <p style={styles.textSecondary}>
          Un administrateur va valider votre compte très prochainement.
        </p>

        {/* Séparateur */}
        <hr style={styles.divider} />

        {/* Bouton déconnexion */}
        <button onClick={handleSignOut} style={styles.logoutBtn}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Styles inline (SaaS / Pro — sobre)
// ——————————————————————————————————————————
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8f8fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    fontFamily: "'Montserrat', sans-serif",
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
    width: '100%',
    maxWidth: '460px',
    padding: '2.5rem 2.25rem',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  iconWrapper: {
    marginBottom: '1.25rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.75rem 0',
  },
  text: {
    fontSize: '0.875rem',
    color: '#374151',
    lineHeight: '1.6',
    margin: '0 0 0.25rem 0',
  },
  textSecondary: {
    fontSize: '0.8125rem',
    color: '#9ca3af',
    lineHeight: '1.5',
    margin: 0,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #f3f4f6',
    margin: '1.5rem 0',
  },
  logoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1.25rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#6b7280',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
