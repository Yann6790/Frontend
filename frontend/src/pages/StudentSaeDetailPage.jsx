import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Folder, FolderOpen, FileText, ChevronDown, Clock, CheckCircle2 } from 'lucide-react';

const LISTE_MATIERES_MMI = ["Développement Web", "Graphisme", "Audiovisuel", "Communication", "Gestion de projet", "UX/UI Design"];

const mockSaeDetails = {
  id: 'sae-1',
  titre: "SAE 3.01 - Concevoir un service numérique",
  description: "Cette SAE a pour objectif de concevoir un service numérique interactif en appliquant les méthodologies centrées sur les utilisateurs (UX/UI). Vous devrez réaliser une recherche utilisateur, concevoir l'architecture de l'information, prototyper l'interface et mener des tests d'utilisabilité de manière itérative.",
  matieres: ["Développement Web", "UX/UI Design"],
  equipePedagogique: [
    { id: 'prof-1', nom: 'M. Dupont', role: 'Principal' },
    { id: 'prof-2', nom: 'M. Leroy', role: 'Secondaire' }
  ],
  imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=1200&h=800",
  dossiers: [
    {
      id: "f1",
      nom: "Consignes",
      fichiers: [
        { nom: "Cahier_des_charges_V1.pdf" },
        { nom: "Grille_evaluation.pdf" }
      ]
    },
    {
      id: "f2",
      nom: "Ressources annexes",
      fichiers: [
        { nom: "Assets_Graphiques.zip" },
        { nom: "Charte_Editoriale.pdf" },
        { nom: "Templates_Figma.link" }
      ]
    }
  ],
  dateRenduFinale: "2026-05-15T23:59:00",
  phases: [
    {
      id: "p1",
      numero: 1,
      titre: "Recherche UX",
      description: "Mener des entretiens utilisateurs et créer des personas.",
      dateLimite: "2026-04-10T23:59:00",
      statut: "terminée"
    },
    {
      id: "p2",
      numero: 2,
      titre: "Prototypage UI",
      description: "Réaliser les maquettes haute fidélité sur Figma.",
      dateLimite: "2026-04-30T23:59:00",
      statut: "en cours"
    },
    {
      id: "p3",
      numero: 3,
      titre: "Tests et Rendu",
      description: "Tester le prototype interactif et préparer le livrable final.",
      dateLimite: "2026-05-15T23:59:00",
      statut: "à venir"
    }
  ]
};

export default function StudentSaeDetailPage() {
  const { id } = useParams();
  const [openFolders, setOpenFolders] = useState({});
  const [phaseInput, setPhaseInput] = useState("");

  const toggleFolder = (folderId) => {
    setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // Dans un cas réel, on irait chercher la SAE avec useFetch ou similaire grâce à 'id'
  const sae = mockSaeDetails;
  
  // Fonction pour calculer les jours restants
  const calculateDaysRemaining = (targetDate) => {
    const diffTime = new Date(targetDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemainingGlobal = calculateDaysRemaining(sae.dateRenduFinale); 


  return (
    <div className="w-full min-h-full bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* A. Section Haute */}
        <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
          <h1 className="text-3xl md:text-4xl font-black text-black text-center mb-6 tracking-tight">
            {sae.titre}
          </h1>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {sae.matieres?.map(m => (
              <span key={m} className="px-5 py-2 bg-[#A3477F]/10 text-[#A3477F] border border-[#A3477F]/20 rounded-full text-sm font-black tracking-wide shadow-sm">
                {m}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-gray-600 mb-12 bg-gray-50 border border-gray-100 max-w-max mx-auto px-6 py-3 rounded-2xl shadow-sm">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mr-1">Équipe :</span>
            {sae.equipePedagogique?.map((prof, i) => (
              <span key={prof.id} className="text-[15px]">
                <strong className={prof.role === 'Principal' ? 'text-gray-900' : 'text-gray-700'}>{prof.nom}</strong>
                {prof.role === 'Principal' && <span className="text-[11px] text-[#A3477F] font-black uppercase tracking-wider ml-1.5">(Responsable)</span>}
                {i < sae.equipePedagogique.length - 1 && <span className="text-gray-300 mx-1.5">|</span>}
              </span>
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="w-full lg:w-1/2 overflow-hidden rounded-2xl shadow-lg group relative bg-gray-100 aspect-[4/3]">
              <img 
                src={sae.imageUrl} 
                alt={sae.titre} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <div className="inline-block border-l-4 border-[#A3477F] pl-4 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Description du Projet</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg font-light">
                {sae.description}
              </p>
            </div>
          </div>
        </section>

        {/* B. Section Milieu */}
        <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 antialiased">
          <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Documents & Ressources</h2>
          <div className="flex flex-col gap-5">
            {sae.dossiers.map(dossier => {
              const isOpen = openFolders[dossier.id];
              return (
                <div key={dossier.id} className="border-b-4 border-[#A3477F] rounded-xl bg-gray-50/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <button
                    onClick={() => toggleFolder(dossier.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors group focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-md shadow-sm transition-transform duration-300">
                        {isOpen ? <FolderOpen className="text-[#A3477F] w-5 h-5" strokeWidth={1.5} /> : <Folder className="text-[#A3477F] w-5 h-5" strokeWidth={1.5} />}
                      </div>
                      <span className="font-bold text-lg text-gray-800 tracking-tight">{dossier.nom}</span>
                    </div>
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <div className={`transition-all duration-400 ease-out ${isOpen ? 'max-h-[500px] opacity-100 py-2' : 'max-h-0 opacity-0'}`}>
                    <ul className="px-6 pb-6 pt-2 flex flex-col gap-3">
                      {dossier.fichiers.map((fichier, idx) => (
                        <li key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm hover:shadow-md cursor-pointer group transition-all duration-200 border border-gray-100 hover:border-[#A3477F]/30 hover:-translate-y-0.5">
                          <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-[#A3477F]/10 transition-colors">
                            <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#A3477F] transition-colors" />
                          </div>
                          <span className="text-gray-700 font-medium group-hover:text-black transition-colors">{fichier.nom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* C. Section Basse */}
        <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
          <div className="flex flex-col xl:flex-row gap-10">
            
            {/* Bloc Gauche - Global */}
            <div className="w-full xl:w-1/3 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-inner group">
              <div className="bg-white p-3 rounded-xl shadow-sm mb-5 transition-transform duration-500">
                <Clock className="w-8 h-8 text-[#A3477F]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-2">Rendu Final</h3>
              <p className="text-3xl font-black text-black mb-8 tracking-tight">
                {daysRemainingGlobal} Jours
              </p>
              <Link to={`/sae/${id}/rendu`} className="w-full py-4 px-6 bg-[#A3477F] hover:bg-[#8e3e6f] text-white font-bold rounded-lg shadow-[0_8px_20px_0_rgba(163,71,127,0.3)] hover:shadow-[0_12px_25px_rgba(163,71,127,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-lg tracking-wide flex items-center justify-center gap-2">
                <span>Rendre la SAE</span>
                <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
              </Link>
            </div>

            {/* Bloc Droite - Gestion des Phases */}
            <div className="w-full xl:w-2/3 flex flex-col">
              
              {/* Timeline Indicator */}
              <div className="flex items-center gap-3 mb-10">
                {sae.phases.map((p, idx) => (
                  <div key={p.id} className="flex-1 flex flex-col gap-3 group">
                    <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-0 transition-all duration-500 ${
                          p.statut === 'terminée' 
                            ? 'bg-[#A3477F]' 
                            : p.statut === 'en cours' 
                              ? 'bg-[#A3477F] opacity-90' 
                              : 'bg-transparent'
                        }`} 
                      />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                      p.statut === 'en cours' ? 'text-[#A3477F]' : 
                      p.statut === 'terminée' ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      Phase {p.numero}
                    </span>
                  </div>
                ))}
              </div>

              {/* Phase Actuelle Content */}
              {sae.phases.filter(p => p.statut === 'en cours').map(currentPhase => (
                <div key={currentPhase.id} className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="mb-8">
                    <div className="inline-block px-4 py-1.5 bg-[#A3477F]/10 rounded-full mb-4">
                      <span className="text-sm font-bold text-[#A3477F] uppercase tracking-wider">Étape En Cours</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
                      Phase {currentPhase.numero} : {currentPhase.titre}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{currentPhase.description}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3 mb-8">
                    <label htmlFor="phase-input" className="font-bold text-gray-800 flex items-center gap-2">
                       <FileText className="w-5 h-5 text-gray-500" />
                       Journal de bord de la phase
                    </label>
                    <div className="relative group">
                      <textarea 
                        id="phase-input"
                        value={phaseInput}
                        onChange={(e) => setPhaseInput(e.target.value)}
                        placeholder="Décrivez ce que vous avez accompli durant cette phase, les difficultés rencontrées..."
                        className="w-full min-h-[160px] p-4 border border-black rounded-lg bg-white focus:ring-2 focus:ring-[#A3477F]/20 focus:border-[#A3477F] transition-all duration-300 resize-y font-medium text-gray-800 shadow-sm placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-red-500 font-bold bg-white px-4 py-2.5 rounded-lg shadow-sm border border-red-100 w-full sm:w-auto text-sm">
                      <Clock className="w-5 h-5 animate-pulse" strokeWidth={1.5} />
                      <span>Reste {calculateDaysRemaining(currentPhase.dateLimite)} jours</span>
                    </div>
                    <button className="w-full sm:w-auto py-2.5 px-6 bg-black hover:bg-gray-800 text-white font-bold rounded-lg shadow-[0_8px_20px_0_rgba(0,0,0,0.2)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-200 flex items-center justify-center gap-2">
                      <span>Envoyer</span>
                      <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
