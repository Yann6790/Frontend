import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import IllustratedState from "../components/IllustratedState";
import { Badge } from "../components/ui/badge";
import { usePageTitle } from "../hooks/usePageTitle";
import { saeService } from "../services/sae.service";

const normalizeThematic = (raw) => {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((t) => {
    if (typeof t === "string") return t;
    return t.label ?? t.code ?? t.name ?? t.id ?? String(t);
  });
};

export default function StudentAnnouncementsPage() {
  usePageTitle("Annonces");
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedMatiere, setSelectedMatiere] = useState("Toutes");

  const loadAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError("");
      const data = await saeService.getAllAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Erreur de chargement des annonces", err);
      setFetchError(
        err?.message || "Impossible de charger les annonces pour le moment.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const allMatieres = useMemo(() => {
    const matieresSet = new Set();
    announcements.forEach((a) => {
      const ms = normalizeThematic(a.thematic);
      ms.forEach((m) => matieresSet.add(m));
    });
    return ["Toutes", ...Array.from(matieresSet)];
  }, [announcements]);

  const displayedAnnonces = useMemo(() => {
    let filtered = [...announcements];

    // filtrage par thématique
    if (selectedMatiere !== "Toutes") {
      filtered = filtered.filter((a) => {
        const ms = normalizeThematic(a.thematic);
        return ms.includes(selectedMatiere);
      });
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }, [announcements, selectedMatiere]);

  const isApiFetchFail =
    !!fetchError && /(failed to fetch|network|fetch)/i.test(fetchError);

  return (
    <div className="min-h-screen bg-white font-montserrat">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 pt-28 sm:px-8">
        <section className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Espace etudiant
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Annonces
          </h1>
          <p className="text-base text-slate-600">
            Retrouvez les communications importantes de vos SAE.
          </p>
        </section>

        {allMatieres.length > 0 && (
          <section className="space-y-3">
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
                    className={`px-3 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap flex flex-row items-center justify-center w-fit gap-2 transition-all duration-200 active:scale-95 ${
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
          </section>
        )}

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />
          </div>
        ) : fetchError ? (
          <IllustratedState
            imageSrc="/images/undraw_pin-to-board_eoie.svg"
            imageAlt="Erreur de chargement des annonces"
            title={
              isApiFetchFail
                ? "Echec de connexion a l'API"
                : "Erreur de chargement"
            }
            description={
              isApiFetchFail
                ? "La connexion au serveur a echoue. Verifiez votre connexion puis reessayez."
                : "Une erreur est survenue pendant le chargement des annonces."
            }
            action={
              <button
                type="button"
                onClick={loadAnnouncements}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-purple-600 px-4 py-2 gap-2 text-sm font-semibold text-white transition-all duration-200 active:scale-95 hover:bg-purple-700"
              >
                Reessayer
              </button>
            }
          />
        ) : (
          <section className="grid grid-cols-1 gap-6">
            {displayedAnnonces.map((annonce) => {
              const thematics = normalizeThematic(annonce.thematic);
              const author =
                typeof annonce.authorName === "object"
                  ? `${annonce.authorName?.firstname || ""} ${annonce.authorName?.lastname || ""}`.trim()
                  : annonce.authorName || "Professeur";

              return (
                <article
                  key={annonce.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
                >
                  {annonce.saeBanner && (
                    <div className="mb-5 h-36 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={annonce.saeBanner}
                        alt={annonce.saeTitle || "Banniere SAE"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {author}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(annonce.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {thematics.map((t) => (
                        <Badge
                          key={t}
                          className="bg-purple-100 text-purple-700 hover:bg-purple-100"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-950">
                    {annonce.title}
                  </h2>
                  <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                    {annonce.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Nom de la SAE
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {annonce.saeTitle || "SAE"}
                      </p>
                    </div>

                    <Link
                      to={`/sae/${annonce.saeId}`}
                      className="inline-flex h-9 items-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
                    >
                      Voir la SAE
                    </Link>
                  </div>
                </article>
              );
            })}

            {displayedAnnonces.length === 0 &&
              (announcements.length === 0 ? (
                <IllustratedState
                  imageSrc="/images/undraw_pin-to-board_eoie.svg"
                  imageAlt="Aucune annonce"
                  title="Aucune annonce"
                  description="Les nouvelles communications de vos professeurs apparaitront ici."
                />
              ) : (
                <IllustratedState
                  imageSrc="/images/undraw_pin-to-board_eoie.svg"
                  imageAlt="Aucune annonce pour ces filtres"
                  title="Aucune annonce pour ces filtres"
                  description="Essayez une autre matiere pour afficher des communications."
                />
              ))}
          </section>
        )}
      </main>
    </div>
  );
}
