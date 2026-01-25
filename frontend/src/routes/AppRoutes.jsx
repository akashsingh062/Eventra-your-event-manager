import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Events from "../pages/student/Events";
import MyRegistrations from "../pages/student/MyRegistrations";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "../components/common/ProtectedRoute";

import AdminDashboard from "../pages/admin/Dashboard";
import ManageEvents from "../pages/admin/ManageEvents";
import AdminRegistrations from "../pages/admin/Registrations.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/events" element={<Events />} />

      {/* Student Protected Routes */}
      <Route
        path="/my-registrations"
        element={
          <ProtectedRoute role="student">
            <MyRegistrations />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/events"
        element={
          <ProtectedRoute role="admin">
            <ManageEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/registrations"
        element={
          <ProtectedRoute role="admin">
            <AdminRegistrations />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;