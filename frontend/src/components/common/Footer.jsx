import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const { isAuthenticated, user } = useAuth();
  const isStudent = user?.role === "student";

  return (
    <footer className="border-t border-gray-200 bg-white">
      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8 sm:flex-row sm:justify-between sm:items-start">
        {/* Brand */}
        <div className="flex flex-col gap-2 max-w-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Eventra
          </h2>
          <p className="text-sm text-gray-500">
            Eventra helps students discover, register, and manage campus events
            with ease.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-12">
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-gray-900">
              Explore
            </span>
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Home
            </Link>

            {isAuthenticated && isStudent && (
              <Link
                to="/events"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Events
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-gray-900">
              Account
            </span>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <span className="text-gray-500">
                Logged in
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Eventra. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;