import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Calendar, Ticket, LogOut, Sun, Moon, ChevronDown, LayoutDashboard, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import assets from "../../assets/assets.js";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const isLoggedIn = Boolean(user);
  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";
  const userInitial = user?.name?.charAt(0).toUpperCase() || "?";

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-navy-500/10 dark:bg-navy-500/20 text-navy-600 dark:text-steel-500"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
    }`;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream-900/90 dark:bg-navy-100/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-navy-400/30"
          : "bg-cream-900/60 dark:bg-navy-100/60 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            onClick={() => navigate(isLoggedIn ? "/events" : "/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={assets.logo}
              alt="Eventra Logo"
              className="h-8 w-auto object-contain dark:invert transition-transform group-hover:scale-105"
            />
          </div>

          {/* Desktop Navigation */}
          {(isLoggedIn ? (isStudent || isAdmin) : true) && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/events" className={navLinkClass}>
                <Calendar className="w-4 h-4" />
                Events
              </NavLink>

              {isLoggedIn && isStudent && (
                <NavLink to="/my-registrations" className={navLinkClass}>
                  <Ticket className="w-4 h-4" />
                  My Registrations
                </NavLink>
              )}

              {isLoggedIn && isAdmin && (
                <>
                  <NavLink to="/admin/dashboard" className={navLinkClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/events" className={navLinkClass}>
                    <Settings className="w-4 h-4" />
                    Manage
                  </NavLink>
                </>
              )}
            </div>
          )}

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {!isLoggedIn ? (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-semibold text-white bg-brick-500 rounded-xl hover:bg-brick-400 shadow-md shadow-brick-500/20 dark:shadow-none transition-all"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative ml-2" ref={dropdownRef}>
                {/* Avatar Button */}
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-500 to-steel-300 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {userInitial}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none transition-all origin-top-right ${
                    profileOpen
                      ? "opacity-100 visible scale-100 translate-y-0"
                      : "opacity-0 invisible scale-95 -translate-y-2"
                  }`}
                >
                  {/* User Info */}
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-steel-300 text-white flex items-center justify-center font-bold shadow-sm">
                        {userInitial}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                        Admin
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-2 px-2">
                    {isStudent && (
                      <>
                        <NavLink
                          to="/events"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Events
                        </NavLink>
                        <NavLink
                          to="/my-registrations"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <Ticket className="w-4 h-4 text-gray-400" />
                          My Registrations
                        </NavLink>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <NavLink
                          to="/admin/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          Admin Dashboard
                        </NavLink>
                        <NavLink
                          to="/admin/events"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Manage Events
                        </NavLink>
                      </>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 dark:border-gray-800 p-2">
                    <button
                      onClick={() => {
                        logout();
                        navigate('/events');
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: Theme Toggle + Hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-1 border-t border-gray-200/50 dark:border-gray-800/50 pt-3">
          {!isLoggedIn ? (
            <div className="space-y-2">
              <NavLink to="/events" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <Calendar className="w-4 h-4 text-gray-400" />
                Events
              </NavLink>
              <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
              <Link
                to="/login"
                className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block text-center px-4 py-3 text-sm font-semibold text-white bg-brick-500 hover:bg-brick-400 rounded-xl transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {/* User card */}
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-steel-300 text-white flex items-center justify-center font-bold shadow-sm">
                  {userInitial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                {isAdmin && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                    Admin
                  </span>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

              {isStudent && (
                <>
                  <NavLink to="/events" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Events
                  </NavLink>
                  <NavLink to="/my-registrations" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    <Ticket className="w-4 h-4 text-gray-400" />
                    My Registrations
                  </NavLink>
                </>
              )}

              {isAdmin && (
                <>
                  <NavLink to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                    Admin Dashboard
                  </NavLink>
                  <NavLink to="/admin/events" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                    Manage Events
                  </NavLink>
                </>
              )}

              <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

              <button
                onClick={() => {
                  logout();
                  navigate('/events');
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;