import { Route, Routes } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import GuestGuard from "./components/GuestGuard";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";
import StudentLayout from "./components/StudentLayout";
import TeacherLayout from "./components/TeacherLayout";
import AdminAccountManagement from "./pages/AdminAccountManagement";
import AdminSaeManagement from "./pages/AdminSaeManagement";
import AdminStudentValidation from "./pages/AdminStudentValidation";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import PendingValidation from "./pages/PendingValidation";
import ProfilePage from "./pages/ProfilePage";
import PublicGallery from "./pages/PublicGallery";
import RegisterPage from "./pages/RegisterPage";
import StudentAnnouncementsPage from "./pages/StudentAnnouncementsPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentGalleryPage from "./pages/StudentGalleryPage";
import StudentRendusPage from "./pages/StudentRendusPage";
import StudentSaeDetailPage from "./pages/StudentSaeDetailPage";
import StudentSaeSubmissionPage from "./pages/StudentSaeSubmissionPage";
import TeacherAdvancedViewPage from "./pages/TeacherAdvancedViewPage";
import TeacherAnnouncementsPage from "./pages/TeacherAnnouncementsPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherGalleryPage from "./pages/TeacherGalleryPage";
import TeacherSaeDetailPage from "./pages/TeacherSaeDetailPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/gallery" element={<PublicGallery />} />

        {/* GUEST-ONLY ROUTES */}
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* SEMI-PROTECTED ROUTES (Specific to new student needing onboarding, handled by AuthGuard later, or explicitly guarded here) */}
        {/* On onboarding, user must be authenticated but might not have completed onboarding. We'll protect it generically for anyone logged in. */}
        <Route element={<AuthGuard />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/pending" element={<PendingValidation />} />
        </Route>

        {/* PROTECTED ROUTES: STUDENT */}
        <Route element={<AuthGuard allowedRoles={["STUDENT"]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student/gallery" element={<StudentGalleryPage />} />
            <Route
              path="/student/annonces"
              element={<StudentAnnouncementsPage />}
            />
            <Route path="/student/rendus" element={<StudentRendusPage />} />
          </Route>
          {/* SAE Detail Pages (without navbar) */}
          <Route path="/sae/:id" element={<StudentSaeDetailPage />} />
          <Route path="/sae/:id/rendu" element={<StudentSaeSubmissionPage />} />
        </Route>

        {/* PROTECTED ROUTES: TEACHER */}
        <Route element={<AuthGuard allowedRoles={["TEACHER"]} />}>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route
              path="/teacher/annonces"
              element={<TeacherAnnouncementsPage />}
            />
            <Route path="/teacher/galerie" element={<TeacherGalleryPage />} />
            <Route
              path="/teacher/galerie/avancee"
              element={<TeacherAdvancedViewPage />}
            />
          </Route>
          {/* SAE Detail Page (without navbar) */}
          <Route path="/teacher/sae/:id" element={<TeacherSaeDetailPage />} />
        </Route>

        {/* SHARED PROTECTED ROUTES (Profile) */}
        <Route element={<AuthGuard allowedRoles={["STUDENT", "TEACHER"]} />}>
          {/* We wrap profile with dynamic layout based on role */}
          <Route
            path="/profile"
            element={
              <div className="flex-1 flex flex-col">
                {/* Dynamic Navbar selection logic could be handled here or inside ProfilePage */}
                <ProfilePage />
              </div>
            }
          />
        </Route>

        {/* PROTECTED ROUTES: ADMIN */}
        <Route element={<AuthGuard allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/comptes" element={<AdminAccountManagement />} />
          <Route
            path="/admin/validation"
            element={<AdminStudentValidation />}
          />
          <Route path="/admin/sae" element={<AdminSaeManagement />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
