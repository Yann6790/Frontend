import React from 'react';
import { NavLink } from 'react-router-dom';
import mmiLogo from '../Images/mmilogo.png';

export default function AdminNavbar() {
  const navLinks = [
    { path: '/admin/comptes', label: 'Gestion des comptes' },
    { path: '/admin/sae', label: 'Gestion des SAE' },
    { path: '/admin/validation', label: 'Validation des étudiants' },
    { path: '/admin/logs', label: 'Logs' }
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

      {/* Right: Admin Profile */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-gray-800">Admin</span>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center">
          <img 
            src="/Images/adminlogo.png" 
            alt="Profil Admin" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback in case image doesn't exist
              e.target.onerror = null; 
              e.target.src = "https://placehold.co/100x100/eeeeee/333333?text=A";
            }}
          />
        </div>
      </div>
    </nav>
  );
}
