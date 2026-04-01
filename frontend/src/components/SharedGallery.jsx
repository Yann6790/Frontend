import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, ExternalLink, User, Calendar, Tag, ChevronDown, Search, 
  Filter, MoreVertical, Trash2, Eye, Download, FileText
} from 'lucide-react';

import { saeService } from '../services/sae.service';

export default function SharedGallery({ canModerate = false, isAdminView = false, refreshTrigger = 0, onDelete = () => {} }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortDate, setSortDate] = useState(null); // 'asc' | 'desc' | null
  const [sortNote, setSortNote] = useState(null); // 'asc' | 'desc' | null
  const [selectedMatieres, setSelectedMatieres] = useState([]);
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isMatiereMenuOpen, setIsMatiereMenuOpen] = useState(false);
  const [isNoteMenuOpen, setIsNoteMenuOpen] = useState(false);
  const [isPromoMenuOpen, setIsPromoMenuOpen] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const data = await saeService.getAllPublicSubmissions();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur chargement galerie", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [refreshTrigger]);

  const allMatieres = useMemo(() => {
    const mats = new Set(projects.map(p => p.thematic).filter(Boolean));
    return Array.from(mats);
  }, [projects]);

  const allPromos = useMemo(() => {
    const years = new Set(projects.map(p => p.year).filter(Boolean));
    return Array.from(years).sort((a,b) => b-a);
  }, [projects]);

  const closeAllMenus = () => {
    setIsDateMenuOpen(false);
    setIsMatiereMenuOpen(false);
    setIsNoteMenuOpen(false);
    setIsPromoMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeAllMenus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menuName) => {
    setIsDateMenuOpen(menuName === 'date' ? !isDateMenuOpen : false);
    setIsMatiereMenuOpen(menuName === 'matiere' ? !isMatiereMenuOpen : false);
    setIsNoteMenuOpen(menuName === 'note' ? !isNoteMenuOpen : false);
    setIsPromoMenuOpen(menuName === 'promo' ? !isPromoMenuOpen : false);
  };

  const handleMatiereToggle = (matiere) => {
    setSelectedMatieres(prev =>
      prev.includes(matiere) ? prev.filter(m => m !== matiere) : [...prev, matiere]
    );
  };

  const handlePromoToggle = (promo) => {
    setSelectedPromos(prev =>
      prev.includes(promo) ? prev.filter(p => p !== promo) : [...prev, promo]
    );
  };

  const displayedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const studentName = project.name ? `${project.name.firstname || ''} ${project.name.lastname || ''}`.toLowerCase() : '';
      const projTitle = (project.title || '').toLowerCase();
      
      const matchSearch = projTitle.includes(searchTerm.toLowerCase()) || studentName.includes(searchTerm.toLowerCase());

      const matchMatiere = selectedMatieres.length === 0 || selectedMatieres.includes(project.thematic);
      const matchPromo = selectedPromos.length === 0 || selectedPromos.includes(project.year); // mapping year to promo

      return matchSearch && matchMatiere && matchPromo;
    });

    if (sortDate) {
      filtered.sort((a, b) => {
        // En l'absence de createdAt précis dans /api/saes/archives, on trie par ID ou par année
        const valA = a.year || a.id || 0;
        const valB = b.year || b.id || 0;
        if (sortDate === 'asc') return valA < valB ? -1 : 1;
        return valA > valB ? -1 : 1;
      });
    }

    return filtered;
  }, [projects, searchTerm, sortDate, selectedMatieres, selectedPromos]);

  return (
    <>
      <div className="bg-white w-full px-6 pb-6 md:px-12 flex flex-col items-center border-b border-gray-100">
        <div className="w-full max-w-4xl flex flex-col items-center gap-6 pb-4">
          {/* Recherche */}
          <div className="w-full relative mt-4">
            <input
              type="text"
              placeholder="Recherchez par nom d'étudiant ou de projet"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 focus:bg-white focus:ring-4 focus:ring-purple-100 border border-gray-200 rounded-lg py-3 px-6 text-base font-medium outline-none transition-all placeholder-gray-400 shadow-sm"
            />
          </div>

          {/* Boutons de filtres */}
          <div className="flex flex-wrap justify-center gap-3" ref={containerRef}>
            {/* 1. Date de rendu */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('date')}
                className={`px-5 py-2 border rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm ${sortDate || isDateMenuOpen ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Date de rendu
                <svg className={`w-4 h-4 transition-transform ${isDateMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isDateMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 z-20">
                  <button
                    onClick={() => { setSortDate('asc'); setSortNote(null); setIsDateMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-purple-50 text-sm ${sortDate === 'asc' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-700'}`}
                  >
                    Croissante
                  </button>
                  <button
                    onClick={() => { setSortDate('desc'); setSortNote(null); setIsDateMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-purple-50 text-sm ${sortDate === 'desc' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-700'}`}
                  >
                    Décroissante
                  </button>
                  {sortDate && (
                    <button onClick={() => setSortDate(null)} className="w-full text-left px-4 py-2 mt-1 border-t border-gray-100 hover:bg-gray-50 text-sm text-red-500 font-medium">
                      Effacer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Matière */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('matiere')}
                className={`px-5 py-2 border rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm ${selectedMatieres.length > 0 || isMatiereMenuOpen ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Matière {selectedMatieres.length > 0 && <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-md text-xs font-bold leading-none">{selectedMatieres.length}</span>}
                <svg className={`w-4 h-4 transition-transform ${isMatiereMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isMatiereMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-2 z-20 flex flex-col gap-1 px-3">
                  {allMatieres.map(matiere => (
                    <label key={matiere} className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-2">
                      <input
                        type="checkbox"
                        checked={selectedMatieres.includes(matiere)}
                        onChange={() => handleMatiereToggle(matiere)}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{matiere}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Année */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('promo')}
                className={`px-5 py-2 border rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm ${selectedPromos.length > 0 || isPromoMenuOpen ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Année {selectedPromos.length > 0 && <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-md text-xs font-bold leading-none">{selectedPromos.length}</span>}
                <svg className={`w-4 h-4 transition-transform ${isPromoMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isPromoMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-2 z-20 flex flex-col gap-1 px-3">
                  {allPromos.map(promo => (
                    <label key={promo} className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-2">
                      <input
                        type="checkbox"
                        checked={selectedPromos.includes(promo)}
                        onChange={() => handlePromoToggle(promo)}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{promo}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`${isAdminView ? 'bg-gray-50' : 'bg-purple-700'} flex-1 w-full min-h-screen px-6 py-12 md:px-12`}>
        <h2 className={`text-3xl md:text-4xl font-montserrat font-extrabold pb-4 ${isAdminView ? 'text-gray-900' : 'text-white'} text-center mb-12 tracking-tight`}>
          Les projets
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className={`animate-spin rounded-full h-12 w-12 border-4 ${isAdminView ? 'border-gray-300 border-t-black' : 'border-white border-t-transparent'}`}></div>
          </div>
        ) : displayedProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {displayedProjects.map(project => (
              <div 
                key={project.id} 
                onClick={() => setSelectedProject(project)}
                className="bg-white relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300 flex flex-col group border border-gray-100 hover:border-purple-300 cursor-pointer"
              >
                
                {/* Modération (Croix de suppression) */}
                {canModerate && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                    className="absolute top-3 right-3 z-30 p-2 bg-white/90 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-full text-red-500 shadow-sm border border-red-100 transition-all scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                    title="Supprimer la réalisation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="h-48 bg-gray-200 relative overflow-hidden group">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                       <FileText className="w-12 h-12" strokeWidth={1} />
                    </div>
                  )}
                  {project.year && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black text-purple-800 shadow-sm border border-purple-100 uppercase tracking-widest">
                      {project.year}
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-montserrat font-bold text-gray-900 leading-tight mb-2 line-clamp-2 min-h-[3rem]" title={project.title}>
                    {project.title || 'Sans titre'}
                  </h3>

                  {project.name ? (
                     <div className="flex items-center gap-2 mb-4">
                       <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                         <span className="text-[10px] font-black uppercase">{(project.name.firstname?.[0] || '') + (project.name.lastname?.[0] || '')}</span>
                       </div>
                       <p className="text-gray-600 font-bold text-xs truncate">
                         {project.name.firstname} {project.name.lastname}
                       </p>
                     </div>
                  ) : (
                     <div className="mb-4 text-xs text-gray-300 font-bold italic tracking-wider">Auteur anonyme</div>
                  )}

                  {project.description && (
                     <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4 leading-relaxed">
                       {project.description}
                     </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                       {project.thematic && (
                         <span className="bg-purple-50 text-purple-600 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-purple-100 tracking-tighter">
                           {project.thematic}
                         </span>
                       )}
                    </div>

                    <div className="flex items-center gap-1.5 text-purple-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      Explorer <ChevronDown className="w-3 h-3 -rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 ${isAdminView ? 'bg-white' : 'bg-white/10'} rounded-3xl max-w-2xl mx-auto backdrop-blur-md border ${isAdminView ? 'border-gray-200' : 'border-white/20'}`}>
            <h3 className={`text-xl font-bold ${isAdminView ? 'text-gray-900' : 'text-white'} mb-2`}>Aucun projet ne correspond à vos critères.</h3>
          </div>
        )}
      </div>

      {/* ── Modal de Détails du Projet ── */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
            
            {/* Partie Gauche : Image / Aperçu */}
            <div className="md:w-3/5 bg-gray-50 relative flex items-center justify-center overflow-hidden min-h-[300px]">
              {selectedProject.imageUrl ? (
                <img 
                  src={selectedProject.imageUrl} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-300">
                  <FileText className="w-24 h-24" strokeWidth={0.5} />
                  <span className="font-black text-xs uppercase tracking-widest">Aperçu non disponible</span>
                </div>
              )}
              
              {/* Badge Année */}
              {selectedProject.year && (
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/20 text-xs font-black text-purple-900 uppercase tracking-widest">
                  Promotion {selectedProject.year}
                </div>
              )}
              
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 md:hidden p-3 bg-white/90 rounded-full shadow-lg text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Partie Droite : Infos */}
            <div className="md:w-2/5 p-8 lg:p-12 flex flex-col h-full bg-white relative overflow-y-auto">
              <button 
                onClick={() => setSelectedProject(null)}
                className="hidden md:flex absolute top-8 right-8 p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col gap-8">
                {/* Header Infos */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.thematic && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-black uppercase rounded-lg border border-purple-100">
                        <Tag className="w-3 h-3" /> {selectedProject.thematic}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-montserrat font-black text-gray-900 tracking-tight leading-tight">
                    {selectedProject.title || 'Projet Sans Titre'}
                  </h2>
                  
                  {selectedProject.name && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
                        <span className="font-black">{(selectedProject.name.firstname?.[0] || '') + (selectedProject.name.lastname?.[0] || '')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Réalisé par</span>
                        <p className="font-bold text-gray-900">{selectedProject.name.firstname} {selectedProject.name.lastname}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest underline decoration-purple-300 decoration-2 underline-offset-4">Description du projet</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {selectedProject.description || "Aucune description détaillée n'a été fournie pour ce projet."}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-6 mt-auto border-t border-gray-100 flex flex-col gap-4">
                  {selectedProject.url ? (
                    <a 
                      href={selectedProject.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-4 px-8 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-2xl shadow-xl shadow-purple-200 transition-all hover:-translate-y-1 active:scale-95"
                    >
                      Explorer le rendu <ExternalLink className="w-5 h-5" />
                    </a>
                  ) : (
                    <div className="py-4 px-8 bg-gray-100 text-gray-400 font-bold text-center rounded-2xl border border-gray-200">
                      Lien non disponible
                    </div>
                  )}
                  <p className="text-[10px] text-center text-gray-400 font-medium">
                    Cliquez sur le bouton ci-dessus pour ouvrir le projet dans un nouvel onglet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
