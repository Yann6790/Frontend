import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit3, Save, Eye, EyeOff, FolderPlus, Folder, FileText, Plus, Trash2, Calendar, Download, Image as ImageIcon, CheckCircle2, AlertCircle, Clock, Search, ChevronLeft, UploadCloud, MessageSquare } from 'lucide-react';

const LISTE_MATIERES_MMI = ["Développement Web", "Graphisme", "Audiovisuel", "Communication", "Gestion de projet", "UX/UI Design"];

const MOCK_ALL_PROFESSORS = [
  { id: 'prof-1', nom: 'M. Dupont' },
  { id: 'prof-2', nom: 'Mme Martin' },
  { id: 'prof-3', nom: 'M. Leroy' },
  { id: 'prof-4', nom: 'Mme Dubois' },
  { id: 'prof-5', nom: 'M. Lefebvre' },
];

const currentUser = { id: 'prof-1', nom: 'M. Dupont' };

const initialMockData = {
  id: 'sae-1',
  titre: "SAE 3.01 - Conception Web Avancée",
  description: "Cette SAE vise à concevoir un service numérique complet, de la recherche utilisateur au prototypage interactif. L'objectif est de mettre en pratique les heuristiques d'utilisabilité.",
  matieres: ["Développement Web", "UX/UI Design"],
  equipePedagogique: [
    { id: 'prof-1', nom: 'M. Dupont', role: 'Principal' },
    { id: 'prof-2', nom: 'M. Leroy', role: 'Secondaire' }
  ],
  imageUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=1200",
  dateRenduFinale: "2026-05-15",
  isVisible: true,
  dossiers: [
    {
      id: "d1",
      nom: "Sujet et Consignes",
      fichiers: [ { nom: "Cahier_des_charges_v2.pdf" }, { nom: "Grille_evaluation.pdf" } ]
    },
    {
      id: "d2",
      nom: "Ressources Annexes",
      fichiers: [ { nom: "Assets_Graphiques.zip" }, { nom: "Liens_Utiles.txt" } ]
    }
  ],
  phases: [
    {
      id: "p1",
      numero: 1,
      titre: "Recherche UX",
      description: "Entretiens et création des personas.",
      dateDebut: "2026-03-01",
      dateFin: "2026-03-15"
    },
    {
      id: "p2",
      numero: 2,
      titre: "Prototypage",
      description: "Réalisation des wireframes et maquettes haute fidélité.",
      dateDebut: "2026-03-16",
      dateFin: "2026-04-30"
    }
  ]
};

const mockPhaseTracking = [
  { id: 's1', nom: "Alice Dupont", description: "J'ai réalisé 5 entretiens utilisateurs ce week-end. Les retours sont très intéressants pour la suite.", delta: "Rendu 2 jours avant l'échéance", status: 'early' },
  { id: 's2', nom: "Bob Martin", description: "Phase compliquée à démarrer, mais personas finis.", delta: "Rendu le jour J", status: 'on-time' },
  { id: 's3', nom: "Charlie Brun", description: "En cours de rédaction du rapport final.", delta: "En retard de 1 jour", status: 'late' }
];

const mockFinalSubmissions = [
  { id: 's1', nom: "Alice Dupont", imageUrl: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=400", description: "Voici le lien vers notre prototype interactif finalisé.", fichiers: [{nom: "maquettes_finales.fig"}] },
  { id: 's2', nom: "Bob Martin", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400", description: "Dossier complet zippé avec les sources.", fichiers: [{nom: "projet_complet.zip"}] }
];

export default function TeacherSaeDetailPage() {
  const { id } = useParams();
  
  // App States
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'tracking' | 'rendus'
  const [activePhaseId, setActivePhaseId] = useState(initialMockData.phases[0]?.id);

  // Form States
  const [formData, setFormData] = useState(initialMockData);
  const [imagePreview, setImagePreview] = useState(initialMockData.imageUrl);

  const isPrincipal = formData?.equipePedagogique?.some(p => p.id === currentUser.id && p.role === 'Principal');
  
  // Drag & Drop specific states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleSave = () => {
    setIsEditing(false);
    setFormData(prev => ({ ...prev, imageUrl: imagePreview }));
    // In real app, API call goes here
  };

  const handleCancel = () => {
    setFormData(initialMockData);
    setImagePreview(initialMockData.imageUrl);
    setIsEditing(false);
  };

  const handleAddFolder = () => {
    setFormData(prev => ({
      ...prev,
      dossiers: [...prev.dossiers, { id: Date.now().toString(), nom: "Nouveau Dossier", fichiers: [] }]
    }));
  };

  const handleAddPhase = () => {
    const nextNum = formData.phases.length + 1;
    setFormData(prev => ({
      ...prev,
      phases: [...prev.phases, { id: Date.now().toString(), numero: nextNum, titre: "Nouvelle Phase", description: "", dateDebut: "", dateFin: "" }]
    }));
  };

  // --- Drag & Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault();
    if (isEditing) setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    if (isEditing) setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isEditing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert("Veuillez importer une image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  // ----------------------------

  return (
    <div className="flex-1 min-h-screen bg-slate-50 font-merriweather pb-20">
      
      {/* Sticky Header with Actions */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full">
          <Link to="/teacher-dashboard" className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors shrink-0" title="Retour au Dashboard">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest truncate">Gestion de SAE</span>
            <h1 className="text-xl font-black text-gray-900 truncate">{formData.titre}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
                className="flex items-center gap-2 py-2 px-5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] hover:-translate-y-0.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Sauvegarder</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Navigation Tabs (Disabled while editing to force focus inside details) */}
        <div className={`flex flex-col sm:flex-row gap-2 border-b-2 border-gray-200 pb-px ${isEditing ? 'opacity-50 pointer-events-none' : ''}`}>
           {[
             { id: 'details', label: 'Détails & Configuration' },
             { id: 'tracking', label: 'Suivi des Phases' },
             { id: 'rendus', label: 'Rendus Finaux', badge: mockFinalSubmissions.length }
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

        {/* TAB CONTENT: DETAILS & CONFIG */}
        {activeTab === 'details' && (
          <div className="flex flex-col gap-10">
            {/* HERO SECTION */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" strokeWidth={1.5} /> Présentation
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700">Titre de la SAE</label>
                    {isEditing ? (
                      <input type="text" value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-base font-bold shadow-sm" />
                    ) : (
                      <p className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-lg border border-transparent">{formData.titre}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="font-bold text-gray-700">Matières associées</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {formData.matieres?.map(m => (
                        <span key={m} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${isEditing ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                          {m}
                          {isEditing && (
                            <button 
                              type="button"
                              onClick={() => {
                                if (formData.matieres.length > 1) {
                                  setFormData(prev => ({...prev, matieres: prev.matieres.filter(mat => mat !== m)}));
                                }
                              }}
                              disabled={formData.matieres.length === 1}
                              className={`flex items-center justify-center rounded-full p-0.5 transition-colors ${formData.matieres.length === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-indigo-200 text-indigo-500 hover:text-indigo-800'}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </span>
                      ))}
                      {isEditing && formData.matieres?.length === 1 && (
                        <span className="text-xs text-red-500 font-bold ml-2">Au moins une matière requise</span>
                      )}
                    </div>
                    {isEditing && (
                      <select 
                        className="mt-2 p-2 border border-gray-300 text-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold max-w-xs bg-white shadow-sm"
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !formData.matieres.includes(e.target.value)) {
                            setFormData(prev => ({...prev, matieres: [...prev.matieres, e.target.value]}));
                          }
                        }}
                      >
                        <option value="">+ Ajouter une matière...</option>
                        {LISTE_MATIERES_MMI.filter(m => !formData.matieres?.includes(m)).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Gestion de l'équipe pédagogique */}
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                    <label className="font-bold text-gray-700">Équipe Pédagogique</label>
                    
                    {!isEditing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mr-2">Équipe :</span>
                        {formData.equipePedagogique?.map((prof, i) => (
                          <span key={prof.id} className="text-[15px]">
                            <strong className={prof.role === 'Principal' ? 'text-indigo-800' : 'text-gray-800'}>{prof.nom}</strong>
                            {prof.role === 'Principal' && <span className="text-xs text-indigo-600 font-bold ml-1">(Responsable)</span>}
                            {i < formData.equipePedagogique.length - 1 && <span className="text-gray-400 mx-1">,</span>}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          {formData.equipePedagogique?.map(prof => (
                            <div key={prof.id} className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                              <span className="font-bold text-gray-800 text-sm">{prof.nom}</span>
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${prof.role === 'Principal' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>
                                {prof.role}
                              </span>
                              {prof.role !== 'Principal' && isPrincipal && (
                                <button 
                                  onClick={() => setFormData(prev => ({...prev, equipePedagogique: prev.equipePedagogique.filter(p => p.id !== prof.id)}))}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1 ml-1 transition-colors"
                                  title="Retirer ce professeur"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {isPrincipal ? (
                          <select 
                            className="mt-2 p-2.5 border-2 border-gray-200 text-gray-700 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold max-w-xs bg-white shadow-sm"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                const profToAdd = MOCK_ALL_PROFESSORS.find(p => p.id === e.target.value);
                                if (!formData.equipePedagogique.some(ep => ep.id === profToAdd.id)) {
                                  setFormData(prev => ({
                                    ...prev, 
                                    equipePedagogique: [...prev.equipePedagogique, { ...profToAdd, role: 'Secondaire' }]
                                  }));
                                }
                              }
                            }}
                          >
                            <option value="">+ Ajouter un collègue...</option>
                            {MOCK_ALL_PROFESSORS.filter(p => !formData.equipePedagogique?.some(ep => ep.id === p.id)).map(p => (
                              <option key={p.id} value={p.id}>{p.nom}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="mt-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 p-3 rounded-xl flex gap-3 items-start max-w-md shadow-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 text-orange-500" />
                            <p className="font-medium leading-relaxed">Seul le professeur responsable ({formData.equipePedagogique?.find(p => p.role === 'Principal')?.nom}) peut modifier l'équipe pédagogique.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700">Description détaillée</label>
                    {isEditing ? (
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full min-h-[120px] resize-y p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all leading-relaxed shadow-sm text-sm" />
                    ) : (
                      <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-transparent min-h-[120px]">{formData.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-gray-700">Image de couverture</label>
                  {isEditing ? (
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full aspect-video rounded-xl border-2 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 relative overflow-hidden group
                        ${isDragging ? 'border-indigo-500 bg-indigo-50 border-solid' : 'border-gray-300 border-dashed bg-gray-50 hover:bg-gray-100'}`}
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Preview" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <UploadCloud className="w-8 h-8 text-indigo-600 mb-2 drop-shadow-md" strokeWidth={1.5} />
                            <span className="font-bold mb-1 text-indigo-900 bg-white/80 px-3 py-1 rounded-md shadow-sm text-sm">Changer l'image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`p-3 rounded-md shadow-sm transition-transform duration-300 ${isDragging ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-indigo-600'}`}>
                            <UploadCloud className="w-6 h-6" strokeWidth={1.5} />
                          </div>
                          <span className="font-medium text-gray-500 text-center px-4 text-sm">Glissez votre image ici<br/>ou cliquez pour parcourir</span>
                        </>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md">
                      {imagePreview ? <img src={imagePreview} alt={formData.titre} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* VISIBILITY AND FINAL DEADLINE (Always visible, inputs only on edit) */}
            <div className={`bg-gradient-to-br rounded-xl p-6 shadow-sm border flex flex-col md:flex-row gap-8 items-start ${isEditing ? 'from-indigo-50 to-purple-50 border-indigo-100' : 'from-white to-gray-50 border-gray-200'}`}>
              
              <div className="flex-1 flex flex-col gap-4 w-full">
                <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Date de Rendu Finale
                </h3>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={formData.dateRenduFinale} 
                    onChange={e => setFormData({...formData, dateRenduFinale: e.target.value})}
                    className="w-full max-w-xs p-4 bg-white border-2 border-indigo-200 rounded-xl font-mono text-indigo-900 font-bold outline-none focus:border-indigo-500 shadow-sm"
                  />
                ) : (
                  <div className="bg-white p-4 border border-gray-200 rounded-xl font-mono text-gray-800 font-bold w-max shadow-sm">
                    {formData.dateRenduFinale ? new Date(formData.dateRenduFinale).toLocaleDateString() : 'Non définie'}
                  </div>
                )}
                <p className="text-sm text-indigo-700 font-medium">C'est la date limite globale appliquée pour le bloc complet "Rendre la SAE".</p>
              </div>

              <div className="flex-1 flex flex-col gap-4 w-full">
                <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2">
                  <Eye className="w-5 h-5" /> Visibilité Étudiant
                </h3>
                
                {isEditing ? (
                  <div className={`p-5 rounded-2xl bg-white border-2 transition-colors flex items-start gap-4 cursor-pointer ${!formData.dateRenduFinale ? 'border-gray-200 opacity-60 cursor-not-allowed' : formData.isVisible ? 'border-indigo-500 shadow-md' : 'border-gray-300'}`}>
                    <div className="pt-1">
                      <div className="relative flex items-center justify-center w-6 h-6">
                        <input 
                          type="checkbox" 
                          checked={formData.isVisible}
                          disabled={!formData.dateRenduFinale}
                          onChange={e => setFormData({...formData, isVisible: e.target.checked})}
                          className="peer appearance-none w-6 h-6 border-2 border-gray-400 rounded checked:bg-indigo-600 checked:border-indigo-600 disabled:bg-gray-200 transition-all cursor-pointer"
                        />
                        <CheckCircle2 className="w-4 h-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-900">Publier cette SAE</label>
                      <p className="text-sm text-gray-600">
                        {!formData.dateRenduFinale 
                          ? "Vous devez définir une date de rendu finale pour publier." 
                          : "Les étudiants pourront voir et déposer leur travail pour cette SAE."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
                    <div className={`p-2 rounded-full ${formData.isVisible ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                       {formData.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{formData.isVisible ? "SAE Visible (Publique)" : "SAE Cachée"}</span>
                      <span className="text-sm text-gray-500">{formData.isVisible ? "Accessible aux étudiants sur leur Dashbaord." : "Invisible pour les étudiants."}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* EDITABLE/READ-ONLY PHASES IN CONFIG */}
            <div className={`rounded-xl p-6 shadow-sm border ${isEditing ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" strokeWidth={1.5} /> Gestion des Phases
                </h2>
                {isEditing && (
                  <button onClick={handleAddPhase} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                    <Plus className="w-5 h-5" /> Ajouter une phase
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-5">
                {formData.phases.map((phase, pIdx) => (
                  <div key={phase.id} className={`p-5 border rounded-xl flex flex-col gap-4 relative ${isEditing ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 shadow-sm hover:border-indigo-200 transition-colors'}`}>
                    
                    {isEditing ? (
                      <>
                        <button 
                          onClick={() => setFormData(prev => ({...prev, phases: prev.phases.filter((_, i) => i !== pIdx)}))}
                          className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 w-3/4">
                          <span className="shrink-0 bg-indigo-600 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">{pIdx + 1}</span>
                          <input type="text" value={phase.titre} onChange={e => {
                            const newPhases = [...formData.phases];
                            newPhases[pIdx].titre = e.target.value;
                            setFormData({...formData, phases: newPhases});
                          }} className="flex-1 font-bold text-lg bg-white border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500" placeholder="Titre de la phase" />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-gray-600">Description</label>
                          <textarea value={phase.description} onChange={e => {
                            const newPhases = [...formData.phases];
                            newPhases[pIdx].description = e.target.value;
                            setFormData({...formData, phases: newPhases});
                          }} className="w-full bg-white border border-gray-300 rounded-lg p-3 min-h-[80px] outline-none focus:border-indigo-500 resize-y" placeholder="Objectifs de la phase..." />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-600">Date de début</label>
                            <input type="date" value={phase.dateDebut} onChange={e => {
                              const newPhases = [...formData.phases];
                              newPhases[pIdx].dateDebut = e.target.value;
                              setFormData({...formData, phases: newPhases});
                            }} className="bg-white border border-gray-300 rounded-lg p-3 font-mono text-sm outline-none focus:border-indigo-500" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-600">Date de fin</label>
                            <input type="date" value={phase.dateFin} onChange={e => {
                              const newPhases = [...formData.phases];
                              newPhases[pIdx].dateFin = e.target.value;
                              setFormData({...formData, phases: newPhases});
                            }} className="bg-white border border-gray-300 rounded-lg p-3 font-mono text-sm outline-none focus:border-indigo-500" />
                          </div>
                        </div>
                      </>
                    ) : (
                      // READ-ONLY PHASE
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex items-center justify-center bg-indigo-100 text-indigo-800 font-black w-14 h-14 rounded-full text-2xl shrink-0">
                          {pIdx + 1}
                        </div>
                        <div className="flex flex-col flex-1">
                          <h3 className="font-bold text-gray-900 text-xl">{phase.titre}</h3>
                          <p className="text-gray-600 mt-2 italic">"{phase.description}"</p>
                        </div>
                        <div className="flex flex-col justify-center border-l border-gray-100 pl-6 shrink-0">
                           <div className="flex items-center gap-2 mb-2">
                             <span className="text-xs font-bold text-gray-400 uppercase w-12">Début</span>
                             <span className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">{new Date(phase.dateDebut).toLocaleDateString()}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-gray-400 uppercase w-12">Fin</span>
                             <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded">{new Date(phase.dateFin).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
                {formData.phases.length === 0 && (
                  <p className="text-center text-gray-500 py-8 bg-white rounded-2xl border border-dashed border-gray-300">Aucune phase n'est configurée. La SAE se déroulera en un seul bloc.</p>
                )}
              </div>
            </div>

            {/* FOLDERS SECTION */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-indigo-600" strokeWidth={1.5} /> Dossiers & Ressources
                </h2>
                {isEditing && (
                  <button onClick={handleAddFolder} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                    <FolderPlus className="w-4 h-4" strokeWidth={1.5} /> Ajouter un dossier
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {formData.dossiers.map((dossier, dIdx) => (
                  <div key={dossier.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-4 relative">
                    {isEditing && (
                      <button 
                        onClick={() => setFormData(prev => ({...prev, dossiers: prev.dossiers.filter((_, i) => i !== dIdx)}))}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    
                    <div className="flex flex-col gap-1 pr-10">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden">Nom du dossier</label>
                      {isEditing ? (
                        <input type="text" value={dossier.nom} onChange={e => {
                          const newDossiers = [...formData.dossiers];
                          newDossiers[dIdx].nom = e.target.value;
                          setFormData({...formData, dossiers: newDossiers});
                        }} className="font-black text-lg text-gray-900 bg-white border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500" />
                      ) : (
                        <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-indigo-500" strokeWidth={1.5} /> {dossier.nom}
                        </h3>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-1">
                      {dossier.fichiers.map((fichier, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm relative group">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                          {isEditing ? (
                            <>
                              <input type="text" value={fichier.nom} onChange={e => {
                                const newDossiers = [...formData.dossiers];
                                newDossiers[dIdx].fichiers[fIdx].nom = e.target.value;
                                setFormData({...formData, dossiers: newDossiers});
                              }} className="flex-1 min-w-0 bg-gray-50 p-1.5 rounded border border-gray-200 text-sm font-medium outline-none focus:border-indigo-500" />
                              <button onClick={() => {
                                const newDossiers = [...formData.dossiers];
                                newDossiers[dIdx].fichiers.splice(fIdx, 1);
                                setFormData({...formData, dossiers: newDossiers});
                              }} className="text-red-400 hover:text-red-600 p-1"><X className="w-4 h-4 shrink-0" /></button>
                            </>
                          ) : (
                            <span className="text-sm font-medium text-gray-700 truncate">{fichier.nom}</span>
                          )}
                        </div>
                      ))}
                      
                      {isEditing && (
                        <button onClick={() => {
                          const newDossiers = [...formData.dossiers];
                          newDossiers[dIdx].fichiers.push({ nom: "Nouveau_fichier.pdf" });
                          setFormData({...formData, dossiers: newDossiers});
                        }} className="flex items-center justify-center gap-2 p-2.5 mt-1 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm font-bold">
                          <Plus className="w-4 h-4" /> Ajouter un fichier
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {formData.dossiers.length === 0 && !isEditing && (
                  <p className="text-gray-500 italic col-span-full">Aucun dossier configuré pour cette SAE.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB CONTENT: SUIVI DES PHASES */}
        {activeTab === 'tracking' && (
           <div className="flex flex-col gap-6 animate-fade-in">
             
             {formData.phases.length === 0 ? (
               <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100 flex flex-col items-center">
                 <Clock className="w-12 h-12 text-gray-300 mb-4" strokeWidth={1.5} />
                 <h2 className="text-xl font-black text-gray-800 mb-2">Aucune phase configurée</h2>
                 <p className="text-gray-500 max-w-md text-sm">Les étudiants ne peuvent pas soumettre de journaux de bord puisque cette SAE n'a pas été découpée en phases. Vous pouvez en ajouter depuis l'onglet Détails en mode Édition.</p>
               </div>
             ) : (
               <>
                 {/* Top Controls: Selector Buttons */}
                 <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                   <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] ml-2 mr-2">Naviguer</span>
                   {formData.phases.map(p => (
                     <button
                       key={p.id}
                       onClick={() => setActivePhaseId(p.id)}
                       className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all border ${activePhaseId === p.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'}`}
                     >
                       Phase {p.numero} : {p.titre}
                     </button>
                   ))}
                 </div>

                 {/* Active Phase Display */}
                 {formData.phases.filter(p => p.id === activePhaseId).map(phase => (
                   <div key={phase.id} className="flex flex-col gap-6">
                     
                     <div className="bg-indigo-900 rounded-3xl p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                       <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                       <div className="relative z-10 flex flex-col text-center md:text-left">
                         <div className="bg-indigo-500/30 text-indigo-100 font-bold uppercase text-xs tracking-widest px-3 py-1 rounded-full w-max mb-3 mx-auto md:mx-0 border border-indigo-400/30">Suivi actif</div>
                         <h2 className="text-3xl font-black text-white tracking-tight mb-2">Phase {phase.numero} : {phase.titre}</h2>
                         <p className="text-indigo-200 font-medium">L'échéance de cette phase est fixée au <strong className="text-white">{new Date(phase.dateFin).toLocaleDateString()}</strong>.</p>
                       </div>
                       <div className="relative z-10 flex flex-col bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl items-center min-w-[150px]">
                         <span className="text-4xl font-black text-white">{mockPhaseTracking.length}</span>
                         <span className="text-sm font-bold text-indigo-200 mt-1">Soumissions</span>
                       </div>
                     </div>

                     {/* Student List for this Phase (Card format identical to 'Rendus Finaux' for clarity) */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {mockPhaseTracking.map(student => (
                         <div key={student.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                             <h4 className="font-black text-lg text-gray-900 flex items-center gap-3">
                               {student.nom}
                             </h4>
                             <span className={`text-xs font-bold px-3 py-1 rounded-md ${student.status === 'late' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                               {student.delta}
                             </span>
                           </div>
                           
                           <div className="flex-1">
                             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Journal de bord</span>
                             <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl italic border border-gray-100 overflow-y-auto max-h-[120px]">
                               " {student.description} "
                             </p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </>
             )}
           </div>
        )}

        {/* TAB CONTENT: RENDUS FINAUX */}
        {activeTab === 'rendus' && (
           <div className="flex flex-col gap-6 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-center bg-indigo-900 rounded-xl p-6 lg:p-8 shadow-md overflow-hidden relative">
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
               <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0">
                 <h2 className="text-2xl font-black text-white tracking-tight mb-2">Rendus Finaux Étudiants</h2>
                 <p className="text-indigo-200 font-medium text-sm"> {mockFinalSubmissions.length} projets soumis sur 60 inscrits.</p>
               </div>
               <button className="relative z-10 flex items-center justify-center gap-2 py-3 px-6 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-sm rounded-lg shadow-sm transition-all border border-indigo-100">
                 <Download className="w-5 h-5" strokeWidth={1.5} />
                 Téléchargement rapide (ZIP)
               </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
               {mockFinalSubmissions.map(submission => (
                 <div key={submission.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all">
                   
                   <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                     <h3 className="font-bold text-lg text-gray-900">{submission.nom}</h3>
                     <span className="bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Rendu validé</span>
                   </div>

                   <div className="flex gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden shadow-sm shrink-0 border border-gray-200">
                        <img src={submission.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                      </div>
                      <p className="flex-1 text-xs text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed overflow-y-auto max-h-[80px]">
                        "{submission.description}"
                      </p>
                   </div>

                   <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 flex items-center justify-between mt-auto">
                     <div className="flex items-center gap-3 truncate pr-4">
                       <div className="p-1.5 bg-white rounded-md shadow-sm text-indigo-600"><FileText className="w-4 h-4" strokeWidth={1.5} /></div>
                       <span className="font-bold text-gray-800 text-sm truncate">{submission.fichiers[0]?.nom}</span>
                     </div>
                     <button className="flex items-center justify-center p-2.5 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg transition-all shadow-sm shrink-0" title="Télécharger les fichiers de cet étudiant">
                       <Download className="w-4 h-4" strokeWidth={1.5} />
                     </button>
                   </div>

                 </div>
               ))}
             </div>
           </div>
        )}

      </div>
    </div>
  );
}

const X = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
