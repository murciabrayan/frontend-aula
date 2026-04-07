import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "@/commons/Auth/screens/LoginScreen";
import ForgotPasswordScreen from "@/commons/Auth/screens/ForgotPasswordScreen";
import InitialPasswordSetupScreen from "@/commons/Auth/screens/InitialPasswordSetupScreen";
import ResetPasswordScreen from "@/commons/Auth/screens/ResetPasswordScreen";
import DataPolicyConsentScreen from "@/commons/Auth/screens/DataPolicyConsentScreen";
import AdminDashboard from "@/commons/personas/screens/AdminDashboard";
import TeacherDashboard from "@/commons/personas/screens/TeacherDashboard";
import StudentDashboard from "@/commons/personas/screens/StudentDashboard";
import ProtectedRoute from "@/commons/personas/components/ProtectedRoute";
import InstitutionalLayout from "@/landing/InstitutionalLayout";
import LandingHomePage from "@/landing/LandingHomePage";
import InstitutionalInfoPage from "@/landing/InstitutionalInfoPage";
import ContactPage from "@/landing/ContactPage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<InstitutionalLayout />}>
          <Route path="/" element={<LandingHomePage />} />
          <Route path="/institucional" element={<InstitutionalInfoPage />} />
          <Route path="/contacto" element={<ContactPage />} />
        </Route>

        <Route path="/plataforma" element={<LoginScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/tratamiento-datos" element={<DataPolicyConsentScreen />} />
        <Route path="/primer-acceso" element={<InitialPasswordSetupScreen />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordScreen />} />

        {/* Rutas protegidas según rol */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🧭 Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
