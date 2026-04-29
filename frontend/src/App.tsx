import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import PatientLayout from './layouts/PatientLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import ProfilePage from './pages/patient/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import DoctorsPage from './pages/admin/DoctorsPage';
import DoctorDetailPage from './pages/admin/DoctorDetailPage';
import SpecialtiesPage from './pages/admin/SpecialtiesPage';
import PatientsPage from './pages/admin/PatientsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Rutas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Rutas del paciente */}
          <Route element={<ProtectedRoute><PatientLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/appointments/new" element={<BookAppointmentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Rutas del admin */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/appointments" element={<AppointmentsPage />} />
            <Route path="/admin/doctors" element={<DoctorsPage />} />
            <Route path="/admin/doctors/:id" element={<DoctorDetailPage />} />
            <Route path="/admin/specialties" element={<SpecialtiesPage />} />
            <Route path="/admin/patients" element={<PatientsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
