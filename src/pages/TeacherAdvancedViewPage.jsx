import { ChevronLeft, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { saeService } from "../services/sae.service";

export default function TeacherAdvancedViewPage() {
  usePageTitle("Vue avancée");
  const [realizations, setRealizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatiere, setSelectedMatiere] = useState("Toutes");
  const [selectedPromo, setSelectedPromo] = useState("Toutes");

  const [bulkYear, setBulkYear] = useState("");

  useEffect(() => {
    const loadRows = async () => {
      setIsLoading(true);
      try {
        const saesRes = await saeService.getSaeList();
        const saes = Array.isArray(saesRes)
          ? saesRes
          : saesRes?.data || saesRes?.items || [];

        const settledSubs = await Promise.allSettled(
          saes.map(async (sae) => {
            const subRes = await saeService.getSubmissions(sae.id);
            const subs = Array.isArray(subRes)
              ? subRes
              : subRes?.data || subRes?.items || [];
            return { sae, subs };
          }),
        );

        const rows = [];
        settledSubs.forEach((entry) => {
          if (entry.status !== "fulfilled") return;
          const { sae, subs } = entry.value;
          subs.forEach((sub) => {
            const fullName =
              `${sub?.name?.firstname || ""} ${sub?.name?.lastname || ""}`.trim() ||
              `${sub?.student?.firstname || ""} ${sub?.student?.lastname || ""}`.trim() ||
              "Etudiant";

            rows.push({
              id: sub.id,
              saeId: sae.id,
              titre: sae.title || sub.description || "Sans titre",
              etudiant: fullName,
              note: sub.average ?? null,
              promo: new Date(
                sub.submittedAt || sae.dueDate || sae.createdAt || Date.now(),
              ).getFullYear(),
              matiere:
                typeof sae.thematic === "string"
                  ? sae.thematic
                  : sae.thematic?.label || sae.thematic?.name || "Non definie",
              publicationDate: sub.submittedAt || sae.createdAt,
              isForceHidden: sub.isPublic === false,
            });
          });
        });

        setRealizations(rows);
      } catch (err) {
        console.error("Erreur de chargement de la galerie avancee", err);
        alert(err?.message || "Erreur lors du chargement des donnees.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRows();
  }, []);

  const matieres = [
    "Toutes",
    ...new Set(realizations.map((r) => r.matiere).filter(Boolean)),
  ];
  const promos = [
    "Toutes",
    ...new Set(realizations.map((r) => r.promo).filter(Boolean)).values(),
  ].sort((a, b) => {
    if (a === "Toutes") return -1;
    if (b === "Toutes") return 1;
    return Number(b) - Number(a);
  });

  const handleBulkDelete = async () => {
    if (!bulkYear || bulkYear.length !== 4) {
      alert("Veuillez entrer une annee valide (ex: 2024).");
      return;
    }

    const yearNum = parseInt(bulkYear, 10);
    const targets = realizations.filter(
      (r) => new Date(r.publicationDate).getFullYear() === yearNum,
    );

    if (targets.length === 0) {
      alert(`Aucune realisation trouvee pour l'annee ${yearNum}.`);
      return;
    }

    if (
      !window.confirm(
        `ATTENTION\nVous etes sur le point de supprimer DEFINITIVEMENT ${targets.length} realisation(s) de l'annee ${yearNum}.\nCette action est irreversible. Continuer ?`,
      )
    ) {
      return;
    }

    const results = await Promise.allSettled(
      targets.map((row) => saeService.deleteSubmission(row.id)),
    );
    const okCount = results.filter((r) => r.status === "fulfilled").length;

    setRealizations((prev) =>
      prev.filter((r) => new Date(r.publicationDate).getFullYear() !== yearNum),
    );
    setBulkYear("");
    alert(`${okCount} realisation(s) supprimee(s) avec succes.`);
  };

  const handleToggleHideStatus = async (row) => {
    const nextIsPublic = row.isForceHidden;
    try {
      await saeService.updateSubmissionVisibility(
        row.saeId,
        row.id,
        nextIsPublic,
      );
      setRealizations((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, isForceHidden: !r.isForceHidden } : r,
        ),
      );
    } catch (err) {
      alert(err?.message || "Erreur lors du changement de visibilite.");
    }
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm("Supprimer definitivement ce rendu ?")) return;
    try {
      await saeService.deleteSubmission(id);
      setRealizations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err?.message || "Erreur lors de la suppression.");
    }
  };

  const displayedRows = useMemo(() => {
    let filtered = [...realizations];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.titre.toLowerCase().includes(lowerSearch) ||
          r.etudiant.toLowerCase().includes(lowerSearch),
      );
    }

    if (selectedMatiere !== "Toutes") {
      filtered = filtered.filter((r) => r.matiere === selectedMatiere);
    }

    if (selectedPromo !== "Toutes") {
      filtered = filtered.filter(
        (r) => r.promo?.toString() === selectedPromo.toString(),
      );
    }

    filtered.sort(
      (a, b) => new Date(b.publicationDate) - new Date(a.publicationDate),
    );

    return filtered;
  }, [realizations, searchTerm, selectedMatiere, selectedPromo]);

  return (
    <div className="min-h-screen bg-white font-montserrat pb-20">
      <main className="mx-auto mt-16 flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:px-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Link
              to="/teacher/galerie"
              className="flex w-fit items-center gap-2 font-semibold text-purple-600 hover:text-purple-700"
            >
              <ChevronLeft className="h-5 w-5" /> Retour galerie
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Espace professeur
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-950">
                Visualisation avancee
              </h1>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                {realizations.length} projets
              </span>
            </div>
            <p className="text-base text-slate-600">
              Pilotez les publications avec des filtres rapides et des actions
              de moderation.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Filtres
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[250px] flex-1 sm:flex-initial">
                  <input
                    type="text"
                    placeholder="Rechercher un etudiant ou un projet"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <select
                  value={selectedMatiere}
                  onChange={(e) => setSelectedMatiere(e.target.value)}
                  className="h-11 min-w-[170px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  {matieres.map((m) => (
                    <option key={m} value={m}>
                      {m === "Toutes" ? "Toutes matieres" : m}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPromo}
                  onChange={(e) => setSelectedPromo(e.target.value)}
                  className="h-11 min-w-[150px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  {promos.map((p) => (
                    <option key={String(p)} value={p}>
                      {p === "Toutes" ? "Toutes promos" : p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-3 sm:p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-red-600">
                Suppression annuelle
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  placeholder="Ex: 2023"
                  value={bulkYear}
                  onChange={(e) => setBulkYear(e.target.value)}
                  className="h-11 w-28 rounded-xl border border-red-200 bg-white px-3 text-center text-sm font-bold text-slate-900 outline-none transition placeholder:font-semibold placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex h-11 items-center rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700"
                  title="Supprime toutes les realisations publiees pour l'annee indiquee. Action irreversible."
                  aria-label="Supprimer toutes les realisations d'une annee"
                >
                  Suppression par annee
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Etudiant
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Titre SAE
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Promo
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Matiere
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Date publication
                  </th>
                  <th scope="col" className="px-6 py-4 text-center">
                    Note
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Chargement des donnees...
                    </td>
                  </tr>
                ) : displayedRows.length > 0 ? (
                  displayedRows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-purple-50/40"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900">
                        {row.etudiant}
                      </td>
                      <td className="px-6 py-4">{row.titre}</td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                          {row.promo || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">{row.matiere || "-"}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {row.publicationDate
                          ? new Date(row.publicationDate).toLocaleDateString(
                              "fr-FR",
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.note === "number" ? (
                          <>
                            <span className="font-black text-purple-700">
                              {row.note}
                            </span>
                            <span className="text-xs text-slate-400">/20</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleHideStatus(row)}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                            row.isForceHidden
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          title="Cliquer pour basculer le statut"
                        >
                          {row.isForceHidden ? "CACHE (RESTREINT)" : "PUBLIC"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteOne(row.id)}
                          className="rounded p-1 text-red-400 transition-colors hover:text-red-700"
                          title="Supprimer definitivement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center font-bold text-slate-500"
                    >
                      Aucune realisation trouvee.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
