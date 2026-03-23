import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './PublicGallery.css';

const mockProjects = [
  { id: 1, titre: "Application Mobile Météo", etudiant: "Alice Dupont", dateRendu: "2023-11-15", matiere: "Développement Web", note: 16, promo: "MMI 2", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+1" },
  { id: 2, titre: "Court-métrage Noir et Blanc", etudiant: "Bob Martin", dateRendu: "2023-12-10", matiere: "Audiovisuel", note: 18, promo: "MMI 3", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+2" },
  { id: 3, titre: "Maquette Site E-commerce", etudiant: "Charlie Leroy", dateRendu: "2024-01-20", matiere: "Design UX/UI", note: 15, promo: "MMI 1", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+3" },
  { id: 4, titre: "Jeu Vidéo 2D", etudiant: "David Garnier", dateRendu: "2024-02-05", matiere: "Développement Web", note: 14, promo: "MMI 2", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+4" },
  { id: 5, titre: "Affiche Festival", etudiant: "Emma Faure", dateRendu: "2024-02-15", matiere: "Graphisme", note: 17, promo: "MMI 1", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+5" },
  { id: 6, titre: "Webdocumentaire Écologie", etudiant: "Fabien Blanc", dateRendu: "2023-10-30", matiere: "Audiovisuel", note: 19, promo: "MMI 3", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+6" },
  { id: 7, titre: "Application Gestion de Tâches", etudiant: "Gabriel Morel", dateRendu: "2024-03-01", matiere: "Développement Web", note: 13, promo: "MMI 2", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+7" },
  { id: 8, titre: "Identité Visuelle Marque", etudiant: "Hugo Perrin", dateRendu: "2023-11-05", matiere: "Design UX/UI", note: 16, promo: "MMI 3", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+8" },
  { id: 9, titre: "API RESTful Node.js", etudiant: "Inès Roux", dateRendu: "2024-01-25", matiere: "Développement Web", note: 18, promo: "MMI 2", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+9" },
  { id: 10, titre: "Podcast Tech", etudiant: "Jules Fournier", dateRendu: "2023-12-01", matiere: "Audiovisuel", note: 15, promo: "MMI 1", imageUrl: "https://placehold.co/600x400/eeeeee/999999?text=Image+Projet+10" }
];

const allMatieres = [...new Set(mockProjects.map(p => p.matiere))];
const allPromos = ["MMI 1", "MMI 2", "MMI 3"];

export default function PublicGallery() {
  // --- 2. Logique d'état ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDate, setSortDate] = useState(null); // 'asc' | 'desc' | null
  const [sortNote, setSortNote] = useState(null); // 'asc' | 'desc' | null
  const [selectedMatieres, setSelectedMatieres] = useState([]);
  const [selectedPromos, setSelectedPromos] = useState([]);

  // États booléens pour gérer l'ouverture/fermeture des 4 menus
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isMatiereMenuOpen, setIsMatiereMenuOpen] = useState(false);
  const [isNoteMenuOpen, setIsNoteMenuOpen] = useState(false);
  const [isPromoMenuOpen, setIsPromoMenuOpen] = useState(false);

  const containerRef = useRef(null);

  // Fermer les menus au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeAllMenus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeAllMenus = () => {
    setIsDateMenuOpen(false);
    setIsMatiereMenuOpen(false);
    setIsNoteMenuOpen(false);
    setIsPromoMenuOpen(false);
  };

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

  // --- 3. Logique de filtrage et tri ---
  const displayedProjects = useMemo(() => {
    let filtered = mockProjects.filter(project => {
      // Filtre de recherche dynamique
      const matchSearch = project.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.etudiant.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre Matière/Promo
      const matchMatiere = selectedMatieres.length === 0 || selectedMatieres.includes(project.matiere);
      const matchPromo = selectedPromos.length === 0 || selectedPromos.includes(project.promo);

      return matchSearch && matchMatiere && matchPromo;
    });

    // Tri sur date de rendu OU note
    if (sortDate) {
      filtered.sort((a, b) => {
        const dateA = new Date(a.dateRendu);
        const dateB = new Date(b.dateRendu);
        return sortDate === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortNote) {
      filtered.sort((a, b) => {
        return sortNote === 'asc' ? a.note - b.note : b.note - a.note;
      });
    }

    return filtered;
  }, [searchTerm, sortDate, sortNote, selectedMatieres, selectedPromos]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-b from-white to-purple-200">
      {/* 4. Interface Haut (Fond transparent/glass pour le dégradé) */}
      <div className="bg-white/40 backdrop-blur-sm px-6 py-6 md:px-12 flex flex-col gap-6 relative z-10 border-b border-purple-100/50">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-black tracking-tight">Welizy</h1>
          <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-full transition-colors shadow-sm">
            Se connecter
          </Link>
        </div>

        {/* Recherche Centrée */}
        <div className="flex justify-center mt-2">
          <input
            type="text"
            placeholder="Recherchez par nom d'étudiant ou de projet"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-2xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-purple-100 border border-gray-200 rounded-[2rem] py-4 px-8 text-lg font-medium outline-none transition-all placeholder-gray-400"
          />
        </div>

        {/* Boutons de filtres */}
        <div className="flex flex-wrap justify-center gap-3 mt-2" ref={containerRef}>
          {/* 1. Date de rendu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('date')}
              className={`px-6 py-2 border rounded-full font-medium flex items-center gap-2 transition-colors ${sortDate || isDateMenuOpen ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
              className={`px-6 py-2 border rounded-full font-medium flex items-center gap-2 transition-colors ${selectedMatieres.length > 0 || isMatiereMenuOpen ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Matière {selectedMatieres.length > 0 && <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full text-xs font-bold leading-none">{selectedMatieres.length}</span>}
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

          {/* 3. Note */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('note')}
              className={`px-6 py-2 border rounded-full font-medium flex items-center gap-2 transition-colors ${sortNote || isNoteMenuOpen ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Note
              <svg className={`w-4 h-4 transition-transform ${isNoteMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isNoteMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 z-20">
                <button
                  onClick={() => { setSortNote('asc'); setSortDate(null); setIsNoteMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-purple-50 text-sm ${sortNote === 'asc' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-700'}`}
                >
                  Croissante
                </button>
                <button
                  onClick={() => { setSortNote('desc'); setSortDate(null); setIsNoteMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-purple-50 text-sm ${sortNote === 'desc' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-700'}`}
                >
                  Décroissante
                </button>
                {sortNote && (
                  <button onClick={() => setSortNote(null)} className="w-full text-left px-4 py-2 mt-1 border-t border-gray-100 hover:bg-gray-50 text-sm text-red-500 font-medium">
                    Effacer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 4. Promo */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('promo')}
              className={`px-6 py-2 border rounded-full font-medium flex items-center gap-2 transition-colors ${selectedPromos.length > 0 || isPromoMenuOpen ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Promo {selectedPromos.length > 0 && <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full text-xs font-bold leading-none">{selectedPromos.length}</span>}
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

        {/* Texte et bouton de retour */}
        <div className="relative flex flex-col md:flex-row items-center justify-center mt-6 py-4 px-2 w-full lg:h-12">
          <p className="text-gray-500 font-medium lg:absolute w-full text-center pointer-events-none mb-4 md:mb-0">
            Dans cet interface vous trouverez toutes les réalisations disponibles des étudiants.
          </p>
          <div className="lg:ml-auto relative z-10 pointer-events-auto">
            <Link to="/" className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2.5 px-6 rounded-lg transition-colors border border-purple-200 whitespace-nowrap">
              Retour à la page d'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Interface Bas */}
      <div className="flex-1 px-6 py-16 md:px-12 z-0">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-16 tracking-tight">Les projets</h2>

        {displayedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {displayedProjects.map(project => (
              <div key={project.id} className="bg-white rounded-[1.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 flex flex-col group border-4 border-transparent hover:border-purple-300/30">
                {/* Image du projet (placeholder) */}
                <div className="h-60 bg-gray-200 relative overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.titre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-black text-purple-800 shadow-lg">
                    {project.note}/20
                  </div>
                </div>

                {/* Contenu de la Carte */}
                <div className="p-7 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2" title={project.titre}>
                    {project.titre}
                  </h3>

                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <p className="text-gray-600 font-medium">
                      {project.etudiant}
                    </p>
                  </div>

                  <div className="mt-auto space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-100">
                        {project.matiere}
                      </span>
                      <span className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-100">
                        {project.promo}
                      </span>
                    </div>

                    <div className="text-sm text-gray-400 font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {new Date(project.dateRendu).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-3xl max-w-2xl mx-auto backdrop-blur-md border border-purple-200 shadow-sm">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-600">Modifiez vos filtres ou votre recherche pour découvrir d'autres projets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
