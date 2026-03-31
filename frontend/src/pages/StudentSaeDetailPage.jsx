import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Folder, FolderOpen, FileText, ChevronDown, Clock, CheckCircle2, Megaphone } from 'lucide-react';
import { saeService } from '../services/sae.service';

export default function StudentSaeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openFolders, setOpenFolders] = useState({ default: true });
  const [phaseInput, setPhaseInput] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});

  const [saeDefaults, setSaeDefaults] = useState(null);
  const [documentsList, setDocumentsList] = useState([]);
  const [milestonesList, setMilestonesList] = useState([]);
  const [myProgress, setMyProgress] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [mySubmission, setMySubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [saeRes, docsRes, milestonesRes, progressRes, announcementsRes] = await Promise.all([
          saeService.getSaeById(id),
          saeService.getSaeDocuments(id),
          saeService.getSaeMilestones(id),
          saeService.getMyMilestoneProgress(id),
          saeService.getAnnouncements(id),
        ]);

        setSaeDefaults(saeRes.data || saeRes || null);
        setDocumentsList(Array.isArray(docsRes) ? docsRes : docsRes?.data || []);
        
        const ms = Array.isArray(milestonesRes) ? milestonesRes : milestonesRes?.data || [];
        setMilestonesList(ms.sort((a,b) => new Date(a.deadline) - new Date(b.deadline)));
        
        setMyProgress(Array.isArray(progressRes) ? progressRes : progressRes?.data || []);
        setAnnouncements(Array.isArray(announcementsRes) ? announcementsRes : announcementsRes?.data || []);

        // Charger le rendu séparément (peut échouer avec 404 si pas encore soumis)
        try {
          const submissionRes = await saeService.getMySubmission(id);
          setMySubmission(submissionRes?.data || submissionRes || null);
        } catch {
          setMySubmission(null); // Pas encore de rendu
        }
      } catch (err) {
        console.error("Erreur de chargement de la SAE", err);
        if (err.status === 403 || err.message?.includes("403")) {
          alert("Accès non autorisé.");
          navigate('/student-dashboard');
        } else {
          alert("Erreur lors du chargement de la SAE.");
          navigate('/student-dashboard');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const toggleFolder = (folderId) => {
    setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const calculateDaysRemaining = (targetDate) => {
    if (!targetDate) return 0;
    const diffTime = new Date(targetDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handlePhaseSubmit = async (milestoneId) => {
    try {
      setIsSubmitting(prev => ({...prev, [milestoneId]: true}));
      const message = phaseInput[milestoneId] || "";
      await saeService.postMilestoneProgress(id, milestoneId, {
        isReached: true,
        message: message
      });
      const progressRes = await saeService.getMyMilestoneProgress(id);
      setMyProgress(Array.isArray(progressRes) ? progressRes : progressRes?.data || []);
      alert("Journal de bord soumis avec succès !");
      setPhaseInput(prev => ({...prev, [milestoneId]: ""}));
    } catch (error) {
       console.error("Erreur de soumission", error);
       alert("Erreur de soumission");
    } finally {
      setIsSubmitting(prev => ({...prev, [milestoneId]: false}));
    }
  };

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-gray-200 border-t-[#A3477F] rounded-full animate-spin"></div></div>;
  }

  if (!saeDefaults) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-gray-500">SAE introuvable</div>;
  }

  const sae = saeDefaults;
  const daysRemainingGlobal = calculateDaysRemaining(sae.dueDate);
  const authorName = sae.createdBy?.name ? `${sae.createdBy.name.firstname || ''} ${sae.createdBy.name.lastname || ''}`.trim() : "Professeur";

  const getPhaseStatus = (milestoneId) => {
    const isSubmitted = myProgress.some(p => p.milestoneId === milestoneId && p.isReached);
    if (isSubmitted) return 'terminée';
    return 'en cours'; // Simplification : tout le reste est en cours pour qu'ils puissent rendre
  };

  const isFolderOpen = openFolders['default'] !== false;

  return (
    <div className="w-full min-h-full bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* A. Section Haute */}
        <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
          <h1 className="text-3xl md:text-4xl font-black text-black text-center mb-6 tracking-tight">
            {sae.title}
          </h1>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {sae.thematic && (
              <span className="px-5 py-2 bg-[#A3477F]/10 text-[#A3477F] border border-[#A3477F]/20 rounded-full text-sm font-black tracking-wide shadow-sm">
                {sae.thematic}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-gray-600 mb-12 bg-gray-50 border border-gray-100 max-w-max mx-auto px-6 py-3 rounded-2xl shadow-sm">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mr-1">Équipe :</span>
            <span className="text-[15px]">
              <strong className="text-gray-900">{authorName}</strong>
              <span className="text-[11px] text-[#A3477F] font-black uppercase tracking-wider ml-1.5">(Responsable)</span>
            </span>
          </div>
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <div className="inline-block border-l-4 border-[#A3477F] pl-4 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Description du Projet</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg font-light">
                {sae.description || "Aucune description fournie pour cette SAE."}
              </p>
            </div>
          </div>
        </section>

        {/* B. Annonces */}
        {announcements.length > 0 && (
          <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <Megaphone className="w-5 h-5 text-[#A3477F]" strokeWidth={1.5} />
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Annonces</h2>
              <span className="bg-[#A3477F]/10 text-[#A3477F] text-xs font-black px-2 py-0.5 rounded-full">{announcements.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {announcements.map(ann => (
                <div key={ann.id} className="bg-[#A3477F]/5 border border-[#A3477F]/15 rounded-xl p-4">
                  <p className="font-black text-gray-900 mb-1">{ann.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{ann.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(ann.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* C. Section Milieu — Documents */}
        <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 antialiased">
          <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Documents & Ressources</h2>
          <div className="flex flex-col gap-5">
            <div className="border-b-4 border-[#A3477F] rounded-xl bg-gray-50/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <button
                onClick={() => toggleFolder('default')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors group focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md shadow-sm transition-transform duration-300">
                    {isFolderOpen ? <FolderOpen className="text-[#A3477F] w-5 h-5" strokeWidth={1.5} /> : <Folder className="text-[#A3477F] w-5 h-5" strokeWidth={1.5} />}
                  </div>
                  <span className="font-bold text-lg text-gray-800 tracking-tight">Ressources et Consignes</span>
                </div>
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isFolderOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <div className={`transition-all duration-400 ease-out ${isFolderOpen ? 'max-h-[1000px] opacity-100 py-2' : 'max-h-0 opacity-0'}`}>
                <ul className="px-6 pb-6 pt-2 flex flex-col gap-3">
                  {documentsList.length > 0 ? documentsList.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-[#A3477F]/30 hover:-translate-y-0.5">
                      <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-[#A3477F]/10 transition-colors">
                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#A3477F] transition-colors" />
                      </div>
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-gray-700 font-medium hover:text-black transition-colors flex-1">{doc.name || `Document ${idx+1}`}</a>
                    </li>
                  )) : (
                    <li className="text-gray-500 italic p-4">Aucun document disponible pour le moment.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* D. Section Basse — Rendu & Paliers */}
        <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
          <div className="flex flex-col xl:flex-row gap-10">
            
            {/* Bloc Gauche — Statut du rendu */}
            <div className="w-full xl:w-1/3 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-inner group">
              <div className="bg-white p-3 rounded-xl shadow-sm mb-5 transition-transform duration-500">
                {mySubmission
                  ? <CheckCircle2 className="w-8 h-8 text-green-500" strokeWidth={1.5} />
                  : <Clock className="w-8 h-8 text-[#A3477F]" strokeWidth={1.5} />
                }
              </div>
              <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-2">
                {mySubmission ? 'Rendu Final' : 'Rendu Final'}
              </h3>

              {mySubmission ? (
                <>
                  <p className="text-base font-black text-green-600 mb-2">✓ Soumis</p>
                  <p className="text-xs text-gray-500 mb-4">Le {new Date(mySubmission.submittedAt).toLocaleDateString('fr-FR')}</p>
                  <Link
                    to={`/sae/${id}/rendu?mode=view`}
                    className="w-full py-3 px-6 bg-white border-2 border-[#A3477F] text-[#A3477F] hover:bg-[#A3477F]/5 font-bold rounded-lg transition-all duration-200 text-sm tracking-wide flex items-center justify-center gap-2"
                  >
                    <span>Voir mon rendu</span>
                    <FileText className="w-4 h-4" strokeWidth={1.5} />
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-3xl font-black text-black mb-8 tracking-tight">
                    {daysRemainingGlobal} Jours
                  </p>
                  <Link
                    to={`/sae/${id}/rendu`}
                    className="w-full py-4 px-6 bg-[#A3477F] hover:bg-[#8e3e6f] text-white font-bold rounded-lg shadow-[0_8px_20px_0_rgba(163,71,127,0.3)] hover:shadow-[0_12px_25px_rgba(163,71,127,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-lg tracking-wide flex items-center justify-center gap-2"
                  >
                    <span>Rendre la SAE</span>
                    <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                  </Link>
                </>
              )}
            </div>

            {/* Bloc Droite - Gestion des Phases */}
            <div className="w-full xl:w-2/3 flex flex-col">
              
              {/* Timeline Indicator */}
              <div className="flex flex-wrap items-center gap-3 mb-10">
                {milestonesList.length === 0 && <span className="text-gray-500 italic">Aucune phase configurée pour cette SAE.</span>}
                {milestonesList.map((p, idx) => {
                  const statut = getPhaseStatus(p.id);
                  return (
                    <div key={p.id} className="flex-1 min-w-[100px] flex flex-col gap-3 group">
                      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`absolute inset-0 transition-all duration-500 ${
                            statut === 'terminée' 
                              ? 'bg-[#A3477F]' 
                              : statut === 'en cours' 
                                ? 'bg-[#A3477F] opacity-90' 
                                : 'bg-transparent'
                          }`} 
                        />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                        statut === 'en cours' ? 'text-[#A3477F]' : 
                        statut === 'terminée' ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        Phase {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Phase Actuelle Content */}
              {milestonesList.map((currentPhase, idx) => {
                const statut = getPhaseStatus(currentPhase.id);
                // On affiche la zone de saisie pour celles "en cours"
                if (statut !== 'en cours') return null;

                return (
                  <div key={currentPhase.id} className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 mb-10 border-b border-gray-100 pb-10 last:border-0 last:pb-0">
                    <div className="mb-8">
                      <div className="inline-block px-4 py-1.5 bg-[#A3477F]/10 rounded-full mb-4">
                        <span className="text-sm font-bold text-[#A3477F] uppercase tracking-wider">Étape En Cours</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
                        Phase {idx + 1} : {currentPhase.title}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{currentPhase.description}</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 mb-8">
                      <label htmlFor={`phase-input-${currentPhase.id}`} className="font-bold text-gray-800 flex items-center gap-2">
                         <FileText className="w-5 h-5 text-gray-500" />
                         Journal de bord de la phase
                      </label>
                      <div className="relative group">
                        <textarea 
                          id={`phase-input-${currentPhase.id}`}
                          value={phaseInput[currentPhase.id] || ''}
                          onChange={(e) => setPhaseInput(prev => ({...prev, [currentPhase.id]: e.target.value}))}
                          placeholder="Décrivez ce que vous avez accompli durant cette phase, les difficultés rencontrées..."
                          className="w-full min-h-[160px] p-4 border border-black rounded-lg bg-white focus:ring-2 focus:ring-[#A3477F]/20 focus:border-[#A3477F] transition-all duration-300 resize-y font-medium text-gray-800 shadow-sm placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 text-red-500 font-bold bg-white px-4 py-2.5 rounded-lg shadow-sm border border-red-100 w-full sm:w-auto text-sm">
                        <Clock className="w-5 h-5 animate-pulse" strokeWidth={1.5} />
                        <span>Reste {calculateDaysRemaining(currentPhase.deadline)} jours</span>
                      </div>
                      <button 
                        onClick={() => handlePhaseSubmit(currentPhase.id)}
                        disabled={isSubmitting[currentPhase.id]}
                        className="w-full sm:w-auto py-2.5 px-6 bg-black disabled:bg-gray-400 hover:bg-gray-800 text-white font-bold rounded-lg shadow-[0_8px_20px_0_rgba(0,0,0,0.2)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {isSubmitting[currentPhase.id] ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>Envoyer</span>
                            <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

