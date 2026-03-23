import React, { useState, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';

const mockLogs = [
  { id: 1, action: "Création d'un compte professeur (M. Dupont)", type: "ajout_compte", date: "2024-03-20 09:15" },
  { id: 2, action: "Attribution de la SAE 301 au professeur Martin", type: "attribution_sae", date: "2024-03-20 10:30" },
  { id: 3, action: "Suppression du compte étudiant (N. 123456)", type: "suppression_compte", date: "2024-03-19 14:20" },
  { id: 4, action: "Modification des paramètres globaux du serveur", type: "autre", date: "2024-03-18 20:00" },
  { id: 5, action: "Création d'un compte étudiant (L. Petit)", type: "ajout_compte", date: "2024-03-18 09:05" },
  { id: 6, action: "Attribution de la SAE 201 à Mme Garnier", type: "attribution_sae", date: "2024-03-17 11:45" },
  { id: 7, action: "Mise à jour de sécurité de la base de données", type: "autre", date: "2024-03-15 02:30" },
  { id: 8, action: "Suppression du compte professeur (M. Faure)", type: "suppression_compte", date: "2024-03-14 16:10" }
];

export default function AdminLogsPage() {
  const [sortDate, setSortDate] = useState('desc'); // 'desc' = Le plus récent d'abord
  const [filterType, setFilterType] = useState('Tous');

  const displayedLogs = useMemo(() => {
    let filtered = [...mockLogs];

    if (filterType !== 'Tous') {
      filtered = filtered.filter(log => log.type === filterType);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date.replace(' ', 'T'));
      const dateB = new Date(b.date.replace(' ', 'T'));
      return sortDate === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [sortDate, filterType]);

  const toggleSortDate = () => {
    setSortDate(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'ajout_compte': return "Ajout de compte";
      case 'suppression_compte': return "Suppression de compte";
      case 'attribution_sae': return "Attribution SAE";
      case 'autre': return "Autre";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <AdminNavbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
        
        <div className="pb-2">
          <h1 className="text-3xl font-black text-black tracking-tight">
            Bienvenu sur le compte administrateur
          </h1>
        </div>

        {/* Zone de contrôles (Filtres) */}
        <div className="bg-gray-100 border border-gray-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-bold text-gray-700">Filtrer par type :</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-gray-400 text-black px-3 py-1.5 outline-none focus:border-black font-medium text-sm w-full sm:w-auto cursor-pointer"
            >
              <option value="Tous">Tous</option>
              <option value="ajout_compte">Ajout de compte</option>
              <option value="suppression_compte">Suppression de compte</option>
              <option value="attribution_sae">Attribution SAE</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <button 
            onClick={toggleSortDate}
            className="bg-white border border-gray-400 hover:bg-gray-100 text-black font-bold text-sm px-4 py-1.5 transition-colors w-full sm:w-auto"
          >
            Trier par date : {sortDate === 'desc' ? "Le plus récent d'abord" : "Le plus ancien d'abord"}
          </button>
        </div>

        {/* Zone d'affichage (Les Logs) */}
        <div className="bg-white overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-200 border-b-2 border-gray-400 text-black">
              <tr>
                <th className="py-3 px-4 border-r border-gray-300 font-bold whitespace-nowrap">Date & Heure</th>
                <th className="py-3 px-4 border-r border-gray-300 font-bold">Type d'action</th>
                <th className="py-3 px-4 font-bold">Description de l'action</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.length > 0 ? (
                displayedLogs.map((log, index) => (
                  <tr key={log.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-300 hover:bg-gray-200 transition-colors text-black`}>
                    <td className="py-3 px-4 border-r border-gray-300 font-mono text-xs whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-3 px-4 border-r border-gray-300 font-semibold">
                      <span className={`inline-block px-2 py-0.5 border text-xs font-bold uppercase tracking-wider ${
                        log.type === 'ajout_compte' ? 'bg-gray-100 border-gray-500' :
                        log.type === 'suppression_compte' ? 'bg-black text-white border-black' :
                        log.type === 'attribution_sae' ? 'bg-gray-300 border-gray-500' :
                        'bg-white border-gray-400 text-gray-700'
                      }`}>
                        {getTypeLabel(log.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {log.action}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-gray-500 font-medium">
                    Aucun événement ne correspond à ces critères.
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
