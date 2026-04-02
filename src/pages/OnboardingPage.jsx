import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, UploadCloud, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { authService } from "../services/auth.service";
import { resourcesService } from "../services/resources.service";

export default function OnboardingPage() {
  usePageTitle("Configuration");
  const [promotions, setPromotions] = useState([]);
  const [groups, setGroups] = useState([]);

  const [promotionId, setPromotionId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [promosData, groupsData] = await Promise.all([
          resourcesService.getPromotions(),
          resourcesService.getGroups(),
        ]);
        setPromotions(Array.isArray(promosData) ? promosData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch {
        setError("Impossible de charger les promotions et groupes.");
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchResources();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format non supporte. Utilisez PNG, JPEG ou WebP.");
      return;
    }

    setError("");
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let imageUrl = "";
      if (selectedFile) {
        const uploadRes = await resourcesService.uploadImage(selectedFile);
        imageUrl = uploadRes?.url || uploadRes?.data?.url || "";
      }

      await authService.onboardStudent({
        promotionId,
        groupId,
        imageUrl,
      });

      await refreshUser();
      navigate("/pending");
    } catch (err) {
      setError(err?.message || "Erreur lors de la soumission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-montserrat">
      <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-16 sm:px-8">
        <section className="mx-auto w-full max-w-3xl space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Etape finale
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Finalisez votre profil etudiant
          </h1>
          <p className="text-base text-slate-600">
            Indiquez votre promotion, votre groupe et ajoutez une photo de
            profil. Votre demande sera ensuite validee par un administrateur.
          </p>
        </section>

        <section className="mx-auto mt-8 w-full max-w-3xl">
          <Card className="rounded-2xl border-slate-200 shadow-none">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold text-slate-950">
                Informations de scolarite
              </CardTitle>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="promotion"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Promotion
                    </label>
                    <select
                      id="promotion"
                      value={promotionId}
                      onChange={(e) => setPromotionId(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      required
                    >
                      <option value="">Selectionnez une promotion...</option>
                      {promotions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="group"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Groupe TP
                    </label>
                    <select
                      id="group"
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      required
                    >
                      <option value="">Selectionnez un groupe...</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Photo de profil
                  </p>
                  <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                    <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Apercu"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <UserCircle2 className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <label
                        htmlFor="profile-image"
                        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700"
                      >
                        {selectedFile ? (
                          <ImagePlus className="h-4 w-4" />
                        ) : (
                          <UploadCloud className="h-4 w-4" />
                        )}
                        {selectedFile ? selectedFile.name : "Choisir une image"}
                      </label>
                      <input
                        id="profile-image"
                        type="file"
                        accept=".png,.jpeg,.jpg,.webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <p className="text-xs text-slate-500">
                        PNG, JPEG ou WebP
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !promotionId || !groupId}
                  className="h-11 w-full bg-purple-600 font-semibold text-white hover:bg-purple-700 px-4 py-2 gap-2 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white flex-shrink-0" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    "Envoyer ma demande"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
