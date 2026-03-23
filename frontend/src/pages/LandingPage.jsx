import React from 'react';
import { Link } from 'react-router-dom';
import SharedGallery from '../components/SharedGallery';

export default function LandingPage() {
  return (
    <div className="font-merriweather flex flex-col min-h-screen">
      {/* Partie Haute (Fond blanc) */}
      <div className="bg-white px-6 py-6 md:px-12 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-7xl flex justify-between items-center mb-10">
          <div className="text-3xl font-montserrat font-black text-black tracking-tight">Welizy</div>
          <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm text-sm">
            Se connecter
          </Link>
        </div>

        {/* Hero Section */}
        <div className="w-full max-w-3xl text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-montserrat font-extrabold text-gray-900 mb-5">Bienvenue sur Welizy !</h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed font-merriweather">
            Découvrez l'univers créatif et technique des étudiants MMI à l'IUT de Vélizy. Cet espace vous permet d'explorer la diversité des réalisations tout en permettant aux étudiants de gérer intuitivement leurs rendus.
          </p>
        </div>
      </div>

      {/* Galerie Partagée */}
      <SharedGallery />
    </div>
  );
}
