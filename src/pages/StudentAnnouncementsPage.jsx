import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Calendar, Clock, BookOpen, ChevronRight, Layout } from 'lucide-react';
import { saeService } from '../services/sae.service';

const normalizeThematic = (raw) => {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(t => {
    if (typeof t === 'string') return t;
    return t.label ?? t.code ?? t.name ?? t.id ?? String(t);
  });
};

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatiere, setSelectedMatiere] = useState('Toutes');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await saeService.getAllAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error("Erreur de chargement des annonces", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const allMatieres = useMemo(() => {
    const matieresSet = new Set();
    announcements.forEach(a => {
      const ms = normalizeThematic(a.thematic);
      ms.forEach(m => matieresSet.add(m));
    });
    return ["Toutes", ...Array.from(matieresSet)];
  }, [announcements]);

  const displayedAnnonces = useMemo(() => {
    let filtered = [...announcements];

    // filtrage par thématique
    if (selectedMatiere !== "Toutes") {
      filtered = filtered.filter(a => {
        const ms = normalizeThematic(a.thematic);
        return ms.includes(selectedMatiere);
      });
    }

    return filtered;
  }, [announcements, selectedMatiere]);

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-50 min-h-screen">
      {/* En-tête de page & Filtres */}
      <div className="flex-none w-full bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shadow-sm">
              <Megaphone className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Annonces du Semestre
            </h1>
          </div>
          <p className="text-gray-500 font-medium mb-10 text-center max-w-lg">Retrouvez toutes les communications importantes de vos professeurs concernant vos SAE.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-200 shadow-inner">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest pl-2">Filtrer par matière</span>
              <select
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="bg-white border-2 border-transparent font-bold text-gray-800 rounded-2xl px-6 py-2.5 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm cursor-pointer min-w-[200px]"
              >
                {allMatieres.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Zone d'affichage des Annonces */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {displayedAnnonces.map((annonce) => {
              const thematics = normalizeThematic(annonce.thematic);
              return (
                <div
                  key={annonce.id}
                  className="bg-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(163,71,127,0.1)] transition-all duration-500 flex flex-col gap-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-purple-500/20 group-hover:bg-purple-500 transition-colors duration-500"></div>

                  {/* Entête */}
                  <div className="flex flex-wrap justify-between items-start gap-4 border-b border-gray-50 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center text-purple-700 font-black text-xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {annonce.authorName?.firstname?.[0] || annonce.authorName?.charAt?.(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg leading-tight">
                          {typeof annonce.authorName === 'object' ? `${annonce.authorName.firstname} ${annonce.authorName.lastname}` : annonce.authorName}
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-400 font-bold mt-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(annonce.createdAt).toLocaleDateString('fr-FR', {
                              weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {thematics.map(t => (
                         <span key={t} className="bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-purple-100 shadow-sm">
                           {t}
                         </span>
                       ))}
                    </div>
                  </div>

                  {/* Corps */}
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                      {annonce.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg font-medium whitespace-pre-line">
                      {annonce.content}
                    </p>
                  </div>

                  {/* Pied de carte : Contexte SAE */}
                  <div className="mt-4 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Layout className="w-4 h-4" />
                      <span className="text-sm font-bold uppercase tracking-tight">Source : {annonce.saeTitle}</span>
                    </div>

                    <Link
                      to={`/sae/${annonce.saeId}`}
                      className="inline-flex items-center gap-3 bg-gray-900 text-white text-sm font-black px-8 py-3.5 rounded-2xl shadow-xl hover:bg-purple-700 hover:shadow-purple-500/20 active:scale-95 transition-all duration-300"
                    >
                      <span>Accéder au Projet</span>
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {displayedAnnonces.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-inner">
                  <Megaphone className="w-10 h-10" strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Pas de nouvelles annonces</h3>
                <p className="text-gray-400 font-bold max-w-xs mx-auto">Toutes les communications importantes de vos professeurs apparaîtront ici.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
