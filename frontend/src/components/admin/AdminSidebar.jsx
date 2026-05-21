import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  Scan,
  Ticket,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
      isActive
        ? "bg-navy-500/10 dark:bg-navy-500/20 text-navy-600 dark:text-steel-500 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-brick-500 before:rounded-full"
        : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-300/20"
    }`;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-navy-200 border border-gray-200 dark:border-navy-400/30 shadow"
        >
          <Menu className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
      )}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-navy-200 border-r border-gray-200 dark:border-navy-400/30 px-4 py-6 flex flex-col
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div className="mb-8 px-3 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-cream-500">
              Eventra
            </h1>
            <p className="text-xs text-gray-500 dark:text-steel-500 mt-1">
              Admin Panel
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-navy-300/30"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 w-full">
          <NavLink
            to="/admin/dashboard"
            onClick={() => setOpen(false)}
            className={navLinkClass}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/events"
            onClick={() => setOpen(false)}
            className={navLinkClass}
          >
            <CalendarPlus className="w-5 h-5" />
            Manage Events
          </NavLink>

          <NavLink
            to="/admin/registrations"
            onClick={() => setOpen(false)}
            className={navLinkClass}
          >
            <Users className="w-5 h-5" />
            Registrations
          </NavLink>

          <NavLink
            to="/admin/coupons"
            onClick={() => setOpen(false)}
            className={navLinkClass}
          >
            <Ticket className="w-5 h-5" />
            Manage Coupons
          </NavLink>

          <NavLink
            to="/admin/checkin"
            onClick={() => setOpen(false)}
            className={navLinkClass}
          >
            <Scan className="w-5 h-5" />
            Event Check-In
          </NavLink>
        </nav>

        <div className="my-6 border-t border-gray-200 dark:border-navy-400/30" />

        {/* Theme Toggle */}
        <div className="px-2 mb-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-300/20 transition-all"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5 text-cream-300" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-navy-500" />
                Dark Mode
              </>
            )}
          </button>
        </div>

        {/* User Info + Logout */}
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-steel-300 text-white flex items-center justify-center font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-cream-500">
                {user?.name}
              </p>
              <span className="text-xs font-bold text-brick-500 dark:text-brick-700 uppercase tracking-wider">
                Admin
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-brick-500 dark:hover:text-brick-700 hover:bg-red-50 dark:hover:bg-brick-500/10 transition-colors"
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