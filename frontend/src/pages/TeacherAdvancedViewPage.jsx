import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, Trash2, ShieldAlert } from 'lucide-react';

const initialMockRealizations = [
  { id: 'r1', titre: 'Refonte App Météo', etudiant: 'Alice Dupont', image: 'url', note: 16, promo: 2024, matiere: 'Design', publicationDate: '2024-05-10', isForceHidden: false },
  { id: 'r2', titre: 'API Node.js', etudiant: 'Bob Martin', image: 'url', note: 18, promo: 2024, matiere: 'Développement', publicationDate: '2024-06-01', isForceHidden: true },
  { id: 'r3', titre: 'Campagne Réseaux Sociaux', etudiant: 'Charlie Brun', image: 'url', note: 14, promo: 2023, matiere: 'Communication', publicationDate: '2023-12-15', isForceHidden: false },
  { id: 'r4', titre: 'Court-métrage Fiction', etudiant: 'Diana Prince', image: 'url', note: 15, promo: 2023, matiere: 'Audiovisuel', publicationDate: '2023-11-20', isForceHidden: false },
  { id: 'r5', titre: 'Site E-commerce React', etudiant: 'Evan Rachel', image: 'url', note: 12, promo: 2025, matiere: 'Développement', publicationDate: '2025-01-05', isForceHidden: false }
];

export default function TeacherAdvancedViewPage() {
  const [realizations, setRealizations] = useState(initialMockRealizations);
  
  // States pour filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('Toutes');
  const [selectedPromo, setSelectedPromo] = useState('Toutes');

  // Bulk Delete State
  const [bulkYear, setBulkYear] = useState('');

  const matieres = ["Toutes", ...new Set(initialMockRealizations.map(r => r.matiere))];
  const promos = ["Toutes", ...new Set(initialMockRealizations.map(r => r.promo).sort((a,b)=>b-a))];

  const handleBulkDelete = () => {
    if (!bulkYear || bulkYear.length !== 4) {
      alert("Veuillez entrer une année valide (ex: 2024).");
      return;
    }
    const yearNum = parseInt(bulkYear, 10);
    const countToDelete = realizations.filter(r => new Date(r.publicationDate).getFullYear() === yearNum).length;
    
    if (countToDelete === 0) {
      alert(`Aucune réalisation trouvée pour l'année ${yearNum}.`);
      return;
    }

    if (window.confirm(`⚠️ ATTENTION ⚠️\nVous êtes sur le point de supprimer DÉFINITIVEMENT ${countToDelete} réalisation(s) de la promo/année ${yearNum}.\nCette action est irréversible. Continuer ?`)) {
      setRealizations(prev => prev.filter(r => new Date(r.publicationDate).getFullYear() !== yearNum));
      alert(`${countToDelete} réalisation(s) supprimée(s) avec succès.`);
      setBulkYear('');
    }
  };

  const handleToggleHideStatus = (id) => {
    setRealizations(prev => prev.map(r => r.id === id ? { ...r, isForceHidden: !r.isForceHidden } : r));
  };

  const displayedRows = useMemo(() => {
    let filtered = [...realizations];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(r => r.titre.toLowerCase().includes(lowerSearch) || r.etudiant.toLowerCase().includes(lowerSearch));
    }
    if (selectedMatiere !== 'Toutes') {
      filtered = filtered.filter(r => r.matiere === selectedMatiere);
    }
    if (selectedPromo !== 'Toutes') {
      filtered = filtered.filter(r => r.promo.toString() === selectedPromo.toString());
    }

    // Sort by publicationDate descending
    filtered.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

    return filtered;
  }, [realizations, searchTerm, selectedMatiere, selectedPromo]);

  return (
    <div className="min-h-screen bg-slate-50 font-merriweather pb-20">
      
      {/* Header section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/teacher/galerie" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                Visualisation Avancée de la Galerie
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">{realizations.length} Projets</span>
              </h1>
              <p className="text-gray-500 font-medium text-sm mt-1">Gestion brute des données ("Bulk Delete", modifications de status rapides).</p>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                />
              </div>
              <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer">
                {matieres.map(m => <option key={m} value={m}>{m === 'Toutes' ? 'Toutes Matières' : m}</option>)}
              </select>
              <select value={selectedPromo} onChange={e => setSelectedPromo(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer">
                {promos.map(p => <option key={p} value={p}>{p === 'Toutes' ? 'Toutes Promos' : p}</option>)}
              </select>
            </div>

            {/* Bulk Delete Zone */}
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
               <ShieldAlert className="w-5 h-5 text-red-500" />
               <input 
                 type="number" 
                 placeholder="Ex: 2023"
                 value={bulkYear}
                 onChange={e => setBulkYear(e.target.value)}
                 className="w-24 px-3 py-1.5 bg-white border border-red-200 rounded text-sm text-center font-bold focus:outline-none focus:border-red-400"
               />
               <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-1.5 rounded transition-colors whitespace-nowrap shadow-sm">
                 <Trash2 className="w-4 h-4" />
                 Supprimer toutes les réalisations
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 font-medium">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200 font-bold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Étudiant</th>
                  <th scope="col" className="px-6 py-4">Titre SAE</th>
                  <th scope="col" className="px-6 py-4">Promo</th>
                  <th scope="col" className="px-6 py-4">Matière</th>
                  <th scope="col" className="px-6 py-4">Date Publication</th>
                  <th scope="col" className="px-6 py-4 text-center">Note</th>
                  <th scope="col" className="px-6 py-4">Statut</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedRows.length > 0 ? displayedRows.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{row.etudiant}</td>
                    <td className="px-6 py-4">{row.titre}</td>
                    <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{row.promo}</span></td>
                    <td className="px-6 py-4">{row.matiere}</td>
                    <td className="px-6 py-4 font-mono text-xs">{row.publicationDate}</td>
                    <td className="px-6 py-4 text-center"><span className="font-black text-blue-700">{row.note}</span><span className="text-gray-400 text-xs">/20</span></td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleHideStatus(row.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${row.isForceHidden ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        title="Cliquer pour basculer le statut"
                      >
                        {row.isForceHidden ? 'CACHÉ (RESTREINT)' : 'PUBLIC'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => setRealizations(prev => prev.filter(r => r.id !== row.id))} className="text-red-400 hover:text-red-700 transition-colors p-1" title="Supprimer définitivement">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 font-bold">Aucune réalisation trouvée.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
