import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getRedirectPath(user) {
  if (!user) return "/login";

  if (user.role === "ADMIN") return "/admin/comptes";
  if (user.role === "TEACHER") return "/teacher-dashboard";

  const isValidated = user.isProfileValidated === true;
  const isPending = user.isProfileValidated === false;
  const needsOnboarding =
    user.isProfileValidated === undefined || !("isProfileValidated" in user);

  if (needsOnboarding) return "/onboarding";
  if (isPending) return "/pending";
  if (isValidated) return "/student-dashboard";

  return "/student-dashboard";
}

const GuestGuard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            border: "2.5px solid #e5e7eb",
            borderTopColor: "#4f46e5",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </div>
    );
  }

  if (user) {
    return <Navigate to={getRedirectPath(user)} replace />;
  }

  return <Outlet />;
};

export default GuestGuard;
