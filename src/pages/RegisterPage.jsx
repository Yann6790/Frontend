import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { authService } from "../services/auth.service";

// Schéma de validation Zod robuste
const registerSchema = z
  .object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    email: z.string().email("Format d'email invalide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  usePageTitle("Inscription");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setApiError("");
    setIsLoading(true);

    try {
      // 1. Inscription (Sign Up) à l'API
      await authService.signUp({
        email: data.email,
        password: data.password,
        firstname: data.prenom,
        lastname: data.nom,
      });

      // 2. Connexion automatique (Sign In) juste après l'inscription
      await authService.signIn({
        email: data.email,
        password: data.password,
      });

      // 3. Récupération de la session globale
      await refreshUser();

      // 4. Redirection vers l'onboarding pour finir le profil étudiant
      navigate("/onboarding");
    } catch (err) {
      setApiError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] font-montserrat lg:grid lg:grid-cols-[minmax(0,1fr)_35%]">
      <section className="flex items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-[560px]">
          <form
            className={cn("flex flex-col gap-8")}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
                  Creez votre compte
                </h1>
                <p className="text-base text-slate-500">
                  Rejoignez Welizy pour centraliser vos SAE, rendus et annonces.
                </p>
              </div>

              {apiError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {apiError}
                </div>
              )}

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="nom"
                      className="ml-1 text-sm font-semibold text-slate-900"
                    >
                      Nom
                    </Label>
                    <Input
                      type="text"
                      id="nom"
                      placeholder="Dupont"
                      {...register("nom")}
                      className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 text-base focus-visible:bg-white"
                    />
                    {errors.nom && (
                      <p className="ml-1 text-xs text-red-600">
                        {errors.nom.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="prenom"
                      className="ml-1 text-sm font-semibold text-slate-900"
                    >
                      Prenom
                    </Label>
                    <Input
                      type="text"
                      id="prenom"
                      placeholder="Jean"
                      {...register("prenom")}
                      className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 text-base focus-visible:bg-white"
                    />
                    {errors.prenom && (
                      <p className="ml-1 text-xs text-red-600">
                        {errors.prenom.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="ml-1 text-sm font-semibold text-slate-900"
                  >
                    Adresse e-mail
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="votre@email.com"
                    {...register("email")}
                    className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 text-base focus-visible:bg-white"
                  />
                  {errors.email && (
                    <p className="ml-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="ml-1 text-sm font-semibold text-slate-900"
                    >
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="••••••••"
                        {...register("password")}
                        className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 pr-10 text-base focus-visible:bg-white"
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
                    {errors.password && (
                      <p className="ml-1 text-xs text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="ml-1 text-sm font-semibold text-slate-900"
                    >
                      Confirmation
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 pr-10 text-base focus-visible:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                        aria-label={
                          showConfirmPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="ml-1 text-xs text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 rounded-xl text-sm font-bold px-4 py-2 gap-2 flex items-center justify-center"
                >
                  {isLoading ? "Inscription en cours..." : "Creer mon compte"}
                </Button>

                <div className="text-center text-sm text-slate-500">
                  Vous avez deja un compte ?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    Se connecter
                  </Link>
                </div>

                <div className="text-center text-sm text-slate-500">
                  <Link
                    to="/"
                    className="font-medium text-slate-500 hover:text-slate-700 hover:underline"
                  >
                    Retourner a la page d'accueil
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="hidden items-center justify-center px-8 py-10 lg:flex">
        <img
          src="/images/undraw_educator_6dgp.svg"
          alt="Illustration d'inscription"
          className="h-full max-h-[72vh] w-full max-w-[520px] object-contain"
        />
      </section>
    </main>
  );
};

export default RegisterPage;
