import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Edit3, Save, Eye, EyeOff, FolderPlus, Folder, FileText, Plus, Trash2,
  Calendar, Download, Image as ImageIcon, CheckCircle2, AlertCircle, Clock,
  Search, ChevronLeft, UploadCloud, MessageSquare, UserPlus, X, Users
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
  const [progressStats, setProgressStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Invitations ──
  const [invitations, setInvitations] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');

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
      const [saeRes, docsRes, msRes, statsRes, invRes] = await Promise.allSettled([
        saeService.getSaeById(id),
        saeService.getSaeDocuments(id),
        saeService.getSaeMilestones(id),
        saeService.getMilestoneProgressStats(id),
        saeService.getInvitations(id),
      ]);

      const saeObj = saeRes.status === 'fulfilled' ? (saeRes.value?.data || saeRes.value) : null;
      if (!saeObj) { alert("Erreur de chargement de la SAE."); navigate('/teacher-dashboard'); return; }

      const saeData = { ...saeObj, thematic: saeObj.thematic || '' };
      setFormData(saeData);
      setOriginalData(saeData);

      setDocumentsList(docsRes.status === 'fulfilled' ? (Array.isArray(docsRes.value) ? docsRes.value : docsRes.value?.data || []) : []);

      const ms = msRes.status === 'fulfilled' ? (Array.isArray(msRes.value) ? msRes.value : msRes.value?.data || []) : [];
      const sortedMs = ms.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setMilestonesList(sortedMs);
      if (sortedMs.length > 0) setActivePhaseId(sortedMs[0].id);

      setProgressStats(statsRes.status === 'fulfilled' ? (Array.isArray(statsRes.value) ? statsRes.value : statsRes.value?.data || []) : []);
      setInvitations(invRes.status === 'fulfilled' ? (Array.isArray(invRes.value) ? invRes.value : invRes.value?.data || []) : []);
    } catch (err) {
      console.error("Erreur de chargement", err);
      if (err.status === 403) { alert("Accès non autorisé."); }
      else { alert("Erreur lors du chargement de la SAE."); }
      navigate('/teacher-dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadSaeData(); }, [loadSaeData]);

  // Charger les profs pour les invitations
  useEffect(() => {
    resourcesService.getTeachers()
      .then(data => setAllTeachers(Array.isArray(data) ? data : data?.data || []))
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
      if (formData.description !== originalData.description) patch.description = formData.description;
      if (formData.instructions !== originalData.instructions) patch.instructions = formData.instructions;
      if (formData.dueDate !== originalData.dueDate) patch.dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;
      if (formData.banner !== originalData.banner) patch.banner = formData.banner;

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
      const nextNum = milestonesList.length + 1;
      const newPhase = {
        title: `Nouvelle Phase ${nextNum}`,
        description: "Description",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      await saeService.createMilestone(id, newPhase);
      const msRes = await saeService.getSaeMilestones(id);
      const ms = Array.isArray(msRes) ? msRes : msRes?.data || [];
      const sortedMs = ms.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setMilestonesList(sortedMs);
    } catch (err) {
      alert("Erreur ajout phase");
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
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
    <div className="flex-1 min-h-screen bg-slate-50 font-merriweather pb-20">

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
            { id: 'rendus', label: 'Rendus Finaux', badge: formData.submissionCount || 0 }
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
                    <label className="font-bold text-gray-700">Matière</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {formData.thematic && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border bg-blue-50 text-blue-800 border-blue-100">
                          {formData.thematic}
                        </span>
                      )}
                      {!formData.thematic && <span className="text-gray-400 text-sm italic">Aucune matière définie</span>}
                    </div>
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

                {/* Right column: Banner */}
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Image de couverture</label>
                  {isEditing ? (
                    <div
                      ref={bannerDropRef}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      className={`w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer relative group ${isDraggingOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                      onClick={() => document.getElementById('banner-upload-input').click()}
                    >
                      {isUploadingBanner && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                      )}
                      {formData.banner ? (
                        <>
                          <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                            <UploadCloud className="w-10 h-10 mb-2" />
                            <span className="font-bold text-sm">Glissez une image ou cliquez</span>
                            <span className="text-xs opacity-75">PNG, JPG, WEBP — max 5 MB</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <UploadCloud className="w-12 h-12 mb-3" />
                          <span className="font-bold text-sm">Glissez une image ici</span>
                          <span className="text-xs">ou cliquez pour parcourir</span>
                        </div>
                      )}
                      <input
                        id="banner-upload-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onBannerInputChange}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md">
                      {formData.banner ? (
                        <img src={formData.banner} alt="Banner SAE" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                    </div>
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

            {/* Phases */}
            <div className={`rounded-xl p-6 shadow-sm border ${isEditing ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" strokeWidth={1.5} /> Gestion des Phases (Milestones)
                </h2>
                {isEditing && (
                  <button onClick={handleAddPhase} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                    <Plus className="w-5 h-5" /> Ajouter une phase
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-5">
                {milestonesList.map((phase, pIdx) => (
                  <div key={phase.id} className={`p-5 border rounded-xl flex flex-col gap-4 relative ${isEditing ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 shadow-sm hover:border-indigo-200 transition-colors'}`}>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex items-center justify-center bg-indigo-100 text-indigo-800 font-black w-14 h-14 rounded-full text-2xl shrink-0">
                        {pIdx + 1}
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 text-xl">{phase.title}</h3>
                        <p className="text-gray-600 mt-2 italic">"{phase.description}"</p>
                      </div>
                      <div className="flex flex-col justify-center border-l border-gray-100 pl-6 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 uppercase w-12">Fin</span>
                          <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded">{new Date(phase.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {milestonesList.length === 0 && (
                  <p className="text-center text-gray-500 py-8 bg-white rounded-2xl border border-dashed border-gray-300">Aucune phase n'est configurée. La SAE se déroulera en un seul bloc.</p>
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
            TAB : SUIVI DES PHASES
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'tracking' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {milestonesList.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100 flex flex-col items-center">
                <Clock className="w-12 h-12 text-gray-300 mb-4" strokeWidth={1.5} />
                <h2 className="text-xl font-black text-gray-800 mb-2">Aucune phase configurée</h2>
                <p className="text-gray-500 max-w-md text-sm">Les étudiants ne peuvent pas soumettre de journaux de bord puisque cette SAE n'a pas été découpée en phases. Vous pouvez en ajouter depuis l'onglet Détails en mode Édition.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] ml-2 mr-2">Naviguer</span>
                  {milestonesList.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePhaseId(p.id)}
                      className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all border ${activePhaseId === p.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'}`}
                    >
                      Phase {idx + 1} : {p.title}
                    </button>
                  ))}
                </div>

                {milestonesList.filter(p => p.id === activePhaseId).map((phase, idx) => (
                  <div key={phase.id} className="flex flex-col gap-6">

                    <div className="bg-indigo-900 rounded-3xl p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                      <div className="relative z-10 flex flex-col text-center md:text-left">
                        <div className="bg-indigo-500/30 text-indigo-100 font-bold uppercase text-xs tracking-widest px-3 py-1 rounded-full w-max mb-3 mx-auto md:mx-0 border border-indigo-400/30">Suivi actif</div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Phase {idx + 1} : {phase.title}</h2>
                        <p className="text-indigo-200 font-medium">L'échéance de cette phase est fixée au <strong className="text-white">{new Date(phase.deadline).toLocaleDateString()}</strong>.</p>
                      </div>
                      <div className="relative z-10 flex flex-col bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl items-center min-w-[150px]">
                        <span className="text-4xl font-black text-white">{progressStats.filter(s => s.milestoneId === activePhaseId).length}</span>
                        <span className="text-sm font-bold text-indigo-200 mt-1">Soumissions</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {progressStats.filter(s => s.milestoneId === activePhaseId).map(studentProg => (
                        <div key={studentProg.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                            <h4 className="font-black text-lg text-gray-900 flex items-center gap-3">
                              Étudiant ID: {studentProg.studentId}
                            </h4>
                            <span className="text-xs font-bold px-3 py-1 rounded-md bg-green-100 text-green-700">Soumis</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Journal de bord</span>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl italic border border-gray-100 overflow-y-auto max-h-[120px]">
                              " {studentProg.message} "
                            </p>
                          </div>
                        </div>
                      ))}
                      {progressStats.filter(s => s.milestoneId === activePhaseId).length === 0 && (
                        <div className="col-span-full p-8 text-center text-gray-500 bg-white border border-gray-100 rounded-xl">Aucune soumission pour le moment.</div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB : RENDUS FINAUX
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'rendus' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center bg-indigo-900 rounded-xl p-6 lg:p-8 shadow-md overflow-hidden relative">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0">
                <h2 className="text-2xl font-black text-white tracking-tight mb-2">Rendus Finaux Étudiants</h2>
                <p className="text-indigo-200 font-medium text-sm">{formData.submissionCount || 0} projets soumis sur {formData.studentCount || 0} inscrits.</p>
              </div>
              <button className="relative z-10 flex items-center justify-center gap-2 py-3 px-6 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-sm rounded-lg shadow-sm transition-all border border-indigo-100">
                <Download className="w-5 h-5" strokeWidth={1.5} />
                Téléchargement rapide (ZIP)
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 mt-2">
              <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100 flex flex-col items-center">
                <p className="text-gray-500 italic mb-2">L'API des rendus finaux détaillés doit être rattachée ici.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
