import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SharedGallery from '../components/SharedGallery';
import { saeService } from '../services/sae.service';

export default function TeacherGalleryPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment cacher/supprimer cette réalisation de la galerie publique ?")) {
      try {
        await saeService.deleteSubmission(id);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error("Erreur lors de la suppression", err);
        alert(err.message || 'Erreur lors de la suppression.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-merriweather pb-20">
      
      {/* Header section (White banner) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Galerie - Modération</h1>
             <p className="text-sm text-gray-500 font-medium mt-1">Supervisez les travaux publics des étudiants.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Link to="/teacher/galerie/avancee" className="flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto">
              <Settings2 className="w-4 h-4" />
              Visualisation avancée
            </Link>
          </div>
        </div>
      </div>

      {/* Shared Gallery Zone */}
      <SharedGallery canModerate={true} isAdminView={true} refreshTrigger={refreshTrigger} onDelete={handleDelete} />
    </div>
  );
}
