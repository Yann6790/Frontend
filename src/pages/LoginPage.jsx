import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.signIn({ email, password });
      await refreshUser();

      const sessionData = await authService.getMe();
      const currentUser = sessionData.data || sessionData.user || sessionData;

      console.log(
        "[LoginPage] User data at login:",
        JSON.stringify(currentUser, null, 2),
      );

      if (currentUser?.role === "ADMIN") {
        navigate("/admin/comptes");
      } else if (currentUser?.role === "TEACHER") {
        navigate("/teacher-dashboard");
      } else {
        if (
          currentUser?.isProfileValidated === undefined ||
          !("isProfileValidated" in currentUser)
        ) {
          navigate("/onboarding");
        } else if (currentUser?.isProfileValidated === false) {
          navigate("/pending");
        } else {
          navigate("/student-dashboard");
        }
      }
    } catch (err) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] font-montserrat lg:grid lg:grid-cols-[minmax(0,1fr)_35%]">
      <section className="flex items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-[520px]">
          <form className={cn("flex flex-col gap-8")} onSubmit={handleLogin}>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
                  Accédez a votre espace
                </h1>
                <p className="text-base text-slate-500">
                  Gerez votre scolarite MMI avec fluidite sur Welizy.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="ml-1 text-sm font-semibold text-slate-900"
                  >
                    Adresse e-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 text-base focus-visible:bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="ml-1 text-sm font-semibold text-slate-900"
                  >
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 pr-10 text-base focus-visible:bg-white"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="h-11 rounded-xl font-bold text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? "Connexion en cours..."
                    : "Se connecter a mon espace"}
                </Button>
              </div>

              <p className="text-center text-sm text-slate-500">
                Nouveau sur la plateforme ?{" "}
                <Link
                  to="/register"
                  className="font-bold text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Creer un compte gratuitement
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>

      <section className="hidden items-center justify-center px-8 py-10 lg:flex">
        <img
          src="/images/undraw_focused_m9bj.svg"
          alt="Illustration de connexion"
          className="h-full max-h-[72vh] w-full max-w-[520px] object-contain"
        />
      </section>
    </main>
  );
};

export default LoginPage;
