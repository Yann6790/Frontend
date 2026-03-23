import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';

const initialPendingStudents = [
  { id: 1, nom: "Bernard", prenom: "Lucas", email: "lucas.bernard@etu.fr", promoDemandee: "MMI 1", groupeTPDemande: "A1" },
  { id: 2, nom: "Petit", prenom: "Marie", email: "marie.petit@etu.fr", promoDemandee: "MMI 2", groupeTPDemande: "B1" },
  { id: 3, nom: "Dubois", prenom: "Thomas", email: "thomas.dubois@etu.fr", promoDemandee: "MMI 1", groupeTPDemande: "A2" },
  { id: 4, nom: "Richard", prenom: "Léa", email: "lea.richard@etu.fr", promoDemandee: "MMI 3", groupeTPDemande: "A1" },
  { id: 5, nom: "Garcia", prenom: "Hugo", email: "hugo.garcia@etu.fr", promoDemandee: "MMI 2", groupeTPDemande: "B2" },
  { id: 6, nom: "Moreau", prenom: "Chloé", email: "chloe.moreau@etu.fr", promoDemandee: "MMI 1", groupeTPDemande: "B1" },
  { id: 7, nom: "Laurent", prenom: "Antoine", email: "antoine.laurent@etu.fr", promoDemandee: "MMI 3", groupeTPDemande: "A2" }
];

export default function AdminStudentValidation() {
  const [pendingStudents, setPendingStudents] = useState(initialPendingStudents);
  const [filterPromo, setFilterPromo] = useState("Toutes");
  const [filterTP, setFilterTP] = useState("Tous");
  
  const [editingStudent, setEditingStudent] = useState(null);

  const filteredStudents = pendingStudents.filter(student => {
    const matchPromo = filterPromo === "Toutes" || student.promoDemandee === filterPromo;
    const matchTP = filterTP === "Tous" || student.groupeTPDemande === filterTP;
    return matchPromo && matchTP;
  });

  const handleAccept = (id) => {
    setPendingStudents(pendingStudents.filter(s => s.id !== id));
  };

  const handleRefuse = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir refuser et supprimer cette demande d'inscription ?")) {
      setPendingStudents(pendingStudents.filter(s => s.id !== id));
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent({ ...student });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setPendingStudents(pendingStudents.map(s => 
      s.id === editingStudent.id ? editingStudent : s
    ));
    setEditingStudent(null);
  };

  const handleChangeEdit = (field, value) => {
    setEditingStudent(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      <AdminNavbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6">
        
        <div className="pb-2">
          <h1 className="text-3xl font-black text-black tracking-tight">
            Validation des inscriptions étudiants
          </h1>
        </div>

        {/* Zone de filtres (Fond gris très clair) */}
        <div className="bg-gray-100 border border-gray-300 p-5 flex flex-col sm:flex-row items-center justify-start gap-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Promotion :</label>
            <select 
              value={filterPromo}
              onChange={(e) => setFilterPromo(e.target.value)}
              className="bg-white border border-gray-400 text-black px-4 py-2 outline-none focus:border-black font-medium text-sm w-full sm:w-auto cursor-pointer"
            >
              <option value="Toutes">Toutes</option>
              <option value="MMI 1">MMI 1</option>
              <option value="MMI 2">MMI 2</option>
              <option value="MMI 3">MMI 3</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Groupe TP :</label>
            <select 
              value={filterTP}
              onChange={(e) => setFilterTP(e.target.value)}
              className="bg-white border border-gray-400 text-black px-4 py-2 outline-none focus:border-black font-medium text-sm w-full sm:w-auto cursor-pointer"
            >
              <option value="Tous">Tous</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>
          </div>
        </div>

        {/* Zone d'affichage (Tableau strict) */}
        <div className="bg-white border border-gray-300 overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-200 border-b-2 border-gray-400 text-black">
              <tr>
                <th className="py-3 px-4 border-r border-gray-300 font-bold">Nom & Prénom</th>
                <th className="py-3 px-4 border-r border-gray-300 font-bold">Email</th>
                <th className="py-3 px-4 border-r border-gray-300 font-bold text-center">Promo demandée</th>
                <th className="py-3 px-4 border-r border-gray-300 font-bold text-center">Groupe TP demandé</th>
                <th className="py-3 px-4 font-bold text-center w-72">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className={`border-b border-gray-300 hover:bg-gray-200 transition-colors text-black ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4 border-r border-gray-300 font-semibold">
                      {student.nom.toUpperCase()} {student.prenom}
                    </td>
                    <td className="py-3 px-4 border-r border-gray-300 text-gray-700">
                      {student.email}
                    </td>
                    <td className="py-3 px-4 border-r border-gray-300 text-center font-bold text-gray-800">
                      {student.promoDemandee}
                    </td>
                    <td className="py-3 px-4 border-r border-gray-300 text-center font-bold text-gray-800">
                      {student.groupeTPDemande}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button 
                          onClick={() => handleAccept(student.id)}
                          className="flex-1 bg-gray-800 hover:bg-black text-white text-xs font-bold px-3 py-1.5 transition-colors border border-black shadow-sm"
                        >
                          Accepter
                        </button>
                        <button 
                          onClick={() => handleRefuse(student.id)}
                          className="flex-1 bg-white hover:bg-gray-100 text-black border-2 border-black text-xs font-bold px-3 py-1.5 transition-colors shadow-sm"
                        >
                          Refuser
                        </button>
                        <button 
                          onClick={() => handleEditClick(student)}
                          className="flex-none bg-gray-200 hover:bg-gray-300 text-black border border-gray-400 text-xs font-bold px-3 py-1.5 transition-colors shadow-sm"
                        >
                          Modifier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 font-medium">
                    Aucune demande en attente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modale d'Édition */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 shadow-xl w-full max-w-md">
            
            <div className="bg-gray-100 border-b border-gray-300 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">Modifier les informations</h2>
              <button 
                onClick={() => setEditingStudent(null)}
                className="text-gray-500 hover:text-black font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">Nom</label>
                  <input 
                    type="text" 
                    value={editingStudent.nom} 
                    onChange={(e) => handleChangeEdit('nom', e.target.value)}
                    className="w-full bg-white border border-gray-400 text-black px-3 py-2 outline-none focus:border-black font-medium text-sm transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">Prénom</label>
                  <input 
                    type="text" 
                    value={editingStudent.prenom} 
                    onChange={(e) => handleChangeEdit('prenom', e.target.value)}
                    className="w-full bg-white border border-gray-400 text-black px-3 py-2 outline-none focus:border-black font-medium text-sm transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700">Promo demandée</label>
                <select 
                  value={editingStudent.promoDemandee} 
                  onChange={(e) => handleChangeEdit('promoDemandee', e.target.value)}
                  className="w-full bg-white border border-gray-400 text-black px-3 py-2 outline-none focus:border-black font-medium text-sm transition-colors cursor-pointer"
                >
                  <option value="MMI 1">MMI 1</option>
                  <option value="MMI 2">MMI 2</option>
                  <option value="MMI 3">MMI 3</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700">Groupe TP demandé</label>
                <select 
                  value={editingStudent.groupeTPDemande} 
                  onChange={(e) => handleChangeEdit('groupeTPDemande', e.target.value)}
                  className="w-full bg-white border border-gray-400 text-black px-3 py-2 outline-none focus:border-black font-medium text-sm transition-colors cursor-pointer"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold text-sm transition-colors border border-gray-400"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gray-800 hover:bg-black text-white font-bold text-sm transition-colors border border-black"
                >
                  Enregistrer les modifications
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
