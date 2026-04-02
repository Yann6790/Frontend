import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import IllustratedState from "../components/IllustratedState";
import { saeService } from "../services/sae.service";

export default function StudentSaeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("presentation");
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
        const [saeRes, docsRes, milestonesRes, progressRes, announcementsRes] =
          await Promise.all([
            saeService.getSaeById(id),
            saeService.getSaeDocuments(id),
            saeService.getSaeMilestones(id),
            saeService.getMyMilestoneProgress(id),
            saeService.getAnnouncements(id),
          ]);

        setSaeDefaults(saeRes.data || saeRes || null);
        setDocumentsList(
          Array.isArray(docsRes) ? docsRes : docsRes?.data || [],
        );

        const ms = Array.isArray(milestonesRes)
          ? milestonesRes
          : milestonesRes?.data || [];
        setMilestonesList(
          ms.sort((a, b) => (a.position ?? 999) - (b.position ?? 999)),
        );

        // L'API (endpoint 57) retourne : { milestones: [{ milestone: {id, title}, progress: {...} }] }
        // On normalise en un tableau indexé par milestoneId pour accès facile
        const rawProgress = progressRes?.data || progressRes;
        const milestoneProgressArr =
          rawProgress?.milestones ||
          (Array.isArray(rawProgress) ? rawProgress : []);
        setMyProgress(milestoneProgressArr);

        setAnnouncements(
          Array.isArray(announcementsRes)
            ? announcementsRes
            : announcementsRes?.data || [],
        );

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
          navigate("/student-dashboard");
        } else {
          alert("Erreur lors du chargement de la SAE.");
          navigate("/student-dashboard");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const toggleFolder = (folderId) => {
    setOpenFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const calculateDaysRemaining = (targetDate) => {
    if (!targetDate) return 0;
    const diffTime = new Date(targetDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Trouve la progression d'un palier donné depuis le tableau normalisé
  // Supporte { milestone: {id}, progress: {...} } ET { milestoneId, isReached, ... }
  const getMilestoneProgress = (milestoneId) => {
    for (const entry of myProgress) {
      // Format endpoint 57 : { milestone: { id }, progress: { isReached, ... } }
      if (entry?.milestone?.id === milestoneId) return entry.progress ?? null;
      // Format plat alternatif
      if (entry?.milestoneId === milestoneId) return entry;
    }
    return null;
  };

  const handlePhaseSubmit = async (milestoneId) => {
    try {
      setIsSubmitting((prev) => ({ ...prev, [milestoneId]: true }));
      const message = phaseInput[milestoneId] || "";
      await saeService.postMilestoneProgress(id, milestoneId, {
        isReached: true,
        message: message,
      });
      // Recharger la progression
      const progressRes = await saeService.getMyMilestoneProgress(id);
      const rawProgress = progressRes?.data || progressRes;
      const milestoneProgressArr =
        rawProgress?.milestones ||
        (Array.isArray(rawProgress) ? rawProgress : []);
      setMyProgress(milestoneProgressArr);
      setPhaseInput((prev) => ({ ...prev, [milestoneId]: "" }));
    } catch (error) {
      console.error("Erreur de soumission", error);
      alert("Erreur de soumission. Veuillez réessayer.");
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [milestoneId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white">
        <IllustratedState
          imageSrc="/images/undraw_work-time_1ogn.svg"
          imageAlt="Chargement de la SAE"
          title="Chargement de la SAE"
          description="Nous preparons les details, documents et paliers."
          className="min-h-screen"
        />
      </div>
    );
  }

  if (!saeDefaults) {
    return (
      <div className="bg-white">
        <IllustratedState
          imageSrc="/images/undraw_work-time_1ogn.svg"
          imageAlt="SAE introuvable"
          title="SAE introuvable"
          description="Cette SAE est indisponible ou vous n'avez pas les droits d'acces."
          className="min-h-screen"
        />
      </div>
    );
  }

  const sae = saeDefaults;
  const daysRemainingGlobal = calculateDaysRemaining(sae.dueDate);
  const authorName = sae.createdBy?.name
    ? `${sae.createdBy.name.firstname || ""} ${sae.createdBy.name.lastname || ""}`.trim()
    : "Professeur";

  const getPhaseStatus = (milestoneId) => {
    const prog = getMilestoneProgress(milestoneId);
    if (prog?.isReached) return "terminée";
    return "en cours";
  };

  const isFolderOpen = openFolders["default"] !== false;

  return (
    <div className="w-full min-h-screen bg-white font-montserrat flex flex-col">
      {/* BANNIÈRE FULL WIDTH EN HAUT */}
      {sae.banner && (
        <div className="w-full h-80 overflow-hidden bg-slate-100">
          <img
            src={sae.banner}
            alt={sae.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-8">
        {/* Back Button */}
        <Link
          to="/student-dashboard"
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold w-fit"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour au dashboard
        </Link>

        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-950">
                {sae.title}
              </h1>
              <p className="text-base text-slate-600">
                {sae.description ||
                  "Aucune description fournie pour cette SAE."}
              </p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3">
            {sae.thematic && (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                {sae.thematic}
              </Badge>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold">Responsable :</span>
              <span>{authorName}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-slate-200">
          {[
            { id: "presentation", label: "Présentation" },
            { id: "milestones", label: "Paliers" },
            { id: "submission", label: "Rendu Final" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-6 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-purple-600 text-purple-600" : "border-transparent text-slate-600 hover:text-slate-900"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: PRESENTATION */}
        {activeTab === "presentation" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="flex flex-col gap-8">
              {/* Documents Section */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFolder("default")}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {isFolderOpen ? (
                      <FolderOpen className="h-5 w-5 text-purple-600" />
                    ) : (
                      <Folder className="h-5 w-5 text-purple-600" />
                    )}
                    <span className="font-semibold text-slate-950">
                      Ressources et Consignes
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-600 transition ${
                      isFolderOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isFolderOpen && (
                  <div className="border-t border-slate-200 p-5 space-y-3">
                    {documentsList.length > 0 ? (
                      documentsList.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                        >
                          <FileText className="h-5 w-5 text-slate-500 flex-shrink-0" />
                          <span className="text-slate-700 font-medium flex-1">
                            {doc.name || `Document ${idx + 1}`}
                          </span>
                        </a>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm italic">
                        Aucun document disponible.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Instructions Section */}
              {sae.instructions && (
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-slate-950 mb-4">
                    Instructions
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {sae.instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Annonces - Sticky Sidebar */}
            <aside className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-slate-950">
                    Annonces
                  </h2>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    {announcements.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {announcements.length > 0 ? (
                    announcements.map((ann) => (
                      <article
                        key={ann.id}
                        className="rounded-lg border border-purple-100 bg-purple-50/50 p-3"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                          {ann.title || "Annonce"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 whitespace-pre-line line-clamp-4">
                          {ann.content || "Aucun contenu."}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {ann.createdAt
                            ? new Date(ann.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Date non disponible"}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      Aucune annonce pour cette SAE.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* TAB: SUBMISSION */}
        {activeTab === "submission" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="bg-white border border-slate-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-slate-950 mb-8">
                Rendu Final
              </h2>
              {mySubmission ? (
                <div className="space-y-6">
                  {/* Success State */}
                  <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-green-900 text-lg">
                        Rendu soumis ✓
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Le{" "}
                        {new Date(mySubmission.submittedAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <Link to={`/sae/${id}/rendu?mode=view`} className="block">
                    <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg">
                      <FileText className="h-5 w-5 mr-2" />
                      Consulter mon rendu
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Deadline Info */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Date limite
                        </p>
                        <p className="text-lg font-semibold text-slate-950">
                          {sae.dueDate
                            ? new Date(sae.dueDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : "Non définie"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {daysRemainingGlobal === 0 && "À rendre aujourd'hui"}
                          {daysRemainingGlobal === 1 && "À rendre demain"}
                          {daysRemainingGlobal > 1 &&
                            `${daysRemainingGlobal} jours restants`}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`${
                            daysRemainingGlobal <= 3
                              ? "bg-red-100 text-red-700 hover:bg-red-100"
                              : daysRemainingGlobal <= 7
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                : "bg-green-100 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {daysRemainingGlobal <= 3
                            ? "Urgent"
                            : daysRemainingGlobal <= 7
                              ? "Prochainement"
                              : "En ordre"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link to={`/sae/${id}/rendu`} className="block">
                    <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg">
                      Rendre la SAE maintenant
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Annonces - Sticky Sidebar */}
            <aside className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-slate-950">
                    Annonces
                  </h2>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    {announcements.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {announcements.length > 0 ? (
                    announcements.map((ann) => (
                      <article
                        key={ann.id}
                        className="rounded-lg border border-purple-100 bg-purple-50/50 p-3"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                          {ann.title || "Annonce"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 whitespace-pre-line line-clamp-4">
                          {ann.content || "Aucun contenu."}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {ann.createdAt
                            ? new Date(ann.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Date non disponible"}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      Aucune annonce pour cette SAE.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* TAB: MILESTONES */}
        {activeTab === "milestones" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-slate-950 mb-6">
                Paliers
              </h2>
              {milestonesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Clock className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-slate-600 font-medium">
                    Aucun palier configuré pour cette SAE.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Timeline */}
                  <div className="flex items-center gap-2 mb-6">
                    {milestonesList.map((p, idx) => {
                      const statut = getPhaseStatus(p.id);
                      return (
                        <div key={p.id} className="flex-1">
                          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`absolute inset-0 transition-all duration-300 ${
                                statut === "terminée"
                                  ? "bg-purple-600"
                                  : "bg-slate-300"
                              }`}
                            />
                          </div>
                          <div className="text-xs font-semibold text-slate-600 mt-2 text-center">
                            Palier {idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Milestones */}
                  <div className="space-y-5">
                    {milestonesList.map((currentPhase, idx) => {
                      const statut = getPhaseStatus(currentPhase.id);
                      const prog = getMilestoneProgress(currentPhase.id);

                      if (statut === "terminée") {
                        return (
                          <div
                            key={currentPhase.id}
                            className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-950">
                                    {currentPhase.title}
                                  </h4>
                                  {currentPhase.description && (
                                    <p className="text-sm text-slate-600 mt-1">
                                      {currentPhase.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex-shrink-0">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Validé
                              </Badge>
                            </div>
                            {prog?.message && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-xs font-semibold text-slate-600 mb-2">
                                  VOTRE JOURNAL
                                </p>
                                <p className="text-sm text-slate-700 italic">
                                  "{prog.message}"
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={currentPhase.id}
                          className="border border-slate-200 rounded-lg p-5 space-y-4"
                        >
                          <div>
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 mb-3">
                              Palier en cours
                            </Badge>
                            <h4 className="text-lg font-bold text-slate-950">
                              Palier {idx + 1}: {currentPhase.title}
                            </h4>
                            {currentPhase.description && (
                              <p className="text-sm text-slate-600 mt-2">
                                {currentPhase.description}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor={`phase-input-${currentPhase.id}`}
                              className="block text-sm font-semibold text-slate-950"
                            >
                              <FileText className="h-4 w-4 inline mr-2" />
                              Journal de bord
                            </label>
                            <textarea
                              id={`phase-input-${currentPhase.id}`}
                              value={phaseInput[currentPhase.id] || ""}
                              onChange={(e) =>
                                setPhaseInput((prev) => ({
                                  ...prev,
                                  [currentPhase.id]: e.target.value,
                                }))
                              }
                              placeholder="Décrivez ce que vous avez accompli, les difficultés..."
                              className="w-full min-h-32 p-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none text-sm"
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={() => handlePhaseSubmit(currentPhase.id)}
                              disabled={
                                isSubmitting[currentPhase.id] ||
                                !phaseInput[currentPhase.id]?.trim()
                              }
                              className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-300"
                            >
                              {isSubmitting[currentPhase.id] ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                              )}
                              Valider ce palier
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Annonces - Sticky Sidebar */}
            <aside className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-slate-950">
                    Annonces
                  </h2>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    {announcements.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {announcements.length > 0 ? (
                    announcements.map((ann) => (
                      <article
                        key={ann.id}
                        className="rounded-lg border border-purple-100 bg-purple-50/50 p-3"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                          {ann.title || "Annonce"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 whitespace-pre-line line-clamp-4">
                          {ann.content || "Aucun contenu."}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {ann.createdAt
                            ? new Date(ann.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Date non disponible"}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      Aucune annonce pour cette SAE.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
