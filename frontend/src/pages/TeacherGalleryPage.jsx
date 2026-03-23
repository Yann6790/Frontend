import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Settings2 } from 'lucide-react';

const initialMockRealizations = [
  { id: 'r1', titre: 'Refonte App Météo', etudiant: 'Alice Dupont', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400', note: 16, promo: 2024, matiere: 'Design', publicationDate: '2024-05-10', isForceHidden: false },
  { id: 'r2', titre: 'API Node.js', etudiant: 'Bob Martin', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400', note: 18, promo: 2024, matiere: 'Développement', publicationDate: '2024-06-01', isForceHidden: false },
  { id: 'r3', titre: 'Campagne Réseaux Sociaux', etudiant: 'Charlie Brun', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400', note: 14, promo: 2023, matiere: 'Communication', publicationDate: '2023-12-15', isForceHidden: false },
  { id: 'r4', titre: 'Court-métrage Fiction', etudiant: 'Diana Prince', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400', note: 15, promo: 2023, matiere: 'Audiovisuel', publicationDate: '2023-11-20', isForceHidden: false },
  { id: 'r5', titre: 'Site E-commerce React', etudiant: 'Evan Rachel', image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=400', note: 12, promo: 2025, matiere: 'Développement', publicationDate: '2025-01-05', isForceHidden: false }
];

export default function TeacherGalleryPage() {
  const [realizations, setRealizations] = useState(initialMockRealizations);
  
  // States pour filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('Toutes');
  const [selectedPromo, setSelectedPromo] = useState('Toutes');
  const [selectedNote, setSelectedNote] = useState('Toutes'); // "Toutes", ">= 15", "< 15"
  const [sortOrder, setSortOrder] = useState('recent'); // "recent", "older"

  // Options dynamiques
  const matieres = ["Toutes", ...new Set(initialMockRealizations.map(r => r.matiere))];
  const promos = ["Toutes", ...new Set(initialMockRealizations.map(r => r.promo).sort((a,b)=>b-a))];

  const handleHide = (id) => {
    if (window.confirm("Voulez-vous vraiment cacher cette réalisation de la galerie publique ?")) {
      setRealizations(prev => prev.map(r => r.id === id ? { ...r, isForceHidden: true } : r));
    }
  };

  const displayedCards = useMemo(() => {
    let filtered = realizations.filter(r => !r.isForceHidden);

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
    if (selectedNote === '>= 15') {
      filtered = filtered.filter(r => r.note >= 15);
    } else if (selectedNote === '< 15') {
      filtered = filtered.filter(r => r.note < 15);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.publicationDate);
      const dateB = new Date(b.publicationDate);
      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [realizations, searchTerm, selectedMatiere, selectedPromo, selectedNote, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 font-merriweather pb-20">
      
      {/* Header section (White banner) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Galerie - Modération</h1>
             <p className="text-sm text-gray-500 font-medium mt-1">Supervisez les travaux publics des étudiants.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Rechercher étudiant, projet..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-shadow shadow-sm"
              />
            </div>
            <Link to="/teacher/galerie/avancee" className="flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto">
              <Settings2 className="w-4 h-4" />
              Visualisation avancée
            </Link>
          </div>
        </div>
        
        {/* Filters bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-4 items-center bg-white">
          <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold cursor-pointer">
            {matieres.map(m => <option key={m} value={m}>{m === 'Toutes' ? 'Matières' : m}</option>)}
          </select>
          <select value={selectedPromo} onChange={e => setSelectedPromo(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold cursor-pointer">
            {promos.map(p => <option key={p} value={p}>{p === 'Toutes' ? 'Promotions' : p}</option>)}
          </select>
          <select value={selectedNote} onChange={e => setSelectedNote(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold cursor-pointer">
            <option value="Toutes">Notes</option>
            <option value=">= 15">Excellentes (≥ 15)</option>
            <option value="< 15">Autres (&lt; 15)</option>
          </select>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-bold ml-auto cursor-pointer">
            <option value="recent">Plus récents</option>
            <option value="older">Plus anciens</option>
          </select>
        </div>
      </div>

      {/* Grid Zone */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayedCards.map(card => (
            <div key={card.id} className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col relative w-full aspect-[4/5]">
              {/* Moderation Cross */}
              <button 
                onClick={() => handleHide(card.id)}
                className="absolute top-3 right-3 z-20 p-2 bg-white/80 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-full text-red-500 shadow-sm border border-red-100 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                title="Masquer de force (Modération)"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>

              <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden shrink-0">
                <img src={card.image} alt={card.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                   <div className="flex flex-col">
                     <span className="text-white font-black text-lg drop-shadow-md leading-tight">{card.titre}</span>
                     <span className="text-blue-100 font-semibold text-xs drop-shadow-sm">{card.matiere}</span>
                   </div>
                   <div className="bg-white/90 backdrop-blur text-blue-800 font-black px-2.5 py-1 rounded shadow text-sm">
                     {card.note}/20
                   </div>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1 justify-between bg-white">
                 <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Auteur</span>
                    <span className="font-bold text-gray-900">{card.etudiant} <span className="text-gray-400 font-medium">({card.promo})</span></span>
                 </div>
                 <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500">Publié le {new Date(card.publicationDate).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
          ))}
          {displayedCards.length === 0 && (
             <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700">Aucun projet trouvé.</h3>
                <p className="text-gray-500 mt-2">Modifiez vos critères de recherche.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
