import React, { useState, useMemo } from 'react';

// 2. Mock Data
const mockTeacherSAEs = [
  { id: 1, titre: "SAE 301", promo: "MMI 2", matieresDisponibles: ["Développement web", "Design UX", "Gestion de projet"] },
  { id: 2, titre: "SAE 402", promo: "MMI 2", matieresDisponibles: ["Développement avancé", "Architecture web"] },
  { id: 3, titre: "SAE 201", promo: "MMI 1", matieresDisponibles: ["Base de données", "Algorithmique"] }
];

const initialAnnouncements = [
  {
    id: 1,
    titre: "Rendu repoussé pour la SAE 301",
    contenu: "Suite à des problèmes serveurs, le rendu est décalé au vendredi soir.",
    cible: "Toute la promo",
    matiere: "Développement web",
    saeAssociee: mockTeacherSAEs[0],
    isScheduled: false,
    datePublication: "2023-10-15T08:00:00"
  },
  {
    id: 2,
    titre: "Soutenance de mi-parcours",
    contenu: "N'oubliez pas d'apporter vos prototypes papier pour la séance de ce mardi.",
    cible: "Groupe TD 1",
    matiere: "Design UX",
    saeAssociee: mockTeacherSAEs[0],
    isScheduled: true,
    datePublication: "2026-12-01T10:00:00"
  }
];

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [selectedSaeId, setSelectedSaeId] = useState("");
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [cible, setCible] = useState("Toute la promo");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  // History Filter State
  const [filterPromo, setFilterPromo] = useState("Toutes");

  const selectedSae = useMemo(() => mockTeacherSAEs.find(s => s.id === Number(selectedSaeId)), [selectedSaeId]);
  
  // Handlers
  const handleSaeChange = (e) => {
    setSelectedSaeId(e.target.value);
    setSelectedMatiere(""); // Reset matiere strictly when SAE changes
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedSaeId("");
    setSelectedMatiere("");
    setCible("Toute la promo");
    setTitre("");
    setContenu("");
    setIsScheduled(false);
    setScheduledDate("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSaeId || !selectedMatiere || !titre || !contenu) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const datePub = isScheduled && scheduledDate ? scheduledDate + "T08:00:00Z" : new Date().toISOString();

    const newAnnouncement = {
      id: editingId ? editingId : Date.now(),
      titre,
      contenu,
      cible,
      matiere: selectedMatiere,
      saeAssociee: selectedSae,
      isScheduled,
      datePublication: datePub
    };

    if (editingId) {
      setAnnouncements(announcements.map(a => a.id === editingId ? newAnnouncement : a));
    } else {
      setAnnouncements([newAnnouncement, ...announcements]);
    }
    resetForm();
  };

  const handleEdit = (ann) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(ann.id);
    setSelectedSaeId(ann.saeAssociee.id.toString());
    setSelectedMatiere(ann.matiere);
    setCible(ann.cible);
    setTitre(ann.titre);
    setContenu(ann.contenu);
    setIsScheduled(ann.isScheduled);
    setScheduledDate(ann.datePublication.split('T')[0]);
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      setAnnouncements(announcements.filter(a => a.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const displayedAnnouncements = useMemo(() => {
    if (filterPromo === "Toutes") return announcements;
    return announcements.filter(a => a.saeAssociee.promo === filterPromo);
  }, [announcements, filterPromo]);

  return (
    <div className="flex-1 flex flex-col font-merriweather bg-blue-50">
      
      {/* 3A. Créer une annonce (Fond blanc pour le haut) */}
      <div className="bg-white border-b border-blue-200 shadow-sm px-6 py-10 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-8 font-montserrat tracking-tight">
            {editingId ? "Modifier l'annonce" : "Créer une annonce"}
          </h1>
          
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2rem] border border-blue-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-2">
              {/* Choix SAE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">SAE associée <span className="text-red-500">*</span></label>
                <select 
                  value={selectedSaeId} 
                  onChange={handleSaeChange}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold transition-all shadow-sm cursor-pointer"
                  required
                >
                  <option value="" disabled>Sélectionner une SAE...</option>
                  {mockTeacherSAEs.map(sae => (
                    <option key={sae.id} value={sae.id}>{sae.titre} - {sae.promo}</option>
                  ))}
                </select>
              </div>

              {/* Choix Matière */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${selectedSaeId ? 'text-gray-700' : 'text-gray-400'}`}>Matière concernée <span className="text-red-500">*</span></label>
                <select 
                  value={selectedMatiere} 
                  onChange={(e) => setSelectedMatiere(e.target.value)}
                  disabled={!selectedSaeId}
                  className={`w-full border outline-none rounded-xl px-4 py-3 font-semibold transition-all shadow-sm cursor-pointer ${
                    selectedSaeId 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500' 
                      : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                  required
                >
                  <option value="" disabled>Sélectionner une matière...</option>
                  {selectedSae?.matieresDisponibles.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Cible (Audience) <span className="text-red-500">*</span></label>
              <select 
                value={cible} 
                onChange={(e) => setCible(e.target.value)}
                className="w-full md:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold transition-all shadow-sm cursor-pointer"
              >
                <option value="Toute la promo">Toute la promo</option>
                <option value="Groupe TD 1">Groupe TD 1</option>
                <option value="Groupe TD 2">Groupe TD 2</option>
                <option value="Groupe TP 1">Groupe TP 1</option>
                <option value="Groupe TP 2">Groupe TP 2</option>
                <option value="Groupe TP 3">Groupe TP 3</option>
                <option value="Groupe TP 4">Groupe TP 4</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l'annonce <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={titre} 
                onChange={(e) => setTitre(e.target.value)} 
                placeholder="Ex: Rappel pour le rendu de demain"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold transition-all shadow-sm"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Message <span className="text-red-500">*</span></label>
              <textarea 
                value={contenu} 
                onChange={(e) => setContenu(e.target.value)} 
                placeholder="Écrivez le contenu détaillé de votre annonce ici..."
                className="w-full min-h-[140px] bg-gray-50 border border-gray-300 text-gray-800 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-sm resize-y"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <input 
                    type="checkbox" 
                    checked={isScheduled} 
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Planifier cette annonce
                  </span>
                </label>
                {isScheduled && (
                  <input 
                    type="date" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full md:w-48 bg-white border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    required={isScheduled}
                    min={new Date().toISOString().split('T')[0]}
                  />
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="flex-1 md:flex-none px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Annuler
                  </button>
                )}
                <button 
                  type="submit" 
                  className={`flex-1 md:flex-none px-8 py-3.5 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                    isScheduled ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {editingId ? 'Mettre à jour' : (isScheduled ? 'Planifier' : 'Publier')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 3B. Historique des annonces (Fond bleu) */}
      <div className="flex-1 bg-blue-600 px-6 py-16 md:px-12 relative z-0">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white font-montserrat tracking-tight">
              Gérer mes annonces
            </h2>
            <div className="flex items-center gap-3 bg-blue-700/60 p-2.5 rounded-xl backdrop-blur-md border border-blue-500/40 shadow-inner">
              <label className="text-sm font-bold text-blue-100 pl-2">Promo :</label>
              <select 
                value={filterPromo} 
                onChange={(e) => setFilterPromo(e.target.value)}
                className="bg-white border border-transparent text-blue-900 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-white font-bold cursor-pointer shadow-sm"
              >
                <option value="Toutes">Toutes</option>
                <option value="MMI 1">MMI 1</option>
                <option value="MMI 2">MMI 2</option>
                <option value="MMI 3">MMI 3</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {displayedAnnouncements.length > 0 ? (
              displayedAnnouncements.map(ann => (
                <div key={ann.id} className="bg-white rounded-[1.5rem] p-6 md:p-8 shadow-xl border-4 border-transparent hover:border-blue-300/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col md:flex-row gap-6 group">
                  
                  {/* Infos & Contenu */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-4">
                      {ann.isScheduled ? (
                        <span className="bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-orange-200">
                          Planifiée au {new Date(ann.datePublication).toLocaleDateString('fr-FR')}
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-green-200">
                          Publiée
                        </span>
                      )}
                      <span className="bg-blue-50 text-blue-800 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-blue-200 shadow-sm">
                        {ann.saeAssociee.titre}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
                        {ann.cible}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
                        {ann.matiere}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold font-montserrat text-gray-900 mb-3 group-hover:text-blue-700 transition-colors leading-tight">
                      {ann.titre}
                    </h3>
                    <p className="text-gray-600 font-medium text-base leading-relaxed mb-5">
                      {ann.contenu}
                    </p>
                    
                    {!ann.isScheduled && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-sm text-gray-500 font-semibold">
                          Publiée le {new Date(ann.datePublication).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions (Boutons) */}
                  <div className="flex flex-row md:flex-col gap-3 justify-start md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-6 min-w-[140px]">
                    <button 
                      onClick={() => handleEdit(ann)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors border border-blue-200 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(ann.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-colors border border-red-200 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Supprimer
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/10 rounded-[2rem] border-2 border-dashed border-white/20 backdrop-blur-md">
                <div className="w-16 h-16 bg-blue-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Aucune annonce trouvée</h3>
                <p className="text-blue-100 font-medium">Vous n'avez pas d'annonce pour cette promo ou avec ces filtres.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
