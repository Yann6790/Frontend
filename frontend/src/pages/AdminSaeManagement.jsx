import React, { useState, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';

const initialProfessors = [
  { id: 1, nom: "M. Dupont" },
  { id: 2, nom: "Mme Martin" },
  { id: 3, nom: "M. Leroy" },
  { id: 4, nom: "Mme Dubois" },
  { id: 5, nom: "M. Lefebvre" },
];

const initialSaeList = [
  { id: 1, titre: "Template SAE 301", matiere: "Développement web", promo: "MMI 3", dateCreation: "2023-01-15", professeursAssocies: [1] },
  { id: 2, titre: "SAE 202 - Conception", matiere: "Graphisme", promo: "MMI 1", dateCreation: "2023-05-10", professeursAssocies: [2] },
  { id: 3, titre: "SAE 401 - Web Documentaire", matiere: "Audiovisuel", promo: "MMI 2", dateCreation: "2024-02-20", professeursAssocies: [3] },
  { id: 4, titre: "SAE 105 - Recueil de besoins", matiere: "Développement web", promo: "MMI 1", dateCreation: "2023-09-01", professeursAssocies: [1, 2] },
  { id: 5, titre: "SAE 501 - Projet pro", matiere: "Développement web", promo: "MMI 3", dateCreation: "2024-03-12", professeursAssocies: [1, 3, 4] },
  { id: 6, titre: "SAE 203 - Charte Graphique", matiere: "Graphisme", promo: "MMI 1", dateCreation: "2023-11-25", professeursAssocies: [2] },
  { id: 7, titre: "SAE 303 - Montage Vidéo", matiere: "Audiovisuel", promo: "MMI 2", dateCreation: "2024-01-05", professeursAssocies: [3, 4] },
  { id: 8, titre: "SAE 601 - Portfolio", matiere: "Développement web", promo: "MMI 3", dateCreation: "2024-05-18", professeursAssocies: [1, 2] }
];

const MATIERES = ["Développement web", "Graphisme", "Audiovisuel", "Communication", "Autre"];
const PROMOS = ["MMI 1", "MMI 2", "MMI 3"];

export default function AdminSaeManagement() {
  const [saeList, setSaeList] = useState(initialSaeList);
  
  // Section 1 State
  const [newSae, setNewSae] = useState({ titre: "", matiere: "", promo: "", professeursAssocies: [] });
  
  // Section 2 State
  const [filterMatiere, setFilterMatiere] = useState("");
  const [filterPromo, setFilterPromo] = useState("");
  const [sortDate, setSortDate] = useState("desc"); // desc = Plus récent, asc = Plus ancien
  
  const [deleteYear, setDeleteYear] = useState("");

  // Edit Profs State
  const [editingProfSaeId, setEditingProfSaeId] = useState(null);
  const [tempEditedProfs, setTempEditedProfs] = useState([]);

  // Computed state
  const filteredSaeList = useMemo(() => {
    let result = [...saeList];
    if (filterMatiere) result = result.filter(sae => sae.matiere === filterMatiere);
    if (filterPromo) result = result.filter(sae => sae.promo === filterPromo);
    
    result.sort((a, b) => {
      const dateA = new Date(a.dateCreation).getTime();
      const dateB = new Date(b.dateCreation).getTime();
      return sortDate === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [saeList, filterMatiere, filterPromo, sortDate]);

  // Handlers
  const handleCreateSae = (e) => {
    e.preventDefault();
    if (!newSae.matiere || !newSae.promo) {
      alert("La Matière et la Promotion sont obligatoires.");
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const newId = saeList.length > 0 ? Math.max(...saeList.map(s => s.id)) + 1 : 1;
    const saeToAdd = {
      ...newSae,
      id: newId,
      dateCreation: today
    };
    setSaeList([saeToAdd, ...saeList]);
    setNewSae({ titre: "", matiere: "", promo: "", professeursAssocies: [] });
  };

  const handleBatchDelete = () => {
    if (!deleteYear) return;
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les SAE de l'année ${deleteYear} ?\nCette action est irréversible.`)) {
      setSaeList(saeList.filter(sae => !sae.dateCreation.startsWith(deleteYear)));
      setDeleteYear("");
    }
  };

  const handleDeleteSae = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette SAE définitivement ?")) {
      setSaeList(saeList.filter(sae => sae.id !== id));
    }
  };

  const startEditingProfs = (sae) => {
    setEditingProfSaeId(sae.id);
    setTempEditedProfs(sae.professeursAssocies);
  };

  const saveEditedProfs = (id) => {
    setSaeList(saeList.map(sae => sae.id === id ? { ...sae, professeursAssocies: tempEditedProfs } : sae));
    setEditingProfSaeId(null);
  };

  const getProfNames = (profIds) => {
    return profIds.map(id => initialProfessors.find(p => p.id === id)?.nom).filter(Boolean).join(", ");
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <AdminNavbar />
      
      <main className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-black pb-2 mb-8">
          Gestion des SAE
        </h1>

        {/* SECTION 1 : Création d'une Template SAE */}
        <div className="bg-gray-100 border-2 border-black p-6 mb-8 uppercase">
          <h2 className="text-lg font-black tracking-tight mb-4">Créer une nouvelle SAE (Template)</h2>
          <form onSubmit={handleCreateSae} className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex flex-col flex-1">
              <label className="text-xs font-bold mb-1">Titre de la SAE</label>
              <input 
                type="text" 
                placeholder="Ex: Nom de la SAE"
                value={newSae.titre}
                onChange={(e) => setNewSae({...newSae, titre: e.target.value})}
                className="border border-black p-2 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            
            <div className="flex flex-col flex-1">
              <label className="text-xs font-bold mb-1">Matière *</label>
              <select 
                value={newSae.matiere}
                onChange={(e) => setNewSae({...newSae, matiere: e.target.value})}
                required
                className="border border-black p-2 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">-- Choisir --</option>
                {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex flex-col w-32">
              <label className="text-xs font-bold mb-1">Promo *</label>
              <select 
                value={newSae.promo}
                onChange={(e) => setNewSae({...newSae, promo: e.target.value})}
                required
                className="border border-black p-2 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">-- Promo --</option>
                {PROMOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="flex flex-col flex-1">
              <label className="text-xs font-bold mb-1">Professeurs (Ctrl/Cmd pour multiple)</label>
              <select 
                multiple 
                value={newSae.professeursAssocies}
                onChange={(e) => setNewSae({...newSae, professeursAssocies: Array.from(e.target.selectedOptions, option => Number(option.value))})}
                className="border border-black p-2 bg-white text-sm font-semibold h-10 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-black"
                style={{ height: '42px' }}
              >
                {initialProfessors.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>

            <button type="submit" className="bg-black text-white px-6 py-2 font-black uppercase text-sm hover:bg-gray-800 transition border-2 border-black flex-shrink-0 h-[42px]">
              Créer la SAE
            </button>
          </form>
        </div>

        {/* SECTION 2 : Filtres & Nettoyage */}
        <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-4 border border-black mb-6 gap-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-black uppercase text-sm tracking-tight">Filtres :</span>
            <select value={filterMatiere} onChange={(e) => setFilterMatiere(e.target.value)} className="border border-gray-400 p-1 text-sm bg-white font-semibold outline-none focus:border-black">
              <option value="">Toutes les matières</option>
              {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filterPromo} onChange={(e) => setFilterPromo(e.target.value)} className="border border-gray-400 p-1 text-sm bg-white font-semibold outline-none focus:border-black">
              <option value="">Toutes les promos</option>
              {PROMOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button 
              onClick={() => setSortDate(sortDate === 'desc' ? 'asc' : 'desc')}
              className="border border-black px-3 py-1 text-sm font-bold uppercase hover:bg-black hover:text-white transition"
            >
              Trier: {sortDate === 'desc' ? 'Plus récent d\'abord' : 'Plus ancien d\'abord'}
            </button>
          </div>

          <div className="flex items-center gap-3 border-2 border-black p-3 bg-gray-100">
            <span className="font-black uppercase text-xs tracking-tight">Nettoyage Serveur</span>
            <input 
              type="number" 
              placeholder="Ex: 2022" 
              value={deleteYear}
              onChange={(e) => setDeleteYear(e.target.value)}
              className="border border-black p-1 text-sm w-24 text-center font-bold bg-white outline-none"
            />
            <button 
              onClick={handleBatchDelete}
              className="bg-black text-white px-3 py-1 text-xs font-bold uppercase hover:text-red-500 transition"
              disabled={!deleteYear}
            >
              Supprimer par année
            </button>
          </div>
        </div>

        {/* SECTION 3 : Tableau de Gestion */}
        <div className="overflow-x-auto bg-white border border-black">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3 font-bold uppercase tracking-tight">ID</th>
                <th className="p-3 font-bold uppercase tracking-tight">Titre</th>
                <th className="p-3 font-bold uppercase tracking-tight">Matière</th>
                <th className="p-3 font-bold uppercase tracking-tight">Promo</th>
                <th className="p-3 font-bold uppercase tracking-tight">Date</th>
                <th className="p-3 font-bold uppercase tracking-tight">Professeurs attribués</th>
                <th className="p-3 font-bold uppercase tracking-tight text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 font-medium">
              {filteredSaeList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400 font-bold uppercase">Aucune SAE trouvée</td>
                </tr>
              ) : filteredSaeList.map(sae => (
                <tr key={sae.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-bold text-gray-500">#{sae.id}</td>
                  <td className="p-3 font-bold">{sae.titre || "-"}</td>
                  <td className="p-3">{sae.matiere}</td>
                  <td className="p-3">
                    <span className="border border-black px-2 py-0.5 text-xs font-black uppercase bg-gray-100">
                      {sae.promo}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{sae.dateCreation}</td>
                  <td className="p-3 w-64">
                    {editingProfSaeId === sae.id ? (
                      <div className="flex flex-col gap-2">
                        <select 
                          multiple 
                          value={tempEditedProfs}
                          onChange={(e) => setTempEditedProfs(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                          className="border border-black p-1 text-xs h-24 bg-white"
                        >
                          {initialProfessors.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                        </select>
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setEditingProfSaeId(null)} className="border border-black bg-white text-black hover:bg-gray-100 text-xs px-2 py-1 font-bold uppercase">Annuler</button>
                          <button onClick={() => saveEditedProfs(sae.id)} className="bg-black text-white hover:text-green-400 text-xs px-2 py-1 font-bold uppercase border border-black">OK</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <span className="truncate max-w-[200px]" title={getProfNames(sae.professeursAssocies)}>
                          {getProfNames(sae.professeursAssocies) || <span className="text-gray-400 italic font-normal">Aucun</span>}
                        </span>
                        <button 
                          onClick={() => startEditingProfs(sae)}
                          className="text-xs uppercase border border-gray-300 hover:border-black px-2 py-1 hover:bg-gray-100 font-bold transition flex-shrink-0"
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleDeleteSae(sae.id)}
                      className="text-xs uppercase font-bold text-white bg-black hover:bg-white hover:text-black border border-black px-3 py-1 transition"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
