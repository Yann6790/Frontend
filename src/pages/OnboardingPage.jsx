import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { resourcesService } from '../services/resources.service';
import { useAuth } from '../context/AuthContext';

export default function OnboardingPage() {
  const [promotions, setPromotions] = useState([]);
  const [groups, setGroups] = useState([]);

  const [promotionId, setPromotionId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  // Récupérer promotions et groupes depuis l'API au montage
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [promosData, groupsData] = await Promise.all([
          resourcesService.getPromotions(),
          resourcesService.getGroups(),
        ]);
        setPromotions(Array.isArray(promosData) ? promosData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (err) {
        setError('Impossible de charger les promotions et groupes.');
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchResources();
  }, []);

  // Gestion du fichier sélectionné + preview
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez PNG, JPEG ou WebP.');
      return;
    }

    setError('');
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  // Nettoyage de l'URL de preview
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Upload de la photo de profil si sélectionnée
      let imageUrl = '';
      if (selectedFile) {
        const uploadRes = await resourcesService.uploadImage(selectedFile);
        imageUrl = uploadRes.url;
      }

      // 2. POST /api/auth/onboarding
      await authService.onboardStudent({
        promotionId,
        groupId,
        imageUrl,
      });

      // 3. Rafraîchir la session puis rediriger
      await refreshUser();
      navigate('/pending');
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // — Loading —
  if (isFetchingData) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div style={styles.spinner} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={styles.title}>Finalisez votre profil étudiant</h2>
          <p style={styles.subtitle}>
            Veuillez indiquer votre promotion, votre groupe de TP et ajouter une photo de profil
            pour accéder à vos SAE. Ces informations devront être validées par un administrateur.
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          {/* Promotion */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Promotion</label>
            <select
              value={promotionId}
              onChange={(e) => setPromotionId(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Sélectionnez une promotion…</option>
              {promotions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Groupe TP */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Groupe TP</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Sélectionnez un groupe…</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Photo de profil */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Photo de profil</label>
            <div style={styles.fileRow}>
              {/* Preview */}
              <div style={styles.avatarPreview}>
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.375rem' }}
                  />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>

              {/* Input file stylisé */}
              <div style={{ flex: 1 }}>
                <label style={styles.fileLabel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {selectedFile ? selectedFile.name : 'Choisir une image…'}
                  <input
                    type="file"
                    accept=".png,.jpeg,.jpg,.webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <p style={styles.fileHint}>PNG, JPEG ou WebP</p>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isSubmitting || !promotionId || !groupId}
            style={{
              ...styles.submitBtn,
              opacity: isSubmitting || !promotionId || !groupId ? 0.55 : 1,
              cursor: isSubmitting || !promotionId || !groupId ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? (
              <span style={styles.btnSpinner} />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
                Envoyer ma demande
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Styles inline (SaaS / Pro)
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
    padding: '2rem 2.25rem',
    border: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: 0,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    marginBottom: '1.25rem',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  fieldGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.375rem',
  },
  select: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    color: '#111827',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    outline: 'none',
    appearance: 'auto',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  avatarPreview: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '0.375rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.4375rem 0.75rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#374151',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileHint: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    margin: '0.25rem 0 0 0',
  },
  submitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#ffffff',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '0.375rem',
    marginTop: '0.5rem',
    transition: 'background-color 0.15s ease',
  },
  spinner: {
    width: '2rem',
    height: '2rem',
    border: '2.5px solid #e5e7eb',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  btnSpinner: {
    display: 'inline-block',
    width: '1.125rem',
    height: '1.125rem',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};
