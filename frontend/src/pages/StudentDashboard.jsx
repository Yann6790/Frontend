import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import mmiLogo from '../Images/mmilogo.png';
import { useAuth } from '../context/AuthContext';
import { saeService } from '../services/sae.service';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Data States
  const [saes, setSaes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [activeTab, setActiveTab] = useState('urgentes');
  const [thresholds, setThresholds] = useState({ urgentes: 3, moment: 14 });
  const [selectedMatieres, setSelectedMatieres] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMatiereMenuOpen, setIsMatiereMenuOpen] = useState(false);

  // States pour les inputs du modal
  const [tempUrgentes, setTempUrgentes] = useState(thresholds.urgentes);
  const [tempMoment, setTempMoment] = useState(thresholds.moment);

  const filterRef = useRef(null);

  useEffect(() => {
    const fetchSaes = async () => {
      setIsLoading(true);
      try {
         const apiParams = {};
         
         // 1. Déduire l'ID de la promotion selon la structure du user
         const promoId = user?.promotion?.id || user?.promotionId || user?.studentProfile?.promotionId;
         if (promoId) apiParams.promotionId = promoId;

         // 2. Déduire le groupe (A/B...)
         const groupId = user?.groupTp || user?.studentProfile?.groupTp;
         if (groupId) apiParams.groupId = groupId;

         const data = await saeService.getSaeList(apiParams);
         const allSaes = Array.isArray(data) ? data : data?.data || [];
         
         // --- DEBUG LOGS (F12) ---
         console.log("[DEBUG DASHBOARD] API Params envoyés :", apiParams);
         console.log("[DEBUG DASHBOARD] Réponse brute de /api/saes :", data);
         console.log("[DEBUG DASHBOARD] Liste extraite (allSaes) :", allSaes);
         
         setSaes(allSaes);
      } catch (error) {
         console.error("[DEBUG DASHBOARD] Erreur lors de la récupération des SAEs :", error);
      } finally {
         setIsLoading(false);
      }
    };
    
    if (user) {
      fetchSaes();
    }
  }, [user]);

  const allMatieres = useMemo(() => {
    return [...new Set(saes.map(s => s.thematic).filter(Boolean))];
  }, [saes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsMatiereMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMatiereToggle = (matiere) => {
    setSelectedMatieres(prev =>
      prev.includes(matiere) ? prev.filter(m => m !== matiere) : [...prev, matiere]
    );
  };

  const saveThresholds = () => {
    setThresholds({
      urgentes: parseInt(tempUrgentes, 10) || 3,
      moment: parseInt(tempMoment, 10) || 14
    });
    setIsEditModalOpen(false);
  };

  const calculateDaysRemaining = (dateRendu) => {
    if (!dateRendu) return 999;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateRendu);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - todayStart;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const displayedSAEs = useMemo(() => {
    let filtered = saes.filter(sae => {
      // Les SAEs "Rendues" (isSubmitted) n'apparaissent plus dans le dashboard.
      // Elles sont visibles dans l'onglet "Mes rendus".
      if (sae.isSubmitted) return false;
      
      const daysRemaining = calculateDaysRemaining(sae.dueDate);

      if (activeTab === 'urgentes') {
        return daysRemaining <= thresholds.urgentes;
      } else if (activeTab === 'moment') {
        return daysRemaining > thresholds.urgentes && daysRemaining <= thresholds.moment;
      } else if (activeTab === 'planifier') {
        return daysRemaining > thresholds.moment;
      }
      return false;
    });

    // 2. Filtrer par matière si des matières sont sélectionnées
    if (selectedMatieres.length > 0) {
      filtered = filtered.filter(sae => selectedMatieres.includes(sae.thematic));
    }

    // Tri par date de rendu croissante (les null en dernier via 9999-12-31)
    filtered.sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));

    return filtered;
  }, [activeTab, thresholds, selectedMatieres, saes]);

  const renderDaysText = (sae) => {
    if (sae.isSubmitted) return `Rendu`;
    if (!sae.dueDate) return "Date de rendu indéfinie";
    const days = calculateDaysRemaining(sae.dueDate);
    if (days < 0) return `En retard de ${Math.abs(days)} jour(s)`;
    if (days === 0) return "À rendre aujourd'hui !";
    if (days === 1) return "Rendu demain";
    return `Rendu dans ${days} jours`;
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-gradient-to-b from-white to-purple-200 min-h-screen">
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Logo MMI */}
        <div className="flex justify-center md:justify-start mb-2">
          <img 
            src={mmiLogo} 
            alt="Logo MMI" 
            className="h-12 md:h-14 w-auto"
          />
        </div>

        {/* 2. Contrôles */}
        <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Modifier
            </button>

            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsMatiereMenuOpen(!isMatiereMenuOpen)}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-md transition-all shadow-sm ${selectedMatieres.length > 0 ? 'bg-purple-50 border border-purple-200 text-purple-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}`}
              >
                Matière {selectedMatieres.length > 0 && <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded-md text-xs">{selectedMatieres.length}</span>}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              
              {isMatiereMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-2 z-20 flex flex-col gap-1 px-3">
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
                  {selectedMatieres.length > 0 && (
                    <button 
                      onClick={() => setSelectedMatieres([])}
                      className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-800 text-center py-1 border-t border-gray-100"
                    >
                      Effacer tout
                    </button>
                  )}
                  {allMatieres.length === 0 && (
                    <span className="text-sm text-gray-500 italic p-2 block">Aucune matière existante</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Les Onglets Principaux reliés au contenu */}
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-200 px-2 lg:px-0">
          {[
            { id: 'urgentes', label: 'SAE urgentes', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
            { id: 'moment', label: 'SAE du moment', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'planifier', label: 'SAE à planifier', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold text-sm transition-all -mb-[1px] ${
                activeTab === tab.id 
                  ? 'bg-white text-purple-700 border-t border-l border-r border-t-purple-600 border-l-gray-200 border-r-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 border-t border-transparent'
              }`}
            >
              <svg className={`w-4 h-4 ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon}></path>
              </svg>
              {tab.label}
              {activeTab === tab.id && displayedSAEs.length > 0 && !isLoading && (
                <span className="ml-1.5 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-xs">
                  {displayedSAEs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 4. Zone de contenu (Grille des SAE) */}
        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200 p-5 md:p-6 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
               <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
               <span className="text-gray-500 font-medium">Chargement de vos SAEs...</span>
            </div>
          ) : displayedSAEs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedSAEs.map((sae, index) => {
                const daysLeft = calculateDaysRemaining(sae.dueDate);
                const isUrgentContext = daysLeft <= thresholds.urgentes && !sae.isSubmitted;
                
                // Prioritize 'isUrgent' from backend if true, else frontend logic:
                const isUrgent = sae.isUrgent || isUrgentContext;
                
                return (
                  <Link 
                    to={`/sae/${sae.id}`} 
                    key={`${sae.id}-${index}`}
                    className={`block group bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative border ${isUrgent ? 'border-red-200 hover:border-red-300 bg-red-50/20' : 'border-gray-100 hover:border-purple-200'}`}
                  >
                    {/* Top color bar */}
                    <div className={`h-1.5 w-full ${isUrgent ? 'bg-red-500' : 'bg-purple-500'} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                    
                    {/* Banner Image Optional */}
                    {sae.banner && (
                      <div className="w-full h-32 bg-gray-200 overflow-hidden">
                        <img src={sae.banner} alt={sae.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    
                    <div className="p-4 flex flex-col h-full min-h-[140px]">
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-block bg-gray-50 text-gray-600 text-[11px] font-bold px-2 py-1 flex items-center justify-center rounded-md border border-gray-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                          {sae.thematic || 'Développement'}
                        </span>
                        
                        {sae.isSubmitted && (
                          <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-100 uppercase tracking-wide">
                            Terminé
                          </span>
                        )}
                        {!sae.isSubmitted && isUrgent && (
                           <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 uppercase tracking-wide flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                             Urgent
                           </span>
                        )}
                      </div>
                      
                      <h3 className="text-base font-montserrat font-bold text-gray-900 leading-tight mb-4 group-hover:text-purple-700 transition-colors">
                        {sae.title}
                      </h3>
                      
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2">
                        <svg className={`w-4 h-4 ${isUrgent ? 'text-red-500' : (sae.isSubmitted ? 'text-green-500' : 'text-purple-500')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className={`text-sm font-semibold ${isUrgent ? 'text-red-600' : (sae.isSubmitted ? 'text-green-600' : 'text-gray-600')}`}>
                          {renderDaysText(sae)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-lg font-montserrat font-semibold text-gray-700 mb-1">Aucune SAE trouvée</h3>
              <p className="text-gray-500 text-sm max-w-sm">Vous êtes à jour dans vos rendus pour cet onglet.</p>
            </div>
          )}
        </div>
      </div>
      </main>

      {/* 5. Modale Modifier le Dashboard */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/60 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-montserrat font-semibold text-gray-900">
                Modifier le Dashboard
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors"
                title="Fermer"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 14 14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="urgentes" className="block text-sm font-medium text-gray-700 mb-1">
                    Jours limite pour SAE (Urgentes)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      id="urgentes" 
                      min="0"
                      value={tempUrgentes}
                      onChange={(e) => setTempUrgentes(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 outline-none transition-all" 
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">jour(s)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="moment" className="block text-sm font-medium text-gray-700 mb-1">
                    Jours limite pour SAE (Du moment)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      id="moment" 
                      min={parseInt(tempUrgentes, 10) + 1 || 1}
                      value={tempMoment}
                      onChange={(e) => setTempMoment(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 outline-none transition-all" 
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">jour(s)</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Doit être supérieur aux SAE urgentes.</p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end p-4 border-t border-gray-100 gap-3 rounded-b-xl">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-600 bg-white hover:bg-gray-100 font-medium rounded-md text-sm px-4 py-2 focus:outline-none transition-colors border border-gray-200"
              >
                Annuler
              </button>
              <button 
                onClick={saveThresholds}
                className="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-semibold rounded-md text-sm px-4 py-2 text-center transition-colors shadow-sm"
              >
                Sauvegarder et fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
