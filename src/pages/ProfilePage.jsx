import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { apiClient } from '../lib/api';
import StudentNavbar from '../components/StudentNavbar';
import TeacherNavbar from '../components/TeacherNavbar';

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser, signOut } = useAuth();

  // Retour dynamique selon le rôle ou l'origine
  const isTeacher = user?.role === 'TEACHER';
  const themeBase = isTeacher ? 'blue' : 'purple';
  const backLink = location.state?.from || (isTeacher ? '/teacher-dashboard' : '/student-dashboard');

  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });

  // Nouveaux états pour l'avatar
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setNotification({ message: 'Format non supporté (PNG, JPG, WEBP uniquement).', type: 'error' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setNotification({ message: '', type: '' });
    }
  };

  const cancelAvatarChange = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    const fileInput = document.getElementById('avatar-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile) return;
    setIsUploadingAvatar(true);
    setNotification({ message: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Action A: Upload
      const uploadRes = await apiClient('/api/resources/upload-image', {
        method: 'POST',
        body: formData
      });

      const newAvatarUrl = uploadRes.data?.url || uploadRes.url;

      // Action B: Persister via la nouvelle API dédiée
      await authService.updateProfileImage(newAvatarUrl);

      // Action C: Rafraîchir
      await refreshUser();

      setNotification({ message: 'Photo de profil mise à jour avec succès.', type: 'success' });
      cancelAvatarChange();
    } catch (err) {
      setNotification({ message: err.message || 'Erreur lors de la mise à jour de la photo', type: 'error' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' });
    setIsChangingPassword(true);

    try {
      await authService.changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      setNotification({ message: 'Mot de passe modifié avec succès', type: 'success' });
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setNotification({ message: err.message || 'Erreur lors de la modification du mot de passe', type: 'error' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col font-montserrat bg-gray-50">
      {/* Dynamic Navbar based on role */}
      {isTeacher ? <TeacherNavbar /> : <StudentNavbar />}

      {/* 1. Header contextuel (couleur adaptative) */}
      <div className="bg-white px-6 py-6 md:px-12 flex items-center justify-between shadow-sm relative z-10 border-b border-gray-100">
        <Link to={backLink} className={`flex items-center gap-2 text-${themeBase}-700 hover:text-${themeBase}-800 font-bold transition-all px-4 py-2 hover:bg-${themeBase}-50 rounded-full`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Retour au Dashboard
        </Link>
      </div>

      {/* 2. Section Basse Dynamique (Violet/Bleu) */}
      <div className={`bg-${themeBase}-700 flex-1 px-4 py-12 md:px-12 flex justify-center items-start`}>

        {/* Card Centrale Blanche */}
        <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-8 md:p-12 relative">

          {/* Notifications */}
          {notification.message && (
            <div className={`mb-6 px-6 py-3 rounded-xl font-bold text-sm shadow-sm ${notification.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              {notification.message}
            </div>
          )}

          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-montserrat font-black text-gray-900">
              Mon Profil
            </h1>

            {/* Informations du compte (live data) */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar avec upload */}
                <div className="relative flex-shrink-0 flex flex-col items-center">
                  <div className={`w-24 h-24 bg-${themeBase}-100 rounded-full flex items-center justify-center text-${themeBase}-700 font-bold text-3xl uppercase border-4 border-white shadow-md overflow-hidden relative group`}>
                    {(previewUrl || user?.imageUrl) ? (
                      <img src={previewUrl || user?.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.firstname?.[0] || user?.name?.firstname?.[0] || 'U'}</span>
                    )}
                    
                    {/* Overlay hover */}
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                    </label>
                  </div>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    className="hidden" 
                    onChange={handleFileSelect} 
                  />
                </div>

                <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Informations publiques</h2>
                  <div className="text-xl font-bold text-gray-900 font-montserrat mb-1">
                    {user?.firstname || user?.name?.firstname || 'Utilisateur'} <span className="uppercase">{user?.lastname || user?.name?.lastname || ''}</span>
                  </div>
                  <div className="text-gray-500 font-medium text-sm mb-3">{user?.email || 'email@indisponible.com'}</div>

                  {!isTeacher && (
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-2">
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm flex flex-col items-center sm:items-start min-w-[120px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Promotion</span>
                        <span className="text-sm font-bold text-gray-800 truncate max-w-[150px]" title={typeof user?.promotion === 'string' ? user.promotion : (user?.promotion?.name || user?.promotionId || user?.studentProfile?.promotion?.name || user?.studentProfile?.promotionId || 'Non assignée')}>
                          {typeof user?.promotion === 'string' ? user.promotion : (user?.promotion?.name || user?.promotionId || user?.studentProfile?.promotion?.name || user?.studentProfile?.promotionId || 'Non assignée')}
                        </span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm flex flex-col items-center sm:items-start min-w-[120px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Groupe TP</span>
                        <span className="text-sm font-bold text-gray-800 truncate max-w-[150px]" title={user?.group || user?.groupTp || user?.studentProfile?.groupTp || 'Non assigné'}>
                          {user?.group || user?.groupTp || user?.studentProfile?.groupTp || 'Non assigné'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action pour l'avatar */}
              {selectedFile && (
                <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={cancelAvatarChange}
                    disabled={isUploadingAvatar}
                    className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={isUploadingAvatar}
                    className={`px-4 py-2 text-sm font-bold text-white bg-${themeBase}-600 hover:bg-${themeBase}-700 rounded-lg transition-colors flex items-center gap-2 disabled:bg-${themeBase}-400 shadow-sm`}
                  >
                    {isUploadingAvatar ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Sauvegarde...
                      </span>
                    ) : (
                      "Sauvegarder la nouvelle photo"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Changement de mot de passe (ÉTAPE 4 API) */}
            <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-2xl border border-gray-200 mt-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4 font-montserrat flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Sécurité
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ancien mot de passe</label>
                  <input
                    type="password"
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                    placeholder="Saisissez votre mot de passe actuel"
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Saisissez le nouveau mot de passe"
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="mt-3 w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-lg transition-colors disabled:bg-gray-400 flex justify-center items-center gap-2"
                >
                  {isChangingPassword ? (
                    <span className="animate-pulse">Modification...</span>
                  ) : "Mettre à jour le mot de passe"}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
