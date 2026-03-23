import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import mmiLogo from '../Images/mmilogo.png';
import { Eye, EyeOff } from 'lucide-react';

const mockTeacherSAE = [
  { id: 1, titre: "SAE 301 - Conception Web", semestre: "S3", dateRendu: "2024-01-20", statut: "En cours", isVisible: true },
  { id: 2, titre: "SAE 402 - Développement Avancé", semestre: "S4", dateRendu: "2024-05-15", statut: "À venir", isVisible: true },
  { id: 3, titre: "SAE 201 - Base de données", semestre: "S2", dateRendu: "2023-11-10", statut: "Terminé", isVisible: true },
  { id: 4, titre: "SAE 101 - Audit Numérique", semestre: "S1", dateRendu: "2023-10-05", statut: "Terminé", isVisible: false },
  { id: 5, titre: "SAE 302 - Communication", semestre: "S3", dateRendu: "2024-02-10", statut: "En cours", isVisible: true },
  { id: 6, titre: "SAE 501 - Stage pro.", semestre: "S5", dateRendu: "2025-01-10", statut: "À venir", isVisible: false }
];

const ALL_SEMESTRES = ["Tous", "S1", "S2", "S3", "S4", "S5", "S6"];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('visibles');
  const [selectedSemestre, setSelectedSemestre] = useState('Tous');

  const displayedSAEs = useMemo(() => {
    let filtered = mockTeacherSAE.filter(sae => {
      if (activeTab === 'visibles') return sae.isVisible === true;
      if (activeTab === 'cachees') return sae.isVisible === false;
      return true;
    });

    if (selectedSemestre !== "Tous") {
      filtered = filtered.filter(sae => sae.semestre === selectedSemestre);
    }

    return filtered;
  }, [activeTab, selectedSemestre]);

  const tabs = [
    { id: 'visibles', label: 'SAE visible(s)', icon: <Eye strokeWidth={2.5} className="w-5 h-5" /> },
    { id: 'cachees', label: 'SAE cachée(s)', icon: <EyeOff strokeWidth={2.5} className="w-5 h-5" /> }
  ];

  return (
    <div className="flex-1 flex flex-col font-merriweather bg-gradient-to-b from-white to-indigo-200 min-h-screen">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Logo MMI */}
        <div className="flex justify-center md:justify-start -mb-2">
          <img 
            src={mmiLogo} 
            alt="Logo MMI" 
            className="h-16 md:h-20 w-auto"
          />
        </div>

        {/* Zone de contrôles */}
        <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedSemestre}
              onChange={(e) => setSelectedSemestre(e.target.value)}
              className="flex items-center gap-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 px-4 py-2 outline-none rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              {ALL_SEMESTRES.map(s => <option key={s} value={s}>{s === 'Tous' ? 'Filtrer par semestre' : s}</option>)}
            </select>
          </div>
        </div>

        {/* Les Onglets Principaux reliés au contenu */}
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-200 px-2 lg:px-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-t-xl font-bold text-sm md:text-base transition-all -mb-[1px] relative overflow-hidden group ${
                activeTab === tab.id 
                  ? 'bg-white text-indigo-700 border-t border-l border-r border-t-indigo-500 border-l-gray-200 border-r-gray-200 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-10' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50/80 border-t border-transparent'
              }`}
            >
              {activeTab === tab.id && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              )}
              <div className={`transition-colors ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {tab.icon}
              </div>
              <span className="tracking-wide">{tab.label}</span>
              {activeTab === tab.id && (
                <span className="ml-1 bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs shadow-sm">
                  {displayedSAEs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Zone d'affichage */}
        <div className="bg-white rounded-b-3xl rounded-tr-3xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[400px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            
            {displayedSAEs.map(sae => (
              <div key={sae.id} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-indigo-400 transition-all duration-200 hover:shadow-md hover:-translate-y-1 flex flex-col group relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/30 transition-colors pointer-events-none"></div>

                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3 relative z-10">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    {sae.semestre}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${sae.statut === 'Terminé' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                    {sae.statut}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-montserrat text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors relative z-10 leading-snug">
                  {sae.titre}
                </h3>
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-xs text-gray-600 font-medium truncate">
                    Échéance le {new Date(sae.dateRendu).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="mt-auto pt-3 text-right relative z-10">
                  <Link to={`/teacher/sae/${sae.id}`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors shadow-sm">
                    Gérer la SAE
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>
              </div>
            ))}
            
          </div>
          
          {displayedSAEs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-sm">
                {activeTab === 'visibles' ? <EyeOff className="w-8 h-8" /> : <Eye className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-montserrat font-bold text-gray-800 mb-2">Aucune SAE dans cette catégorie</h3>
              <p className="text-gray-500 text-sm max-w-sm font-medium">Vous pouvez modifier la visibilité d'une SAE depuis sa page de gestion.</p>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}
