import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { resourcesService } from "../services/resources.service";
import { saeService } from "../services/sae.service";

export default function StudentSaeSubmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forcedReadOnly = searchParams.get("mode") === "view";

  // ── États page ──
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(forcedReadOnly);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [saeTitle, setSaeTitle] = useState("");
  const [saeBanner, setSaeBanner] = useState("");

  // ── États formulaire ──
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // ── Fichier principal ──
  const [selectedFile, setSelectedFile] = useState(null); // File object
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // ── Image de couverture ──
  const [imageFile, setImageFile] = useState(null); // File object
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  // ── Soumission ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [error, setError] = useState("");

  // ────────────────────────────────────────────────────────────
  // Chargement initial
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // Charger le titre de la SAE
        try {
          const saeRes = await saeService.getSaeById(id);
          const saeData = saeRes?.data || saeRes;
          setSaeTitle(saeData?.title || "");
          setSaeBanner(saeData?.banner || "");
        } catch {
          /* ignore */
        }

        // Vérifier si l'étudiant a déjà soumis
        try {
          const sub = await saeService.getMySubmission(id);
          const subData = sub?.data || sub;
          if (subData && subData.id) {
            setExistingSubmission(subData);
            setIsReadOnly(true);
            setDescription(subData.description || "");
            setIsPublic(subData.isPublic ?? false);
            setImagePreview(subData.imageUrl || null);
          }
        } catch {
          // 404 = pas encore de rendu, c'est normal
          setExistingSubmission(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [id]);

  // ────────────────────────────────────────────────────────────
  // Drag & Drop
  // ────────────────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isReadOnly) setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isReadOnly && e.dataTransfer.files?.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Image de couverture
  // ────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Soumission
  // ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier à soumettre.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      // Étape 1 : Upload du fichier principal
      const formDataFile = new FormData();
      formDataFile.append("file", selectedFile);
      formDataFile.append("saeId", id);
      formDataFile.append("description", description);
      const uploadRes = await saeService.uploadSaeResource(formDataFile);
      const fileUrl = uploadRes?.url || uploadRes?.data?.url;
      if (!fileUrl) throw new Error("L'URL du fichier uploadé est manquante.");

      // Étape 2 : Upload de l'image si fournie
      let imageUrl = null;
      if (imageFile) {
        const imgRes = await resourcesService.uploadImage(imageFile);
        imageUrl = imgRes?.url || imgRes?.data?.url;
      }

      // Étape 3 : Soumission du rendu
      const body = {
        url: fileUrl,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        description,
        isPublic,
        ...(imageUrl && { imageUrl }),
      };
      const result = await saeService.submitSae(id, body);
      const subData = result?.data || result;
      setExistingSubmission(subData);
      setIsReadOnly(true);
      setImagePreview(subData?.imageUrl || imagePreview);
      alert("✅ Votre rendu a été soumis avec succès !");
    } catch (err) {
      console.error("[Submission] Erreur:", err);
      setError(err.message || "Une erreur est survenue lors de la soumission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Changer visibilité (après soumission)
  // ────────────────────────────────────────────────────────────
  const handleToggleVisibility = async () => {
    setIsTogglingVisibility(true);
    try {
      const newVal = !isPublic;
      await saeService.updateMySubmissionVisibility(id, newVal);
      setIsPublic(newVal);
      setExistingSubmission((prev) => ({ ...prev, isPublic: newVal }));
    } catch (err) {
      alert(err.message || "Erreur lors du changement de visibilité.");
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Chargement
  // ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white font-montserrat flex flex-col">
      {saeBanner && (
        <div className="w-full h-80 overflow-hidden bg-slate-100">
          <img
            src={saeBanner}
            alt={saeTitle || `SAE ${id}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <main className="flex-1 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:px-8 pt-28">
        <Link
          to="/student-dashboard"
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold w-fit"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour au dashboard
        </Link>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            {saeTitle || `SAE ${id}`}
          </h1>
          <p className="text-base text-slate-600">
            {isReadOnly ? "Mon rendu" : "Déposer mon rendu"}
          </p>
        </div>

        {/* Badge statut */}
        {isReadOnly && existingSubmission && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold">
              Soumis le{" "}
              {new Date(existingSubmission.submittedAt).toLocaleDateString(
                "fr-FR",
              )}
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 font-medium px-3 py-2 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-full max-w-6xl"
        >
          {/* Description */}
          <Card className="ring-0 shadow-none">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Description</span>
                <span className="text-xs font-normal text-slate-500">
                  (Facultatif)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isReadOnly}
                placeholder="Expliquez votre démarche, les outils utilisés..."
                className={`w-full min-h-24 p-2.5 rounded-lg text-sm transition-all resize-y outline-none
                  ${
                    isReadOnly
                      ? "bg-slate-50 text-slate-700 cursor-default"
                      : "bg-slate-50 focus-visible:ring-0"
                  }`}
              />
            </CardContent>
          </Card>

          {/* Image de couverture */}
          <Card className="ring-0 shadow-none">
            <CardHeader>
              <CardTitle>Image de couverture</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative group rounded-lg overflow-hidden w-full">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-full h-auto object-cover aspect-video"
                  />
                  {!isReadOnly && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : !isReadOnly ? (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group"
                >
                  <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-purple-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Ajouter une image
                  </span>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Aucune image fournie.</p>
              )}
            </CardContent>
          </Card>

          {/* Fichier principal */}
          <Card className="ring-0 shadow-none">
            <CardHeader>
              <CardTitle>Fichier à soumettre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isReadOnly && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-6 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
                    ${isDragging ? "bg-purple-50" : "bg-slate-50 hover:bg-slate-100"}`}
                >
                  <div
                    className={`p-3 rounded-full transition-transform ${isDragging ? "bg-purple-600 text-white scale-110" : "bg-white text-purple-600"}`}
                  >
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 text-sm">
                      Glissez et déposez votre fichier
                    </p>
                    <p className="text-xs text-slate-600">
                      ou cliquez pour parcourir
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) =>
                      e.target.files?.[0] && setSelectedFile(e.target.files[0])
                    }
                    className="hidden"
                  />
                </div>
              )}

              {/* Fichier sélectionné ou soumis */}
              {(selectedFile || (isReadOnly && existingSubmission)) && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-purple-100 rounded-md text-purple-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col truncate min-w-0">
                      <span className="font-medium text-slate-900 truncate text-sm">
                        {selectedFile?.name ||
                          existingSubmission?.fileName ||
                          "Fichier soumis"}
                      </span>
                      {isReadOnly && existingSubmission?.url && (
                        <a
                          href={existingSubmission.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-purple-600 hover:underline"
                        >
                          Télécharger
                        </a>
                      )}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {!isReadOnly && !selectedFile && (
                <p className="text-xs text-slate-500">
                  Aucun fichier sélectionné.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Visibilité */}
          <Card className="ring-0 shadow-none cursor-pointer">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    id="public"
                    checked={isPublic}
                    onChange={
                      isReadOnly
                        ? handleToggleVisibility
                        : (e) => setIsPublic(e.target.checked)
                    }
                    disabled={isTogglingVisibility}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <label
                    htmlFor="public"
                    className="font-semibold text-slate-900 text-sm cursor-pointer"
                  >
                    Rendre ce projet public
                  </label>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Visible par tous les utilisateurs dans la galerie.{" "}
                    {isReadOnly ? "Modifiable à tout moment." : ""}
                  </p>
                  {isTogglingVisibility && (
                    <p className="text-xs text-slate-500 mt-1">
                      Mise à jour...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton soumettre */}
          {!isReadOnly && (
            <Button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="w-full h-9"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <span>Confirmer le rendu</span>
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </form>
      </main>
    </div>
  );
}
