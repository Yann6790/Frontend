import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mmiLogo from "../Images/mmilogo.png";
import { Spinner } from "../components/ui/spinner";
import { resourcesService } from "../services/resources.service";
import { saeService } from "../services/sae.service";

const ALL_SEMESTRES = ["Tous", "S1", "S2", "S3", "S4", "S5", "S6"];

export default function TeacherDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [saes, setSaes] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("visibles");
  const [selectedSemestre, setSelectedSemestre] = useState("Tous");

  useEffect(() => {
    // Attendre que l'auth soit résolue
    if (authLoading) return;
    // Si pas de user après résolution, laisser l'AuthGuard rediriger
    if (!user?.email) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [saeRes, semRes] = await Promise.allSettled([
          saeService.getSaeList(),
          resourcesService.getSemesters(),
        ]);

        const allSaes =
          saeRes.status === "fulfilled"
            ? Array.isArray(saeRes.value)
              ? saeRes.value
              : saeRes.value?.data || []
            : [];
        const allSems =
          semRes.status === "fulfilled"
            ? Array.isArray(semRes.value)
              ? semRes.value
              : semRes.value?.data || []
            : [];
        setSemesters(allSems);

        // ── 1. SAEs dont le prof est propriétaire ────────────────────
        const ownedSaes = allSaes.filter(
          (sae) => sae.createdBy?.email === user.email,
        );
        const ownedIds = new Set(ownedSaes.map((s) => s.id));

        // ── 2. SAEs où le prof pourrait être invité ───────────────────
        const notOwned = allSaes.filter((sae) => !ownedIds.has(sae.id));
        const invitationChecks = await Promise.allSettled(
          notOwned.map((sae) =>
            saeService
              .getInvitations(sae.id)
              .then((invs) => {
                const list = Array.isArray(invs) ? invs : invs?.data || [];
                const myName = user.name;
                const isInvited = list.some((inv) => {
                  if (!inv.name || !myName) return false;
                  return (
                    inv.name.firstname?.toLowerCase() ===
                      myName.firstname?.toLowerCase() &&
                    inv.name.lastname?.toLowerCase() ===
                      myName.lastname?.toLowerCase()
                  );
                });
                return isInvited ? sae : null;
              })
              .catch(() => null),
          ),
        );

        const invitedSaes = invitationChecks
          .filter((r) => r.status === "fulfilled" && r.value !== null)
          .map((r) => r.value);

        setSaes([...ownedSaes, ...invitedSaes]);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading]);

  const displayedSAEs = useMemo(() => {
    let filtered = saes.filter((sae) => {
      const isVisible = sae.isPublished !== false; // Par défaut visible si non spécifié, ou === true
      if (activeTab === "visibles") return isVisible;
      if (activeTab === "cachees") return !isVisible;
      return true;
    });

    if (selectedSemestre !== "Tous") {
      const semFilterValue = selectedSemestre.replace("S", "");
      filtered = filtered.filter((sae) => {
        if (sae.semester === selectedSemestre) return true;
        const semObj = semesters.find((s) => s.id === sae.semesterId);
        if (semObj) {
          const num =
            semObj.number ??
            parseInt(
              (semObj.name || semObj.label || "").replace(/\D/g, ""),
              10,
            );
          return String(num) === semFilterValue;
        }
        return String(sae.semesterId) === semFilterValue;
      });
    }

    return filtered;
  }, [activeTab, selectedSemestre, saes]);

  const tabs = [
    {
      id: "visibles",
      label: "SAE visible(s)",
      icon: <Eye strokeWidth={2.5} className="w-5 h-5" />,
    },
    {
      id: "cachees",
      label: "SAE brouillon/cachée(s)",
      icon: <EyeOff strokeWidth={2.5} className="w-5 h-5" />,
    },
  ];

  const getSaeStatus = (sae) => {
    if (!sae.dueDate) return "En cours";
    const due = new Date(sae.dueDate);
    return due < new Date() ? "Terminé" : "En cours";
  };

  const handlePublish = async (saeId, e) => {
    e.preventDefault(); // évite la navigation si dans un Link
    e.stopPropagation();
    if (
      !window.confirm(
        "Publier cette SAE ? Elle sera visible par les étudiants.",
      )
    )
      return;
    try {
      await saeService.publishSae(saeId);
      setSaes((prev) =>
        prev.map((s) =>
          s.id === saeId ? { ...s, isPublished: true, status: "ongoing" } : s,
        ),
      );
    } catch (err) {
      console.error("[Teacher] Erreur publication:", err);
      alert("Erreur lors de la publication.");
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-white font-montserrat">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-8 pt-28">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Tableau de bord enseignant
          </p>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                Bonjour{" "}
                {user?.firstname || user?.name?.firstname || "Enseignant"}
              </h1>
              <p className="text-base text-slate-600">
                Gérez vos SAE, publiez du contenu et suivisez l'avancée des
                projets.
              </p>
            </div>
            <img
              src={mmiLogo}
              alt="Logo MMI"
              className="h-[4.5rem] w-auto flex-shrink-0"
            />
          </div>
        </div>

        {/* Filtrage par Semestre */}
        <div className="flex items-center justify-start">
          <select
            value={selectedSemestre}
            onChange={(e) => setSelectedSemestre(e.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none hover:border-slate-300 focus-visible:bg-white transition-all shadow-sm"
          >
            {ALL_SEMESTRES.map((s) => (
              <option key={s} value={s}>
                {s === "Tous" ? "Filtrer par semestre" : s}
              </option>
            ))}
          </select>
        </div>

        {/* SAE Tabs Navigation */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative h-12 px-6 py-3 font-semibold text-sm whitespace-nowrap transition border-b-2 flex flex-row items-center justify-center w-fit gap-2 transition-all duration-200 active:scale-95 ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id &&
                displayedSAEs.length > 0 &&
                !isLoading && (
                  <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs font-semibold">
                    {displayedSAEs.length}
                  </Badge>
                )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {authLoading || isLoading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
              <Spinner size="lg" />
              <p className="text-base font-medium text-slate-600">
                Chargement de vos SAE...
              </p>
            </div>
          ) : displayedSAEs.length === 0 ? (
            <div className="flex min-h-96 flex-col items-center justify-center gap-6 text-center py-12">
              <img
                src="/images/undraw_no-data_ig65.svg"
                alt="Aucune SAE"
                className="h-56 w-auto object-contain"
              />
              <div className="space-y-2 max-w-md">
                <p className="text-xl font-bold text-slate-900">
                  {activeTab === "visibles"
                    ? "Aucune SAE visible"
                    : "Aucune SAE en brouillon/cachée"}
                </p>
                <p className="text-sm text-slate-600">
                  {activeTab === "visibles"
                    ? "Il n'y a pas de projets correspondants à vos critères pour le moment."
                    : "Aucune SAE n'est actuellement en mode brouillon/cachée."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedSAEs.map((sae) => {
                const statut = getSaeStatus(sae);
                const isOwner = sae.createdBy?.email === user?.email;
                const daysRemaining = sae.dueDate
                  ? Math.ceil(
                      (new Date(sae.dueDate) - new Date()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : null;

                return (
                  <Link
                    key={sae.id}
                    to={`/teacher/sae/${sae.id}`}
                    className="block group"
                  >
                    <div className="h-full rounded-xl overflow-hidden bg-white border border-slate-200 hover:border-slate-300 transition hover:shadow-lg flex flex-col">
                      {/* Banner */}
                      {sae.banner && (
                        <div className="h-40 overflow-hidden bg-slate-100">
                          <img
                            src={sae.banner}
                            alt={sae.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                      )}

                      {/* Header with badges */}
                      <div className="px-6 pt-6 pb-3 border-b border-slate-100 space-y-3">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs font-semibold px-2.5 py-1 uppercase">
                              {(() => {
                                if (sae.semester) return sae.semester;
                                const semObj = semesters.find(
                                  (s) => s.id === sae.semesterId,
                                );
                                if (semObj) {
                                  const num =
                                    semObj.number ??
                                    parseInt(
                                      (
                                        semObj.name ||
                                        semObj.label ||
                                        ""
                                      ).replace(/\D/g, ""),
                                      10,
                                    );
                                  return num
                                    ? `S${num}`
                                    : semObj.name || semObj.label || "S?";
                                }
                                return sae.semesterId ? `S?` : "Général";
                              })()}
                            </Badge>
                            <Badge
                              className={`hover:${isOwner ? "bg-slate-200" : "bg-purple-100"} text-xs font-semibold px-2.5 py-1 ${
                                isOwner
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {isOwner ? "★ Propriétaire" : "✦ Invité"}
                            </Badge>
                          </div>
                          <Badge
                            className={`text-xs font-semibold px-2.5 py-1 ${
                              statut === "Terminé"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {statut}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4 flex-1 flex flex-col">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-950 group-hover:text-purple-600 transition leading-snug">
                          {sae.title}
                        </h3>

                        {/* Deadline Info */}
                        <div className="space-y-2 border-t border-slate-100 pt-4 flex-1">
                          {sae.dueDate && (
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 flex-shrink-0 text-purple-600" />
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-sm text-slate-900">
                                  Échéance le{" "}
                                  {new Date(sae.dueDate).toLocaleDateString(
                                    "fr-FR",
                                  )}
                                </span>
                                {daysRemaining !== null && (
                                  <span className="text-xs text-slate-600">
                                    {daysRemaining < 0
                                      ? `En retard de ${Math.abs(daysRemaining)} jour(s)`
                                      : daysRemaining === 0
                                        ? "Aujourd'hui"
                                        : `${daysRemaining} jour(s) restant(s)`}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {!sae.dueDate && (
                            <p className="text-sm text-slate-600">
                              Aucune date d'échéance
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 flex-wrap">
                          <Button
                            className="flex-1 bg-purple-600 text-white hover:bg-purple-700 font-bold rounded-lg h-10 px-4 py-2 gap-2 flex items-center justify-center"
                            size="sm"
                          >
                            <span>Gérer</span>
                          </Button>
                          {!sae.isPublished && (
                            <Button
                              variant="outline"
                              className="bg-purple-600 text-white hover:bg-purple-700 border-purple-600 font-bold rounded-lg h-10 px-3 py-2 gap-2 flex items-center justify-center"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePublish(sae.id, e);
                              }}
                            >
                              <Eye className="w-4 h-4 flex-shrink-0" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
