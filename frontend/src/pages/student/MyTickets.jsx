import { useState, useEffect } from "react";
import { useEvent } from "../../context/EventContext";
import MyEventCard from "../../components/student/MyEventCard";
import QRTicket from "../../components/student/QRTicket";
import dayjs from "dayjs";
import { FaTicketAlt, FaCalendarCheck, FaClock, FaCalendarTimes, FaTimes } from "react-icons/fa";

const MyTickets = () => {
  const {
    myRegistrations,
    fetchMyRegistrations,
    registrationsLoading: loading,
  } = useEvent();

  const [activeTab, setActiveTab] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchMyRegistrations();
  }, [fetchMyRegistrations]);

  // Classify registrations
  const classifiedRegistrations = myRegistrations.map((reg) => {
    const actualEvent = reg.event || reg;
    const isPast = dayjs(actualEvent.date).isBefore(dayjs(), "day") || actualEvent.status === "completed";
    let status = "upcoming";

    if (reg.checkedIn) {
      status = "attended";
    } else if (isPast) {
      status = "missed";
    }

    return { ...reg, statusClassified: status };
  });

  // Calculate statistics
  const stats = {
    total: classifiedRegistrations.length,
    upcoming: classifiedRegistrations.filter((r) => r.statusClassified === "upcoming").length,
    attended: classifiedRegistrations.filter((r) => r.statusClassified === "attended").length,
    missed: classifiedRegistrations.filter((r) => r.statusClassified === "missed").length,
  };

  // Filter based on tab
  const filteredTickets = classifiedRegistrations.filter((ticket) => {
    if (activeTab === "all") return true;
    return ticket.statusClassified === activeTab;
  });

  return (
    <div className="bg-transparent min-h-screen text-gray-900 dark:text-gray-100">
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Page Heading Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-navy-200 via-navy-300 to-navy-400 shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-steel-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-navy-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 px-8 py-16 text-center max-w-3xl mx-auto flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-semibold text-cream-300 mb-4">
              <FaTicketAlt /> Entry Passes & QR Codes
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
              My <span className="text-transparent bg-clip-text bg-linear-to-r from-cream-400 to-cream-300">Tickets</span>
            </h1>
            <p className="text-lg text-steel-700 max-w-xl font-light">
              Access your digital ticket passes, check-in status, and event entrance details in one secure place.
            </p>
          </div>
        </section>

        {/* Stats Board */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-navy-200 p-6 rounded-2xl border border-gray-150 dark:border-navy-400/30 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-steel-500">Total Bought</span>
              <div className="w-8 h-8 rounded-lg bg-navy-500/10 flex items-center justify-center text-navy-650 dark:text-steel-500">
                <FaTicketAlt />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.total}</p>
          </div>

          <div className="bg-white dark:bg-navy-200 p-6 rounded-2xl border border-gray-150 dark:border-navy-400/30 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-steel-500">Upcoming</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <FaClock />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.upcoming}</p>
          </div>

          <div className="bg-white dark:bg-navy-200 p-6 rounded-2xl border border-gray-150 dark:border-navy-400/30 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-steel-500">Attended</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FaCalendarCheck />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.attended}</p>
          </div>

          <div className="bg-white dark:bg-navy-200 p-6 rounded-2xl border border-gray-150 dark:border-navy-400/30 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-steel-500">Missed</span>
              <div className="w-8 h-8 rounded-lg bg-brick-500/10 flex items-center justify-center text-brick-500">
                <FaCalendarTimes />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.missed}</p>
          </div>
        </section>

        {/* Filters and Search Tabs */}
        <section className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 dark:border-navy-400/20 pb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Tickets", count: stats.total },
              { id: "upcoming", label: "Upcoming", count: stats.upcoming },
              { id: "attended", label: "Attended", count: stats.attended },
              { id: "missed", label: "Missed", count: stats.missed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-navy-500 text-white dark:bg-steel-500 dark:text-navy-100"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-300/30"
                }`}
              >
                {tab.label} <span className="text-xs opacity-75 font-normal ml-1">({tab.count})</span>
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your tickets...</p>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTickets.map((ticket) => (
                <MyEventCard
                  key={ticket._id}
                  event={ticket}
                  onViewTicket={(t) => setSelectedTicket(t)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center bg-white dark:bg-navy-200 border border-gray-200 dark:border-navy-400/30 rounded-3xl py-24 shadow-sm max-w-2xl mx-auto">
              <div className="text-steel-500/50 mb-6 flex justify-center">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Tickets Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                No tickets found matching your selection. Get ready to experience epic campus events!
              </p>
              <a href="/events" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-brick-500 hover:bg-brick-400 transition-colors">
                Browse Events
              </a>
            </div>
          )}
        </section>

      </div>

      {/* QR Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Glassmorphic Backdrop */}
          <div
            onClick={() => setSelectedTicket(null)}
            className="fixed inset-0 bg-navy-100/60 dark:bg-navy-100/80 backdrop-blur-md transition-opacity"
          ></div>

          {/* Modal Container */}
          <div className="relative bg-white dark:bg-navy-200 border border-gray-150 dark:border-navy-400/50 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg mx-auto z-10 animate-fade-in-up">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-navy-300/30 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            {/* Modal Heading */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                Your Entry Pass
              </h2>
              <p className="text-sm text-gray-500 dark:text-steel-500 mt-1">
                Scan this at the entrance or download for offline access
              </p>
            </div>

            {/* QRTicket Component */}
            <div className="py-2">
              <QRTicket
                event={selectedTicket.event}
                registration={selectedTicket}
                qrPayload={selectedTicket.qrPayload}
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyTickets;
