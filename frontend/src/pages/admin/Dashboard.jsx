import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUsers, FaTicketAlt, FaChartLine, FaCheckCircle, FaArrowRight, FaCog, FaClipboardList, FaRupeeSign, FaQrcode } from "react-icons/fa";
import api from "../../services/api";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalUsers: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalRevenue: 0,
    paidEvents: 0,
    freeEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/dashboard");
      setStats(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load admin dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue || 0}`,
      icon: <FaRupeeSign />,
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Events",
      value: stats.totalEvents,
      icon: <FaCalendarAlt />,
      iconBg: "bg-navy-500/10 dark:bg-navy-500/20",
      iconColor: "text-navy-600 dark:text-steel-500",
      trend: `${stats.paidEvents} paid / ${stats.freeEvents} free`,
    },
    {
      label: "Registrations",
      value: stats.totalRegistrations,
      icon: <FaTicketAlt />,
      iconBg: "bg-steel-900 dark:bg-steel-300/20",
      iconColor: "text-steel-400 dark:text-steel-500",
    },
    {
      label: "Students",
      value: stats.totalUsers,
      icon: <FaUsers />,
      iconBg: "bg-brick-900/20 dark:bg-brick-500/10",
      iconColor: "text-brick-500 dark:text-brick-700",
    },
    {
      label: "Upcoming",
      value: stats.upcomingEvents,
      icon: <FaChartLine />,
      iconBg: "bg-cream-700 dark:bg-cream-100/10",
      iconColor: "text-cream-200 dark:text-cream-400",
    },
  ];

  return (
    <div className="bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back! Here's your platform overview.
            </p>
          </div>
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brick-500 text-white rounded-xl font-semibold text-sm hover:bg-brick-400 shadow-lg shadow-brick-500/20 dark:shadow-none transition-all"
          >
            <FaCalendarAlt /> Manage Events
          </Link>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {statCards.map((card, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center ${card.iconColor} text-lg`}>
                    {card.icon}
                  </div>
                  {card.trend && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                      {card.trend}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link
              to="/admin/events"
              className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:border-navy-600/30 dark:hover:border-steel-300/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-navy-500/10 dark:bg-navy-500/20 flex items-center justify-center text-navy-600 dark:text-steel-500 text-lg">
                  <FaCog />
                </div>
                <FaArrowRight className="text-gray-300 dark:text-gray-700 group-hover:text-navy-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-steel-500 transition-colors">
                Manage Events
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-xs leading-normal">
                Create, edit, or remove campus events.
              </p>
            </Link>

            <Link
              to="/admin/registrations"
              className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:border-steel-700/30 dark:hover:border-steel-300/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-steel-900 dark:bg-steel-300/20 flex items-center justify-center text-steel-400 dark:text-steel-500 text-lg">
                  <FaClipboardList />
                </div>
                <FaArrowRight className="text-gray-300 dark:text-gray-700 group-hover:text-steel-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-steel-400 dark:group-hover:text-steel-500 transition-colors">
                View Registrations
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-xs leading-normal">
                Review student sign-ups and manage attendees.
              </p>
            </Link>

            <Link
              to="/admin/checkin"
              className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:border-brick-500/30 dark:hover:border-brick-500/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brick-500/10 dark:bg-brick-500/20 flex items-center justify-center text-brick-500 dark:text-brick-700 text-lg">
                  <FaQrcode />
                </div>
                <FaArrowRight className="text-gray-300 dark:text-gray-700 group-hover:text-brick-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brick-500 dark:group-hover:text-brick-700 transition-colors">
                Event Check-In
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-xs leading-normal">
                Scan ticket QR codes to verify and confirm attendance.
              </p>
            </Link>

            <div className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 cursor-default">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg">
                  <FaChartLine />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-full">
                  Soon
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Analytics & Reports
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-xs leading-normal">
                Attendance data and usage reports — coming soon.
              </p>
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">System Status</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { name: "Database Connection", detail: "MongoDB cluster status", status: "Healthy", color: "emerald" },
              { name: "API Gateway", detail: "REST endpoints performance", status: "Optimal", color: "emerald" },
              { name: "Email Service", detail: "Notifications and alerts", status: "Delayed", color: "amber" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.detail}</p>
                </div>
                <span className={`flex items-center gap-2 px-3 py-1 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-700 dark:text-${item.color}-400 rounded-full text-xs font-semibold`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-${item.color}-500`}></span>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;