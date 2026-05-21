import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUsers, FaArrowRight, FaBolt, FaShieldAlt, FaRocket } from "react-icons/fa";
import dayjs from "dayjs";
import { useEvent } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/student/EventCard";

const Home = () => {
  const { user } = useAuth();
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
  }, [user]);

  const upcomingEvents = events.filter((event) => {
    const isPast = dayjs(event.date).isBefore(dayjs(), "day");
    return !isPast && event.status !== "completed";
  });

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
