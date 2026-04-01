import SharedGallery from "../components/SharedGallery";

export default function StudentGalleryPage() {
  return (
    <div className="min-h-screen bg-white font-montserrat">
      <main className="flex w-full flex-col gap-8 px-6 py-12 pt-28 sm:px-8">
        <section className="mx-auto flex w-full max-w-7xl flex-col items-center space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Espace etudiant
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Galerie des projets
          </h1>
          <p className="text-base text-slate-600">
            Explorez les travaux publies par les etudiants.
          </p>
        </section>

        <SharedGallery />
      </main>
    </div>
  );
}
