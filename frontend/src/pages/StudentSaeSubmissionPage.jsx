import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { UploadCloud, X, FileText, Image as ImageIcon, CheckCircle2, ChevronLeft } from 'lucide-react';
import { saeService } from '../services/sae.service';
import { resourcesService } from '../services/resources.service';

export default function StudentSaeSubmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forcedReadOnly = searchParams.get('mode') === 'view';

  // ── États page ──
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(forcedReadOnly);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [saeTitle, setSaeTitle] = useState('');

  // ── États formulaire ──
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // ── Fichier principal ──
  const [selectedFile, setSelectedFile] = useState(null);   // File object
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // ── Image de couverture ──
  const [imageFile, setImageFile] = useState(null);         // File object
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  // ── Soumission ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [error, setError] = useState('');

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
          setSaeTitle((saeRes?.data || saeRes)?.title || '');
        } catch { /* ignore */ }

        // Vérifier si l'étudiant a déjà soumis
        try {
          const sub = await saeService.getMySubmission(id);
          const subData = sub?.data || sub;
          if (subData && subData.id) {
            setExistingSubmission(subData);
            setIsReadOnly(true);
            setDescription(subData.description || '');
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
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
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
    if (!selectedFile) { setError('Veuillez sélectionner un fichier à soumettre.'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      // Étape 1 : Upload du fichier principal
      const formDataFile = new FormData();
      formDataFile.append('file', selectedFile);
      formDataFile.append('saeId', id);
      formDataFile.append('description', description);
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
      alert('✅ Votre rendu a été soumis avec succès !');
    } catch (err) {
      console.error('[Submission] Erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de la soumission.');
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
      setExistingSubmission(prev => ({ ...prev, isPublic: newVal }));
    } catch (err) {
      alert(err.message || 'Erreur lors du changement de visibilité.');
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Chargement
  // ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#A3477F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-4 md:px-8 font-merriweather">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Link
              to={`/sae/${id}`}
              className="p-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-full transition-colors"
              title="Retour à la SAE"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="inline-block px-3 py-1 bg-[#A3477F]/10 rounded-lg mb-1">
                <span className="text-sm font-bold text-[#A3477F] uppercase tracking-wider">
                  {saeTitle || `SAE ${id}`}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                {isReadOnly ? 'Mon rendu' : 'Déposer mon rendu'}
              </h1>
            </div>
          </div>

          {/* Badge statut */}
          {isReadOnly && existingSubmission && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-2 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm">Soumis le {new Date(existingSubmission.submittedAt).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 font-medium px-5 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Description */}
          <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100 flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="font-bold text-gray-800 text-lg flex justify-between">
                <span>Description de votre travail</span>
                <span className="text-gray-400 font-normal text-sm">(Facultatif)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isReadOnly}
                placeholder="Expliquez votre démarche, les outils utilisés, les difficultés rencontrées..."
                className={`w-full min-h-[120px] p-4 border-2 rounded-xl transition-all duration-200 resize-y outline-none
                  ${isReadOnly
                    ? 'bg-gray-50 border-transparent text-gray-700 cursor-default'
                    : 'bg-white border-gray-200 focus:border-[#A3477F] focus:ring-4 focus:ring-[#A3477F]/10'}`}
              />
            </div>

            {/* Image de couverture */}
            <div className="flex flex-col gap-3">
              <label className="font-bold text-gray-800 text-lg">Image de couverture</label>
              {imagePreview ? (
                <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 w-full max-w-sm">
                  <img src={imagePreview} alt="Aperçu" className="w-full h-auto object-cover aspect-video" />
                  {!isReadOnly && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                        className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : !isReadOnly ? (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full max-w-sm aspect-video border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                >
                  <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-[#A3477F]" />
                  </div>
                  <span className="font-semibold text-gray-500">Ajouter une image</span>
                  <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">Aucune image fournie.</p>
              )}
            </div>
          </section>

          {/* Fichier principal */}
          <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Fichier à soumettre</h2>

            {!isReadOnly && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-10 mb-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300
                  ${isDragging ? 'border-[#A3477F] bg-[#A3477F]/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#A3477F]/50'}`}
              >
                <div className={`p-5 rounded-full shadow-sm transition-transform duration-300 ${isDragging ? 'bg-[#A3477F] text-white scale-110' : 'bg-white text-[#A3477F]'}`}>
                  <UploadCloud className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800 mb-1">Glissez et déposez votre fichier ici</p>
                  <p className="text-gray-500">ou cliquez pour parcourir</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} className="hidden" />
              </div>
            )}

            {/* Fichier sélectionné ou soumis */}
            {(selectedFile || (isReadOnly && existingSubmission)) && (
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm group">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-2.5 bg-[#A3477F]/10 rounded-lg text-[#A3477F]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-gray-800 truncate">
                      {selectedFile?.name || existingSubmission?.fileName || 'Fichier soumis'}
                    </span>
                    {isReadOnly && existingSubmission?.url && (
                      <a href={existingSubmission.url} target="_blank" rel="noreferrer" className="text-xs text-[#A3477F] hover:underline mt-0.5">
                        Télécharger
                      </a>
                    )}
                  </div>
                </div>
                {!isReadOnly ? (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <span className="text-sm font-bold text-[#A3477F] bg-[#A3477F]/10 px-3 py-1.5 rounded-lg shrink-0">Soumis</span>
                )}
              </div>
            )}

            {!isReadOnly && !selectedFile && (
              <p className="text-sm text-gray-400 italic mt-2">Aucun fichier sélectionné.</p>
            )}
          </section>

          {/* Visibilité */}
          <section
            className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex items-start gap-4 hover:border-[#A3477F]/30 transition-colors group"
            style={{ cursor: isReadOnly ? 'default' : 'pointer' }}
          >
            <div className="pt-1">
              <div className="relative flex items-center justify-center w-7 h-7">
                <input
                  type="checkbox"
                  id="public"
                  checked={isPublic}
                  onChange={isReadOnly ? handleToggleVisibility : (e) => setIsPublic(e.target.checked)}
                  disabled={isTogglingVisibility}
                  className="peer appearance-none w-7 h-7 border-2 border-gray-300 rounded-md checked:bg-[#A3477F] checked:border-[#A3477F] transition-all cursor-pointer focus:ring-4 focus:ring-[#A3477F]/20 disabled:opacity-50"
                />
                <CheckCircle2 className="w-5 h-5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="public" className="text-xl font-bold text-gray-800 cursor-pointer group-hover:text-[#A3477F] transition-colors">
                Rendre ce projet public dans la galerie
              </label>
              <p className="text-gray-500 leading-relaxed">
                En cochant cette case, votre travail sera visible par tous les utilisateurs dans la section "Galerie".{' '}
                {isReadOnly ? (
                  <span className="text-[#A3477F] font-semibold">Vous pouvez modifier ce choix à tout moment.</span>
                ) : (
                  'Vous pourrez modifier ce choix après la soumission.'
                )}
              </p>
              {isTogglingVisibility && <p className="text-sm text-gray-400 mt-1">Mise à jour en cours...</p>}
            </div>
          </section>

          {/* Bouton soumettre (seulement si pas encore soumis) */}
          {!isReadOnly && (
            <div className="mb-16 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="py-4 px-10 bg-[#A3477F] hover:bg-[#8e3e6f] disabled:opacity-50 disabled:hover:bg-[#A3477F] text-white font-black rounded-2xl shadow-[0_8px_20px_0_rgba(163,71,127,0.3)] hover:shadow-[0_12px_25px_rgba(163,71,127,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-200 text-xl tracking-wide flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmer le rendu</span>
                    <CheckCircle2 className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
