import { ChevronDown, ExternalLink, EyeOff, FileText, Trash2, X } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { saeService } from "../services/sae.service";
import IllustratedState from "./IllustratedState";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Spinner } from "./ui/spinner";

// Helper robuste pour extraire le nom complet d'un étudiant (Objet ou String)
const getFullName = (name) => {
  if (!name) return "";
  if (typeof name === "string") return name;
  const first = name.firstname || "";
  const last = name.lastname || "";
  return `${first} ${last}`.trim();
};

// Helper pour extraire les initiales (pour l'avatar)
const getInitials = (name) => {
  if (!name) return "?";
  if (typeof name === "string") {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || "?";
  }
  const first = name.firstname?.[0] || "";
  const last = name.lastname?.[0] || "";
  return (first + last).toUpperCase() || "?";
};

export default function SharedGallery({
  canModerate = false,
  isAdminView = false,
  refreshTrigger = 0,
  onDelete = () => {},
  onHide = () => {},
}) {
  // Styles conditionnels (Ardoise pour Admin, Violet pour le reste)
  const primaryText = isAdminView ? "text-slate-800" : "text-purple-600";
  const accentBg = isAdminView ? "bg-slate-100" : "bg-purple-50";
  const accentText = isAdminView ? "text-slate-700" : "text-purple-700";
  const accentBorder = isAdminView ? "border-slate-200" : "border-purple-300";
  const ringFocus = isAdminView ? "focus:ring-slate-100" : "focus:ring-purple-100";
  const ringFocusBorder = isAdminView ? "focus:border-slate-500" : "focus:border-purple-500";

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [hidingId, setHidingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortDate, setSortDate] = useState(null); // 'asc' | 'desc' | null
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
      setFetchError("");
      try {
        const data = await saeService.getAllPublicSubmissions();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur chargement galerie", err);
        setFetchError(
          err?.message ||
            "Impossible de charger les projets de la galerie pour le moment.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [refreshTrigger]);

  const allMatieres = useMemo(() => {
    const mats = new Set(projects.map((p) => p.thematic).filter(Boolean));
    return Array.from(mats);
  }, [projects]);

  const allPromos = useMemo(() => {
    const years = new Set(projects.map((p) => p.year).filter(Boolean));
    return Array.from(years).sort((a, b) => b - a);
  }, [projects]);

  const closeAllMenus = () => {
    setIsDateMenuOpen(false);
    setIsMatiereMenuOpen(false);
    setIsNoteMenuOpen(false);
    setIsPromoMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        closeAllMenus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menuName) => {
    setIsDateMenuOpen(menuName === "date" ? !isDateMenuOpen : false);
    setIsMatiereMenuOpen(menuName === "matiere" ? !isMatiereMenuOpen : false);
    setIsNoteMenuOpen(menuName === "note" ? !isNoteMenuOpen : false);
    setIsPromoMenuOpen(menuName === "promo" ? !isPromoMenuOpen : false);
  };

  const handleMatiereToggle = (matiere) => {
    setSelectedMatieres((prev) =>
      prev.includes(matiere)
        ? prev.filter((m) => m !== matiere)
        : [...prev, matiere],
    );
  };

  const handlePromoToggle = (promo) => {
    setSelectedPromos((prev) =>
      prev.includes(promo) ? prev.filter((p) => p !== promo) : [...prev, promo],
    );
  };

  const displayedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const fullName = getFullName(project.name);
      const projTitle = (project.title || "").toLowerCase();

      const matchSearch =
        projTitle.includes(searchTerm.toLowerCase()) ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchMatiere =
        selectedMatieres.length === 0 ||
        selectedMatieres.includes(project.thematic);
      const matchPromo =
        selectedPromos.length === 0 || selectedPromos.includes(project.year); // mapping year to promo

      return matchSearch && matchMatiere && matchPromo;
    });

    if (sortDate) {
      filtered.sort((a, b) => {
        // En l'absence de createdAt précis dans /api/saes/archives, on trie par ID ou par année
        const valA = a.year || a.id || 0;
        const valB = b.year || b.id || 0;
        if (sortDate === "asc") return valA < valB ? -1 : 1;
        return valA > valB ? -1 : 1;
      });
    }

    return filtered;
  }, [projects, searchTerm, sortDate, selectedMatieres, selectedPromos]);

  const isApiFetchFail =
    !!fetchError && /(failed to fetch|network|fetch)/i.test(fetchError);

  return (
    <>
      <div className="bg-white w-full px-6 pb-6 md:px-12 flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col items-center gap-6 pb-4">
          {/* Recherche */}
          <div className="w-full relative mt-4">
            <input
              type="text"
              placeholder="Recherchez par nom d'étudiant ou de projet"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 focus:bg-white focus:ring-4 ${ringFocus} border border-slate-200 rounded-lg py-3 px-6 text-base font-medium outline-none transition-all placeholder-slate-400`}
            />
          </div>

          {/* Boutons de filtres */}
          <div
            className="flex flex-wrap justify-center gap-3"
            ref={containerRef}
          >
            {/* 1. Date de rendu */}
            <div className="relative">
              <Button
                onClick={() => toggleMenu("date")}
                variant={isAdminView ? (sortDate || isDateMenuOpen ? "admin" : "adminOutline") : "outline"}
                className={`px-5 py-2 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm ${!isAdminView && (sortDate || isDateMenuOpen) ? "bg-purple-50 border-purple-300 text-purple-700" : ""}`}
              >
                Date de rendu
                <svg
                  className={`w-4 h-4 transition-transform ${isDateMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </Button>
              {isDateMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 z-20">
                  <button
                    onClick={() => {
                      setSortDate("asc");
                      setSortNote(null);
                      setIsDateMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:${accentBg} text-sm flex flex-row items-center justify-center whitespace-nowrap w-fit gap-2 transition-all duration-200 active:scale-95 ${sortDate === "asc" ? `${accentBg} ${accentText} font-bold` : "text-gray-700"}`}
                  >
                    Croissante
                  </button>
                  <button
                    onClick={() => {
                      setSortDate("desc");
                      setSortNote(null);
                      setIsDateMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:${accentBg} text-sm flex flex-row items-center justify-center whitespace-nowrap w-fit gap-2 transition-all duration-200 active:scale-95 ${sortDate === "desc" ? `${accentBg} ${accentText} font-bold` : "text-gray-700"}`}
                  >
                    Décroissante
                  </button>
                  {sortDate && (
                    <button
                      onClick={() => setSortDate(null)}
                      className="w-full text-left px-4 py-2 mt-1 border-t border-gray-100 hover:bg-gray-50 text-sm text-red-500 font-medium flex flex-row items-center justify-center whitespace-nowrap w-fit gap-2 transition-all duration-200 active:scale-95"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Matière */}
            <div className="relative">
              <Button
                onClick={() => toggleMenu("matiere")}
                variant={isAdminView ? (selectedMatieres.length > 0 || isMatiereMenuOpen ? "admin" : "adminOutline") : "outline"}
                className={`px-5 py-2 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm ${!isAdminView && (selectedMatieres.length > 0 || isMatiereMenuOpen) ? "bg-purple-50 border-purple-300 text-purple-700" : ""}`}
              >
                Matière{" "}
                {selectedMatieres.length > 0 && (
                  <span className={`${isAdminView ? 'bg-white text-slate-800' : 'bg-purple-200 text-purple-800'} px-2 py-0.5 rounded-md text-xs font-bold leading-none`}>
                    {selectedMatieres.length}
                  </span>
                )}
                <svg
                  className={`w-4 h-4 transition-transform ${isMatiereMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </Button>
              {isMatiereMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-2 z-20 flex flex-col gap-1 px-3">
                  {allMatieres.map((matiere) => (
                    <label
                      key={matiere}
                      className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMatieres.includes(matiere)}
                        onChange={() => handleMatiereToggle(matiere)}
                        className={`w-4 h-4 ${primaryText} rounded border-gray-300 ${ringFocusBorder}`}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {matiere}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Année */}
            <div className="relative">
              <Button
                onClick={() => toggleMenu("promo")}
                variant={isAdminView ? (selectedPromos.length > 0 || isPromoMenuOpen ? "admin" : "adminOutline") : "outline"}
                className={`px-5 py-2 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm ${!isAdminView && (selectedPromos.length > 0 || isPromoMenuOpen) ? "bg-purple-50 border-purple-300 text-purple-700" : ""}`}
              >
                Année{" "}
                {selectedPromos.length > 0 && (
                  <span className={`${isAdminView ? 'bg-white text-slate-800' : 'bg-purple-200 text-purple-800'} px-2 py-0.5 rounded-md text-xs font-bold leading-none`}>
                    {selectedPromos.length}
                  </span>
                )}
                <svg
                  className={`w-4 h-4 transition-transform ${isPromoMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </Button>
              {isPromoMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-2 z-20 flex flex-col gap-1 px-3">
                  {allPromos.map((promo) => (
                    <label
                      key={promo}
                      className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPromos.includes(promo)}
                        onChange={() => handlePromoToggle(promo)}
                        className={`w-4 h-4 ${primaryText} rounded border-gray-300 ${ringFocusBorder}`}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {promo}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white flex-1 w-full min-h-screen px-6 py-12 md:px-12">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Spinner size="xl" />
          </div>
        ) : fetchError ? (
          <IllustratedState
            imageSrc="/images/undraw_portfolio_btd8.svg"
            imageAlt="Erreur de chargement de la galerie"
            title={
              isApiFetchFail
                ? "Échec de connexion à l'API"
                : "Erreur de chargement"
            }
            description={
              isApiFetchFail
                ? "La requête API a échoué. Vérifiez votre connexion et réessayez."
                : "Impossible de charger la galerie pour le moment."
            }
          />
        ) : displayedProjects.length > 0 ? (
          <div className="w-full max-w-[96rem] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="bg-white relative rounded-xl overflow-hidden transition-all duration-300 flex flex-col group border border-slate-200 hover:border-slate-300 cursor-pointer"
              >
                {/* Modération (Masquer + Supprimer) */}
                {canModerate && (
                  <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    {/* Bouton Masquer */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (hidingId === project.id) return;
                        setHidingId(project.id);
                        try {
                          await onHide(project.saeId, project.id);
                          // Retrait optimiste de la galerie locale
                          setProjects((prev) => prev.filter((p) => p.id !== project.id));
                        } finally {
                          setHidingId(null);
                        }
                      }}
                      disabled={hidingId === project.id}
                      className="p-2 bg-white/90 hover:bg-amber-500 hover:text-white backdrop-blur-md rounded-full text-amber-500 shadow-sm border border-amber-100 transition-all duration-200 active:scale-95 disabled:opacity-50"
                      title="Masquer ce projet (le retirer de la galerie publique)"
                    >
                      {hidingId === project.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project.saeId, project.id);
                      }}
                      className="p-2 bg-white/90 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-full text-red-500 shadow-sm border border-red-100 transition-all duration-200 active:scale-95"
                      title="Supprimer la réalisation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
                    <div className={`absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black ${isAdminView ? 'text-slate-800 border-slate-200' : 'text-purple-800 border-purple-100'} border uppercase tracking-widest`}>
                      {project.year}
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className="text-lg font-montserrat font-bold text-gray-900 leading-tight mb-2 line-clamp-2 min-h-[3rem]"
                    title={project.title}
                  >
                    {project.title || "Sans titre"}
                  </h3>

                  {project.name ? (
                    <div className="flex items-center gap-2 mb-4">
                    <div className={`w-7 h-7 rounded-lg ${accentBg} border ${accentBorder} flex items-center justify-center ${primaryText} shrink-0`}>
                      <span className="text-[10px] font-black uppercase">
                        {getInitials(project.name)}
                      </span>
                    </div>
                      <p className="text-gray-600 font-bold text-xs truncate">
                        {getFullName(project.name)}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4 text-xs text-gray-300 font-bold italic tracking-wider">
                      Auteur anonyme
                    </div>
                  )}

                  {project.description && (
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {project.thematic && (
                        <span className={`${accentBg} ${primaryText} text-[10px] font-black uppercase px-2 py-1 rounded-md border ${accentBorder} tracking-tighter`}>
                          {project.thematic}
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center gap-1.5 ${primaryText} font-black text-[10px] uppercase tracking-widest`}>
                      Voir <ChevronDown className="w-3 h-3 -rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <IllustratedState
            imageSrc="/images/undraw_portfolio_btd8.svg"
            imageAlt={
              projects.length === 0
                ? "Aucun projet dans la galerie"
                : "Aucun projet pour ces filtres"
            }
            title={
              projects.length === 0
                ? "Aucun projet publié"
                : "Aucun projet pour ces filtres"
            }
            description={
              projects.length === 0
                ? "Les projets apparaîtront ici dès qu'ils seront publiés."
                : "Essayez d'ajuster la recherche ou les filtres de matière et d'année."
            }
          />
        )}
      </div>

      {/* Modal de détails du projet */}
      <Dialog
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      >
        {selectedProject && (
          <DialogContent
            showCloseButton={false}
            overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-sm"
            className="max-h-[90vh] max-w-6xl overflow-hidden bg-white p-0 sm:max-w-[72rem]"
          >
            <div className="grid max-h-[90vh] grid-cols-1 md:grid-cols-[1.35fr_1fr]">
              <div className="relative min-h-[260px] bg-slate-100 md:min-h-[560px]">
                {selectedProject.imageUrl ? (
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[260px] items-center justify-center px-6 text-center text-sm text-slate-500">
                    Aperçu non disponible
                  </div>
                )}

                {selectedProject.year && (
                  <Badge
                    variant="outline"
                    className="absolute left-4 top-4 border-slate-300 bg-white/95 text-slate-700"
                  >
                    Promotion {selectedProject.year}
                  </Badge>
                )}
              </div>

              <Card className="h-full rounded-none  bg-white py-0 ">
                <CardHeader className=" bg-white px-6 pb-5 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-3">
                      {selectedProject.thematic && (
                        <Badge variant="outline" className="text-slate-700">
                          {selectedProject.thematic}
                        </Badge>
                      )}
                      <DialogTitle className="text-3xl font-black tracking-tight text-slate-950">
                        {selectedProject.title || "Projet sans titre"}
                      </DialogTitle>
                      {selectedProject.name && (
                        <p className="text-sm text-slate-600">
                          Réalisé par {getFullName(selectedProject.name)}
                        </p>
                      )}
                    </div>

                    <DialogClose
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Fermer</span>
                    </DialogClose>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 overflow-y-auto bg-white px-6 py-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description du projet
                  </p>
                  <DialogDescription className="text-sm leading-relaxed text-slate-700">
                    {selectedProject.description ||
                      "Aucune description détaillée n'a été fournie pour ce projet."}
                  </DialogDescription>
                </CardContent>

                <CardFooter className="flex-col items-stretch gap-3 border-t border-slate-200 bg-white px-6 py-4">
                  <Button
                    disabled={!selectedProject.url}
                    onClick={() => {
                      if (selectedProject.url) {
                        window.open(
                          selectedProject.url,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                    }}
                    className={`w-full px-4 py-2 h-10 gap-2 flex items-center justify-center ${isAdminView ? 'bg-slate-800 hover:bg-slate-900 text-white' : ''}`}
                  >
                    <span>Explorer le rendu</span>
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  </Button>
                  <p className="text-center text-xs text-slate-500">
                    Le projet s&apos;ouvre dans un nouvel onglet.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
