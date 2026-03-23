import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const mockRendus = [
  { id: 1, titre: "SAE 101 - Identité Visuelle", matiere: "Design", semestre: "S1", note: 16, dateDepot: "2023-10-15" },
  { id: 2, titre: "SAE 102 - Site Statique", matiere: "Développement", semestre: "S1", note: 14, dateDepot: "2023-11-20" },
  { id: 3, titre: "SAE 201 - Vidéo Promotionnelle", matiere: "Audiovisuel", semestre: "S2", note: 18, dateDepot: "2024-03-05" },
  { id: 4, titre: "SAE 202 - Base de Données", matiere: "Développement", semestre: "S2", note: 9, dateDepot: "2024-04-10" },
  { id: 5, titre: "SAE 301 - Refonte UX/UI", matiere: "Design", semestre: "S3", note: "Non noté", dateDepot: "2024-10-01" },
  { id: 6, titre: "SAE 302 - App React", matiere: "Développement", semestre: "S3", note: 15, dateDepot: "2024-11-15" },
  { id: 7, titre: "SAE 401 - Stratégie Comm", matiere: "Communication", semestre: "S4", note: "Non noté", dateDepot: "2025-02-28" },
  { id: 8, titre: "SAE 402 - Animation 3D", matiere: "Audiovisuel", semestre: "S4", note: 12, dateDepot: "2025-04-12" }
];

const allSemestres = ["Tous", "S1", "S2", "S3", "S4", "S5", "S6"];
const allMatieres = ["Toutes", ...new Set(mockRendus.map(r => r.matiere))];

export default function StudentRendusPage() {
  const [selectedSemestre, setSelectedSemestre] = useState('Tous');
  const [selectedMatiere, setSelectedMatiere] = useState('Toutes');

  const displayedRendus = useMemo(() => {
    let filtered = [...mockRendus];

    if (selectedSemestre !== "Tous") {
      filtered = filtered.filter(r => r.semestre === selectedSemestre);
    }
    
    if (selectedMatiere !== "Toutes") {
      filtered = filtered.filter(r => r.matiere === selectedMatiere);
    }

    // Tri décroissant par défaut (les plus récents en premier)
    filtered.sort((a, b) => new Date(b.dateDepot) - new Date(a.dateDepot));

    return filtered;
  }, [selectedSemestre, selectedMatiere]);

  return (
    <div className="flex-1 w-full flex flex-col font-merriweather">
      
      {/* En-tête de page (Fond blanc) */}
      <div className="flex-none w-full bg-white border-b border-gray-100 shadow-sm relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <h1 className="text-3xl md:text-4xl font-montserrat font-extrabold text-gray-900 text-center md:text-left">
            Mes Travaux Rendus
          </h1>
          
          {/* Zone de filtres alignés horizontalement */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-gray-50/80 p-3 md:p-4 rounded-2xl border border-gray-200">
            {/* Filtre Semestre */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:block">Semestre</label>
              <select 
                value={selectedSemestre} 
                onChange={(e) => setSelectedSemestre(e.target.value)}
                className="bg-white border font-bold border-gray-300 text-gray-800 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 transition-shadow cursor-pointer shadow-sm"
              >
                {allSemestres.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="w-px h-8 bg-gray-300 hidden md:block"></div>

            {/* Filtre Matière */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:block">Matière</label>
              <select 
                value={selectedMatiere} 
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="bg-white border font-bold border-gray-300 text-gray-800 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 transition-shadow cursor-pointer shadow-sm"
              >
                {allMatieres.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Zone d'affichage (Fond violet vif) */}
      <main className="flex-1 w-full bg-purple-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          
          {displayedRendus.map((rendu) => (
            <Link 
              to={`/sae/${rendu.id}/rendu?mode=view`} 
              key={rendu.id}
              className="group flex flex-col sm:flex-row items-center bg-white rounded-[2rem] shadow-xl border-4 border-transparent hover:border-purple-300/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden p-6 sm:p-8 gap-6 w-full relative"
            >
              {/* Effet visuel hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Infos à gauche */}
              <div className="flex-1 w-full flex flex-col gap-3 relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-purple-100 text-purple-800 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    {rendu.semestre}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-sm">
                    {rendu.matiere}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black font-montserrat text-gray-900 group-hover:text-purple-700 transition-colors mt-1">
                  {rendu.titre}
                </h3>
                
                <div className="flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-sm font-bold text-gray-500">
                    Déposé le {new Date(rendu.dateDepot).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              {/* Note à droite */}
              <div className="flex-none flex items-center justify-center shrink-0 w-full sm:w-auto mt-4 sm:mt-0 relative z-10 border-t sm:border-t-0 sm:border-l border-gray-100 pt-6 sm:pt-0 sm:pl-8">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center border-4 shadow-md transform group-hover:rotate-3 transition-transform ${
                  rendu.note === "Non noté" 
                    ? "bg-gray-50 border-gray-200 text-gray-400" 
                    : (rendu.note >= 10 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600")
                }`}>
                  {rendu.note === "Non noté" ? (
                    <span className="text-xs font-black uppercase text-center leading-tight">En<br/>Attente</span>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-3xl sm:text-4xl font-black font-montserrat leading-none tracking-tighter">{rendu.note}</span>
                      <span className="text-sm font-bold opacity-60 ml-0.5">/20</span>
                    </div>
                  )}
                </div>
                {/* Icône flèche pour inciter au clic */}
                <div className="hidden sm:flex text-gray-300 group-hover:text-purple-600 transition-colors ml-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </Link>
          ))}

          {displayedRendus.length === 0 && (
            <div className="text-center py-20 bg-white/10 rounded-[2rem] border-2 border-dashed border-white/20 backdrop-blur-md">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <p className="text-white font-bold text-xl">Aucun rendu trouvé pour ces critères.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
