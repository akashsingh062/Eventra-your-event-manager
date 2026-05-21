import { useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUsers,
  FaArrowRight,
  FaBolt,
  FaShieldAlt,
  FaRocket,
  FaUserGraduate,
  FaTicketAlt,
  FaSearch,
  FaMapMarkerAlt,
} from "react-icons/fa";
import dayjs from "dayjs";
import { useEvent } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/student/EventCard";
import MyEventCard from "../components/student/MyEventCard";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    events,
    fetchEvents,
    registerForEvent,
    myRegistrations,
    fetchMyRegistrations,
    eventsLoading: loading,
  } = useEvent();

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchMyRegistrations();
    }
  }, [user, fetchEvents, fetchMyRegistrations]);

  const upcomingEvents = events.filter((event) => {
    const isPast = dayjs(event.date).isBefore(dayjs(), "day");
    return !isPast && event.status !== "completed";
  });

  const upcomingRegistrations = myRegistrations.filter((reg) => {
    const actualEvent = reg.event || reg;
    const isPast = dayjs(actualEvent.date).isBefore(dayjs(), "day") || actualEvent.status === "completed";
    return !isPast;
  });

  const sortedUpcomingRegistrations = [...upcomingRegistrations].sort((a, b) => {
    const dateA = new Date((a.event || a).date);
    const dateB = new Date((b.event || b).date);
    return dateA - dateB;
  });

  const nextEventRegistration = sortedUpcomingRegistrations[0];
  const nextEvent = nextEventRegistration ? (nextEventRegistration.event || nextEventRegistration) : null;

  const recommendedEvents = events.filter((event) => {
    const isPast = dayjs(event.date).isBefore(dayjs(), "day") || event.status === "completed";
    const alreadyRegistered = myRegistrations.some(
      (reg) => (reg.event?._id || reg.event) === event._id
    );
    return !isPast && !alreadyRegistered;
  });

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user) {
    const greeting = getGreeting();
    return (
      <div className="bg-transparent min-h-screen text-gray-900 dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          
          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-navy-200 via-navy-300 to-navy-400 shadow-2xl p-8 md:p-12">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-steel-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-navy-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-semibold text-cream-300">
                  <FaUserGraduate className="text-sm" /> Student Dashboard
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {greeting}, <span className="text-transparent bg-clip-text bg-linear-to-r from-cream-400 to-cream-300">{user.name}</span>!
                </h1>
                <p className="text-steel-700 max-w-xl font-light text-base md:text-lg opacity-90">
                  Welcome to your campus hub. Here's a quick look at your events schedule and recommendations.
                </p>
              </div>
              <div className="flex gap-4 shrink-0">
                <Link
                  to="/events"
                  className="px-6 py-3 bg-brick-500 hover:bg-brick-400 text-white font-semibold rounded-2xl shadow-lg shadow-brick-500/25 transition-all flex items-center gap-2 hover:scale-102 active:scale-98"
                >
                  <FaSearch /> Explore Events
                </Link>
                <Link
                  to="/my-tickets"
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white border border-white/20 hover:border-white/40 font-semibold rounded-2xl transition-all flex items-center gap-2 hover:scale-102 active:scale-98"
                >
                  <FaTicketAlt /> My Tickets
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Metrics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-navy-200 p-6 rounded-2xl border border-gray-150 dark:border-navy-400/30 flex items-center gap-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-cream-700/10 dark:bg-cream-100/10 flex items-center justify-center text-cream-650 dark:text-cream-400 text-2xl">
                <FaTicketAlt />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{myRegistrations.length}</p>
                <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Registered Events</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-navy-200 p-6 rounded-2xl border border-gray-150 dark:border-navy-400/30 flex items-center gap-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl">
                <FaCalendarAlt />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{upcomingRegistrations.length}</p>
                <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Upcoming Schedule</p>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-200 p-6 rounded-2xl border border-gray-150 dark:border-navy-400/30 flex items-center gap-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-brick-500/10 flex items-center justify-center text-brick-500 text-2xl">
                <FaUsers />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{events.length}</p>
                <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Total Active Events</p>
              </div>
            </div>
          </section>

          {/* Core Content Layout: Left side for Next Event & Registered, Right side for Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left columns (Next Event + Upcoming Schedule) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Next Event section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brick-500"></span> Up Next
                </h2>
                
                {nextEvent ? (
                  <div className="group relative overflow-hidden rounded-3xl bg-linear-to-r from-navy-400 to-navy-500 dark:from-navy-200 dark:to-navy-300 border border-white/10 dark:border-navy-400/30 shadow-xl flex flex-col md:flex-row">
                    {/* Event Banner */}
                    <div className="md:w-2/5 h-48 md:h-auto relative overflow-hidden">
                      <img
                        src={nextEvent.banner || "https://via.placeholder.com/600x400"}
                        alt={nextEvent.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-brick-500 text-white text-xs font-bold rounded-full shadow-md">
                          {nextEvent.isFree ? "Free" : `₹${nextEvent.price}`}
                        </span>
                      </div>
                    </div>
                    
                    {/* Event Details */}
                    <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-between text-white space-y-4">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-cream-500/20 text-cream-300 px-2.5 py-1 rounded-full">
                          Your Next Event
                        </span>
                        <h3 className="text-2xl font-bold mt-2 group-hover:text-cream-300 transition-colors">
                          {nextEvent.title}
                        </h3>
                        <p className="text-steel-605 dark:text-steel-400 text-sm line-clamp-2 mt-2 font-light">
                          {nextEvent.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-steel-750 dark:text-steel-500 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-cream-300" />
                          <span>{dayjs(nextEvent.date).format("DD MMM YYYY [at] hh:mm A")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-cream-300" />
                          <span className="truncate max-w-[150px]">{nextEvent.location}</span>
                        </div>
                      </div>

                      <Link
                        to={`/events/${nextEvent._id}`}
                        className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white text-sm font-semibold rounded-xl transition-all"
                      >
                        View Ticket & Details <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-navy-200 p-8 rounded-3xl border border-gray-150 dark:border-navy-400/30 text-center space-y-4 shadow-xs">
                    <p className="text-gray-500 dark:text-steel-500">You don't have any upcoming registered events.</p>
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-2 text-brick-500 hover:text-brick-400 font-bold transition-all"
                    >
                      Find your first event <FaArrowRight />
                    </Link>
                  </div>
                )}
              </div>

              {/* Registered Events (Schedule) Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Registered Events</h2>
                  {myRegistrations.length > 3 && (
                    <Link to="/my-tickets" className="text-sm font-semibold text-brick-500 hover:text-brick-400 transition-colors">
                      View All
                    </Link>
                  )}
                </div>

                {upcomingRegistrations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {upcomingRegistrations.slice(0, 4).map((reg) => (
                      <MyEventCard key={reg._id} event={reg} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-navy-300/10 rounded-2xl border border-dashed border-gray-200 dark:border-navy-400/20">
                    <p className="text-gray-500 dark:text-steel-500">No upcoming registrations found.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Right column: Recommendations */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaBolt className="text-cream-500" /> Recommended Events
              </h2>
              
              {recommendedEvents.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {recommendedEvents.slice(0, 4).map((event) => (
                    <div
                      key={event._id}
                      onClick={() => navigate(`/events/${event._id}`)}
                      className="group cursor-pointer bg-white dark:bg-navy-200 p-4 rounded-2xl border border-gray-150 dark:border-navy-400/30 flex gap-4 hover:shadow-lg transition-all"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={event.banner || "https://via.placeholder.com/150"}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex flex-col justify-between overflow-hidden">
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-900 dark:text-cream-500 group-hover:text-navy-600 dark:group-hover:text-steel-500 transition-colors line-clamp-1 font-semibold">
                            {event.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-steel-500 flex items-center gap-1">
                            <FaCalendarAlt /> {dayjs(event.date).format("DD MMM YYYY")}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-brick-500">
                            {event.isFree ? "Free" : `₹${event.price}`}
                          </span>
                          <span className="text-[10px] text-gray-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Register <FaArrowRight />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-navy-300/10 rounded-2xl border border-dashed border-gray-200 dark:border-navy-400/20">
                  <p className="text-gray-500 dark:text-steel-500">No new events to recommend right now.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent">

      {/* ──── Hero Section ──── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-navy-100 via-navy-200 to-navy-300 z-0"></div>
        {/* Decorative blobs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-navy-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-steel-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brick-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 z-0"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWNkgyVjRoMzR6TTYgMzR2LTJIMlYyaDR2MzJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] z-0 opacity-50"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-36 lg:py-44">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-8">
              <span className="w-2 h-2 bg-cream-300 rounded-full animate-pulse"></span>
              <span className="text-sm text-steel-700 font-medium">Your campus event hub</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
              Discover & Join{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cream-400 via-cream-300 to-brick-700">
                Amazing Events
              </span>{" "}
              on Campus
            </h1>

            <p className="text-lg md:text-xl text-steel-600 leading-relaxed mb-10 max-w-2xl font-light">
              From workshops and hackathons to cultural nights and guest lectures —
              explore everything happening around you and register in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/events"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-brick-500 hover:bg-brick-400 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-brick-500/25 transition-all"
              >
                Explore Events
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white rounded-2xl font-semibold text-lg border border-white/20 hover:border-white/40 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 mt-16 pt-10 border-t border-white/10">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-cream-500">{events.length}+</p>
                <p className="text-sm text-steel-500 mt-1">Total Events</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-cream-500">{upcomingEvents.length}</p>
                <p className="text-sm text-steel-500 mt-1">Upcoming</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-cream-500">100%</p>
                <p className="text-sm text-steel-500 mt-1">Free Access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Features Section ──── */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-brick-500 dark:text-brick-700 tracking-wider uppercase mb-3">
            Why Eventra?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-cream-500">
            Everything you need in one place
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaBolt className="text-cream-200" />,
              bg: "bg-cream-700 dark:bg-cream-100/10",
              title: "Instant Registration",
              desc: "Register for any event with a single click. No forms, no hassle — just tap and you're in.",
            },
            {
              icon: <FaCalendarAlt className="text-navy-600" />,
              bg: "bg-steel-900 dark:bg-navy-500/20",
              title: "Real-Time Updates",
              desc: "Stay in sync with live seat availability, event statuses, and any schedule changes.",
            },
            {
              icon: <FaShieldAlt className="text-brick-500" />,
              bg: "bg-brick-900/30 dark:bg-brick-500/10",
              title: "Secure & Reliable",
              desc: "Your registrations are safe. Authentication-backed system ensures only verified students join.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group bg-white dark:bg-navy-200 rounded-3xl p-8 border border-gray-100 dark:border-navy-400/30 hover:border-steel-700 dark:hover:border-steel-300/30 hover:shadow-xl dark:hover:shadow-navy-100/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center text-xl mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-cream-500 mb-3 group-hover:text-navy-600 dark:group-hover:text-steel-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-steel-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──── Featured Events ──── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <p className="text-sm font-semibold text-brick-500 dark:text-brick-700 tracking-wider uppercase mb-3">
              Don't miss out
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-cream-500">
              Upcoming Events
            </h2>
            <p className="text-gray-600 dark:text-steel-500 mt-2">
              Here's what's happening on campus soon — grab your spot!
            </p>
          </div>
          <Link
            to="/events"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-navy-500/10 dark:bg-navy-500/20 text-navy-600 dark:text-steel-500 hover:bg-navy-500/20 dark:hover:bg-navy-500/30 rounded-xl font-semibold text-sm transition-all shrink-0"
          >
            View All Events
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-steel-500 font-medium">Loading events...</p>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.slice(0, 6).map((event, index) => (
              <div
                key={event._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
              >
                <EventCard
                  event={event}
                  onRegister={() => registerForEvent(event._id)}
                  isRegistered={myRegistrations.some(
                    (reg) => (reg.event?._id || reg.event) === event._id
                  )}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white dark:bg-navy-200 border border-gray-100 dark:border-navy-400/30 rounded-3xl py-24 shadow-sm max-w-2xl mx-auto">
            <div className="text-steel-700 dark:text-steel-300 mb-6 flex justify-center">
              <FaCalendarAlt className="w-14 h-14" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-cream-500 mb-2">No Upcoming Events</h3>
            <p className="text-gray-500 dark:text-steel-500 max-w-md mx-auto">
              There are no upcoming events at the moment. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* ──── CTA Section ──── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-navy-500 to-navy-300"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWNkgyVjRoMzR6TTYgMzR2LTJIMlYyaDR2MzJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to explore campus life?
          </h2>
          <p className="text-lg text-steel-700 mb-10 max-w-2xl mx-auto font-light">
            Join students who are already using Eventra to discover, register, and never miss out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-brick-500 hover:bg-brick-400 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-brick-500/25 transition-all"
            >
              <FaRocket />
              Create Free Account
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white rounded-2xl font-semibold text-lg border border-white/20 hover:border-white/40 transition-all"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-gray-500 dark:text-steel-400">
          © {new Date().getFullYear()} Eventra. Built for campus communities.
        </p>
      </footer>
    </div>
  );
};

export default Home;
