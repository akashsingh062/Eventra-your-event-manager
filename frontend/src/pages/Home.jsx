import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUsers, FaUniversity } from "react-icons/fa";
import { useEvent } from "../context/EventContext";
import EventCard from "../components/student/EventCard";

const Home = () => {
  const { events, fetchEvents, registerForEvent, loading } = useEvent();

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="bg-transparent">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Manage & Discover{" "}
            <span className="text-gray-700 dark:text-gray-400">Campus Events</span>{" "}
            Easily
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300">
            Eventra helps students explore upcoming campus events, register seamlessly,
            and stay updated — all in one place.
          </p>

          <div className="flex gap-4">
            <Link
              to="/events"
              className="px-6 py-3 bg-gray-800 dark:bg-white text-white dark:text-gray-900 rounded-md font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition"
            >
              Explore Events
            </Link>

            <Link
              to="/register"
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:border-gray-500 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-none border border-transparent dark:border-gray-800 rounded-xl p-8 space-y-4 w-full max-w-md">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-gray-700 dark:text-gray-300 text-xl" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Upcoming Events</span>
            </div>

            <div className="flex items-center gap-3">
              <FaUsers className="text-gray-700 dark:text-gray-300 text-xl" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Easy Registrations</span>
            </div>

            <div className="flex items-center gap-3">
              <FaUniversity className="text-gray-700 dark:text-gray-300 text-xl" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Campus Focused</span>
            </div>
          </div>
        </div>

      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Check out what's happening on campus soon.</p>
          </div>
          <Link to="/events" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium pb-1 border-b-2 border-transparent hover:border-gray-900 dark:hover:border-white transition">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">Loading events...</div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onRegister={() => registerForEvent(event._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            No upcoming events at the moment.
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
