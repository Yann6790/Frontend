import { Badge } from "@/components/ui/badge";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import IllustratedState from "../components/IllustratedState";
import { useAuth } from "../context/AuthContext";
import { resourcesService } from "../services/resources.service";
import { saeService } from "../services/sae.service";

export default function StudentRendusPage() {
  const { user } = useAuth();

  const [selectedSemestre, setSelectedSemestre] = useState("Tous");
  const [selectedMatiere, setSelectedMatiere] = useState("Toutes");

  const [rendus, setRendus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const loadRendus = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      // 1. Params for getting SAEs applicable to the student
      const apiParams = {};
      const promoId =
        user?.promotion?.id ||
        user?.promotionId ||
        user?.studentProfile?.promotionId;
      if (promoId) apiParams.promotionId = promoId;

      const groupId = user?.groupTp || user?.studentProfile?.groupTp;
      if (groupId) apiParams.groupId = groupId;

      // 2. Fetch all necessary data concurrently
      const [saeData, gradesDataRes, semestersRes] = await Promise.all([
        saeService.getSaeList(apiParams),
        saeService.getMyGrades().catch(() => ({ data: { data: [] } })),
        resourcesService.getSemesters().catch(() => ({ data: [] })),
      ]);

      const allSaes = Array.isArray(saeData) ? saeData : saeData?.data || [];
      const myGradesArray = Array.isArray(gradesDataRes?.data?.data)
        ? gradesDataRes.data.data
        : [];
      const sems = Array.isArray(semestersRes)
        ? semestersRes
        : semestersRes?.data || [];

      // 3. Keep only SAEs that are marked as submitted by the backend
      const submittedSaes = allSaes.filter((sae) => sae.isSubmitted);

      // 4. Map the graded items so we can lookup average easily by saeTitle or via some linkage.
      const gradesMap = {};
      myGradesArray.forEach((gradeObj) => {
        if (gradeObj.saeId) {
          gradesMap[gradeObj.saeId] = gradeObj.average;
        } else if (gradeObj.saeTitle) {
          gradesMap[gradeObj.saeTitle] = gradeObj.average;
        }
      });

      // 5. Build Final array
      const merged = submittedSaes.map((sae) => {
        let semLabel = "S?";
        const semObj = sems.find((s) => s.id === sae.semesterId);
        if (semObj) {
          const num =
            semObj.number ??
            parseInt((semObj.name || semObj.label || "").replace(/\D/g, ""), 10);
          semLabel = num ? `S${num}` : semObj.name || semObj.label || "S?";
        }

        const gradeVal = gradesMap[sae.id] ?? gradesMap[sae.title];

        return {
          id: sae.id,
          titre: sae.title || "SAE Sans Titre",
          banniere: sae.banner || "",
          matiere: sae.thematic || "General",
          semestre: semLabel,
          note: gradeVal !== undefined ? gradeVal : "Non note",
          dateDepot: sae.updatedAt || sae.dueDate || new Date().toISOString(),
        };
      });

      setRendus(merged);
    } catch (err) {
      console.error("Erreur lors du chargement des rendus :", err);
      setFetchError(
        err?.message ||
          "Impossible de charger vos rendus pour le moment. Veuillez reessayer dans quelques instants.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadRendus();
    }
  }, [user, loadRendus]);

  const allSemestres = useMemo(
    () => ["Tous", ...new Set(rendus.map((r) => r.semestre))].sort(),
    [rendus],
  );

  const allMatieres = useMemo(
    () => ["Toutes", ...new Set(rendus.map((r) => r.matiere))].sort(),
    [rendus],
  );

  const displayedRendus = useMemo(() => {
    let filtered = [...rendus];

    if (selectedSemestre !== "Tous") {
      filtered = filtered.filter((r) => r.semestre === selectedSemestre);
    }

    if (selectedMatiere !== "Toutes") {
      filtered = filtered.filter((r) => r.matiere === selectedMatiere);
    }

    // Tri decroissant par defaut (les plus recents en premier)
    filtered.sort((a, b) => new Date(b.dateDepot) - new Date(a.dateDepot));

    return filtered;
  }, [selectedSemestre, selectedMatiere, rendus]);

  const isApiFetchFail =
    !!fetchError &&
    /(failed to fetch|network|fetch)/i.test(fetchError);

  return (
    <div className="min-h-screen bg-white font-montserrat">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 pt-28 sm:px-8">
        <section className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Espace etudiant
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Mes rendus
          </h1>
          <p className="text-base text-slate-600">
            Consultez vos travaux deja remis et leurs evaluations.
          </p>
        </section>

        {allSemestres.length > 0 && (
          <section className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-600">
                Filtrer par semestre :
              </p>
              <select
                value={selectedSemestre}
                onChange={(e) => setSelectedSemestre(e.target.value)}
                className="h-10 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {allSemestres.map((semestre) => (
                  <option key={semestre} value={semestre}>
                    {semestre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-600">
                Filtrer par matiere :
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {allMatieres.map((matiere) => {
                  const isActive = selectedMatiere === matiere;

                  return (
                    <button
                      key={matiere}
                      type="button"
                      onClick={() => setSelectedMatiere(matiere)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
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
          </section>
        )}

        {isLoading ? (
          <IllustratedState
            imageSrc="/images/undraw_completing_3pe7.svg"
            imageAlt="Chargement des rendus"
            title="Chargement des rendus"
            description="Nous recuperons vos depots et vos evaluations."
            className="min-h-72"
          />
        ) : fetchError ? (
          <IllustratedState
            imageSrc="/images/undraw_completing_3pe7.svg"
            imageAlt="Erreur de chargement des rendus"
            title={
              isApiFetchFail
                ? "Echec de connexion a l'API"
                : "Erreur de chargement"
            }
            description={
              isApiFetchFail
                ? "La connexion au serveur a echoue. Verifiez le reseau puis reessayez."
                : "Impossible de charger vos rendus pour le moment."
            }
            action={
              <button
                type="button"
                onClick={loadRendus}
                className="inline-flex h-9 items-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
              >
                Reessayer
              </button>
            }
          />
        ) : (
          <section className="grid grid-cols-1 gap-6">
            {displayedRendus.length === 0 &&
              (rendus.length === 0 ? (
                <IllustratedState
                  imageSrc="/images/undraw_completing_3pe7.svg"
                  imageAlt="Aucun rendu"
                  title="Aucun rendu"
                  description="Vous n'avez pas encore de rendu disponible."
                />
              ) : (
                <IllustratedState
                  imageSrc="/images/undraw_completing_3pe7.svg"
                  imageAlt="Aucun rendu pour ces filtres"
                  title="Aucun rendu pour ces filtres"
                  description="Essayez un autre semestre ou une autre matiere."
                />
              ))}

            {displayedRendus.map((rendu) => {
                const noteValue = Number(rendu.note);
                const hasGrade =
                  rendu.note !== "Non note" && !Number.isNaN(noteValue);

                return (
                  <Link
                    to={`/sae/${rendu.id}/rendu?mode=view`}
                    key={rendu.id}
                    className="group block"
                  >
                    <article className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
                      {rendu.banniere && (
                        <div className="mb-5 h-36 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={rendu.banniere}
                            alt={rendu.titre}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                            {rendu.semestre}
                          </Badge>
                          <Badge variant="outline" className="text-slate-700">
                            {rendu.matiere}
                          </Badge>
                        </div>

                        {hasGrade ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              noteValue >= 10
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            Note : {noteValue}/20
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            En attente de note
                          </span>
                        )}
                      </div>

                      <h2 className="mb-2 text-2xl font-medium tracking-tight text-slate-950 group-hover:text-purple-600">
                        {rendu.titre}
                      </h2>

                      <p className="mb-5 text-sm text-slate-600">
                        Depose ou echeance le{" "}
                        {new Date(rendu.dateDepot).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      <div className="flex items-center justify-end border-t border-slate-100 pt-4">
                        <span className="inline-flex h-9 items-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-purple-700">
                          Voir le rendu
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
          </section>
        )}
      </main>
    </div>
  );
}
