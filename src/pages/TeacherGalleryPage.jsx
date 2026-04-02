import { Settings2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import SharedGallery from "../components/SharedGallery";
import { usePageTitle } from "../hooks/usePageTitle";
import { saeService } from "../services/sae.service";

export default function TeacherGalleryPage() {
  usePageTitle("Galerie");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDelete = async (saeId, id) => {
    if (
      window.confirm(
        "Voulez-vous vraiment supprimer définitivement cette réalisation de la galerie ?",
      )
    ) {
      try {
        await saeService.deleteSubmission(saeId, id);
        setRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        console.error("Erreur lors de la suppression", err);
        alert(err.message || "Erreur lors de la suppression.");
      }
    }
  };

  const handleHide = async (saeId, submissionId) => {
    await saeService.updateSubmissionVisibility(saeId, submissionId, false);
  };

  return (
    <div className="min-h-screen bg-white font-montserrat pb-20">
      <main className="flex w-full flex-col gap-10 px-6 py-12 sm:px-8 mt-16">
        {/* Header */}
        <section className="mx-auto w-full max-w-6xl space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Espace professeur
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Galerie & Modération
          </h1>
          <p className="text-base text-slate-600">
            Supervisez et modérez les travaux publics des étudiants.
          </p>
        </section>

        <div className="mx-auto flex w-full max-w-6xl justify-center">
          <Link
            to="/teacher/galerie/avancee"
            className="flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            <Settings2 className="w-4 h-4" />
            Visualisation avancée
          </Link>
        </div>

        {/* Shared Gallery Zone */}
        <SharedGallery
          canModerate={true}
          isAdminView={true}
          refreshTrigger={refreshTrigger}
          onDelete={handleDelete}
          onHide={handleHide}
        />
      </main>
    </div>
  );
}
