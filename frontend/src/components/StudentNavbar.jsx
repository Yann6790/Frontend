import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentNavbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 h-16 flex justify-between items-center shadow-sm sticky top-0 z-50 font-merriweather">
      {/* Côté Gauche : Logo */}
      <div className="flex items-center gap-2 h-full">
        <Link to="/student-dashboard" className="flex items-center text-purple-700 font-montserrat font-black text-2xl tracking-tight">
          Welizy
        </Link>
      </div>

      {/* Centre : Navigation */}
      <nav className="hidden md:flex items-center h-full gap-8">
        <NavLink 
          to="/student-dashboard" 
          className={({ isActive }) => `text-sm font-semibold h-full flex items-center border-b-[3px] transition-colors ${isActive ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-200'}`}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/student/annonces" 
          className={({ isActive }) => `text-sm font-semibold h-full flex items-center border-b-[3px] transition-colors ${isActive ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-200'}`}
        >
          Annonces
        </NavLink>
        <NavLink 
          to="/student/gallery" 
          className={({ isActive }) => `text-sm font-semibold h-full flex items-center border-b-[3px] transition-colors ${isActive ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-200'}`}
        >
          Galerie
        </NavLink>
        <NavLink 
          to="/student/rendus" 
          className={({ isActive }) => `text-sm font-semibold h-full flex items-center border-b-[3px] transition-colors ${isActive ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-200'}`}
        >
          Mes Rendus
        </NavLink>
      </nav>

      {/* Côté Droite : Profil & Déconnexion */}
      <div className="flex items-center gap-4">
        <span className="font-semibold text-gray-700 hidden sm:inline-block">Hello {user?.firstname || user?.name?.firstname || 'étudiant'}</span>
        <Link to="/profile" className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full border-2 border-purple-200 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer shadow-sm flex items-center justify-center font-bold uppercase">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm">{user?.firstname?.[0] || user?.name?.firstname?.[0] || 'E'}</span>
          )}
        </Link>
        <Link to="/" className="text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 flex items-center h-9 rounded-full transition-colors border border-purple-200 shadow-sm ml-2 hidden sm:flex">
          Se déconnecter
        </Link>
      </div>
    </header>
  );
}
