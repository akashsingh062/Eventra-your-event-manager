import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow"
        >
          <Menu className="w-5 h-5 text-gray-900" />
        </button>
      )}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 px-4 py-6 flex flex-col
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:top-16 md:h-[calc(100vh-4rem)]`}
      >
        {/* Header */}
        <div className="mb-8 px-3 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Admin Panel
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Eventra Management
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 w-full">
          <NavLink
            to="/admin/dashboard"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition relative ${
                isActive
                  ? "bg-gray-100 text-gray-900 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/events"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition relative ${
                isActive
                  ? "bg-gray-100 text-gray-900 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <CalendarPlus className="w-5 h-5" />
            Manage Events
          </NavLink>

          <NavLink
            to="/admin/registrations"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition relative ${
                isActive
                  ? "bg-gray-100 text-gray-900 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Users className="w-5 h-5" />
            Registrations
          </NavLink>
        </nav>
        <div className="my-6 border-t border-gray-200" />
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.name}
              </p>
              <span className="text-xs font-semibold text-red-600">
                ADMIN
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;