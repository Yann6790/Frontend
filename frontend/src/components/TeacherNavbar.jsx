import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function TeacherNavbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 h-16 flex justify-between items-center shadow-sm sticky top-0 z-50 font-merriweather">
      {/* Logo */}
      <div className="flex items-center gap-2 h-full">
        <Link to="/teacher-dashboard" className="flex items-center text-blue-700 font-montserrat font-black text-2xl tracking-tight">
          Welizy
        </Link>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center h-full gap-8">
        <NavLink 
          to="/teacher-dashboard" 
          className={({ isActive }) => `text-sm font-semibold h-full flex items-center border-b-[3px] transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-200'}`}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/teacher/annonces" 
          className={({ isActive }) => `text-sm font-semibold h-full flex items-center border-b-[3px] transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-200'}`}
        >
          Annonces
        </NavLink>
        <NavLink 
          to="/teacher/galerie" 
          className={({ isActive }) => `text-sm font-semibold h-full flex items-center border-b-[3px] transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-200'}`}
        >
          Galerie des étudiants
        </NavLink>
      </nav>

      {/* Profil */}
      <div className="flex items-center gap-4">
        <span className="font-semibold text-gray-700 hidden sm:inline-block">Hello professeur</span>
        <Link to="/profile" state={{ from: '/teacher-dashboard' }} className="w-10 h-10 bg-gray-300 rounded-full border-2 border-blue-200 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer shadow-sm">
          <img src="https://placehold.co/100x100/e2e8f0/94a3b8?text=PR" alt="Avatar" className="w-full h-full object-cover" />
        </Link>
        <Link to="/" className="text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 flex items-center h-9 rounded-full transition-colors border border-blue-200 shadow-sm ml-2 hidden sm:flex">
          Se déconnecter
        </Link>
      </div>
    </header>
  );
}
