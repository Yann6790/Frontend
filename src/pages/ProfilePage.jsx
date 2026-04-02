import { useState } from "react";
import { useLocation } from "react-router-dom";
import StudentNavbar from "../components/StudentNavbar";
import TeacherNavbar from "../components/TeacherNavbar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/api";
import { authService } from "../services/auth.service";

export default function ProfilePage() {
  const location = useLocation();
  const { user, refreshUser } = useAuth();

  const isTeacher = user?.role === "TEACHER";
  const backLink = location.state?.from || (isTeacher ? "/teacher-dashboard" : "/student-dashboard");

  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });

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
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    const fileInput = document.getElementById("avatar-upload");
    if (fileInput) fileInput.value = "";
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

      setNotification({ message: "Avatar mis a jour avec succes.", type: "success" });
      cancelAvatarChange();
    } catch (err) {
      setNotification({ message: err.message || "Erreur lors de la mise a jour", type: "error" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' });

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setNotification({ message: "Le nouveau mot de passe et sa confirmation ne correspondent pas.", type: "error" });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setNotification({ message: "Le nouveau mot de passe doit faire au moins 6 caracteres.", type: "error" });
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await authService.changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });

      if (res && res.success === false) {
        throw new Error(res.message || "Erreur lors de la modification");
      }

      setNotification({ message: "Mot de passe modifie avec succes.", type: "success" });
      setPasswords({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setNotification({ message: err.message || "Erreur lors de la modification", type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-montserrat bg-white">
      {isTeacher ? <TeacherNavbar /> : <StudentNavbar />}

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 pt-28 sm:px-8">
        <section className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Mon compte
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Profil
          </h1>
          <p className="text-base text-slate-600">
            Gerez vos informations personnelles et votre securite.
          </p>
        </section>

        {notification.message && (
          <div className={`rounded-2xl border px-6 py-4 text-sm font-medium ${
            notification.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-6 flex flex-col items-center">
                <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full bg-slate-100 shadow-md">
                  {(previewUrl || user?.imageUrl) ? (
                    <img
                      src={previewUrl || user?.imageUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-black uppercase text-slate-700">
                      {user?.firstname?.[0] || user?.name?.firstname?.[0] || "U"}
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                      />
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
                <p className="text-xs text-slate-500">Cliquez pour changer</p>
              </div>

              {selectedFile && (
                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full px-4 py-2 h-10 gap-2 flex items-center justify-center"
                    onClick={cancelAvatarChange}
                    disabled={isUploadingAvatar}
                  >
                    <span>Annuler</span>
                  </Button>
                  <Button
                    type="button"
                    variant="admin"
                    className="w-full px-4 py-2 h-10 gap-2 flex items-center justify-center"
                    onClick={handleSaveAvatar}
                    loading={isUploadingAvatar}
                  >
                    <span>Sauvegarder</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-950">
                Informations personnelles
              </h2>

              <div className="space-y-4">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Nom complet
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {user?.firstname || user?.name?.firstname}{" "}
                    {user?.lastname || user?.name?.lastname || ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {user?.email || "email@indisponible.com"}
                  </p>
                </div>

                {!isTeacher && (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Promotion
                      </p>
                      <Badge variant="outline" className="text-slate-700">
                        {typeof user?.promotion === "string"
                          ? user.promotion
                          : user?.promotion?.name ||
                            user?.promotionId ||
                            user?.studentProfile?.promotion?.name ||
                            user?.studentProfile?.promotionId ||
                            "Non assignee"}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Groupe TP
                      </p>
                      <Badge variant="outline" className="text-slate-700">
                        {user?.group ||
                          user?.groupTp ||
                          user?.studentProfile?.groupTp ||
                          "Non assigne"}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            <form
              onSubmit={handlePasswordChange}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-950">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Securite
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ancien mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwords.oldPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, oldPassword: e.target.value })
                    }
                    placeholder="Saisissez votre mot de passe actuel"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                    placeholder="Saisissez le nouveau mot de passe"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwords.confirmNewPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmNewPassword: e.target.value })
                    }
                    placeholder="Confirmez le nouveau mot de passe"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="admin"
                  loading={isChangingPassword}
                  className="mt-2 w-full font-bold uppercase tracking-wider h-11 px-4 py-2 gap-2 flex items-center justify-center"
                >
                  <span>Mettre a jour le mot de passe</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
