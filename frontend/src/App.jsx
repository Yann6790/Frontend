import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicGallery from './pages/PublicGallery';
import StudentDashboard from './pages/StudentDashboard';
import ProfilePage from './pages/ProfilePage';
import StudentGalleryPage from './pages/StudentGalleryPage';
import StudentAnnouncementsPage from './pages/StudentAnnouncementsPage';
import StudentRendusPage from './pages/StudentRendusPage';
import StudentLayout from './components/StudentLayout';
import TeacherLayout from './components/TeacherLayout';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAnnouncementsPage from './pages/TeacherAnnouncementsPage';
import TeacherSaeDetailPage from './pages/TeacherSaeDetailPage';
import TeacherGalleryPage from './pages/TeacherGalleryPage';
import TeacherAdvancedViewPage from './pages/TeacherAdvancedViewPage';
import AdminLogsPage from './pages/AdminLogsPage';
import AdminAccountManagement from './pages/AdminAccountManagement';
import AdminStudentValidation from './pages/AdminStudentValidation';
import StudentSaeDetailPage from './pages/StudentSaeDetailPage';
import StudentSaeSubmissionPage from './pages/StudentSaeSubmissionPage';
import AdminSaeManagement from './pages/AdminSaeManagement';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/gallery" element={<PublicGallery />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/logs" element={<AdminLogsPage />} />
      <Route path="/admin/comptes" element={<AdminAccountManagement />} />
      <Route path="/admin/validation" element={<AdminStudentValidation />} />
      <Route path="/admin/sae" element={<AdminSaeManagement />} />

      <Route element={<StudentLayout />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student/gallery" element={<StudentGalleryPage />} />
        <Route path="/student/annonces" element={<StudentAnnouncementsPage />} />
        <Route path="/student/rendus" element={<StudentRendusPage />} />
        <Route path="/sae/:id" element={<StudentSaeDetailPage />} />
        <Route path="/sae/:id/rendu" element={<StudentSaeSubmissionPage />} />
      </Route>

      <Route element={<TeacherLayout />}>
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/annonces" element={<TeacherAnnouncementsPage />} />
        <Route path="/teacher/sae/:id" element={<TeacherSaeDetailPage />} />
        <Route path="/teacher/galerie" element={<TeacherGalleryPage />} />
        <Route path="/teacher/galerie/avancee" element={<TeacherAdvancedViewPage />} />
      </Route>
    </Routes>
  );
}

export default App;
