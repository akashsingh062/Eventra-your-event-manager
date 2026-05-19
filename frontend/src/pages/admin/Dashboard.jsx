import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="bg-transparent">
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* Header */}
        <div className="space-y-1 text-left md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of platform activity
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400 py-20">
            Loading dashboard...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center md:justify-items-stretch">
            <div className="w-full max-w-sm md:max-w-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalEvents}
              </p>
            </div>

            <div className="w-full max-w-sm md:max-w-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Registrations</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalRegistrations}
              </p>
            </div>

            <div className="w-full max-w-sm md:max-w-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>

            <div className="w-full max-w-sm md:max-w-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Events</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.upcomingEvents}
              </p>
            </div>

            <div className="w-full max-w-sm md:max-w-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed Events</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.completedEvents}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Link 
              to="/admin/events" 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6 hover:shadow-md dark:hover:shadow-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer group"
            >
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Manage Events</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create, edit, or remove upcoming campus events.</p>
            </Link>
            
            <Link 
              to="/admin/registrations" 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6 hover:shadow-md dark:hover:shadow-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer group"
            >
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">View Registrations</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review student sign-ups and manage attendee lists.</p>
            </Link>
            
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6 hover:shadow-md dark:hover:shadow-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer group">
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Analytics & Reports</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download attendance data and system usage reports.</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Database Connection</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">MongoDB cluster status</p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800/50">Healthy</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">API Gateway</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">REST endpoints performance</p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800/50">Optimal</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Service</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notifications and alerts</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium border border-yellow-200 dark:border-yellow-800/50">Delayed</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;