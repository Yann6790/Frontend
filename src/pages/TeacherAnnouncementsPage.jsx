import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import IllustratedState from "../components/IllustratedState";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { saeService } from "../services/sae.service";

export default function TeacherAnnouncementsPage() {
  usePageTitle("Annonces");
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [mySaes, setMySaes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [selectedSaeId, setSelectedSaeId] = useState("");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");

  // History Filter State
  const [filterSaeId, setFilterSaeId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError("");
      const [annRes, saeRes] = await Promise.all([
        saeService.getAllAnnouncements(),
        saeService.getSaeList(),
      ]);
      let annList = Array.isArray(annRes) ? annRes : annRes?.data || [];
      const allSaes = Array.isArray(saeRes) ? saeRes : saeRes?.data || [];

      // ── Filtrage des annonces (uniquement les siennes, sauf ADMIN) ──
      if (user?.role !== "ADMIN") {
        annList = annList.filter(
          (ann) =>
            ann.userId === user?.id ||
            ann.authorId === user?.id ||
            ann.creatorId === user?.id ||
            ann.authorName === user?.name ||
            ann.authorEmail === user?.email,
        );
      }

      // ── Filtrage selon rôle et participation ──
      if (user?.role === "ADMIN") {
        setMySaes(allSaes);
      } else {
        const owned = allSaes.filter((s) => s.createdBy?.email === user?.email);
        const ownedIds = new Set(owned.map((s) => s.id));
        const others = allSaes.filter((s) => !ownedIds.has(s.id));

        const checks = await Promise.allSettled(
          others.map((s) =>
            saeService
              .getInvitations(s.id)
              .then((invs) => {
                const list = Array.isArray(invs) ? invs : invs?.data || [];
                const isInvited = list.some(
                  (i) =>
                    i.userId === user?.id ||
                    i.email === user?.email ||
                    (i.name?.firstname?.toLowerCase() ===
                      user?.name?.firstname?.toLowerCase() &&
                      i.name?.lastname?.toLowerCase() ===
                        user?.name?.lastname?.toLowerCase()),
                );
                return isInvited ? s : null;
              })
              .catch(() => null),
          ),
        );

        const invited = checks
          .filter((r) => r.status === "fulfilled" && r.value)
          .map((r) => r.value);

        setMySaes([...owned, ...invited]);
      }

      setAnnouncements(annList);
    } catch (err) {
      console.error("Erreur chargement données", err);
      setFetchError(
        err?.message ||
          "Impossible de charger les annonces et les SAE pour le moment.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unusedSelectedSae = useMemo(
    () => mySaes.find((s) => s.id === selectedSaeId),
    [mySaes, selectedSaeId],
  );

  const resetForm = () => {
    setEditingId(null);
    setSelectedSaeId("");
    setTitre("");
    setContenu("");
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSaeId || !titre || !contenu) return;

    setIsSaving(true);
    try {
      const payload = { title: titre, content: contenu };
      if (editingId) {
        await saeService.updateAnnouncement(selectedSaeId, editingId, payload);
        setSaveMsg("Annonce mise à jour avec succès !");
      } else {
        await saeService.createAnnouncement(selectedSaeId, payload);
        setSaveMsg("Annonce publiée avec succès !");
      }
      setTimeout(() => setSaveMsg(""), 3000);
      await loadData();
      resetForm();
    } catch (err) {
      alert(`Erreur : ${err.message || "Impossible d'enregistrer l'annonce."}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (ann) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEditingId(ann.id);
    setSelectedSaeId(ann.saeId);
    setTitre(ann.title);
    setContenu(ann.content);
  };

  const handleDelete = async (saeId, annId) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    try {
      await saeService.deleteAnnouncement(saeId, annId);
      setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
    } catch (err) {
      alert(`Erreur : ${err.message || "Impossible de supprimer l'annonce."}`);
    }
  };

  const displayedAnnouncements = useMemo(() => {
    if (!filterSaeId) return announcements;
    return announcements.filter((a) => a.saeId === filterSaeId);
  }, [announcements, filterSaeId]);

  const isApiFetchFail =
    !!fetchError && /(failed to fetch|network|fetch)/i.test(fetchError);

  return (
    <div className="min-h-screen bg-white font-montserrat">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-8 mt-16">
        {/* Header */}
        <section className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Espace professeur
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Annonces & Communications
          </h1>
          <p className="text-base text-slate-600">
            Diffusez des informations importantes sur vos projets SAE.
          </p>
        </section>

        {/* Save Message */}
        {saveMsg && (
          <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg text-sm font-bold">
            {saveMsg}
          </div>
        )}

        {/* Nouvelle Annonce Button */}
        {!showForm && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Annonce
            </button>
          </div>
        )}

        {/* Sélection SAE */}
        <div className="flex flex-col gap-3">
          <label className="font-bold text-slate-700">
            Sélectionner une SAE
          </label>
          <select
            value={filterSaeId}
            onChange={(e) => setFilterSaeId(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-medium max-w-sm"
          >
            <option value="">-- Choisir une SAE --</option>
            {mySaes.map((sae) => (
              <option key={sae.id} value={sae.id}>
                {sae.title}
              </option>
            ))}
          </select>
        </div>

        {/* Formulaire d'annonce */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-950">
                {editingId ? "Modifier l'annonce" : "Créer une annonce"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="p-1 hover:bg-slate-100 rounded-lg transition-all duration-200 active:scale-95 flex flex-row items-center justify-center whitespace-nowrap w-fit gap-2"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700">
                  SAE Associée *
                </label>
                <select
                  value={selectedSaeId}
                  onChange={(e) => setSelectedSaeId(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-medium"
                  required
                >
                  <option value="">Sélectionner une SAE...</option>
                  {mySaes.map((sae) => (
                    <option key={sae.id} value={sae.id}>
                      {sae.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700">Objet *</label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex: Mise à jour du cahier des charges"
                  className="bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-700">
                Message aux étudiants *
              </label>
              <textarea
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                placeholder="Expliquez en détail le changement ou l'information importante..."
                className="bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-medium resize-y min-h-[120px]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
              >
                {isSaving ? "Envoi..." : editingId ? "Sauvegarder" : "Publier"}
              </button>
            </div>
          </form>
        )}

        {/* Liste des annonces */}
        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />
          </div>
        ) : fetchError ? (
          <IllustratedState
            imageSrc="/images/undraw_pin-to-board_eoie.svg"
            imageAlt="Erreur de chargement"
            title={
              isApiFetchFail
                ? "Echec de connexion a l'API"
                : "Erreur de chargement"
            }
            description={
              isApiFetchFail
                ? "La requete API a echoue. Verifiez la connexion puis reessayez."
                : "Une erreur est survenue lors du chargement des donnees."
            }
            action={
              <button
                type="button"
                onClick={loadData}
                className="inline-flex h-9 items-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
              >
                Reessayer
              </button>
            }
          />
        ) : (
          <section className="grid grid-cols-1 gap-6">
            {displayedAnnouncements.length > 0 ? (
              displayedAnnouncements.map((annonce) => {
                const saeBanner = mySaes.find(
                  (s) => s.id === annonce.saeId,
                )?.banner;
                return (
                  <article
                    key={annonce.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition hover:border-slate-300 group"
                  >
                    {/* Banner SAE */}
                    {saeBanner && (
                      <div className="w-full h-40 overflow-hidden bg-slate-100">
                        <img
                          src={saeBanner}
                          alt={annonce.saeTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {annonce.saeTitle || "SAE"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(annonce.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-950">
                        {annonce.title}
                      </h2>
                      <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                        {annonce.content}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(annonce)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 font-bold text-xs rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Modifier
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(annonce.saeId, annonce.id)
                            }
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : announcements.length === 0 ? (
              <IllustratedState
                imageSrc="/images/undraw_pin-to-board_eoie.svg"
                imageAlt="Aucune annonce"
                title="Aucune annonce"
                description="Les annonces que vous publiez sur vos SAE apparaitront ici."
              />
            ) : (
              <IllustratedState
                imageSrc="/images/undraw_pin-to-board_eoie.svg"
                imageAlt="Aucune annonce pour cette SAE"
                title="Aucune annonce pour cette SAE"
                description="Selectionnez une autre SAE ou publiez une nouvelle annonce."
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
