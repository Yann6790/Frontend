import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { authService } from '../services/auth.service';
import { resourcesService } from '../services/resources.service';

// Hook personnalisé pour le debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminAccountManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce
  const [filterRole, setFilterRole] = useState("Tous");

  // État Modale de création Enseignant
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeacherData, setNewTeacherData] = useState({ firstname: '', lastname: '', email: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState("");

  // État Modale de succès (Mot de passe temporaire)
  const [successData, setSuccessData] = useState(null); // { tempPassword: '' }

  // Fonction pour charger les utilisateurs
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await resourcesService.getUsers(debouncedSearchTerm, filterRole);
      let baseUsers = Array.isArray(data) ? data : data.data || [];

      // Si le filtre n'exclut pas les étudiants, on récupère leurs informations détaillées (promo, groupe)
      if (filterRole === "Tous" || filterRole === "Étudiant") {
        try {
          const studentsData = await resourcesService.getStudents();
          const studentsList = Array.isArray(studentsData) ? studentsData : studentsData.data || [];
          
          baseUsers = baseUsers.map(u => {
            if (u.role === 'STUDENT') {
              // Rapprochement par ID ou Email
              const details = studentsList.find(s => s.id === u.id || s.email === u.email);
              if (details) {
                return { ...u, promotion: details.promotion, group: details.group };
              }
            }
            return u;
          });
        } catch (err) {
          console.warn("[AdminAccount] Could not fetch detailed students directory", err);
        }
      }

      setUsers(baseUsers);
    } catch (error) {
      console.error("[AdminAccount] Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Recharger quand la recherche debouncée ou le filtre changent
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, filterRole]);

  // Actions
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
      try {
        await resourcesService.deleteUser(id);
        // Retrait visuel/local 
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error("[AdminAccount] Error deleting user:", error);
        alert(error.message || "Erreur lors de la suppression du compte.");
      }
    }
  };

  const handleCreateTeacherClick = () => {
    setNewTeacherData({ firstname: '', lastname: '', email: '' });
    setCreationError("");
    setIsCreateModalOpen(true);
  };

  const submitCreateTeacher = async (e) => {
    e.preventDefault();
    setCreationError("");
    setIsCreating(true);

    try {
      const res = await authService.signUpTeacher(newTeacherData);
      
      // La réponse contient le mot de passe temporaire (ex: res.data.temporaryPassword ou res.temporaryPassword)
      const dataObj = res.data || res;
      setSuccessData({ tempPassword: dataObj.temporaryPassword || "ERREUR: Pas de MDP renvoyé" });
      
      setIsCreateModalOpen(false); // On ferme la modale de création
    } catch (error) {
      setCreationError(error.message || "Erreur lors de la création du compte.");
    } finally {
      setIsCreating(false);
    }
  };

  const closeSuccessModal = () => {
    setSuccessData(null);
    fetchUsers(); // Rafraîchir la liste après création
  };

  // format helper pour les noms
  const getDisplayName = (user) => {
    // Le nom peut être structuré comme { firstname: '...', lastname: '...' } dans user.name
    // Ou directement à la racine selon les backends. On couvre les cas les plus fréquents :
    let first = user.name?.firstname || user.firstname || "";
    let last = user.name?.lastname || user.lastname || user.name || "";
    
    // Si c'est un objet (Prisma JSON)
    if (typeof user.name === 'object' && user.name !== null) {
      first = user.name.firstname || "";
      last = user.name.lastname || "";
    }

    if (!first && !last) return "Utilisateur inconnu";
    return `${last.toUpperCase()} ${first}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-montserrat relative">
      <AdminNavbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 mt-16 flex flex-col gap-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200">
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            Gestion des comptes du site
          </h1>
          <Button 
            onClick={handleCreateTeacherClick}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Créer un compte Enseignant
          </Button>
        </div>

        {/* Barre d'outils (Filtres) */}
        <div className="bg-slate-50 border border-slate-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl">
          <div className="flex-1 w-full relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Rechercher un nom ou un email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:max-w-md bg-white border border-slate-300 text-slate-900 pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 font-medium text-sm transition-all rounded-lg"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Rôle :</label>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 font-medium text-sm w-full cursor-pointer rounded-lg transition-all"
              >
                <option value="Tous">Tous</option>
                <option value="Étudiant">Étudiant</option>
                <option value="Professeur">Professeur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
          </div>
        </div>

        {/* Zone d'affichage (Tableau de données) */}
        <div className="bg-white border border-gray-200 overflow-x-auto shadow-sm rounded-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="py-4 px-6 font-bold">Nom & Prénom</th>
                <th className="py-4 px-6 font-bold">Email</th>
                <th className="py-4 px-6 font-bold text-center">Rôle</th>
                <th className="py-4 px-6 font-bold text-center">Promo</th>
                <th className="py-4 px-6 font-bold text-center">Groupe TP</th>
                <th className="py-4 px-6 font-bold text-center">Statut</th>
                <th className="py-4 px-6 font-bold text-center w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                      <span className="text-gray-500 font-medium">Chargement des utilisateurs...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6 font-bold text-slate-950 tracking-tight">
                      {getDisplayName(user)}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {user.email}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${
                        user.role === 'TEACHER' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 font-medium text-xs">
                      {user.role === 'STUDENT' ? (user.promotion || '-') : '-'}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 font-medium text-xs">
                      {user.role === 'STUDENT' ? (user.group || '-') : '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {user.isActive !== false ? (
                        <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full" title="Actif"></span>
                      ) : (
                        <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full" title="Inactif"></span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Button 
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === 'ADMIN'} // Empêcher la suppression des admins ou de soi-même idéalement
                        className="bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-300 hover:border-red-300 text-[11px] uppercase tracking-wider font-black px-4 py-2 rounded-lg transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-gray-400 font-medium italic">
                    Aucun compte trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODALE 1 : Création de compte enseignant */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-black tracking-tight">Nouveau Professeur</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Création de compte</p>
              </div>
              <Button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-900"
                disabled={isCreating}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </Button>
            </div>

            <form onSubmit={submitCreateTeacher} className="p-8 flex flex-col gap-5">
              
              {creationError && (
                 <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg text-xs font-bold shadow-sm">
                   {creationError}
                 </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 ml-1">Prénom</label>
                <input 
                  type="text" 
                  value={newTeacherData.firstname} 
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, firstname: e.target.value })}
                  className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 font-bold text-sm transition-all"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 ml-1">Nom</label>
                <input 
                  type="text" 
                  value={newTeacherData.lastname} 
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, lastname: e.target.value })}
                  className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 font-bold text-sm transition-all"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 ml-1">Adresse Email</label>
                <input 
                  type="email" 
                  value={newTeacherData.email} 
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, email: e.target.value })}
                  className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 font-bold text-sm transition-all"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl transition-all"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  {isCreating && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  Créer le compte
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE 2 : Succès (Affichage Mot de passe temporaire) */}
      {successData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-gray-200 shadow-2xl w-full max-w-sm rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-black tracking-tight">Compte créé !</h2>
              <p className="text-sm text-gray-500 font-medium">
                Le compte professeur a été créé avec succès. Veuillez transmettre ce mot de passe temporaire à l'utilisateur :
              </p>
              
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 my-2 relative group">
                <div className="text-xl font-mono font-black text-black tracking-widest break-all">
                  {successData.tempPassword}
                </div>
                <Button 
                  onClick={() => navigator.clipboard.writeText(successData.tempPassword)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-black bg-white shadow-sm border border-gray-200 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copier le mot de passe"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </Button>
              </div>

              <div className="w-full mt-4">
                <Button 
                  type="button" 
                  onClick={closeSuccessModal}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
