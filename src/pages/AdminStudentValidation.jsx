import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { usePageTitle } from "../hooks/usePageTitle";
import { adminService } from "../services/admin.service";
import { resourcesService } from "../services/resources.service";

/**
 * Page de validation des étudiants par l'administrateur.
 * Branchement direct sur le backend NestJS.
 */
export default function AdminStudentValidation() {
  usePageTitle("Validation des étudiants");
  // États principaux
  const [pendingStudents, setPendingStudents] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [groups, setGroups] = useState([]);

  // États d'interface
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  // États de filtrage
  const [filterPromo, setFilterPromo] = useState("Toutes");
  const [filterTP, setFilterTP] = useState("Tous");

  // État de la modale de modification
  const [editingStudent, setEditingStudent] = useState(null);

  // 1. Chargement initial des données
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Chargement parallèle des étudiants et des ressources
      const [studentsRes, promosRes, groupsRes] = await Promise.all([
        adminService.getPendingStudents(),
        resourcesService.getPromotions(),
        resourcesService.getGroups(),
      ]);

      // Note: Selon la structure de l'API, on extrait .data ou on prend la réponse directe
      setPendingStudents(studentsRes.data || studentsRes || []);
      setPromotions(promosRes.data || promosRes || []);
      setGroups(groupsRes.data || groupsRes || []);
    } catch (err) {
      console.error("[AdminValidation] Error fetching data:", err);
      showNotification("Erreur lors de la récupération des données.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    // Auto-hide après 5 secondes
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  // 2. Logique de filtrage
  const filteredStudents = pendingStudents.filter((student) => {
    const matchPromo =
      filterPromo === "Toutes" || student.promotionId === filterPromo;
    const matchTP = filterTP === "Tous" || student.groupId === filterTP;
    return matchPromo && matchTP;
  });

  // 3. Actions : Accepter
  const handleAccept = async (id) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await adminService.validateStudent(id);
      showNotification("Étudiant validé avec succès.");
      // Mise à jour locale du state
      setPendingStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      showNotification(err.message || "Erreur lors de la validation.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // 4. Actions : Refuser
  const handleRefuse = async (id) => {
    if (isActionLoading) return;
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir refuser et supprimer cette demande d'inscription ?",
      )
    )
      return;

    setIsActionLoading(true);
    try {
      await adminService.unvalidateStudent(id);
      showNotification("Demande refusée et supprimée.");
      setPendingStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      showNotification(err.message || "Erreur lors du refus.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // 5. Actions : Modification (Modale)
  const handleEditClick = (student) => {
    // Si l'API renvoie les noms sous forme de chaînes de caractères au lieu des IDs, on les mappe
    let promoId = student.promotionId || student.promotion?.id;
    if (!promoId && typeof student.promotion === "string") {
      const foundPromo = promotions.find(
        (p) => (p.label || p.name) === student.promotion,
      );
      if (foundPromo) promoId = foundPromo.id;
    }

    let grpId = student.groupId || student.group?.id;
    if (!grpId && typeof student.groupName === "string") {
      const foundGrp = groups.find((g) => g.name === student.groupName);
      if (foundGrp) grpId = foundGrp.id;
    }

    setEditingStudent({
      id: student.id,
      firstname: student.firstname || student.name?.firstname,
      lastname: student.lastname || student.name?.lastname,
      promotionId: promoId || "",
      groupId: grpId || "",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (isActionLoading) return;

    setIsActionLoading(true);
    try {
      await adminService.updateStudent(editingStudent.id, {
        firstname: editingStudent.firstname,
        lastname: editingStudent.lastname,
        promotionId: editingStudent.promotionId,
        groupId: editingStudent.groupId,
      });

      showNotification("Informations mises à jour avec succès.");
      setEditingStudent(null);
      // Rafraîchir la liste pour voir les changements (nom, promo, etc.)
      await fetchData();
    } catch (err) {
      showNotification(
        err.message || "Erreur lors de la mise à jour.",
        "error",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleChangeEdit = (field, value) => {
    setEditingStudent((prev) => ({ ...prev, [field]: value }));
  };

  // Helper pour trouver le nom d'une ressource par l'objet étudiant ou son ID
  const getPromoName = (student) => {
    if (typeof student.promotion === "string") return student.promotion;
    if (student.promotion?.label) return student.promotion.label;
    if (student.promotion?.name) return student.promotion.name;
    const id = student.promotionId || student.promotion?.id;
    const found = promotions.find((p) => p.id === id);
    if (found) return found.label || found.name;
    return student.promoDemandee || id || "N/A";
  };

  const getGroupName = (student) => {
    if (typeof student.groupName === "string") return student.groupName;
    if (student.group?.name) return student.group.name;
    const id = student.groupId || student.group?.id;
    const found = groups.find((g) => g.id === id);
    if (found) return found.name;
    return student.groupeTPDemande || id || "N/A";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-montserrat relative">
      <AdminNavbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 mt-16 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Validation des inscriptions étudiants
          </h1>
          {/* Notification Toast */}
          {notification.message && (
            <div
              className={`px-4 py-2 rounded-lg font-bold text-xs shadow-md border animate-in fade-in slide-in-from-top-2 ${
                notification.type === "error"
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-slate-800 text-white border-slate-800"
              }`}
            >
              {notification.message}
            </div>
          )}
        </div>

        {/* Zone de filtres (Strict Monochrome) */}
        <div className="bg-slate-50 border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-start gap-6 rounded-xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">
              Promotion :
            </label>
            <select
              value={filterPromo}
              onChange={(e) => setFilterPromo(e.target.value)}
              disabled={isLoading}
              className="bg-white border border-slate-300 text-slate-900 px-4 py-2 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 font-medium text-sm w-full sm:w-auto cursor-pointer rounded-lg transition-all"
            >
              <option value="Toutes">Toutes</option>
              {promotions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label || p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">
              Groupe TP :
            </label>
            <select
              value={filterTP}
              onChange={(e) => setFilterTP(e.target.value)}
              disabled={isLoading}
              className="bg-white border border-slate-300 text-slate-900 px-4 py-2 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 font-medium text-sm w-full sm:w-auto cursor-pointer rounded-lg transition-all"
            >
              <option value="Tous">Tous</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone d'affichage (Cartes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-full rounded-xl bg-white border border-slate-200 p-6 animate-pulse"
              >
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-slate-200 rounded flex-1"></div>
                    <div className="h-8 bg-slate-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="h-full rounded-xl bg-white border border-slate-200 p-6 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 uppercase tracking-tight">
                      {student.lastname || student.name?.lastname}{" "}
                      <span className="capitalize font-medium text-slate-600">
                        {student.firstname || student.name?.firstname}
                      </span>
                    </h3>
                    <p className="text-sm text-slate-600">{student.email}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Promo demandée
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold ring-1 ring-slate-200">
                        {getPromoName(student)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Groupe TP demandé
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold ring-1 ring-slate-200">
                        {getGroupName(student)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleAccept(student.id)}
                      disabled={isActionLoading}
                      variant="admin"
                      className="h-10 px-4 py-2 gap-2 flex items-center justify-center"
                    >
                      <span>Accepter</span>
                    </Button>
                    <Button
                      onClick={() => handleRefuse(student.id)}
                      disabled={isActionLoading}
                      variant="adminOutline"
                      className="h-10 px-4 py-2 gap-2 flex items-center justify-center"
                    >
                      <span>Refuser</span>
                    </Button>
                    <Button
                      onClick={() => handleEditClick(student)}
                      disabled={isActionLoading}
                      variant="adminOutline"
                      className="h-10 px-3 py-2 gap-2 flex items-center justify-center"
                    >
                      <span>Modifier</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center py-20">
              <p className="text-slate-400 font-medium italic">
                Aucune demande en attente.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modale d'Édition (SaaS Monochrome) */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-lg rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">
                  Modifier l'inscription
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Édition des données sources
                </p>
              </div>
              <Button
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-900"
                disabled={isActionLoading}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </Button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editingStudent.lastname}
                    onChange={(e) =>
                      handleChangeEdit("lastname", e.target.value)
                    }
                    className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-500 font-bold text-sm transition-all"
                    required
                    disabled={isActionLoading}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={editingStudent.firstname}
                    onChange={(e) =>
                      handleChangeEdit("firstname", e.target.value)
                    }
                    className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-500 font-bold text-sm transition-all"
                    required
                    disabled={isActionLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Promotion
                </label>
                <select
                  value={editingStudent.promotionId}
                  onChange={(e) =>
                    handleChangeEdit("promotionId", e.target.value)
                  }
                  className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-500 font-bold text-sm transition-all cursor-pointer"
                  required
                  disabled={isActionLoading}
                >
                  <option value="" disabled>
                    Sélectionner une promotion
                  </option>
                  {promotions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label || p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Groupe TP
                </label>
                <select
                  value={editingStudent.groupId}
                  onChange={(e) => handleChangeEdit("groupId", e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-500 font-bold text-sm transition-all cursor-pointer"
                  required
                  disabled={isActionLoading}
                >
                  <option value="" disabled>
                    Sélectionner un groupe
                  </option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  disabled={isActionLoading}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isActionLoading}
                  variant="admin"
                  className="px-6 py-3 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  {isActionLoading && (
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
