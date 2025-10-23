import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "@/commons/Auth/screens/LoginScreen";
import ForgotPasswordScreen from "@/commons/Auth/screens/ForgotPasswordScreen";
import ResetPasswordScreen from "@/commons/Auth/screens/ResetPasswordScreen";
import AdminDashboard from "@/commons/personas/screens/AdminDashboard";
import TeacherDashboard from "@/commons/personas/screens/TeacherDashboard";
import StudentDashboard from "@/commons/personas/screens/StudentDashboard";
import ProtectedRoute from "@/commons/personas/components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 🔓 Rutas públicas */}
        <Route path="/" element={<LoginScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordScreen />} />

        {/* 🔐 Rutas protegidas según rol */}
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
