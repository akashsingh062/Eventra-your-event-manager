import { useEffect, useState } from "react";
import { useEvent } from "../../context/EventContext";
import EventCard from "../../components/student/EventCard";
import { FaSearch, FaFilter, FaThLarge, FaList } from "react-icons/fa";
import dayjs from "dayjs";

const Events = () => {
  const {
    events,
    fetchEvents,
    registerForEvent,
    loading,
  } = useEvent();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'upcoming', 'completed'
  const [viewMode, setViewMode] = useState("grid"); // 'grid', 'list'

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterStatus === "all") return true;

    const isPast = dayjs(event.date).isBefore(dayjs(), "day") || event.status === "completed";

    if (filterStatus === "upcoming") {
      return !isPast;
    } else if (filterStatus === "completed") {
      return isPast;
    }
    
    return true;
  });

  return (
    <div className="bg-transparent">
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        
        {/* Hero / Banner Section */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-navy-200 via-navy-300 to-navy-400 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-steel-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-navy-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 px-6 py-16 md:px-12 md:py-24 text-center max-w-4xl mx-auto flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-sm">
              Discover <span className="text-transparent bg-clip-text bg-linear-to-r from-cream-400 to-brick-700">Campus Events</span>
            </h1>

            <p className="text-lg md:text-xl text-steel-700 max-w-2xl mb-10 font-light">
              Explore upcoming workshops, tech fests, cultural nights, and talks.
              Register easily and never miss an opportunity to connect and grow.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-md relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cream-300 transition-colors">
                <FaSearch />
              </div>
              <input
                type="text"
                placeholder="Search events by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-steel-600 focus:outline-none focus:ring-2 focus:ring-cream-400 focus:bg-white/20 shadow-inner transition-all"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {['all', 'upcoming', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    filterStatus === status
                      ? "bg-cream-500 text-navy-500 shadow-lg shadow-cream-500/20 scale-105"
                      : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} Events
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                {filterStatus === "all" ? (searchQuery ? "Search Results" : "All Events") : `${filterStatus} Events`}
              </h2>
              <span className="px-4 py-1.5 rounded-full bg-navy-500/10 dark:bg-navy-500/20 text-navy-600 dark:text-steel-500 text-sm font-semibold">
                {filteredEvents.length} Events
              </span>
            </div>

            {/* View Mode Toggles */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 text-navy-600 dark:text-steel-500 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
                title="Grid View"
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-navy-600 dark:text-steel-500 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
                title="List View"
              >
                <FaList />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex flex-col gap-6 max-w-5xl mx-auto"
            }>
              {filteredEvents.map((event, index) => (
                <div 
                  key={event._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                >
                  <EventCard
                    event={event}
                    onRegister={() => registerForEvent(event._id)}
                    isListView={viewMode === "list"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl py-24 shadow-sm">
              <div className="text-gray-400 dark:text-gray-600 mb-4 flex justify-center">
                <FaSearch className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? `We couldn't find any events matching "${searchQuery}".` : "There are currently no upcoming events."}
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Events;
