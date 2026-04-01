import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Megaphone, Calendar, Clock, Pencil, Trash2, Plus, Save, X, Layout, BookOpen, ChevronRight } from 'lucide-react';
import { saeService } from '../services/sae.service';

const normalizeThematic = (raw) => {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(t => {
    if (typeof t === 'string') return t;
    return t.label ?? t.code ?? t.name ?? t.id ?? String(t);
  });
};

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [mySaes, setMySaes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [selectedSaeId, setSelectedSaeId] = useState("");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // History Filter State
  const [filterSaeId, setFilterSaeId] = useState("Toutes");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [annRes, saeRes] = await Promise.all([
        saeService.getAllAnnouncements(),
        saeService.getSaeList()
      ]);
      setAnnouncements(annRes);
      setMySaes(Array.isArray(saeRes) ? saeRes : (saeRes?.data || []));
    } catch (err) {
      console.error("Erreur chargement données", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedSae = useMemo(() => mySaes.find(s => s.id === selectedSaeId), [mySaes, selectedSaeId]);
  
  const resetForm = () => {
    setEditingId(null);
    setSelectedSaeId("");
    setTitre("");
    setContenu("");
    setIsAdding(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSaeId || !titre || !contenu) return;

    setIsSaving(true);
    try {
      const payload = { title: titre, content: contenu };
      if (editingId) {
        await saeService.updateAnnouncement(selectedSaeId, editingId, payload);
        setSaveMsg('Annonce mise à jour avec succès !');
      } else {
        await saeService.createAnnouncement(selectedSaeId, payload);
        setSaveMsg('Annonce publiée avec succès !');
      }
      setTimeout(() => setSaveMsg(''), 3000);
      await loadData();
      resetForm();
    } catch (err) {
      alert(`Erreur : ${err.message || 'Impossible d\'enregistrer l\'annonce.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (ann) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(ann.id);
    setSelectedSaeId(ann.saeId);
    setTitre(ann.title);
    setContenu(ann.content);
    setIsAdding(true);
  };

  const handleDelete = async (saeId, annId) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    try {
      await saeService.deleteAnnouncement(saeId, annId);
      setAnnouncements(prev => prev.filter(a => a.id !== annId));
    } catch (err) {
      alert(`Erreur : ${err.message || 'Impossible de supprimer l\'annonce.'}`);
    }
  };

  const displayedAnnouncements = useMemo(() => {
    if (filterSaeId === "Toutes") return announcements;
    return announcements.filter(a => a.saeId === filterSaeId);
  }, [announcements, filterSaeId]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      
      {/* En-tête & Formulaire (Section Haute) */}
      <div className="bg-white border-b border-gray-200 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-indigo-100 text-indigo-600 rounded-[1.25rem] shadow-sm">
                <Megaphone className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Annonces & Communications</h1>
                <p className="text-gray-500 font-medium mt-1">Diffusez des informations importantes sur vos projets SAE.</p>
              </div>
            </div>
            {!isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>Nouvelle Annonce</span>
              </button>
            )}
          </div>
          
          {saveMsg && (
            <div className="mb-6 bg-green-50 text-green-700 border border-green-200 px-6 py-4 rounded-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <div className="p-1 bg-green-100 rounded-full"><Save className="w-4 h-4" /></div>
              {saveMsg}
            </div>
          )}

          {isAdding && (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
              
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-gray-900">{editingId ? "Modifier l'annonce" : "Détails de l'annonce"}</h2>
                 <button type="button" onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Choix SAE */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">SAE Associée</label>
                  <select 
                    value={selectedSaeId} 
                    onChange={e => setSelectedSaeId(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white font-bold transition-all cursor-pointer shadow-sm"
                    required
                  >
                    <option value="" disabled>Sélectionner un projet...</option>
                    {mySaes.map(sae => (
                      <option key={sae.id} value={sae.id}>{sae.title} {sae.status === 'draft' ? '(Brouillon)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Objet de l'annonce</label>
                  <input 
                    type="text" 
                    value={titre} 
                    onChange={(e) => setTitre(e.target.value)} 
                    placeholder="Ex: Mise à jour du cahier des charges"
                    className="w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl px-5 py-3.5 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="mb-8 flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Message aux étudiants</label>
                <textarea 
                  value={contenu} 
                  onChange={(e) => setContenu(e.target.value)} 
                  placeholder="Expliquez en détail le changement ou l'information importante..."
                  className="w-full min-h-[160px] bg-gray-50 border-2 border-transparent text-gray-800 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium transition-all shadow-sm resize-y"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="w-full sm:w-auto px-10 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full sm:w-auto px-12 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isSaving ? 'Envoi...' : (editingId ? 'Sauvegarder les modifications' : 'Diffuser l\'annonce')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Historique des annonces (Bas) */}
      <div className="flex-1 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Historique des publications</h2>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-3">Filtrer par SAE :</label>
              <select 
                value={filterSaeId} 
                onChange={(e) => setFilterSaeId(e.target.value)}
                className="bg-transparent text-indigo-700 font-black outline-none cursor-pointer pr-4"
              >
                <option value="Toutes">Tout afficher</option>
                {mySaes.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
               <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {displayedAnnouncements.length > 0 ? (
                displayedAnnouncements.map(ann => (
                  <div key={ann.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group flex flex-col md:flex-row gap-8">
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-indigo-100">
                          {ann.saeTitle}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                           <Calendar className="w-3.5 h-3.5" />
                           {new Date(ann.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">
                        {ann.title}
                      </h3>
                      <p className="text-gray-600 font-medium text-lg leading-relaxed whitespace-pre-line">
                        {ann.content}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3 justify-start md:justify-center border-t md:border-t-0 md:border-l border-gray-50 pt-6 md:pt-0 md:pl-8 min-w-[160px]">
                      <button 
                        onClick={() => handleEdit(ann)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-indigo-100"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDelete(ann.saeId, ann.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                    <Megaphone className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Aucune annonce historique</h3>
                  <p className="text-gray-400 font-bold max-w-xs mx-auto">Toutes les annonces publiées sur vos SAE seront archivées ici.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
