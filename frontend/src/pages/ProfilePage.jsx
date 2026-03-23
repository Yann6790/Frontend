import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const backLink = location.state?.from || "/student-dashboard";
  const [profile, setProfile] = useState({
    firstName: "Jean",
    lastName: "Étudiant",
    bio: "Étudiant passionné par le développement web et le design d'interfaces. Mon portfolio : www.mon-portfolio.com",
    imagePreview: "https://placehold.co/200x200/e2e8f0/94a3b8?text=AV"
  });



  const [notification, setNotification] = useState("");

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    navigate(backLink);
  };

  return (
    <div className="min-h-screen flex flex-col font-merriweather bg-gray-50">
      {/* 1. En-tête : Fond blanc */}
      <div className="bg-white px-6 py-6 md:px-12 flex items-center shadow-sm relative z-10 border-b border-gray-100">
        <Link to={backLink} className="flex items-center gap-2 text-purple-700 hover:text-purple-800 font-bold transition-all px-4 py-2 hover:bg-purple-50 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Retour au Dashboard
        </Link>
      </div>

      {/* 2. Section Basse Violette */}
      <div className="bg-purple-700 flex-1 px-4 py-12 md:px-12 flex justify-center">

        {/* Card Centrale Blanche */}
        <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden self-start flex flex-col p-8 md:p-12 border-4 border-transparent hover:border-purple-300/30 transition-all duration-300 relative">

          {/* Notification temporaire */}
          {notification && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold shadow-md animate-bounce z-20">
              {notification}
            </div>
          )}

          <h1 className="text-3xl font-montserrat font-bold text-gray-900 mb-8 text-center md:text-left">
            Mon Profil
          </h1>

          <div className="flex flex-col md:flex-row gap-10 items-start">

            {/* Gestion de la Photo */}
            <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
              <div className="relative group cursor-pointer w-40 h-40">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-100 shadow-xl bg-gray-100">
                  <img src={profile.imagePreview} alt="Profil" className="w-full h-full object-cover" />
                </div>
                <div onClick={handleImageClick} className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span className="text-white font-bold text-xs text-center px-2 shadow-sm">Modifier la photo</span>
                </div>
              </div>
              <button
                onClick={handleImageClick}
                className="text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-full transition-colors border border-purple-200 shadow-sm"
              >
                Changer l'image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* Informations Personnelles */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">

              {/* Nom & Prénom */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Identité</h2>
                </div>
                <div className="text-2xl font-bold text-gray-900 font-montserrat">
                  {profile.firstName} <span className="uppercase">{profile.lastName}</span>
                </div>
              </div>

              {/* Description / Bio */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col flex-1 shadow-inner">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 block">Description / Raccourcis</label>

                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full flex-1 min-h-[120px] border border-gray-200 hover:border-purple-300 bg-white rounded-xl px-4 py-4 text-gray-700 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium leading-relaxed resize-y shadow-sm"
                  placeholder="Écrivez une courte présentation ou insérez des liens vers vos réseaux (ex: www.github.com/mon-profil)..."
                />


              </div>

              <button
                onClick={handleSaveAll}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-1 text-lg font-montserrat"
              >
                Enregistrer les modifications
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
