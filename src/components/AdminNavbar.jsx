import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import mmiLogo from '../Images/mmilogo.png';

export default function AdminNavbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { path: '/admin/comptes', label: 'Gestion des comptes' },
    { path: '/admin/sae', label: 'Gestion des SAE' },
    { path: '/admin/validation', label: 'Validation des étudiants' }
  ];

  return (
    <nav className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center shadow-sm z-50 relative">
      {/* Left: Logo */}
      <div className="flex items-center">
        <img src={mmiLogo} alt="Logo MMI" className="h-10 w-auto" />
      </div>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `text-sm font-bold transition-all px-3 py-2 rounded-md ${
                isActive
                  ? 'text-black bg-gray-200 border-b-2 border-black'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Right: Admin Profile & Sign Out */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">Admin</span>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center">
            <img 
              src="/Images/adminlogo.png" 
              alt="Profil Admin" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://placehold.co/100x100/eeeeee/333333?text=A";
              }}
            />
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-200 shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </nav>
  );
}
