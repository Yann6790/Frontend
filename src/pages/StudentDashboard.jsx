import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Loader2,
  Settings2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import mmiLogo from "../Images/mmilogo.png";
import { useAuth } from "../context/AuthContext";
import { saeService } from "../services/sae.service";

const TAB_CONFIG = [
  { id: "urgentes", label: "SAE urgentes" },
  { id: "moment", label: "SAE du moment" },
  { id: "planifier", label: "SAE a planifier" },
];

function getDaysRemaining(dateRendu) {
  if (!dateRendu) return 999;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateRendu);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate - todayStart;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDeadlineText(sae) {
  if (sae.isSubmitted) return "Rendu";
  if (!sae.dueDate) return "Date de rendu indefinie";

  const days = getDaysRemaining(sae.dueDate);
  if (days < 0) return `En retard de ${Math.abs(days)} jour(s)`;
  if (days === 0) return "A rendre aujourd'hui";
  if (days === 1) return "Rendu demain";
  return `Rendu dans ${days} jours`;
}

function getSaeByTab(tab, list, thresholds) {
  return list.filter((sae) => {
    if (sae.isSubmitted) return false;
    const daysRemaining = getDaysRemaining(sae.dueDate);

    if (tab === "urgentes") return daysRemaining <= thresholds.urgentes;
    if (tab === "moment") {
      return (
        daysRemaining > thresholds.urgentes &&
        daysRemaining <= thresholds.moment
      );
    }
    if (tab === "planifier") return daysRemaining > thresholds.moment;

    return false;
  });
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const [saes, setSaes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [activeTab, setActiveTab] = useState("urgentes");
  const [thresholds, setThresholds] = useState({ urgentes: 3, moment: 14 });
  const [selectedMatieres, setSelectedMatieres] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempUrgentes, setTempUrgentes] = useState(3);
  const [tempMoment, setTempMoment] = useState(14);

  useEffect(() => {
    const fetchSaes = async () => {
      setIsLoading(true);
      setFetchError("");

      try {
        const apiParams = {};
        const promoId =
          user?.promotion?.id ||
          user?.promotionId ||
          user?.studentProfile?.promotionId;
        if (promoId) apiParams.promotionId = promoId;

        const groupId = user?.groupTp || user?.studentProfile?.groupTp;
        if (groupId) apiParams.groupId = groupId;

        const data = await saeService.getSaeList(apiParams);
        const allSaes = Array.isArray(data) ? data : data?.data || [];
        setSaes(allSaes);
      } catch (error) {
        console.error("[StudentDashboard] Erreur chargement SAE:", error);
        setFetchError(
          "Impossible de charger vos SAE pour le moment. Veuillez reessayer dans quelques instants.",
        );
        setSaes([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchSaes();
  }, [user]);

  const allMatieres = useMemo(() => {
    return [...new Set(saes.map((s) => s.thematic).filter(Boolean))];
  }, [saes]);

  const filteredByMatiere = useMemo(() => {
    if (selectedMatieres.length === 0) return saes;
    return saes.filter((sae) => selectedMatieres.includes(sae.thematic));
  }, [saes, selectedMatieres]);

  const tabCounts = useMemo(() => {
    return {
      urgentes: getSaeByTab("urgentes", filteredByMatiere, thresholds).length,
      moment: getSaeByTab("moment", filteredByMatiere, thresholds).length,
      planifier: getSaeByTab("planifier", filteredByMatiere, thresholds).length,
    };
  }, [filteredByMatiere, thresholds]);

  const displayedSAEs = useMemo(() => {
    const list = getSaeByTab(activeTab, filteredByMatiere, thresholds);
    return list.sort(
      (a, b) =>
        new Date(a.dueDate || "9999-12-31") -
        new Date(b.dueDate || "9999-12-31"),
    );
  }, [activeTab, filteredByMatiere, thresholds]);

  const saveThresholds = () => {
    const urgentes = Math.max(0, parseInt(tempUrgentes, 10) || 0);
    const moment = Math.max(
      urgentes + 1,
      parseInt(tempMoment, 10) || urgentes + 1,
    );

    setThresholds({ urgentes, moment });
    setIsEditModalOpen(false);
  };

  const openThresholdModal = () => {
    setTempUrgentes(thresholds.urgentes);
    setTempMoment(thresholds.moment);
    setIsEditModalOpen(true);
  };

  const toggleMatiere = (matiere) => {
    setSelectedMatieres((prev) =>
      prev.includes(matiere)
        ? prev.filter((m) => m !== matiere)
        : [...prev, matiere],
    );
  };

  const emptyTitle =
    saes.length === 0 ? "Aucune SAE assignee" : "Aucune SAE dans cet onglet";

  const emptyDescription =
    saes.length === 0
      ? "Votre enseignant n'a pas encore publie de SAE pour votre promotion."
      : "Essayez de changer d'onglet ou d'effacer les filtres matiere.";

  return (
    <div className="flex-1 min-h-screen bg-white font-montserrat">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-8 pt-28">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Tableau de bord etudiant
          </p>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-950">
                Bonjour {user?.firstname || user?.name?.firstname || "etudiant"}
              </h1>
              <p className="text-base text-slate-600">
                Organisez vos priorites SAE avec un suivi clair et rapide.
              </p>
            </div>
            <img
              src={mmiLogo}
              alt="Logo MMI"
              className="h-14 w-auto flex-shrink-0"
            />
          </div>
        </div>

        {/* Settings & Seuils */}
        <div className="flex items-center justify-start">
          <Button
            onClick={openThresholdModal}
            variant="outline"
            className="h-11 rounded-lg px-4"
          >
            <Settings2 className="mr-2 h-5 w-5" />
            Modifier les seuils
          </Button>
        </div>

        {/* SAE Tabs Navigation - PRIMARY FILTER */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-slate-200">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative h-12 px-4 py-3 font-semibold text-sm whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span className="ml-2 text-xs font-bold">
                  {tabCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Matiere Filters - SECONDARY FILTER */}
        {allMatieres.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">
              Affiner par matière :
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setSelectedMatieres([])}
                className={`px-3 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap transition ${
                  selectedMatieres.length === 0
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Tous
              </button>
              {allMatieres.map((matiere) => {
                const isActive = selectedMatieres.includes(matiere);
                return (
                  <button
                    key={matiere}
                    type="button"
                    onClick={() => toggleMatiere(matiere)}
                    className={`px-3 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap transition ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {matiere}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-8">
          {isLoading && (
            <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
              <p className="text-base font-medium text-slate-600">
                Chargement de vos SAE...
              </p>
            </div>
          )}

          {!isLoading && fetchError && (
            <div className="flex min-h-96 flex-col items-center justify-center gap-6 text-center py-12">
              <img
                src="/images/undraw_no-data_ig65.svg"
                alt="Erreur de chargement"
                className="h-56 w-auto object-contain"
              />
              <div className="space-y-2 max-w-md">
                <p className="flex items-center justify-center gap-2 text-xl font-bold text-red-600">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                  Erreur de chargement
                </p>
                <p className="text-sm text-slate-600">{fetchError}</p>
              </div>
            </div>
          )}

          {!isLoading && !fetchError && displayedSAEs.length === 0 && (
            <div className="flex min-h-96 flex-col items-center justify-center gap-6 text-center py-12">
              <img
                src="/images/undraw_no-data_ig65.svg"
                alt="Aucune SAE"
                className="h-56 w-auto object-contain"
              />
              <div className="space-y-2 max-w-md">
                <p className="text-xl font-bold text-slate-900">{emptyTitle}</p>
                <p className="text-sm text-slate-600">{emptyDescription}</p>
              </div>
            </div>
          )}

          {!isLoading && !fetchError && displayedSAEs.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedSAEs.map((sae) => {
                const daysLeft = getDaysRemaining(sae.dueDate);
                const isUrgent =
                  sae.isUrgent || daysLeft <= thresholds.urgentes;

                return (
                  <Link
                    key={sae.id}
                    to={`/sae/${sae.id}`}
                    className="block group"
                  >
                    <div className="h-full rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-slate-300 transition hover:shadow-lg">
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

                      {/* Content */}
                      <div className="p-5 space-y-4">
                        {/* Tags */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs font-semibold">
                            {sae.thematic || "SAE"}
                          </Badge>
                          {isUrgent && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs font-semibold">
                              🔴 Urgent
                            </Badge>
                          )}
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-lg font-bold text-slate-950 group-hover:text-purple-600 transition">
                            {sae.title}
                          </h3>
                        </div>

                        {/* Deadline Info */}
                        <div className="space-y-2 border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-3">
                            <Clock3
                              className={`h-5 w-5 flex-shrink-0 ${
                                daysLeft < 0
                                  ? "text-red-600"
                                  : "text-purple-600"
                              }`}
                            />
                            <span
                              className={`font-semibold text-sm ${
                                daysLeft < 0 ? "text-red-600" : "text-slate-900"
                              }`}
                            >
                              {getDeadlineText(sae)}
                            </span>
                          </div>

                          {sae.dueDate && (
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <CalendarDays className="h-5 w-5 flex-shrink-0" />
                              {new Date(sae.dueDate).toLocaleDateString(
                                "fr-FR",
                              )}
                            </div>
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-white p-0" showCloseButton>
          <DialogHeader className="px-6 py-6">
            <DialogTitle className="text-2xl font-bold">
              Regler les seuils
            </DialogTitle>
            <DialogDescription className="text-base">
              Definissez le nombre de jours pour les categories urgentes et du
              moment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="urgentes" className="font-semibold">
                Jours limite pour SAE urgentes
              </Label>
              <Input
                id="urgentes"
                type="number"
                min="0"
                value={tempUrgentes}
                onChange={(e) => setTempUrgentes(e.target.value)}
                className="h-12 rounded-lg border-slate-300 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moment" className="font-semibold">
                Jours limite pour SAE du moment
              </Label>
              <Input
                id="moment"
                type="number"
                min={parseInt(tempUrgentes, 10) + 1 || 1}
                value={tempMoment}
                onChange={(e) => setTempMoment(e.target.value)}
                className="h-12 rounded-lg border-slate-300 bg-white"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-6 gap-3">
            <Button
              variant="outline"
              className="rounded-lg h-11"
              onClick={() => setIsEditModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="rounded-lg h-11 bg-purple-600 hover:bg-purple-700"
              onClick={saveThresholds}
            >
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
