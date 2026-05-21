import { useEffect, useState } from "react";
import { FaTrash, FaSearch, FaUsers, FaCalendarAlt } from "react-icons/fa";
import dayjs from "dayjs";
import api from "../../services/api";
import { toast } from "react-toastify";

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRegistrations = async () => {
    try {
      const { data } = await api.get("/api/admin/registrations");
      setRegistrations(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (reg) => {
    setSelectedReg(reg);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (refunded) => {
    if (!selectedReg) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/registrations/${selectedReg._id}?refunded=${refunded}`);
      setRegistrations((prev) => prev.filter((item) => item._id !== selectedReg._id));
      toast.success("Registration removed successfully");
      setShowDeleteModal(false);
      setSelectedReg(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete registration");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter((reg) => {
    const q = searchQuery.toLowerCase();
    return (
      reg.user?.name?.toLowerCase().includes(q) ||
      reg.user?.email?.toLowerCase().includes(q) ||
      reg.event?.title?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading registrations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 bg-transparent">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registrations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all student event registrations
          </p>
        </div>
        <span className="px-4 py-1.5 rounded-full bg-steel-900 dark:bg-steel-300/20 text-steel-300 dark:text-steel-500 text-sm font-semibold">
          {registrations.length} Total
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <FaSearch />
        </div>
        <input
          type="text"
          placeholder="Search by student name, email, or event..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-navy-200 border border-gray-200 dark:border-navy-400/30 text-gray-900 dark:text-cream-500 placeholder-gray-400 dark:placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition-all text-sm"
        />
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl py-24 shadow-sm max-w-2xl mx-auto">
          <div className="text-steel-700 dark:text-steel-300 mb-6 flex justify-center">
            <FaUsers className="w-14 h-14" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {searchQuery ? "No Matches Found" : "No Registrations"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery
              ? `No registrations match "${searchQuery}".`
              : "No students have registered for events yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                    Check-In
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredRegistrations.map((reg) => (
                  <tr
                    key={reg._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{reg.user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{reg.user?.email}</p>
                        {reg.numberOfPeople && reg.numberOfPeople > 1 && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 rounded-full">
                            👥 Group of {reg.numberOfPeople}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{reg.event?.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(reg.event?.date).format("DD MMM YYYY")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                            reg.paymentStatus === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                            reg.paymentStatus === "free" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                          }`}
                        >
                          {reg.paymentStatus || "free"}
                        </span>
                        {reg.couponCode && (
                          <div className="text-[11px] font-bold text-green-600 dark:text-green-400">
                            Code: {reg.couponCode} (-₹{reg.discountAmount})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                          reg.checkedIn
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {reg.checkedIn ? "Checked In" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {dayjs(reg.createdAt).format("DD MMM YYYY, h:mm A")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteClick(reg)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                      >
                        <FaTrash /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredRegistrations.map((reg) => (
              <div
                key={reg._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4"
              >
                {/* Student */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-steel-300 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    {reg.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{reg.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{reg.user?.email}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaCalendarAlt className="text-navy-600 text-xs" />
                    <span className="font-medium text-gray-900 dark:text-white">{reg.event?.title}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Event Date: {dayjs(reg.event?.date).format("DD MMM YYYY")}</span>
                    <span className="text-gray-500">Joined: {dayjs(reg.createdAt).format("DD MMM YYYY")}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                        reg.paymentStatus === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                        reg.paymentStatus === "free" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      }`}
                    >
                      {reg.paymentStatus || "free"}
                    </span>
                    {reg.numberOfPeople && reg.numberOfPeople > 1 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 rounded-full">
                        👥 {reg.numberOfPeople} seats
                      </span>
                    )}
                    {reg.couponCode && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 rounded-full uppercase">
                        🏷️ {reg.couponCode} (-₹{reg.discountAmount})
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                        reg.checkedIn
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {reg.checkedIn ? "Checked In" : "Pending"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteClick(reg)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <FaTrash className="text-xs" /> Remove Registration
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Delete/Refund Confirmation Modal */}
      {showDeleteModal && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-navy-200 border border-gray-100 dark:border-navy-400/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-navy-400/20 flex justify-between items-center bg-gray-50 dark:bg-navy-300/30">
              <h3 className="font-bold text-gray-900 dark:text-cream-500 text-lg flex items-center gap-2">
                <FaTrash className="text-brick-500" /> Cancel Registration
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReg(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-cream-500 text-lg transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to remove <span className="font-semibold text-gray-900 dark:text-white">{selectedReg.user?.name}</span> from the event <span className="font-semibold text-gray-900 dark:text-white">{selectedReg.event?.title}</span>?
              </p>

              {selectedReg.paymentStatus === "paid" ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
                  <h4 className="font-bold text-amber-800 dark:text-amber-400 text-xs uppercase tracking-wider">
                    Paid Booking Details
                  </h4>
                  <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <p>• Total Paid: <span className="font-bold">₹{selectedReg.amountPaid}</span></p>
                    <p>• Seats Booked: <span className="font-bold">{selectedReg.numberOfPeople || 1} seat(s)</span></p>
                  </div>
                  <p className="text-xs text-amber-600/90 dark:text-amber-400/90 font-medium">
                    Please specify if you have refunded this payment to the student:
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-navy-300/30 border border-gray-200 dark:border-navy-400/20 rounded-2xl text-xs text-gray-500 dark:text-steel-400">
                  This is a free or pending registration. No payment was captured.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-navy-400/20">
                {selectedReg.paymentStatus === "paid" ? (
                  <>
                    <button
                      onClick={() => confirmDelete(true)}
                      disabled={deleting}
                      className="w-full py-3 bg-brick-500 hover:bg-brick-400 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-brick-500/20 dark:shadow-none"
                    >
                      {deleting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Yes, Refund & Cancel"
                      )}
                    </button>
                    <button
                      onClick={() => confirmDelete(false)}
                      disabled={deleting}
                      className="w-full py-3 bg-navy-500 hover:bg-navy-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      No, Cancel & Keep Payment (No Refund)
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => confirmDelete(false)}
                    disabled={deleting}
                    className="w-full py-3 bg-brick-500 hover:bg-brick-400 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-brick-500/20 dark:shadow-none"
                  >
                    {deleting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Confirm Cancel Booking"
                    )}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedReg(null);
                  }}
                  className="w-full py-3 bg-gray-50 dark:bg-navy-300/30 hover:bg-gray-100 text-gray-700 dark:text-cream-500 font-bold rounded-xl text-sm border border-gray-200 dark:border-navy-400/20 transition-all"
                >
                  Close / Keep Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;