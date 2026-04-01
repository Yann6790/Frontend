import { Button } from "@/components/ui/button";
import { Clock3, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PendingValidation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const firstName = user?.name?.firstname || user?.firstname || "";

  return (
    <div className="min-h-screen bg-white font-montserrat">
      <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-16 sm:px-8">
        <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-none sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
            <Clock3 className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Compte en attente de validation
          </h1>

          <p className="mt-4 text-base text-slate-700">
            {firstName ? `${firstName}, votre` : "Votre"} demande d'affectation
            a bien ete transmise.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Un administrateur va valider votre compte tres prochainement.
          </p>

          <div className="mx-auto my-6 h-px w-full max-w-sm bg-slate-200" />

          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            className="h-10 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se deconnecter
          </Button>
        </section>
      </main>
    </div>
  );
}
