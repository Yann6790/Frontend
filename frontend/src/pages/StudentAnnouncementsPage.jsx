import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const mockAnnonces = [
  {
    id: 1,
    titreAnnonce: "Précision sur le livrable 3",
    contenu: "Pour le livrable 3, n'oubliez pas d'inclure le diagramme de classes. J'ai remarqué que beaucoup d'entre vous l'avaient oublié dans la première version de vos drafts.",
    datePublication: "2023-11-05T10:00:00Z",
    professeur: "M. Dupont",
    saeAssociee: { id: 1, titre: "SAE 301: Conception Web", matiere: "Développement Web", dateRendu: "2023-11-15" }
  },
  {
    id: 2,
    titreAnnonce: "Changement de salle pour les soutenances",
    contenu: "Les soutenances pour la vidéo de présentation auront lieu en salle B204 et non en A102 comme prévu initialement. Merci de prévenir vos camarades.",
    datePublication: "2023-12-01T14:30:00Z",
    professeur: "Mme Martin",
    saeAssociee: { id: 2, titre: "SAE 302: Vidéo de présentation", matiere: "Audiovisuel", dateRendu: "2023-12-10" }
  },
  {
    id: 3,
    titreAnnonce: "Rappel concernant la charte graphique",
    contenu: "Assurez-vous que votre maquette Figma respecte scrupuleusement les contraintes d'accessibilité (contraste des couleurs, hiérarchie visuelle, taille de police).",
    datePublication: "2024-01-15T09:15:00Z",
    professeur: "M. Leroy",
    saeAssociee: { id: 3, titre: "SAE 303: Maquette Figma", matiere: "Design UX", dateRendu: "2024-01-20" }
  },
  {
    id: 4,
    titreAnnonce: "Prolongation du délai de rendu",
    contenu: "Exceptionnellement, le rendu de la BDD SQL est repoussé au 20 février. Profitez-en pour bien optimiser vos requêtes complexes.",
    datePublication: "2024-02-01T11:45:00Z",
    professeur: "Mme Garnier",
    saeAssociee: { id: 4, titre: "SAE 304: BDD SQL", matiere: "Développement Web", dateRendu: "2024-02-20" }
  },
  {
    id: 5,
    titreAnnonce: "Format d'export pour l'affiche",
    contenu: "L'affiche A1 doit être rendue uniquement au format PDF pour impression (CMJN, 300dpi avec fonds perdus). Les autres formats compressés seront refusés.",
    datePublication: "2024-02-10T16:20:00Z",
    professeur: "M. Faure",
    saeAssociee: { id: 5, titre: "SAE 305: Portfolio", matiere: "Graphisme", dateRendu: "2024-02-15" }
  },
  {
    id: 6,
    titreAnnonce: "Critères d'évaluation de l'interview",
    contenu: "La grille d'évaluation détaillée pour l'interview professionnelle est maintenant disponible sur Moodle. L'accent sera mis sur votre posture et votre aisance vocale.",
    datePublication: "2024-03-01T08:00:00Z",
    professeur: "Mme Morel",
    saeAssociee: { id: 6, titre: "SAE 306: Interview pro", matiere: "Communication", dateRendu: "2024-03-08" }
  }
];

const allMatieres = ["Toutes", ...new Set(mockAnnonces.map(a => a.saeAssociee.matiere))];

export default function StudentAnnouncementsPage() {
  const [selectedMatiere, setSelectedMatiere] = useState('Toutes');

  const displayedAnnonces = useMemo(() => {
    let filtered = [...mockAnnonces];

    // 1. Filtrage par Matière
    if (selectedMatiere !== "Toutes") {
      filtered = filtered.filter(a => a.saeAssociee.matiere === selectedMatiere);
    }

    // 2. Tri par défaut (plus récent en premier)
    filtered.sort((a, b) => {
      const datePubA = new Date(a.datePublication);
      const datePubB = new Date(b.datePublication);
      return datePubB - datePubA;
    });

    return filtered;
  }, [selectedMatiere]);

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* 2. En-tête de page & Filtres */}
      <div className="flex-none w-full bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-montserrat font-extrabold text-gray-900 mb-8 text-center">
            Annonces des professeurs
          </h1>

          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 bg-gray-50/80 p-3 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
            {/* Filtre Matière */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Matière</label>
              <select
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="flex-1 sm:flex-none bg-white border font-semibold border-gray-300 text-gray-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm cursor-pointer"
              >
                {allMatieres.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Zone d'affichage principales des Annonces */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6">
          {displayedAnnonces.map((annonce) => (
            <div
              key={annonce.id}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col gap-5 relative overflow-hidden group hover:border-purple-300"
            >
              {/* Entête de l'annonce */}
              <div className="flex flex-wrap justify-between items-start gap-4 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-extrabold text-xl font-montserrat shadow-inner">
                    {annonce.professeur.charAt(0)}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 text-lg leading-tight">{annonce.professeur}</p>
                    <p className="text-sm text-gray-500 font-semibold mt-0.5">
                      {new Date(annonce.datePublication).toLocaleDateString('fr-FR', {
                        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className="bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-purple-200">
                  {annonce.saeAssociee.matiere}
                </span>
              </div>

              {/* Corps de l'annonce */}
              <div>
                <h3 className="text-xl font-montserrat font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                  {annonce.titreAnnonce}
                </h3>
                <p className="text-gray-700 leading-relaxed text-base font-medium">
                  {annonce.contenu}
                </p>
              </div>

              {/* Lien vers la SAE */}
              <div className="mt-2 text-right">
                <Link
                  to={`/sae/${annonce.saeAssociee.id}`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex flex-col text-left">
                    <span>Voir la SAE : {annonce.saeAssociee.titre}</span>
                    <span className="text-xs text-purple-200 font-medium">Rendu le {new Date(annonce.saeAssociee.dateRendu).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
              </div>
            </div>
          ))}

          {displayedAnnonces.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <p className="text-gray-500 font-bold text-lg">Aucune annonce trouvée pour cette matière.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
