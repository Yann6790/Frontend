import React, { useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { UploadCloud, X, FileText, Image as ImageIcon, MessageSquare, CheckCircle2, Star } from 'lucide-react';

const mockSubmissionData = {
  titre: "Refonte UX/UI de l'application mobile Météo",
  description: "Dans le cadre de cette SAE, j'ai réalisé une recherche utilisateur complète auprès de 15 personnes avant de concevoir des maquettes interactives sur Figma. L'accent a été mis sur l'accessibilité et la clarté de la data-visualisation.",
  imagePreview: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=600",
  fichiersRendus: [
    { id: "f1", nom: "maquette_haute_fidelite.fig", size: "12.4 MB" },
    { id: "f2", nom: "rapport_recherche_utilisateur.pdf", size: "3.1 MB" },
    { id: "f3", nom: "assets_finaux.zip", size: "45.0 MB" }
  ],
  isPublic: true,
  note: 16,
  commentaire: "Excellent travail sur la phase de recherche. Les maquettes sont propres et respectent bien les heuristiques de Bastien et Scapin. Attention cependant au contraste sur certains boutons secondaires."
};

export default function StudentSaeSubmissionPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isReadOnlyMode = searchParams.get('mode') === 'view';
  
  // Form State
  const [title, setTitle] = useState(isReadOnlyMode ? mockSubmissionData.titre : "");
  const [description, setDescription] = useState(isReadOnlyMode ? mockSubmissionData.description : "");
  const [isPublic, setIsPublic] = useState(mockSubmissionData.isPublic);
  const [imagePreview, setImagePreview] = useState(isReadOnlyMode ? mockSubmissionData.imagePreview : null);
  const [files, setFiles] = useState(isReadOnlyMode ? mockSubmissionData.fichiersRendus : []);
  
  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isReadOnlyMode) setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isReadOnlyMode && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        nom: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + " MB"
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileId) => {
    if (!isReadOnlyMode) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFilesSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        nom: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + " MB"
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-4 md:px-8 font-merriweather">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* A. En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-block px-3 py-1 bg-[#A3477F]/10 rounded-lg mb-2">
              <span className="text-sm font-bold text-[#A3477F] uppercase tracking-wider">SAE {id}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {isReadOnlyMode ? "Détail de mon rendu" : "Dépôt de la SAE"}
            </h1>
          </div>
        </div>

        {/* B. Formulaire Principal */}
        <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100 flex flex-col gap-8">
          
          {/* Titre de la réalisation */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-bold text-gray-800 text-lg">Titre de votre réalisation <span className="text-red-500">*</span></label>
            <input 
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isReadOnlyMode}
              placeholder="Ex: Application mobile de covoiturage étudiant..."
              className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-lg font-medium outline-none
                ${isReadOnlyMode 
                  ? 'bg-gray-50 border-transparent text-gray-700 cursor-not-allowed' 
                  : 'bg-white border-gray-200 focus:border-[#A3477F] focus:ring-4 focus:ring-[#A3477F]/10'}`}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="font-bold text-gray-800 text-lg flex justify-between">
              <span>Description détaillée</span>
              <span className="text-gray-400 font-normal text-sm">(Facultatif)</span>
            </label>
            <textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnlyMode}
              placeholder="Expliquez brièvement votre démarche, les outils utilisés, les difficultés rencontrées..."
              className={`w-full min-h-[160px] p-4 border-2 rounded-xl transition-all duration-200 resize-y outline-none
                ${isReadOnlyMode 
                  ? 'bg-gray-50 border-transparent text-gray-700 cursor-not-allowed' 
                  : 'bg-white border-gray-200 focus:border-[#A3477F] focus:ring-4 focus:ring-[#A3477F]/10'}`}
            />
          </div>

          {/* Image de couverture */}
          <div className="flex flex-col gap-3">
            <label className="font-bold text-gray-800 text-lg">Image de couverture / Thumbnail</label>
            
            {imagePreview ? (
              <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 w-full max-w-sm">
                <img src={imagePreview} alt="Aperçu" className="w-full h-auto object-cover aspect-video" />
                {!isReadOnlyMode && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => setImagePreview(null)}
                      className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                      title="Supprimer l'image"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !isReadOnlyMode ? (
                <div 
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full max-w-sm aspect-video border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                >
                  <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-[#A3477F]" />
                  </div>
                  <span className="font-semibold text-gray-500">Ajouter une image</span>
                  <input 
                    type="file" 
                    ref={imageInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-gray-500 italic border border-gray-100 w-max">
                  Aucune image de couverture fournie.
                </div>
              )
            )}
          </div>
        </section>

        {/* C. Zone Drag & Drop (Fichiers) */}
        <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Fichiers à soumettre</h2>
          
          {!isReadOnlyMode && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-10 mb-8 border-3 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300
                ${isDragging ? 'border-[#A3477F] bg-[#A3477F]/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#A3477F]/50'}`}
            >
              <div className={`p-5 rounded-full shadow-sm transition-transform duration-300 ${isDragging ? 'bg-[#A3477F] text-white scale-110' : 'bg-white text-[#A3477F]'}`}>
                <UploadCloud className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800 mb-1">Glissez et déposez vos fichiers ici</p>
                <p className="text-gray-500">ou cliquez pour parcourir vos dossiers</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFilesSelect} 
                className="hidden" 
                multiple 
              />
            </div>
          )}

          {/* Liste des fichiers */}
          {files.length > 0 ? (
            <div className="flex flex-col gap-3">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-2.5 bg-[#A3477F]/10 rounded-lg text-[#A3477F]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-gray-800 truncate">{file.nom}</span>
                      {file.size && <span className="text-xs text-gray-500">{file.size}</span>}
                    </div>
                  </div>
                  
                  {!isReadOnlyMode ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4 shrink-0"
                      title="Supprimer ce fichier"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : (
                    <span className="text-sm font-semibold text-[#A3477F] bg-[#A3477F]/10 px-3 py-1.5 rounded-lg shrink-0">
                      Rendu
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            isReadOnlyMode && (
              <p className="text-gray-500 italic p-4 bg-gray-50 rounded-xl border border-gray-100">
                Aucun fichier n'a été soumis.
              </p>
            )
          )}
        </section>

        {/* D. Note et Publication */}
        <div className="flex flex-col gap-6">
          
          {/* Bloc Note (Consultation UNIQUEMENT) */}
          {isReadOnlyMode && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 lg:p-10 border border-indigo-100 shadow-sm relative overflow-hidden">
              {/* Effet décoratif */}
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Star className="w-48 h-48" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border border-indigo-50 min-w-[140px]">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-1">Ma Note</span>
                  <div className="flex items-baseline gap-1 text-[#A3477F]">
                    <span className="text-5xl font-black">{mockSubmissionData.note}</span>
                    <span className="text-xl font-bold text-gray-400">/20</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-xl font-bold text-gray-900">Retour du professeur</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg bg-white/60 p-5 rounded-2xl border border-white/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                    "{mockSubmissionData.commentaire}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Checkbox Publication (TOUJOURS MODIFIABLE) */}
          <section className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex items-start gap-4 cursor-pointer hover:border-[#A3477F]/30 transition-colors group">
            <div className="pt-1">
              <div className="relative flex items-center justify-center w-7 h-7">
                <input 
                  type="checkbox" 
                  id="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="peer appearance-none w-7 h-7 border-2 border-gray-300 rounded-md checked:bg-[#A3477F] checked:border-[#A3477F] transition-all cursor-pointer focus:ring-4 focus:ring-[#A3477F]/20"
                />
                <CheckCircle2 className="w-5 h-5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="public" className="text-xl font-bold text-gray-800 cursor-pointer group-hover:text-[#A3477F] transition-colors">
                Rendre ce projet public dans la galerie
              </label>
              <p className="text-gray-500 leading-relaxed">
                En cochant cette case, vous acceptez que votre travail soit visible par tous les utilisateurs de la plateforme Welizy dans la section "Galerie". Cela permet de valoriser votre portefolio. ({!isReadOnlyMode ? "Vous pourrez modifier ce choix plus tard" : "Vous pouvez modifier ce choix à tout moment"}).
              </p>
            </div>
          </section>
        </div>

        {/* E. Bouton d'action final (Dépôt UNIQUEMENT) */}
        {!isReadOnlyMode && (
          <div className="mt-4 mb-16 flex justify-end">
             <button className="py-4 px-10 bg-[#A3477F] hover:bg-[#8e3e6f] text-white font-black rounded-2xl shadow-[0_8px_20px_0_rgba(163,71,127,0.3)] hover:shadow-[0_12px_25px_rgba(163,71,127,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-200 text-xl tracking-wide flex items-center justify-center gap-3">
                <span>Confirmer le rendu</span>
                <CheckCircle2 className="w-6 h-6" />
              </button>
          </div>
        )}

      </div>
    </div>
  );
}
