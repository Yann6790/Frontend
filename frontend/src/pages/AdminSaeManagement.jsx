import React, { useState, useMemo, useEffect, useCallback } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { saeService } from '../services/sae.service';
import { resourcesService } from '../services/resources.service';
import SharedGallery from '../components/SharedGallery';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Détermine si un semestre requiert un groupe TD.
 * L'API retourne { number: 1..6 } — semestres 4, 5, 6 imposent tdGroup.
 */
function semesterRequiresTdGroup(semesterId, semesters) {
  const sem = semesters.find(s => s.id === semesterId);
  if (!sem) return false;
  const num = sem.number ?? parseInt((sem.name || sem.label || '').replace(/\D/g, ''), 10);
  return num >= 4;
}

/**
 * Retourne le nom complet d'un utilisateur depuis un objet user de l'API.
 */
function getUserFullName(user) {
  if (!user) return 'N/A';
  const first = user.name?.firstname || user.firstname || '';
  const last = user.name?.lastname || user.lastname || '';
  return `${first} ${last}`.trim() || user.email || 'N/A';
}

/**
 * Retourne le label lisible d'un semestre (sans les années).
 * Ex: S3 → "S3 — MMI 2"
 */
function getSemesterLabel(sem) {
  if (!sem) return '—';
  const num = sem.number ?? parseInt((sem.name || sem.label || '').replace(/\D/g, ''), 10);
  if (num) {
    const mmiLevel = Math.ceil(num / 2);
    return `S${num} — MMI ${mmiLevel}`;
  }
  return sem.name || sem.label || '—';
}

/**
 * Valide le format d'un UUID.
 */
const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const EMPTY_FORM = {
  title: '',
  description: '',
  instructions: '',
  semesterId: '',
  tdGroup: '',
  teacherId: '',
  thematicId: '',
  bannerId: '',
  dueDate: '',
};

// ─────────────────────────────────────────────────────────────────
// Sous-composant : Champ de formulaire
// ─────────────────────────────────────────────────────────────────
function FormField({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
        {label} {required && <span className="text-black">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white border border-gray-200 text-black px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium text-sm transition-all";
const selectCls = "w-full bg-white border border-gray-200 text-black px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium text-sm transition-all cursor-pointer";

// ─────────────────────────────────────────────────────────────────
// Sous-composant : Modale création SAE
// ─────────────────────────────────────────────────────────────────
function SaeFormModal({ saeList, semesters, thematics, banners, teachers, onClose, onSuccess }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── Options combinées Semestre + Groupe TD (Dédoublonnées) ──
  const semesterOptions = React.useMemo(() => {
    const opts = [];
    const seenNumbers = new Set();

    // Trier pour prendre le semestre le plus récent en premier pour chaque numéro
    const sortedSems = [...semesters].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    sortedSems.forEach(s => {
      const num = s.number ?? parseInt((s.name || s.label || '').replace(/\D/g, ''), 10);
      if (!num || seenNumbers.has(num)) return;
      seenNumbers.add(num);

      const isS4Plus = num >= 4;
      const semLabel = getSemesterLabel(s);

      if (isS4Plus) {
        opts.push({ value: `${s.id}|A`, label: `${semLabel} — Groupe A`, num });
        opts.push({ value: `${s.id}|B`, label: `${semLabel} — Groupe B`, num });
      } else {
        opts.push({ value: s.id, label: semLabel, num });
      }
    });

    // Retrier S1 -> S6
    return opts.sort((a, b) => a.num - b.num);
  }, [semesters]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSemesterSelect = (value) => {
    if (!value) {
      setForm(prev => ({ ...prev, semesterId: '', tdGroup: '' }));
      return;
    }
    if (value.includes('|')) {
      const [sId, tGrp] = value.split('|');
      setForm(prev => ({ ...prev, semesterId: sId, tdGroup: tGrp }));
    } else {
      setForm(prev => ({ ...prev, semesterId: value, tdGroup: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) { setError('Le titre est obligatoire.'); return; }
    if (!form.semesterId) { setError("L'assignation au semestre est obligatoire."); return; }
    if (!form.teacherId) { setError("Le professeur responsable est obligatoire."); return; }
    // La thématique est optionnelle – on l'envoie seulement si c'est un UUID valide
    
    const needsTdGroup = semesterRequiresTdGroup(form.semesterId, semesters);
    if (needsTdGroup && !form.tdGroup) {
      setError('Erreur interne : groupe TD manquant pour ce semestre.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Construire le corps de la requête
      const body = {
        title: form.title.trim(),
        semesterId: form.semesterId,
        teacherId: form.teacherId,
        startDate: new Date().toISOString(), // Date du jour requise par le backend
      };
      // Ajouter la thématique uniquement si c'est un UUID valide
      if (isValidUUID(form.thematicId)) {
        body.thematicId = form.thematicId;
      }
      if (form.description.trim()) body.description = form.description.trim();
      if (form.instructions.trim()) body.instructions = form.instructions.trim();
      if (form.bannerId) body.bannerId = form.bannerId;
      if (form.dueDate) body.dueDate = new Date(form.dueDate).toISOString();
      if (needsTdGroup && form.tdGroup) body.tdGroup = form.tdGroup;

      console.log('[AdminSAE] Création SAE — body envoyé:', body);
      await saeService.createSae(body);
      onSuccess();
    } catch (err) {
      console.error('[AdminSAE] Erreur création SAE:', err);
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-10 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-gray-200 shadow-2xl w-full max-w-2xl rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-black tracking-tight">Créer une SAE</h2>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Nouveau module</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition text-gray-400 hover:text-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Titre */}
          <FormField label="Titre" required>
            <input
              type="text"
              className={inputCls}
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Ex : SAE 301 — Projet Web Dynamique"
              required
              disabled={isSubmitting}
            />
          </FormField>

          {/* Description & Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Description">
              <textarea
                className={`${inputCls} resize-none h-24`}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Résumé de la SAE..."
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Instructions">
              <textarea
                className={`${inputCls} resize-none h-24`}
                value={form.instructions}
                onChange={e => handleChange('instructions', e.target.value)}
                placeholder="Consignes détaillées de rendu..."
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          {/* Semestre fusionné */}
          <FormField label="Assignation (Semestre & Groupe)" required>
            <select
              className={selectCls}
              value={form.semesterId && form.tdGroup ? `${form.semesterId}|${form.tdGroup}` : form.semesterId}
              onChange={e => handleSemesterSelect(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="">— Sélectionner une promotion —</option>
              {semesterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormField>

          {/* Matière (Thématique) */}
          <FormField label="Matière" required>
            <select
              className={selectCls}
              value={form.thematicId}
              onChange={e => handleChange('thematicId', e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="">— Sélectionner une matière —</option>
              {thematics.map(t => (
                <option key={t.id} value={t.id}>{t.name || t.label || t.title}</option>
              ))}
            </select>
          </FormField>

          {/* Bannière visuelle */}
          <FormField label="Bannière visuelle (optionnelle)">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Option Aucune */}
              <div 
                onClick={() => !isSubmitting && handleChange('bannerId', '')}
                className={`cursor-pointer rounded-lg border-2 flex items-center justify-center min-h-[60px] transition-all bg-gray-50 hover:bg-gray-100 ${!form.bannerId ? 'border-black ring-2 ring-black/10' : 'border-gray-200'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-[10px] font-black uppercase text-gray-500 text-center">Aucune<br/>bannière</span>
              </div>
              {/* Liste des Bannières */}
              {banners.map((b) => (
                <div 
                  key={b.id}
                  onClick={() => !isSubmitting && handleChange('bannerId', b.id)}
                  className={`relative cursor-pointer rounded-lg border-2 overflow-hidden min-h-[60px] group transition-all ${form.bannerId === b.id ? 'border-black ring-2 ring-black/10' : 'border-gray-100 hover:border-gray-300'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <img src={b.url} alt="Bannière" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {form.bannerId === b.id && (
                    <div className="absolute top-1.5 right-1.5 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center p-0.5 shadow-sm">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FormField>

          {/* Professeur responsable */}
          <FormField label="Professeur responsable" required>
            <select
              className={selectCls}
              value={form.teacherId}
              onChange={e => handleChange('teacherId', e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="">— Sélectionner un professeur —</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{getUserFullName(t)} — {t.email}</option>
              ))}
            </select>
          </FormField>

          {/* Date limite */}
          <FormField label="Date limite de rendu (optionnelle)">
            <input
              type="datetime-local"
              className={inputCls}
              value={form.dueDate}
              onChange={e => handleChange('dueDate', e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-all shadow-sm flex items-center gap-2"
            >
              {isSubmitting && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Créer la SAE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────
export default function AdminSaeManagement() {
  // ── Référentiels ──
  const [semesters, setSemesters] = useState([]);
  const [thematics, setThematics] = useState([]);

  // Fallback thematics au cas où l'API /api/resources/thematics renvoie 404
  const FALLBACK_THEMATICS = useMemo(() => [
    { id: '00000000-0000-0000-0000-000000000001', label: 'Développement Web' },
    { id: '00000000-0000-0000-0000-000000000002', label: 'UX/UI Design' },
    { id: '00000000-0000-0000-0000-000000000003', label: 'Audiovisuel' },
    { id: '00000000-0000-0000-0000-000000000004', label: 'Communication' }
  ], []);

  const displayThematics = thematics.length > 0 ? thematics : FALLBACK_THEMATICS;

  const [banners, setBanners] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // ── SAE ──
  const [saeList, setSaeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // ── Modale ──
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ── Onglets ──
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'galerie'
  const [refreshGallery, setRefreshGallery] = useState(0);

  // ── Filtres ──
  const [filterSemester, setFilterSemester] = useState('');
  const [sortDate, setSortDate] = useState('desc');
  const [deleteYear, setDeleteYear] = useState('');
  const [deleteGalleryYear, setDeleteGalleryYear] = useState('');
  const [isBulkDeletingGallery, setIsBulkDeletingGallery] = useState(false);

  // ── Notification ──
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  // ── Chargement SAE ──
  const fetchSaes = useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await saeService.getSaeList();
      console.log('[AdminSAE] Réponse brute /api/saes:', raw);
      const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
      console.log('[AdminSAE] Liste SAE extraite:', list);
      setSaeList(list);
    } catch (e) {
      console.error('[AdminSAE] Erreur chargement saes:', e);
      showNotification('Erreur lors du chargement des SAE.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Chargement référentiels ──
  useEffect(() => {
    const safeLoad = async (label, fn, setter) => {
      try {
        const res = await fn();
        const arr = Array.isArray(res) ? res : (res?.data ?? []);
        console.log(`[AdminSAE] ${label}:`, arr);
        setter(arr);
      } catch (e) {
        console.error(`[AdminSAE] Erreur chargement ${label}:`, e.message);
      }
    };

    Promise.all([
      safeLoad('semesters', () => resourcesService.getSemesters(), setSemesters),
      safeLoad('thematics', () => resourcesService.getThematics(), setThematics),
      safeLoad('banners', () => resourcesService.getBanners(), setBanners),
      safeLoad('teachers', () => resourcesService.getTeachers(), setTeachers),
    ]);

    fetchSaes();
  }, [fetchSaes]);

  // ── Filtrage & Tri ──
  const filteredSaeList = useMemo(() => {
    let result = [...saeList];
    if (filterSemester) {
      // filterSemester est maintenant un 'numéro' (1 à 6)
      result = result.filter(sae => {
        const semObj = semesters.find(s => s.id === sae.semesterId);
        const num = semObj ? (semObj.number ?? parseInt((semObj.name || semObj.label || '').replace(/\D/g, ''), 10)) : null;
        return num && num.toString() === filterSemester.toString();
      });
    }
    result.sort((a, b) => {
      const dA = new Date(a.createdAt || 0).getTime();
      const dB = new Date(b.createdAt || 0).getTime();
      return sortDate === 'desc' ? dB - dA : dA - dB;
    });
    return result;
  }, [saeList, filterSemester, sortDate]);

  // ── Suppression unitaire ──
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette SAE définitivement ? Cette action est irréversible.')) return;
    try {
      await saeService.deleteSae(id);
      setSaeList(prev => prev.filter(s => s.id !== id));
      showNotification('SAE supprimée avec succès.');
    } catch (e) {
      showNotification(e.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  // ── Bulk Delete ──
  const handleBatchDelete = async () => {
    if (!deleteYear) return;
    const year = deleteYear.toString();
    const toDelete = saeList.filter(s => {
      const d = s.createdAt || s.dueDate;
      return d && new Date(d).getFullYear().toString() === year;
    });

    if (toDelete.length === 0) {
      showNotification(`Aucune SAE trouvée pour l'année ${year}.`, 'error');
      return;
    }
    if (!window.confirm(`Supprimer ${toDelete.length} SAE(s) de l'année ${year} ?`)) return;
    if (!window.confirm(`⚠️ CONFIRMATION FINALE — Supprimer définitivement ${toDelete.length} SAE(s) ?`)) return;

    setIsBulkDeleting(true);
    try {
      await Promise.all(toDelete.map(s => saeService.deleteSae(s.id)));
      await fetchSaes();
      setDeleteYear('');
      showNotification(`${toDelete.length} SAE(s) supprimée(s) avec succès.`);
    } catch (e) {
      showNotification(e.message || 'Erreur lors du nettoyage.', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // ── Modération Galerie ──
  const handleDeleteSubmission = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer/cacher cette réalisation étudiante ?")) return;
    try {
      await saeService.deleteSubmission(id);
      showNotification("Réalisation supprimée de la galerie.");
      setRefreshGallery(prev => prev + 1);
    } catch (err) {
      showNotification(err.message || "Erreur lors de la suppression du rendu.", "error");
    }
  };

  const handleBatchDeleteGallery = async () => {
    if (!deleteGalleryYear) return;
    const year = deleteGalleryYear.toString();
    
    if (!window.confirm(`Vous allez supprimer toutes les réalisations publiques de la galerie pour l'année ${year}. Continuer ?`)) return;

    setIsBulkDeletingGallery(true);
    try {
      // On récupère d'abord toutes les réalisations de la galerie pour l'année donnée
      const res = await saeService.getArchives({ year });
      const projects = Array.isArray(res) ? res : (res?.data || []);
      const toDelete = projects.filter(p => !year || p.year?.toString() === year || (p.createdAt && new Date(p.createdAt).getFullYear().toString() === year));

      if (toDelete.length === 0) {
        showNotification(`Aucune réalisation trouvée pour l'année ${year} dans la galerie.`, 'error');
        setIsBulkDeletingGallery(false);
        return;
      }

      await Promise.all(toDelete.map(p => saeService.deleteSubmission(p.id)));
      showNotification(`${toDelete.length} réalisation(s) de l'année ${year} supprimée(s) avec succès.`);
      setDeleteGalleryYear('');
      setRefreshGallery(prev => prev + 1);
    } catch (e) {
      showNotification(e.message || 'Erreur lors du nettoyage de la galerie.', 'error');
    } finally {
      setIsBulkDeletingGallery(false);
    }
  };

  // ── Succès modal ──
  const handleModalSuccess = async () => {
    setShowCreateModal(false);
    await fetchSaes();
    showNotification('SAE créée avec succès !');
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6">

        {/* ── En-tête ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <h1 className="text-3xl font-black text-black tracking-tight">Gestion des SAE</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {notification.message && (
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                notification.type === 'error'
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-gray-900 text-white border-black'
              }`}>{notification.message}</span>
            )}
            {activeTab === 'active' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Créer une SAE
              </button>
            )}
          </div>
        </div>

        {/* ── Onglets ── */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'active'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-500 hover:text-black hover:bg-white/50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              SAE actives
              <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-md">{saeList.length}</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('galerie')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'galerie'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-500 hover:text-black hover:bg-white/50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Galerie des étudiants
            </span>
          </button>
        </div>

        {/* ═══════════════════════ ONGLET SAE ACTIVES ═══════════════════════ */}
        {activeTab === 'active' && (
          <>
            {/* ── Filtres & Nettoyage ── */}
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs font-black uppercase tracking-wider text-gray-600">Filtres :</span>

                {/* Filtre Semestre global 1 à 6 */}
                <select
                  value={filterSemester}
                  onChange={e => setFilterSemester(e.target.value)}
                  className="bg-white border border-gray-300 text-black px-3 py-2 text-sm font-medium rounded-lg outline-none focus:border-black cursor-pointer"
                >
                  <option value="">Tous les semestres</option>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>S{num} — MMI {Math.ceil(num / 2)}</option>
                  ))}
                </select>

                {/* Tri */}
                <button
                  onClick={() => setSortDate(d => d === 'desc' ? 'asc' : 'desc')}
                  className="border border-gray-300 hover:border-black px-3 py-2 text-xs font-bold uppercase rounded-lg hover:bg-black hover:text-white transition"
                >
                  {sortDate === 'desc' ? '↓ Plus récent' : '↑ Plus ancien'}
                </button>
              </div>

              {/* Nettoyage par année */}
              <div className="flex items-center gap-3 bg-white border border-gray-300 px-4 py-3 rounded-xl">
                <div className="text-[11px] font-black uppercase tracking-wider text-gray-500">Nettoyage</div>
                <input
                  type="number"
                  placeholder="Année (ex: 2023)"
                  value={deleteYear}
                  onChange={e => setDeleteYear(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 text-center font-bold bg-white outline-none focus:border-black"
                  min="2020"
                  max="2099"
                />
                <button
                  onClick={handleBatchDelete}
                  disabled={!deleteYear || isBulkDeleting}
                  className="bg-black text-white hover:bg-red-600 text-xs font-bold uppercase px-3 py-2 rounded-lg transition disabled:opacity-40 flex items-center gap-1.5"
                >
                  {isBulkDeleting && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Supprimer
                </button>
              </div>
            </div>

            {/* ── Tableau ── */}
            <div className="bg-white border border-gray-200 overflow-x-auto shadow-sm rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="py-4 px-5 font-bold">Titre</th>
                    <th className="py-4 px-5 font-bold">Thématique</th>
                    <th className="py-4 px-5 font-bold text-center">Semestre</th>
                    <th className="py-4 px-5 font-bold text-center">Groupe TD</th>
                    <th className="py-4 px-5 font-bold">Créateur</th>
                    <th className="py-4 px-5 font-bold text-center">Créé le</th>
                    <th className="py-4 px-5 font-bold text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                          <span className="text-gray-500 font-medium">Chargement des SAE...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSaeList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-20 text-center text-gray-400 font-medium italic">
                        Aucune SAE trouvée.
                      </td>
                    </tr>
                  ) : filteredSaeList.map(sae => {
                    // Trouver l'objet semestre
                    const semObj = semesters.find(s => s.id === sae.semesterId);
                    // Sinon, afficher 'S?' plutôt que l'UUID brut
                    const semLabel = semObj
                      ? getSemesterLabel(semObj)
                      : (sae.semesterId ? 'S?' : '—');
                    // La SAE retourne sae.thematic en string directement (doc)
                    const themLabel = sae.thematic || '—';

                    return (
                      <tr key={sae.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 px-5">
                          <div className="font-bold text-black max-w-[200px] truncate" title={sae.title}>{sae.title || '—'}</div>
                          {sae.isPublished !== undefined && (
                            <span className={`text-[10px] font-black uppercase ${sae.isPublished ? 'text-green-600' : 'text-gray-400'}`}>
                              {sae.isPublished ? '● Publiée' : '○ Brouillon'}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-gray-600 font-medium">{themLabel}</td>
                        <td className="py-4 px-5 text-center">
                          <span className="inline-block px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-800 text-[11px] font-black uppercase rounded-md">
                            {semLabel}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          {sae.tdGroup
                            ? <span className="inline-block px-2.5 py-1 bg-black text-white text-[11px] font-black uppercase rounded-md">Groupe {sae.tdGroup}</span>
                            : <span className="text-gray-300 text-xs">—</span>
                          }
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-sm font-medium text-gray-700 truncate block max-w-[160px]">
                            {getUserFullName(sae.createdBy)}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center text-xs text-gray-500 font-medium">
                          {sae.createdAt ? new Date(sae.createdAt).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center">
                            {/* Supprimer — seule action disponible après création */}
                            <button
                              onClick={() => handleDelete(sae.id)}
                              className="text-[11px] font-bold uppercase bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 px-3 py-1.5 rounded-lg transition"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Compteur */}
            {!isLoading && (
              <p className="text-xs text-gray-400 font-medium text-right">
                {filteredSaeList.length} SAE{filteredSaeList.length > 1 ? 's' : ''} affichée{filteredSaeList.length > 1 ? 's' : ''}
                {saeList.length !== filteredSaeList.length ? ` sur ${saeList.length} au total` : ''}
              </p>
            )}
          </>
        )}

        {/* ═══════════════════════ ONGLET GALERIE ═══════════════════════ */}
        {activeTab === 'galerie' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-5">
              <h2 className="text-sm font-black uppercase text-gray-800 tracking-wide">Modération de la Galerie étudiante</h2>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl">
                <div className="text-[11px] font-black uppercase tracking-wider text-gray-500">Supprimer par année :</div>
                <input
                  type="number"
                  placeholder="Année (ex: 2023)"
                  value={deleteGalleryYear}
                  onChange={e => setDeleteGalleryYear(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 text-center font-bold bg-white outline-none focus:border-black"
                  min="2020"
                  max="2099"
                />
                <button
                  onClick={handleBatchDeleteGallery}
                  disabled={!deleteGalleryYear || isBulkDeletingGallery}
                  className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase px-4 py-2 rounded-lg transition disabled:opacity-40 flex items-center gap-1.5"
                >
                  {isBulkDeletingGallery && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Supprimer tout
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <SharedGallery 
                canModerate={true} 
                isAdminView={true} 
                refreshTrigger={refreshGallery} 
                onDelete={handleDeleteSubmission} 
              />
            </div>
          </div>
        )}
      </main>

      {/* ── Modale Créer ── */}
      {showCreateModal && (
        <SaeFormModal
          saeList={saeList}
          semesters={semesters}
          thematics={displayThematics}
          banners={banners}
          teachers={teachers}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
