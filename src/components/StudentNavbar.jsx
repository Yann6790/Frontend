import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentNavbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-4 left-4 right-4 mx-auto max-w-7xl bg-white/95 backdrop-blur-md border border-slate-200 px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center rounded-full z-50 font-montserrat">
      {/* Côté Gauche : Logo */}
      <div className="flex items-center gap-2 h-full min-w-0">
        <Link
          to="/student-dashboard"
          className="flex items-center text-purple-600 font-montserrat font-black text-xl tracking-tight"
        >
          Welizy
        </Link>
      </div>

      {/* Centre : Navigation */}
      <nav className="hidden md:flex items-center h-full gap-8 justify-self-center">
        <NavLink
          to="/student-dashboard"
          className={({ isActive }) =>
            `text-sm font-semibold h-full flex items-center border-b-2 transition-colors ${isActive ? "border-purple-600 text-purple-600" : "border-transparent text-slate-600 hover:text-purple-600"}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/student/annonces"
          className={({ isActive }) =>
            `text-sm font-semibold h-full flex items-center border-b-2 transition-colors ${isActive ? "border-purple-600 text-purple-600" : "border-transparent text-slate-600 hover:text-purple-600"}`
          }
        >
          Annonces
        </NavLink>
        <NavLink
          to="/student/gallery"
          className={({ isActive }) =>
            `text-sm font-semibold h-full flex items-center border-b-2 transition-colors ${isActive ? "border-purple-600 text-purple-600" : "border-transparent text-slate-600 hover:text-purple-600"}`
          }
        >
          Galerie
        </NavLink>
        <NavLink
          to="/student/rendus"
          className={({ isActive }) =>
            `text-sm font-semibold h-full flex items-center border-b-2 transition-colors ${isActive ? "border-purple-600 text-purple-600" : "border-transparent text-slate-600 hover:text-purple-600"}`
          }
        >
          Mes Rendus
        </NavLink>
      </nav>

      {/* Côté Droite : Profil & Déconnexion */}
      <div className="flex justify-end items-center gap-4 min-w-0">
        <span className="font-semibold text-slate-700 hidden sm:inline-block">
          Hello {user?.firstname || user?.name?.firstname || "étudiant"}
        </span>
        <Link
          to="/profile"
          className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full border-2 border-purple-200 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer shadow-sm flex items-center justify-center font-bold uppercase"
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm">
              {user?.firstname?.[0] || user?.name?.firstname?.[0] || "E"}
            </span>
          )}
        </Link>
        <Link
          to="/"
          aria-label="Se deconnecter"
          title="Se deconnecter"
          className="text-purple-600 bg-purple-50 hover:bg-purple-100 w-10 h-10 flex items-center justify-center rounded-full transition-colors border border-purple-200 shadow-sm ml-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H10m6 4v1a3 3 0 01-3 3H8a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1"
            ></path>
          </svg>
        </Link>
      </div>
    </header>
  );
}
