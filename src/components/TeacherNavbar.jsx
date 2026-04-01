import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TeacherNavbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 h-16 flex justify-between items-center shadow-sm sticky top-0 z-50 font-montserrat">
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
        <span className="font-semibold text-gray-700 hidden sm:inline-block">Hello {user?.firstname || user?.name?.firstname || 'professeur'}</span>
        <Link to="/profile" state={{ from: '/teacher-dashboard' }} className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full border-2 border-blue-200 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer shadow-sm flex items-center justify-center font-bold uppercase">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm">{user?.firstname?.[0] || user?.name?.firstname?.[0] || 'P'}</span>
          )}
        </Link>
        <Link to="/" className="text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 flex items-center h-9 rounded-full transition-colors border border-blue-200 shadow-sm ml-2 hidden sm:flex">
          Se déconnecter
        </Link>
      </div>
    </header>
  );
}
