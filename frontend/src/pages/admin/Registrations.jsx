

import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const { data } = await api.get("/api/admin/registrations");
      setRegistrations(data);
    } catch (error) {
      console.error("Failed to fetch registrations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this registration?")) return;
    try {
      await api.delete(`/api/admin/registrations/${id}`);
      setRegistrations((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Failed to delete registration", error);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading registrations...
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:max-w-7xl md:mx-auto md:px-6 py-6 md:py-8 bg-transparent">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-left md:text-left">
        Event Registrations
      </h1>

      {registrations.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No registrations found.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    Event Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    Registered At
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {registrations.map((reg) => (
                  <tr
                    key={reg._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {reg.user?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {reg.user?.email}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {reg.event?.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {new Date(reg.event?.date).toDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {new Date(reg.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(reg._id)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden w-full space-y-4">
            {registrations.map((reg) => (
              <div
                key={reg._id}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3"
              >
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                  <p className="font-medium text-gray-900 dark:text-white">{reg.user?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{reg.user?.email}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Event</p>
                  <p className="font-medium text-gray-900 dark:text-white">{reg.event?.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(reg.event?.date).toDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Registered At</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(reg.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(reg._id)}
                  className="w-full mt-2 h-11 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  Delete Registration
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRegistrations;