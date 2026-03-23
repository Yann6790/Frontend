import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';

const initialMockAccounts = [
  { id: 1, nom: "Dupont", prenom: "Alice", email: "alice.dupont@etu.fr", role: "étudiant", promo: "MMI 2" },
  { id: 2, nom: "Martin", prenom: "Bob", email: "bob.martin@etu.fr", role: "étudiant", promo: "MMI 3" },
  { id: 3, nom: "Leroy", prenom: "Charlie", email: "charlie.leroy@etu.fr", role: "étudiant", promo: "MMI 1" },
  { id: 4, nom: "Garnier", prenom: "David", email: "dgarnier@univ.fr", role: "professeur", promo: "N/A" },
  { id: 5, nom: "Faure", prenom: "Emma", email: "emma.faure@etu.fr", role: "étudiant", promo: "MMI 1" },
  { id: 6, nom: "Blanc", prenom: "Fabien", email: "fabien.blanc@etu.fr", role: "étudiant", promo: "MMI 3" },
  { id: 7, nom: "Morel", prenom: "Gabriel", email: "gmorel@univ.fr", role: "professeur", promo: "N/A" },
  { id: 8, nom: "Perrin", prenom: "Hugo", email: "hugo.perrin@etu.fr", role: "étudiant", promo: "MMI 2" },
  { id: 9, nom: "Roux", prenom: "Inès", email: "ines.roux@etu.fr", role: "étudiant", promo: "MMI 2" },
  { id: 10, nom: "Fournier", prenom: "Jules", email: "jules.fournier@etu.fr", role: "étudiant", promo: "MMI 1" }
];

export default function AdminAccountManagement() {
  const [accounts, setAccounts] = useState(initialMockAccounts);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Tous");
  const [filterPromo, setFilterPromo] = useState("Toutes");

  const filteredAccounts = accounts.filter(acc => {
    const fullName = `${acc.nom} ${acc.prenom}`.toLowerCase();
    const matchSearch = fullName.includes(searchTerm.toLowerCase()) || acc.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchRole = true;
    if (filterRole === "Étudiant") matchRole = acc.role === "étudiant";
    else if (filterRole === "Professeur") matchRole = acc.role === "professeur";

    let matchPromo = true;
    if (filterPromo !== "Toutes") matchPromo = acc.promo === filterPromo;

    return matchSearch && matchRole && matchPromo;
  });

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const handlePromote = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir passer ce compte étudiant en professeur ?")) {
      setAccounts(accounts.map(a => 
        a.id === id ? { ...a, role: "professeur", promo: "N/A" } : a
      ));
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <AdminNavbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6">
        
        <div className="pb-2">
          <h1 className="text-3xl font-black text-black tracking-tight">
            Gestion des comptes du site
          </h1>
        </div>

        {/* Barre d'outils (Filtres) */}
        <div className="bg-gray-100 border border-gray-300 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <input 
              type="text" 
              placeholder="Rechercher un nom ou un email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:max-w-md bg-white border border-gray-400 text-black px-4 py-2 outline-none focus:border-black font-medium text-sm transition-colors"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Type de compte :</label>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white border border-gray-400 text-black px-3 py-2 outline-none focus:border-black font-medium text-sm w-full cursor-pointer"
              >
                <option value="Tous">Tous</option>
                <option value="Étudiant">Étudiant</option>
                <option value="Professeur">Professeur</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Promotion :</label>
              <select 
                value={filterPromo}
                onChange={(e) => setFilterPromo(e.target.value)}
                className="bg-white border border-gray-400 text-black px-3 py-2 outline-none focus:border-black font-medium text-sm w-full cursor-pointer"
              >
                <option value="Toutes">Toutes</option>
                <option value="MMI 1">MMI 1</option>
                <option value="MMI 2">MMI 2</option>
                <option value="MMI 3">MMI 3</option>
                <option value="N/A">N/A (Profs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Zone d'affichage (Tableau de données) */}
        <div className="bg-white border border-gray-300 overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-200 border-b-2 border-gray-400 text-black">
              <tr>
                <th className="py-3 px-4 border-r border-gray-300 font-bold w-16 text-center">ID</th>
                <th className="py-3 px-4 border-r border-gray-300 font-bold">Nom & Prénom</th>
                <th className="py-3 px-4 border-r border-gray-300 font-bold">Email</th>
                <th className="py-3 px-4 border-r border-gray-300 font-bold">Rôle</th>
                <th className="py-3 px-4 border-r border-gray-300 font-bold text-center">Promo</th>
                <th className="py-3 px-4 font-bold text-center w-64">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc, index) => (
                  <tr key={acc.id} className={`border-b border-gray-300 hover:bg-gray-200 transition-colors text-black ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4 border-r border-gray-300 font-mono text-xs text-center text-gray-600">
                      #{acc.id}
                    </td>
                    <td className="py-3 px-4 border-r border-gray-300 font-semibold">
                      {acc.nom.toUpperCase()} {acc.prenom}
                    </td>
                    <td className="py-3 px-4 border-r border-gray-300 text-gray-700">
                      {acc.email}
                    </td>
                    <td className="py-3 px-4 border-r border-gray-300 font-semibold">
                      <span className={`inline-block px-2 py-0.5 border text-xs font-bold tracking-wider uppercase ${
                        acc.role === 'professeur' ? 'bg-black text-white border-black' : 'bg-gray-200 border-gray-400 text-gray-800'
                      }`}>
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-r border-gray-300 text-center font-medium">
                      {acc.promo}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {acc.role === 'étudiant' && (
                          <button 
                            onClick={() => handlePromote(acc.id)}
                            className="flex-1 bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 transition-colors"
                            title="Passer en Professeur"
                          >
                            Passer Prof
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(acc.id)}
                          className="flex-1 bg-gray-800 hover:bg-black text-white border border-black text-xs font-bold px-3 py-1.5 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                    Aucun compte ne correspond à ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </main>
    </div>
  );
}
