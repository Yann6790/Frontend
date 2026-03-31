import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { saeService } from '../services/sae.service';

export default function SharedGallery({ canModerate = false, isAdminView = false, refreshTrigger = 0, onDelete = () => {} }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortDate, setSortDate] = useState(null); // 'asc' | 'desc' | null
  const [sortNote, setSortNote] = useState(null); // 'asc' | 'desc' | null
  const [selectedMatieres, setSelectedMatieres] = useState([]);
  const [selectedPromos, setSelectedPromos] = useState([]);

  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isMatiereMenuOpen, setIsMatiereMenuOpen] = useState(false);
  const [isNoteMenuOpen, setIsNoteMenuOpen] = useState(false);
  const [isPromoMenuOpen, setIsPromoMenuOpen] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const res = await saeService.getArchives();
        const data = Array.isArray(res) ? res : (res?.data || []);
        setProjects(data);
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
              <div key={project.id} className="bg-white relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300 flex flex-col group border border-gray-100 hover:border-purple-300">
                
                {/* Modération (Croix de suppression) */}
                {canModerate && (
                  <button 
                    onClick={() => onDelete(project.id)}
                    className="absolute top-3 right-3 z-30 p-2 bg-white/90 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-full text-red-500 shadow-sm border border-red-100 transition-all scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                    title="Supprimer la réalisation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
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
                       <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  {/* Notes enlevées car l'API archive ne les fournit pas, on affiche l'année */}
                  {project.year && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-black text-purple-800 shadow-sm">
                      {project.year}
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-montserrat font-semibold text-gray-900 leading-tight mb-2 line-clamp-2" title={project.title}>
                    {project.title || 'Sans titre'}
                  </h3>

                  {project.name ? (
                     <div className="flex items-center gap-2 mb-3">
                       <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                         <span className="text-[10px] font-black">{(project.name.firstname?.[0] || '') + (project.name.lastname?.[0] || '')}</span>
                       </div>
                       <p className="text-gray-600 font-medium text-sm truncate">
                         {project.name.firstname} {project.name.lastname}
                       </p>
                     </div>
                  ) : (
                     <div className="mb-3 text-sm text-gray-400">—</div>
                  )}

                  {project.description && (
                     <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                       {project.description}
                     </p>
                  )}

                  <div className="mt-auto space-y-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                       {project.thematic && (
                         <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-md border border-purple-100">
                           {project.thematic}
                         </span>
                       )}
                    </div>

                    {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors">
                            Voir
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    )}
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
    </>
  );
}
