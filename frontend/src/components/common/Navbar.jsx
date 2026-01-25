import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Calendar, Ticket, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import assets from "../../assets/assets.js";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isLoggedIn = Boolean(user);

  const isStudent = user?.role === "student";

  // User initial for avatar
  const userInitial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            onClick={() => navigate(isLoggedIn ? "/events" : "/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src={assets.logo}
              alt="Eventra Logo"
              className="h-9 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          {(isLoggedIn ? isStudent : true) && (
            <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1 border border-gray-200">
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                Events
              </NavLink>

              {isLoggedIn && isStudent && (
                <NavLink
                  to="/my-registrations"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-white hover:text-gray-900"
                    }`
                  }
                >
                  <Ticket className="w-4 h-4" />
                  My Registrations
                </NavLink>
              )}
            </div>
          )}

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3 relative">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative">
                {/* Avatar */}
                <div
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold cursor-pointer select-none"
                >
                  {userInitial}
                </div>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg transition ${
                    profileOpen ? "opacity-100 visible" : "opacity-0 invisible"
                  }`}
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    {user.role === "admin" && (
                      <span className="block text-xs font-semibold text-red-600 mb-1">
                        ADMIN
                      </span>
                    )}
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <div className="py-1">
                    {isStudent && (
                      <>
                        <NavLink
                          to="/events"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Events
                        </NavLink>
                        <NavLink
                          to="/my-registrations"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Registrations
                        </NavLink>
                      </>
                    )}

                    {user.role === "admin" && (
                      <>
                        <NavLink
                          to="/admin/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </NavLink>
                        <NavLink
                          to="/admin/events"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Manage Events
                        </NavLink>
                      </>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        navigate('/events')
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="absolute right-4 mt-3 w-56 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden">
          

          <div className="border-t border-gray-200">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3 text-sm text-gray-900 font-medium hover:bg-gray-100"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="px-5 py-3 border-b border-gray-200">
                  {user.role === "admin" && (
                    <span className="block text-xs font-semibold text-red-600 mb-1">
                      ADMIN
                    </span>
                  )}
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {isStudent && (
                  <>
                    <NavLink
                      to="/events"
                      onClick={() => setOpen(false)}
                      className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Events
                    </NavLink>
                    <NavLink
                      to="/my-registrations"
                      onClick={() => setOpen(false)}
                      className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Registrations
                    </NavLink>
                  </>
                )}

                {user.role === "admin" && (
                  <>
                    <NavLink
                      to="/admin/dashboard"
                      onClick={() => setOpen(false)}
                      className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </NavLink>
                    <NavLink
                      to="/admin/events"
                      onClick={() => setOpen(false)}
                      className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Manage Events
                    </NavLink>
                  </>
                )}

                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;