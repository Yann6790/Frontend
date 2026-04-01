import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Edit3, Save, Eye, EyeOff, FolderPlus, Folder, FileText, Plus, Trash2,
  Calendar, Download, Image as ImageIcon, CheckCircle2, AlertCircle, Clock,
  Search, ChevronLeft, UploadCloud, MessageSquare, UserPlus, X, Users,
  BarChart2, CheckSquare, Pencil, GripVertical, Megaphone, Info, ExternalLink,
  ClipboardList
} from 'lucide-react';
import { saeService } from '../services/sae.service';
import { resourcesService } from '../services/resources.service';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function toLocalDatetimeValue(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─────────────────────────────────────────────────────────────────
// Composant Principal
// ─────────────────────────────────────────────────────────────────
export default function TeacherSaeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── App States ──
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [activePhaseId, setActivePhaseId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // ── Data ──
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [documentsList, setDocumentsList] = useState([]);
  const [milestonesList, setMilestonesList] = useState([]);
  // progressDashboard : { milestones: [{ id, title, progresses: [{studentId, isReached, reachedAt, message}] }] }
  const [progressDashboard, setProgressDashboard] = useState({ milestones: [] });
  // milestoneStats : { totalStudents, milestonesCount, studentsStats, milestonesStats, globalProgress }
  const [milestoneStats, setMilestoneStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Milestone inline editing ──
  const [editingPhaseId, setEditingPhaseId] = useState(null);
  const [editPhaseData, setEditPhaseData] = useState({});
  const [isSavingPhase, setIsSavingPhase] = useState(false);

  // ── Invitations ──
  const [invitations, setInvitations] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');

  // ── Thématiques ──
  const [allThematics, setAllThematics] = useState([]);

  // ── Bannières preset ──
  const [allBanners, setAllBanners] = useState([]);
  const [showBannerPicker, setShowBannerPicker] = useState(false);

  // ── Rendus & Notation ──
  const [submissionsList, setSubmissionsList] = useState([]);
  const [gradeCategories, setGradeCategories] = useState([]);
  const [allGrades, setAllGrades] = useState([]); // Array of { submissionId, studentName, grades: [...], average }
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [localGrades, setLocalGrades] = useState({}); // { categoryId: value }
  const [isSavingGrades, setIsSavingGrades] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // ── Upload ──
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const bannerDropRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────
  // Chargement initial
  // ─────────────────────────────────────────────────────────────────
  const loadSaeData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [saeRes, docsRes, msRes, invRes] = await Promise.allSettled([
        saeService.getSaeById(id),
        saeService.getSaeDocuments(id),
        saeService.getSaeMilestones(id),
        saeService.getInvitations(id),
      ]);

      const saeObj = saeRes.status === 'fulfilled' ? (saeRes.value?.data || saeRes.value) : null;
      if (!saeObj) { alert("Erreur de chargement de la SAE."); navigate('/teacher-dashboard'); return; }

      // Normaliser la thématique
      const normalizeThematic = (raw) => {
        if (!raw) return [];
        const arr = Array.isArray(raw) ? raw : [raw];
        return arr.map(t => {
          if (typeof t === 'string') return t;
          return t.label ?? t.code ?? t.name ?? t.id ?? String(t);
        });
      };

      const saeData = { ...saeObj, thematic: normalizeThematic(saeObj.thematic) };
      setFormData(saeData);
      setOriginalData(saeData);

      setDocumentsList(docsRes.status === 'fulfilled' ? (Array.isArray(docsRes.value) ? docsRes.value : docsRes.value?.data || []) : []);

      const ms = msRes.status === 'fulfilled' ? (Array.isArray(msRes.value) ? msRes.value : msRes.value?.data || []) : [];
      const sortedMs = [...ms].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
      setMilestonesList(sortedMs);
      if (sortedMs.length > 0) setActivePhaseId(sortedMs[0].id);

      setInvitations(invRes.status === 'fulfilled' ? (Array.isArray(invRes.value) ? invRes.value : invRes.value?.data || []) : []);

      // Charger les rendus et notes
      Promise.allSettled([
        saeService.getSubmissions(id),
        saeService.getGradeCategories(id),
        saeService.getGrades(id),
        saeService.getMilestoneProgressDashboard(id),
        saeService.getMilestoneStats(id),
      ]).then(([subsRes, catsRes, gradesRes, dashRes, statsRes]) => {
        if (subsRes.status === 'fulfilled') setSubmissionsList(subsRes.value?.data || subsRes.value || []);
        if (catsRes.status === 'fulfilled') setGradeCategories(catsRes.value?.data || catsRes.value || []);
        if (gradesRes.status === 'fulfilled') setAllGrades(gradesRes.value?.data || gradesRes.value || []);
        
        if (dashRes.status === 'fulfilled') {
          const val = dashRes.value?.data || dashRes.value;
          const milestonesArr = val?.milestones || (Array.isArray(val) ? val : []);
          setProgressDashboard({ milestones: milestonesArr });
        }
        if (statsRes.status === 'fulfilled') {
          setMilestoneStats(statsRes.value?.data || statsRes.value || null);
        }
      });
    } catch (err) {
      console.error("Erreur de chargement", err);
      if (err.status === 403) { alert("Accès non autorisé."); }
      else { alert("Erreur lors du chargement de la SAE."); }
      navigate('/teacher-dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  const reloadMilestones = useCallback(async () => {
    const [msRes, dashRes, statsRes] = await Promise.allSettled([
      saeService.getSaeMilestones(id),
      saeService.getMilestoneProgressDashboard(id),
      saeService.getMilestoneStats(id),
    ]);
    if (msRes.status === 'fulfilled') {
      const ms = Array.isArray(msRes.value) ? msRes.value : msRes.value?.data || [];
      const sorted = [...ms].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
      setMilestonesList(sorted);
    }
    if (dashRes.status === 'fulfilled') {
      const val = dashRes.value?.data || dashRes.value;
      const milestonesArr = val?.milestones || (Array.isArray(val) ? val : []);
      setProgressDashboard({ milestones: milestonesArr });
    }
    if (statsRes.status === 'fulfilled') {
      setMilestoneStats(statsRes.value?.data || statsRes.value || null);
    }
  }, [id]);

  useEffect(() => { loadSaeData(); }, [loadSaeData]);

  // Charger les profs et les thématiques
  useEffect(() => {
    resourcesService.getTeachers()
      .then(data => setAllTeachers(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {});
    resourcesService.getThematics()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAllThematics(list);
      })
      .catch(() => {});
    resourcesService.getBanners()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAllBanners(list);
      })
      .catch(() => {});
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Handlers : Edition
  // ─────────────────────────────────────────────────────────────────
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    setSaveMsg('');
    try {
          const patch = {};
      if (formData.title !== originalData.title) patch.title = formData.title;

      // Description : validation min 10 chars
      if (formData.description !== originalData.description) {
        if ((formData.description || '').length > 0 && (formData.description || '').length < 10) {
          setSaveMsg('Erreur : La description doit faire au moins 10 caractères.');
          setIsSaving(false);
          return;
        }
        patch.description = formData.description;
      }

      // Instructions : validation min 10 chars
      if (formData.instructions !== originalData.instructions) {
        if ((formData.instructions || '').length > 0 && (formData.instructions || '').length < 10) {
          setSaveMsg('Erreur : Les instructions doivent faire au moins 10 caractères.');
          setIsSaving(false);
          return;
        }
        patch.instructions = formData.instructions;
      }

      if (formData.dueDate !== originalData.dueDate) patch.dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;

      // Thématique : envoyer l'ID (thematicId) et non la valeur texte
      const currentThematics = Array.isArray(formData.thematic) ? formData.thematic : formData.thematic ? [formData.thematic] : [];
      const originalThematics = Array.isArray(originalData.thematic) ? originalData.thematic : originalData.thematic ? [originalData.thematic] : [];
      if (JSON.stringify(currentThematics) !== JSON.stringify(originalThematics) && currentThematics.length > 0) {
        // Retrouver l'ID depuis allThematics en matchant sur le label
        const firstLabel = currentThematics[0];
        const found = allThematics.find(th => {
          const lbl = typeof th === 'string' ? th : (th?.label ?? th?.code ?? th?.name ?? '');
          return lbl === firstLabel;
        });
        if (found?.id) patch.thematicId = found.id;
      }

      // Bannière : envoyer l'ID (bannerId) et non l'URL
      if (formData.bannerId && formData.bannerId !== originalData.bannerId) {
        patch.bannerId = formData.bannerId;
      }

      if (Object.keys(patch).length > 0) {
        const res = await saeService.updateSae(id, patch);
        const updated = res?.data || res;
        const merged = { ...formData, ...updated };
        setFormData(merged);
        setOriginalData(merged);
        setSaveMsg('Modifications enregistrées avec succès !');
      } else {
        setSaveMsg('Aucune modification détectée.');
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur sauvegarde', err);
      setSaveMsg(`Erreur : ${err.message || 'Impossible de sauvegarder.'}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  const handleCancel = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
  };

  // ─────────────────────────────────────────────────────────────────
  // Handlers : Publication
  // ─────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir publier cette SAE ? Les étudiants pourront la voir.')) return;
    try {
      await saeService.publishSae(id);
      setFormData(prev => ({ ...prev, isPublished: true, status: 'ongoing' }));
      setOriginalData(prev => ({ ...prev, isPublished: true, status: 'ongoing' }));
      setSaveMsg('SAE publiée avec succès !');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      alert(`Erreur : ${err.message || 'Impossible de publier.'}`);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Handlers : Banner Drag & Drop
  // ─────────────────────────────────────────────────────────────────
  const handleBannerFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) { alert('Fichier invalide. Sélectionnez une image.'); return; }
    setIsUploadingBanner(true);
    try {
      const result = await resourcesService.uploadImage(file);
      const url = result?.url || result?.data?.url;
      if (url) {
        setFormData(prev => ({ ...prev, banner: url }));
        setSaveMsg('Image uploadée ! N\'oubliez pas de sauvegarder.');
        setTimeout(() => setSaveMsg(''), 4000);
      }
    } catch (err) {
      console.error('Upload banner error', err);
      alert('Erreur lors de l\'upload de l\'image.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleBannerFile(file);
  };
  const onBannerInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleBannerFile(file);
  };

  // ─────────────────────────────────────────────────────────────────
  // Handlers : Invitations
  // ─────────────────────────────────────────────────────────────────
  const handleInviteTeacher = async (userId) => {
    try {
      await saeService.addInvitation(id, userId);
      const invRes = await saeService.getInvitations(id);
      setInvitations(Array.isArray(invRes) ? invRes : invRes?.data || []);
      setShowInviteDropdown(false);
      setInviteSearch('');
      setSaveMsg('Professeur invité avec succès !');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(`Erreur : ${err.message || "Impossible d'inviter ce professeur."}`);
    }
  };

  const handleRemoveInvitation = async (invitationId) => {
    if (!window.confirm('Retirer ce professeur de la SAE ?')) return;
    try {
      await saeService.removeInvitation(id, invitationId);
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      alert(`Erreur : ${err.message || "Impossible de retirer l'invitation."}`);
    }
  };

  // Profs déjà invités (IDs)
  const invitedTeacherIds = new Set(invitations.map(inv => inv.userId));
  const availableTeachers = allTeachers.filter(t => {
    if (invitedTeacherIds.has(t.id)) return false;
    if (formData?.createdBy?.id === t.id) return false;
    if (inviteSearch) {
      const fullName = `${t.name?.firstname || ''} ${t.name?.lastname || ''} ${t.email || ''}`.toLowerCase();
      return fullName.includes(inviteSearch.toLowerCase());
    }
    return true;
  });

  // ─────────────────────────────────────────────────────────────────
  // Handlers : Documents
  // ─────────────────────────────────────────────────────────────────
  const handleDocumentUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploadingDoc(true);
      const file = e.target.files[0];
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('saeId', id);
      formDataUpload.append('type', 'RESOURCE');
      try {
        await saeService.uploadSaeResource(formDataUpload);
        const docsRes = await saeService.getSaeDocuments(id);
        setDocumentsList(Array.isArray(docsRes) ? docsRes : docsRes?.data || []);
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'envoi du document");
      } finally {
        setIsUploadingDoc(false);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Handlers : Phases
  // ─────────────────────────────────────────────────────────────────
  const handleAddPhase = async () => {
    try {
      const nextPos = milestonesList.length + 1;
      const newPhase = {
        title: `Nouveau Palier ${nextPos}`,
        description: '',
        position: nextPos,
      };
      await saeService.createMilestone(id, newPhase);
      await reloadMilestones();
    } catch (err) {
      alert("Erreur lors de l'ajout du palier");
    }
  };

  const handleEditPhase = (phase) => {
    setEditingPhaseId(phase.id);
    setEditPhaseData({ title: phase.title, description: phase.description || '', position: phase.position });
  };

  const handleCancelEditPhase = () => {
    setEditingPhaseId(null);
    setEditPhaseData({});
  };

  const handleSavePhase = async (phaseId) => {
    setIsSavingPhase(true);
    try {
      await saeService.updateMilestone(id, phaseId, editPhaseData);
      setEditingPhaseId(null);
      setEditPhaseData({});
      await reloadMilestones();
    } catch (err) {
      alert(`Erreur : ${err.message || 'Impossible de sauvegarder le palier.'}`);
    } finally {
      setIsSavingPhase(false);
    }
  };

  const handleDeletePhase = async (phaseId) => {
    if (!window.confirm('Supprimer ce palier ? Cette action est irréversible.')) return;
    try {
      await saeService.deleteMilestone(id, phaseId);
      if (activePhaseId === phaseId) setActivePhaseId(null);
      await reloadMilestones();
    } catch (err) {
      alert(`Erreur : ${err.message || 'Impossible de supprimer le palier.'}`);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Handlers : Notation & Rendus
  // ─────────────────────────────────────────────────────────────────
  const openGradingModal = (submission) => {
    setSelectedSubmission(submission);
    // Rechercher les notes existantes pour cet étudiant
    const existingEntry = allGrades.find(g => g.submissionId === submission.id);
    const initialGrades = {};
    if (existingEntry && existingEntry.grades) {
      existingEntry.grades.forEach(g => {
        initialGrades[g.categoryId] = g.value;
      });
    }
    setLocalGrades(initialGrades);
    setIsGradingModalOpen(true);
  };

  const handleGradeChange = (categoryId, value) => {
    const val = parseFloat(value);
    setLocalGrades(prev => ({
      ...prev,
      [categoryId]: isNaN(val) ? '' : val
    }));
  };

  const saveGrades = async () => {
    if (!selectedSubmission) return;
    setIsSavingGrades(true);
    try {
      const gradesArray = Object.entries(localGrades)
        .filter(([_, value]) => value !== '')
        .map(([categoryId, value]) => ({ categoryId, value }));

      await saeService.setSubmissionGrades(selectedSubmission.id, { grades: gradesArray });
      
      // Recharger les notes
      const gradesRes = await saeService.getGrades(id);
      setAllGrades(gradesRes.value?.data || gradesRes.value || []);
      
      setIsGradingModalOpen(false);
      setSaveMsg('Notes enregistrées avec succès !');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(`Erreur : ${err.message || 'Impossible d\'enregistrer les notes.'}`);
    } finally {
      setIsSavingGrades(false);
    }
  };

  const handleExportGrades = async () => {
    setIsExporting(true);
    try {
      // Pour l'export, on ouvre directement l'URL car c'est un fichier
      window.open(`${import.meta.env.VITE_API_URL || ''}/api/saes/${id}/grades/export`, '_blank');
    } catch (err) {
      alert("Erreur lors de l'export.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportGrades = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const formDataImport = new FormData();
    formDataImport.append('file', file);
    try {
      await saeService.importGrades(id, formDataImport);
      const gradesRes = await saeService.getGrades(id);
      setAllGrades(gradesRes.value?.data || gradesRes.value || []);
      setSaveMsg('Notes importées avec succès !');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(`Erreur : ${err.message || 'Erreur lors de l\'import.'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSubmissionVisibility = async (submissionId, isPublic) => {
    try {
      await saeService.updateAllSubmissionsVisibility(id, isPublic); // Note: Should probably be individual toggle based on ID if available
      // But the service has updateAllSubmissionsVisibility(saeId, isPublic). 
      // Documentation 33 says PATCH /api/saes/:saeId/submissions/:submissionId/visibility is possible.
      // Let's add it to service if needed, but for now let's use what we have or reload.
      const subsRes = await saeService.getSubmissions(id);
      setSubmissionsList(subsRes.value?.data || subsRes.value || []);
    } catch (err) {
      alert("Erreur lors du changement de visibilité.");
    }
  };
  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!formData) return null;

  const statusBadge = {
    draft: { label: 'Brouillon', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    upcoming: { label: 'À venir', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    ongoing: { label: 'En cours', cls: 'bg-green-100 text-green-700 border-green-200' },
    finished: { label: 'Terminée', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  };
  const badge = statusBadge[formData.status] || statusBadge.draft;

  return (
    <div className="flex-1 min-h-screen bg-slate-50 font-montserrat pb-20">

      {/* ── Header bar ── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full">
          <Link to="/teacher-dashboard" className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors shrink-0" title="Retour au Dashboard">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest truncate">Gestion de SAE</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 truncate">{formData.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Publier */}
          {!formData.isPublished && !isEditing && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-lg transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Publier</span>
            </button>
          )}
          {formData.isPublished && !isEditing && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Publiée
            </span>
          )}

          {/* Edition */}
          {!isEditing ? (
            <button
              onClick={() => { setIsEditing(true); setActiveTab('details'); }}
              className="flex items-center gap-2 py-2 px-5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Éditer la SAE</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="py-2 px-5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg shadow-sm transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 py-2 px-5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Save feedback ── */}
      {saveMsg && (
        <div className={`mx-4 sm:mx-6 lg:mx-8 mt-4 px-4 py-3 rounded-lg text-sm font-bold border ${saveMsg.startsWith('Erreur') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {saveMsg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

        {/* ── Tabs ── */}
        <div className={`flex flex-col sm:flex-row gap-2 border-b-2 border-gray-200 pb-px ${isEditing ? 'opacity-50 pointer-events-none' : ''}`}>
          {[
            { id: 'details', label: 'Détails & Configuration' },
            { id: 'team', label: 'Équipe Pédagogique', badge: invitations.length },
            { id: 'tracking', label: 'Suivi des Phases' },
            { id: 'rendus', label: 'Rendus Finaux', badge: submissionsList.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-6 font-bold text-sm md:text-base border-b-4 transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════
            TAB : DETAILS & CONFIGURATION
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'details' && (
          <div className="flex flex-col gap-10">

            {/* Présentation */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" strokeWidth={1.5} /> Présentation
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left column */}
                <div className="flex flex-col gap-5">
                  {/* Titre */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700">Titre de la SAE</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={e => handleFieldChange('title', e.target.value)}
                        className="text-lg font-bold text-gray-900 bg-white p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    ) : (
                      <p className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-lg border border-transparent">{formData.title}</p>
                    )}
                  </div>

                  {/* Thématique */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="font-bold text-gray-700">Matière(s)</label>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        {/* Tags sélectionnés */}
                        <div className="flex flex-wrap gap-2 min-h-[36px]">
                          {(Array.isArray(formData.thematic) ? formData.thematic : formData.thematic ? [formData.thematic] : []).map(t => {
                            const label = typeof t === 'string' ? t : (t?.label ?? t?.code ?? t?.name ?? String(t));
                            return (
                              <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                {label}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = Array.isArray(formData.thematic) ? formData.thematic : formData.thematic ? [formData.thematic] : [];
                                    handleFieldChange('thematic', current.filter(x => {
                                      const xl = typeof x === 'string' ? x : (x?.label ?? x?.code ?? x?.name ?? String(x));
                                      return xl !== label;
                                    }));
                                  }}
                                  className="ml-1 text-blue-500 hover:text-red-600 transition-colors"
                                ><X className="w-3 h-3" /></button>
                              </span>
                            );
                          })}
                          {(Array.isArray(formData.thematic) ? formData.thematic : formData.thematic ? [formData.thematic] : []).length === 0 && (
                            <span className="text-gray-400 text-sm italic self-center">Aucune matière sélectionnée</span>
                          )}
                        </div>
                        {/* Dropdown de sélection */}
                        {allThematics.length > 0 ? (
                          <select
                            className="bg-white p-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            value=""
                            onChange={e => {
                              const val = e.target.value;
                              if (!val) return;
                              const current = Array.isArray(formData.thematic) ? formData.thematic : formData.thematic ? [formData.thematic] : [];
                              const labels = current.map(x => typeof x === 'string' ? x : (x?.label ?? x?.code ?? x?.name ?? String(x)));
                              if (!labels.includes(val)) handleFieldChange('thematic', [...current, val]);
                            }}
                          >
                            <option value="">+ Ajouter une matière...</option>
                            {allThematics.map(th => {
                              const thLabel = typeof th === 'string' ? th : (th?.label ?? th?.code ?? th?.name ?? th?.id ?? String(th));
                              return <option key={th?.id ?? thLabel} value={thLabel}>{thLabel}</option>;
                            })}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="Saisir une matière et appuyer sur Entrée"
                            className="bg-white p-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                e.preventDefault();
                                const val = e.target.value.trim();
                                const current = Array.isArray(formData.thematic) ? formData.thematic : formData.thematic ? [formData.thematic] : [];
                                const labels = current.map(x => typeof x === 'string' ? x : (x?.label ?? x?.code ?? x?.name ?? String(x)));
                                if (!labels.includes(val)) handleFieldChange('thematic', [...current, val]);
                                e.target.value = '';
                              }
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {(Array.isArray(formData.thematic) ? formData.thematic : formData.thematic ? [formData.thematic] : []).map(t => {
                          const label = typeof t === 'string' ? t : (t?.label ?? t?.code ?? t?.name ?? String(t));
                          return <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border bg-blue-50 text-blue-800 border-blue-100">{label}</span>;
                        })}
                        {!(Array.isArray(formData.thematic) ? formData.thematic.length > 0 : formData.thematic) && (
                          <span className="text-gray-400 text-sm italic">Aucune matière définie</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="font-bold text-gray-700">Description détaillée</label>
                    {isEditing ? (
                      <textarea
                        value={formData.description || ''}
                        onChange={e => handleFieldChange('description', e.target.value)}
                        rows={5}
                        className="text-gray-700 text-sm leading-relaxed bg-white p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y"
                      />
                    ) : (
                      <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-transparent min-h-[120px]">{formData.description || "Aucune description fournie."}</p>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="font-bold text-gray-700">Instructions pour les étudiants</label>
                    {isEditing ? (
                      <textarea
                        value={formData.instructions || ''}
                        onChange={e => handleFieldChange('instructions', e.target.value)}
                        rows={4}
                        placeholder="Consignes, format de rendu, critères d'évaluation..."
                        className="text-gray-700 text-sm leading-relaxed bg-white p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y"
                      />
                    ) : (
                      <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-transparent min-h-[80px]">{formData.instructions || "Aucune instruction fournie."}</p>
                    )}
                  </div>
                </div>

                {/* Right column: Banner Picker */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-700">Image de couverture</label>
                    {isEditing && (
                      <button 
                        onClick={() => setShowBannerPicker(!showBannerPicker)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {showBannerPicker ? "Fermer la sélection" : "Changer l'image"}
                      </button>
                    )}
                  </div>

                  {isEditing && showBannerPicker ? (
                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 max-h-[300px] overflow-y-auto">
                      {allBanners.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, banner: b.url, bannerId: b.id }));
                            setShowBannerPicker(false);
                          }}
                          className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${formData.bannerId === b.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-indigo-400'}`}
                        >
                          <img src={b.url} alt={b.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <div className={`absolute inset-0 bg-indigo-600/20 transition-opacity ${formData.bannerId === b.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
                          {formData.bannerId === b.id && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </button>
                      ))}
                      {allBanners.length === 0 && (
                        <p className="col-span-2 text-center text-sm text-gray-500 py-4 italic">Chargement des bannières...</p>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md bg-gray-100 relative group">
                      {formData.banner ? (
                        <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="w-12 h-12 mb-2" />
                          <span className="text-sm font-medium">Aucune image sélectionnée</span>
                        </div>
                      )}
                      {isEditing && !showBannerPicker && (
                        <div 
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          onClick={() => setShowBannerPicker(true)}
                        >
                          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white font-bold text-sm">
                            Cliquer pour changer
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {isEditing && (
                    <p className="text-[10px] text-gray-500 italic">
                      Note: Le système propose une sélection d'images optimisées pour l'affichage des SAE.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Date de rendu */}
            <div className={`bg-gradient-to-br rounded-xl p-6 shadow-sm border flex flex-col md:flex-row gap-8 items-start ${isEditing ? 'from-indigo-50 to-purple-50 border-indigo-100' : 'from-white to-gray-50 border-gray-200'}`}>
              <div className="flex-1 flex flex-col gap-4 w-full">
                <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Date de Rendu Finale
                </h3>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={toLocalDatetimeValue(formData.dueDate)}
                    onChange={e => handleFieldChange('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="bg-white p-3 border border-gray-300 rounded-xl font-mono text-gray-800 font-bold w-max shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                ) : (
                  <div className="bg-white p-4 border border-gray-200 rounded-xl font-mono text-gray-800 font-bold w-max shadow-sm">
                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Non définie'}
                  </div>
                )}
                <p className="text-sm text-indigo-700 font-medium">C'est la date limite globale appliquée pour le bloc complet "Rendre la SAE".</p>
              </div>
            </div>

            {/* Paliers — édition inline complète */}
            <div className={`rounded-xl p-6 shadow-sm border ${isEditing ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" strokeWidth={1.5} /> Gestion des Paliers
                </h2>
                <button onClick={handleAddPhase} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                  <Plus className="w-5 h-5" /> Ajouter un palier
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {milestonesList.map((phase, pIdx) => (
                  <div key={phase.id} className={`p-5 border rounded-xl flex flex-col gap-4 transition-all ${editingPhaseId === phase.id ? 'bg-indigo-50/50 border-indigo-300 shadow-sm' : 'bg-white border-gray-100 shadow-sm hover:border-indigo-200'}`}>
                    {editingPhaseId === phase.id ? (
                      /* ── Mode édition inline ── */
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="flex items-center justify-center bg-indigo-600 text-white font-black w-10 h-10 rounded-full text-lg shrink-0">{pIdx + 1}</div>
                          <span className="font-bold text-sm text-indigo-700 uppercase tracking-widest">Modification du palier</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Titre</label>
                            <input
                              type="text"
                              value={editPhaseData.title || ''}
                              onChange={e => setEditPhaseData(p => ({ ...p, title: e.target.value }))}
                              className="bg-white p-2.5 border border-gray-300 rounded-lg text-gray-900 font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                              placeholder="Titre du palier"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Position (ordre)</label>
                            <input
                              type="number"
                              min={1}
                              value={editPhaseData.position ?? pIdx + 1}
                              onChange={e => setEditPhaseData(p => ({ ...p, position: parseInt(e.target.value) || 1 }))}
                              className="bg-white p-2.5 border border-gray-300 rounded-lg text-gray-900 font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none w-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description (optionnel)</label>
                          <textarea
                            value={editPhaseData.description || ''}
                            onChange={e => setEditPhaseData(p => ({ ...p, description: e.target.value }))}
                            rows={3}
                            placeholder="Décrivez ce que les étudiants doivent accomplir durant ce palier..."
                            className="bg-white p-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-y"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-2 border-t border-indigo-100">
                          <button
                            onClick={() => handleSavePhase(phase.id)}
                            disabled={isSavingPhase || !editPhaseData.title}
                            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                          >
                            {isSavingPhase ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{isSavingPhase ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                          </button>
                          <button
                            onClick={handleCancelEditPhase}
                            className="px-5 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Mode lecture ── */
                      <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex items-center justify-center bg-indigo-100 text-indigo-800 font-black w-12 h-12 rounded-full text-xl shrink-0 mt-1">
                          {phase.position ?? pIdx + 1}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{phase.title}</h3>
                          {phase.description ? (
                            <p className="text-gray-500 text-sm mt-1.5">{phase.description}</p>
                          ) : (
                            <p className="text-gray-300 text-sm mt-1 italic">Aucune description</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEditPhase(phase)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Modifier
                          </button>
                          <button
                            onClick={() => handleDeletePhase(phase.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {milestonesList.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-3">
                    <CheckSquare className="w-10 h-10 text-gray-300" />
                    <p className="text-gray-600 font-bold">Aucun palier configuré</p>
                    <p className="text-gray-400 text-sm max-w-sm">La SAE se déroulera en un seul bloc sans étapes intermédiaires.</p>
                    <button onClick={handleAddPhase} className="mt-2 flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                      <Plus className="w-4 h-4" /> Créer le premier palier
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ressources */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-indigo-600" strokeWidth={1.5} /> Ressources et Consignes
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-4 relative">
                  <div className="flex flex-col gap-2 mt-1">
                    {documentsList.map((fichier, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm relative group">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          <a href={fichier.url} target="_blank" rel="noreferrer" className="hover:text-indigo-600">{fichier.name || `Document ${fIdx + 1}`}</a>
                        </span>
                      </div>
                    ))}

                    {isEditing && (
                      <div className="mt-2 text-sm">
                        <input type="file" id="upload-doc" className="hidden" onChange={handleDocumentUpload} />
                        <button onClick={() => document.getElementById('upload-doc').click()} disabled={isUploadingDoc} className="flex items-center justify-center gap-2 p-2.5 mt-1 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm font-bold w-full uppercase">
                          {isUploadingDoc ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                          {isUploadingDoc ? "Upload en cours..." : "Ajouter un fichier"}
                        </button>
                      </div>
                    )}

                    {documentsList.length === 0 && !isEditing && (
                      <p className="text-center text-gray-400 text-sm py-4">Aucun document n'a été ajouté pour le moment.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB : ÉQUIPE PÉDAGOGIQUE
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'team' && (
          <div className="flex flex-col gap-6 animate-fade-in">

            {/* Prof principal */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Professeur Principal (Propriétaire)
              </h2>
              <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                  {(formData.createdBy?.name?.firstname?.[0] || 'P').toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{formData.createdBy?.name?.firstname} {formData.createdBy?.name?.lastname}</p>
                  <p className="text-sm text-gray-500">{formData.createdBy?.email}</p>
                </div>
                <span className="ml-auto text-xs font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full uppercase">Propriétaire</span>
              </div>
            </div>

            {/* Profs invités */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" /> Professeurs Invités
                </h2>
                <div className="relative">
                  <button
                    onClick={() => setShowInviteDropdown(!showInviteDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> Inviter
                  </button>

                  {showInviteDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                          <Search className="w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Rechercher un professeur..."
                            value={inviteSearch}
                            onChange={e => setInviteSearch(e.target.value)}
                            className="bg-transparent text-sm outline-none flex-1"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-[240px] overflow-y-auto">
                        {availableTeachers.length === 0 && (
                          <p className="text-center text-gray-400 text-sm py-6">Aucun professeur disponible</p>
                        )}
                        {availableTeachers.map(t => (
                          <button
                            key={t.id}
                            onClick={() => handleInviteTeacher(t.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center shrink-0">
                              {(t.name?.firstname?.[0] || '?').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">{t.name?.firstname} {t.name?.lastname}</p>
                              <p className="text-xs text-gray-400 truncate">{t.email}</p>
                            </div>
                            <Plus className="w-4 h-4 text-indigo-500 shrink-0" />
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => { setShowInviteDropdown(false); setInviteSearch(''); }}
                        className="w-full py-2 text-center text-xs font-bold text-gray-400 hover:text-gray-600 border-t border-gray-100"
                      >
                        Fermer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {invitations.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun professeur invité pour le moment.</p>
                  <p className="text-gray-400 text-sm mt-1">Invitez des collègues pour co-gérer cette SAE.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {invitations.map(inv => (
                    <div key={inv.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 group hover:border-gray-200 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-300 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {(inv.name?.firstname?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{inv.name?.firstname} {inv.name?.lastname}</p>
                        <p className="text-xs text-gray-400">Invité le {new Date(inv.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveInvitation(inv.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600"
                        title="Retirer de la SAE"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB : SUIVI DES PALIERS
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'tracking' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {milestonesList.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100 flex flex-col items-center">
                <CheckSquare className="w-12 h-12 text-gray-300 mb-4" strokeWidth={1.5} />
                <h2 className="text-xl font-black text-gray-800 mb-2">Aucun palier configuré</h2>
                <p className="text-gray-500 max-w-md text-sm">Les étudiants ne peuvent pas soumettre de journaux de bord. Ajoutez des paliers depuis l'onglet <strong>Détails</strong> en mode Édition.</p>
              </div>
            ) : (
              <>
                {/* ── Stats globales ── */}
                {milestoneStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Étudiants', value: milestoneStats.totalStudents ?? '—', icon: Users, color: 'indigo' },
                      { label: 'Paliers', value: milestoneStats.milestonesCount ?? milestonesList.length, icon: CheckSquare, color: 'purple' },
                      { label: 'Moy. validés', value: milestoneStats.globalProgress?.averageValidated != null ? milestoneStats.globalProgress.averageValidated.toFixed(1) : '—', icon: BarChart2, color: 'blue' },
                      { label: 'Complétion', value: milestoneStats.globalProgress?.completionRate != null ? `${milestoneStats.globalProgress.completionRate.toFixed(0)} %` : '—', icon: CheckCircle2, color: 'green' },
                    ].map(stat => (
                      <div key={stat.label} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1`}>
                        <stat.icon className={`w-5 h-5 text-${stat.color}-500 mb-1`} strokeWidth={1.5} />
                        <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Sélecteur de palier ── */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] ml-2 mr-2">Palier</span>
                  {milestonesList.map((p, idx) => {
                    const dashEntry = progressDashboard.milestones.find(m => m.id === p.id);
                    const count = dashEntry?.progresses?.filter(pr => pr.isReached)?.length ?? 0;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActivePhaseId(p.id)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border flex items-center gap-2 ${activePhaseId === p.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'}`}
                      >
                        <span>Palier {idx + 1} — {p.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activePhaseId === p.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ── Détail du palier sélectionné ── */}
                {milestonesList.filter(p => p.id === activePhaseId).map((phase, idx) => {
                  const dashEntry = progressDashboard.milestones.find(m => m.id === phase.id);
                  const progresses = dashEntry?.progresses || [];
                  const reached = progresses.filter(pr => pr.isReached);

                  // Stats de ce palier depuis milestoneStats
                  const phaseStat = milestoneStats?.milestonesStats?.find(ms => ms.milestoneId === phase.id);

                  return (
                    <div key={phase.id} className="flex flex-col gap-6">
                      {/* Header du palier */}
                      <div className="bg-indigo-900 rounded-2xl p-7 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                        <div className="relative z-10 flex flex-col text-center md:text-left">
                          <div className="bg-indigo-500/30 text-indigo-100 font-bold uppercase text-xs tracking-widest px-3 py-1 rounded-full w-max mb-3 mx-auto md:mx-0 border border-indigo-400/30">Palier {idx + 1}</div>
                          <h2 className="text-2xl font-black text-white tracking-tight mb-1">{phase.title}</h2>
                          {phase.description && <p className="text-indigo-200 text-sm font-medium">{phase.description}</p>}
                        </div>
                        <div className="relative z-10 flex gap-4">
                          <div className="flex flex-col bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl items-center min-w-[110px]">
                            <span className="text-3xl font-black text-white">{reached.length}</span>
                            <span className="text-xs font-bold text-indigo-200 mt-1 text-center">Soumissions</span>
                          </div>
                          {phaseStat && (
                            <div className="flex flex-col bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl items-center min-w-[110px]">
                              <span className="text-3xl font-black text-white">{phaseStat.percentage?.toFixed(0) ?? '—'}%</span>
                              <span className="text-xs font-bold text-indigo-200 mt-1 text-center">Complétion</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Grille des progressions */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {reached.map(prog => (
                          <div key={prog.id ?? prog.studentId} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black text-base flex items-center justify-center shrink-0">
                                  {(prog.firstname?.[0] || prog.studentName?.firstname?.[0] || '?').toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-black text-gray-900 text-sm leading-tight">
                                    {prog.firstname && prog.lastname
                                      ? `${prog.firstname} ${prog.lastname}`
                                      : prog.studentName
                                        ? `${prog.studentName.firstname || ''} ${prog.studentName.lastname || ''}`.trim()
                                        : `Étudiant ${prog.studentId?.slice(0, 8) ?? '?'}`}
                                  </h4>
                                  {prog.reachedAt && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      Soumis le {new Date(prog.reachedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 shrink-0">✓ Validé</span>
                            </div>
                            {prog.message ? (
                              <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Journal de bord</span>
                                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 italic max-h-[120px] overflow-y-auto">
                                  "{prog.message}"
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-300 text-sm italic">Aucun message laissé.</p>
                            )}
                          </div>
                        ))}
                        {reached.length === 0 && (
                          <div className="col-span-full py-10 text-center bg-white border border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2">
                            <Users className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                            <p className="text-gray-500 font-medium">Aucune soumission pour ce palier.</p>
                            <p className="text-gray-400 text-sm">Les étudiants n'ont pas encore validé ce palier.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB : RENDUS FINAUX
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'rendus' && (
          <div className="flex flex-col gap-6 animate-fade-in pb-20">
            {/* Header avec Actions globales et Statut de notation */}
            {(() => {
              const deadlineDate = formData.dueDate ? new Date(formData.dueDate) : null;
              const isDeadlinePassed = deadlineDate ? new Date() >= deadlineDate : false;
              const timeUntilGrading = deadlineDate ? deadlineDate.getTime() - new Date().getTime() : 0;
              const daysLeft = Math.ceil(timeUntilGrading / (1000 * 60 * 60 * 24));

              return (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row justify-between items-center bg-indigo-900 rounded-2xl p-6 lg:p-8 shadow-lg overflow-hidden relative">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-black text-white tracking-tight">Gestion des Rendus</h2>
                        {isDeadlinePassed ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 text-[10px] font-black uppercase rounded-full border border-green-500/30">Notation Ouverte</span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase rounded-full border border-amber-500/30">En attente de rendu</span>
                        )}
                      </div>
                      <p className="text-indigo-200 font-medium text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" /> {submissionsList.length} projets déposés • {!isDeadlinePassed && daysLeft > 0 ? `Notation possible dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : 'Vous pouvez maintenant noter les étudiants.'}
                      </p>
                    </div>
                    
                    <div className="relative z-10 flex flex-wrap justify-center gap-3">
                      <button 
                        onClick={handleExportGrades}
                        disabled={isExporting}
                        className="flex items-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 backdrop-blur transition-all disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        Exporter Notes
                      </button>
                      
                      <label className="flex items-center gap-2 py-2.5 px-5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-sm rounded-xl border border-indigo-100 shadow-sm cursor-pointer transition-all">
                        <UploadCloud className="w-4 h-4" />
                        Importer Notes
                        <input type="file" className="hidden" accept=".xlsx" onChange={handleImportGrades} disabled={isImporting} />
                      </label>
                    </div>
                  </div>

                  {/* Tableau des Rendus */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Étudiant</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Dépôt</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Score Moyen</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {submissionsList.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="p-4 bg-gray-50 rounded-full">
                                    <FileText className="w-8 h-8 text-gray-300" />
                                  </div>
                                  <p className="text-gray-400 font-bold italic">Aucun rendu déposé pour le moment.</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            submissionsList.map(sub => {
                              const gradeEntry = allGrades.find(g => g.submissionId === sub.id);
                              const isLate = sub.isLate;
                              
                              return (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center border border-indigo-100 uppercase text-lg shadow-sm">
                                        {sub.name?.firstname?.[0]}{sub.name?.lastname?.[0]}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-black text-gray-900 leading-tight">{sub.name?.firstname} {sub.name?.lastname}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[150px]">{sub.fileName}</span>
                                          {isLate && (
                                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] font-black uppercase rounded border border-red-200">Retard</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-black text-gray-700">
                                        {new Date(sub.submittedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                      </span>
                                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                                        à {new Date(sub.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5">
                                    {gradeEntry ? (
                                      <div className="flex flex-col">
                                        <span className="text-xl font-black text-indigo-600">
                                          {gradeEntry.average?.toFixed(1)} <span className="text-xs text-gray-300 font-bold">/ 20</span>
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-black text-gray-300 uppercase bg-gray-50 px-2 py-1 rounded border border-gray-100">Non noté</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                      <button 
                                        onClick={() => openGradingModal(sub)}
                                        disabled={!isDeadlinePassed}
                                        className={`flex items-center gap-2 py-2.5 px-6 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 ${
                                          !isDeadlinePassed 
                                            ? 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed opacity-50' 
                                            : gradeEntry 
                                              ? 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50' 
                                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
                                        }`}
                                      >
                                        {!isDeadlinePassed ? <Clock className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                                        {!isDeadlinePassed ? 'Attente Date Rendu' : gradeEntry ? 'Modifier Note' : 'Noter'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* ── Modal de Notation ── */}
      {isGradingModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-indigo-900 p-6 text-white relative">
              <button 
                onClick={() => setIsGradingModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-black text-xl border border-white/30">
                  {selectedSubmission.name?.firstname?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{selectedSubmission.name?.firstname} {selectedSubmission.name?.lastname}</h3>
                  <p className="text-indigo-200 text-sm font-medium">{selectedSubmission.fileName}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col gap-6 font-montserrat">
              {gradeCategories.length === 0 ? (
                <div className="text-center py-6 bg-amber-50 border border-amber-100 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-amber-800 font-bold text-sm">Aucune catégorie de note configurée.</p>
                  <p className="text-amber-600 text-xs mt-1">Veuillez d'abord définir des critères d'évaluation.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Critères d'évaluation</span>
                  </div>
                  
                  {gradeCategories.map(cat => (
                    <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-white transition-all">
                      <label className="font-bold text-gray-700 flex-1">{cat.name}</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={localGrades[cat.id] ?? ''}
                          onChange={(e) => handleGradeChange(cat.id, e.target.value)}
                          placeholder="—"
                          className="w-20 bg-white p-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-center font-black text-indigo-700"
                        />
                        <span className="text-xs font-black text-gray-400 uppercase">/ 20</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={saveGrades}
                disabled={isSavingGrades || gradeCategories.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isSavingGrades ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                Enregistrer la note
              </button>
              <button
                onClick={() => setIsGradingModalOpen(false)}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
