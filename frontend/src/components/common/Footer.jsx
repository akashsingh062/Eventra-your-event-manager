import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const { isAuthenticated, user } = useAuth();
  const isStudent = user?.role === "student";

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8 sm:flex-row sm:justify-between sm:items-start">
        {/* Brand */}
        <div className="flex flex-col gap-2 max-w-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Eventra
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Eventra helps students discover, register, and manage campus events
            with ease.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-12">
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-gray-900 dark:text-white">
              Explore
            </span>
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Home
            </Link>

            {isAuthenticated && isStudent && (
              <Link
                to="/events"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                Events
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-gray-900 dark:text-white">
              Account
            </span>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                Logged in
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          © {new Date().getFullYear()} Eventra. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;