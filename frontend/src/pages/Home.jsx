import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUsers, FaUniversity } from "react-icons/fa";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Manage & Discover{" "}
            <span className="text-gray-700">Campus Events</span>{" "}
            Easily
          </h1>

          <p className="text-lg text-gray-600">
            Eventra helps students explore upcoming campus events, register seamlessly,
            and stay updated — all in one place.
          </p>

          <div className="flex gap-4">
            <Link
              to="/events"
              className="px-6 py-3 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-700 transition"
            >
              Explore Events
            </Link>

            <Link
              to="/register"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:border-gray-500 hover:text-gray-900 transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex justify-center">
          <div className="bg-white shadow-lg rounded-xl p-8 space-y-4 w-full max-w-md">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-gray-700 text-xl" />
              <span className="font-medium text-gray-700">Upcoming Events</span>
            </div>

            <div className="flex items-center gap-3">
              <FaUsers className="text-gray-700 text-xl" />
              <span className="font-medium text-gray-700">Easy Registrations</span>
            </div>

            <div className="flex items-center gap-3">
              <FaUniversity className="text-gray-700 text-xl" />
              <span className="font-medium text-gray-700">Campus Focused</span>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Home;
