import { useEffect, useState } from "react";
import api from "../../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalUsers: 0,
    upcomingEvents: 0,
    completedEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/dashboard");
      setStats(data);
    } catch (error) {
      console.error("Failed to load admin dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* Header */}
        <div className="space-y-1 text-left md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of platform activity
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-gray-500 py-20">
            Loading dashboard...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center md:justify-items-stretch">
            <div className="w-full max-w-sm md:max-w-none bg-white border border-gray-200 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500">Total Events</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalEvents}
              </p>
            </div>

            <div className="w-full max-w-sm md:max-w-none bg-white border border-gray-200 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500">Total Registrations</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalRegistrations}
              </p>
            </div>

            <div className="w-full max-w-sm md:max-w-none bg-white border border-gray-200 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>

            <div className="w-full max-w-sm md:max-w-none bg-white border border-gray-200 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500">Upcoming Events</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.upcomingEvents}
              </p>
            </div>

            <div className="w-full max-w-sm md:max-w-none bg-white border border-gray-200 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500">Completed Events</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.completedEvents}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;