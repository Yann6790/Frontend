import React from 'react';
import { Link } from 'react-router-dom';
import SharedGallery from '../components/SharedGallery';
import './PublicGallery.css';

export default function PublicGallery() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Interface Haut (Navbar Publique) */}
      <div className="bg-white/70 backdrop-blur-md px-6 py-4 md:px-12 flex items-center justify-between relative z-10 border-b border-purple-100/50 sticky top-0 shadow-sm">
        <Link to="/" className="text-3xl font-black text-black tracking-tight hover:text-purple-700 transition-colors">
          Welizy
        </Link>
        <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-full transition-colors shadow-sm text-sm">
          Se connecter
        </Link>
      </div>

      <div className="py-6 bg-white border-b border-gray-100 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Galerie des travaux</h1>
            <p className="text-gray-500 font-medium">
              Dans cette interface, vous trouverez toutes les réalisations publiques de nos étudiants.
            </p>
          </div>
      </div>

      {/* Galerie Partagée */}
      <SharedGallery canModerate={false} />
    </div>
  );
}
