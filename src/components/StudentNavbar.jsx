import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function StudentNavbar() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-4 left-4 right-4 mx-auto max-w-7xl bg-white/95 backdrop-blur-md border border-slate-200 px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center rounded-lg z-50 font-montserrat">
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
          className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full border-2 border-purple-200 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold uppercase"
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
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="icon"
          aria-label="Se deconnecter"
          title="Se deconnecter"
          className="w-10 h-10 p-0 gap-0 flex items-center justify-center"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
