import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Events from "../pages/student/Events";
import MyTickets from "../pages/student/MyTickets";
import EventDetails from "../pages/EventDetails";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "../components/common/ProtectedRoute";
import GuestRoute from "../components/common/GuestRoute";

import AdminDashboard from "../pages/admin/Dashboard";
import ManageEvents from "../pages/admin/ManageEvents";
import AdminRegistrations from "../pages/admin/Registrations.jsx";
import CheckIn from "../pages/admin/CheckIn";
import ManageCoupons from "../pages/admin/ManageCoupons";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetails />} />

      {/* Student Protected Routes */}
      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute role="student">
            <MyTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-registrations"
        element={<Navigate to="/my-tickets" replace />}
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

      <Route
        path="/admin/coupons"
        element={
          <ProtectedRoute role="admin">
            <ManageCoupons />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/checkin"
        element={
          <ProtectedRoute role="admin">
            <CheckIn />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;