import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mmiLogo from "../Images/mmilogo.png";

export default function AdminNavbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const navLinks = [
    { path: "/admin/comptes", label: "Gestion des comptes" },
    { path: "/admin/sae", label: "Gestion des SAE" },
    { path: "/admin/validation", label: "Validation des étudiants" },
  ];

  return (
    <nav className="fixed top-4 left-4 right-4 mx-auto max-w-7xl bg-white/95 backdrop-blur-md border border-slate-200 px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center rounded-full z-50 font-montserrat">
      {/* Left: Logo */}
      <div className="flex items-center min-w-0">
        <img src={mmiLogo} alt="Logo MMI" className="h-10 w-auto" />
      </div>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-8 h-full justify-self-center">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `text-sm font-semibold transition-all border-b-2 h-full flex items-center ${
                isActive
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-slate-600 hover:text-purple-600"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Right: Admin Profile & Sign Out */}
      <div className="flex justify-end items-center gap-4 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Admin</span>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200 bg-purple-100 flex items-center justify-center">
            <img
              src="/Images/adminlogo.png"
              alt="Profil Admin"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/100x100/eeeeee/333333?text=A";
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSignOut}
          aria-label="Se deconnecter"
          title="Se deconnecter"
          className="text-purple-600 bg-purple-50 hover:bg-purple-100 w-10 h-10 rounded-full transition-colors border border-purple-200 shadow-sm flex items-center justify-center"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
        </button>
      </div>
    </nav>
  );
}
