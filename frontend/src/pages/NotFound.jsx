import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-700">404</h1>

        <h2 className="text-xl font-semibold text-gray-800">
          Page Not Found
        </h2>

        <p className="text-gray-600">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block mt-4 px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
