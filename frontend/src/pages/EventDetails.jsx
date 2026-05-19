import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import dayjs from "dayjs";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaClock, FaCheckCircle } from "react-icons/fa";
import { useEvent } from "../context/EventContext";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { registerForEvent } = useEvent();
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/events/${id}`);
        setEvent(data);
      } catch (err) {
        setError("Failed to load event details.");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 dark:text-gray-400">{error || "Event not found"}</p>
        <Link to="/events" className="text-navy-600 dark:text-steel-500 hover:underline font-medium">
          Back to Events
        </Link>
      </div>
    );
  }

  const isPastEvent = dayjs(event.date).isBefore(dayjs(), "day");
  const isFull = event.availableSeats === 0;

  let statusLabel = "Upcoming";
  if (isPastEvent || event.status === "completed") {
    statusLabel = "Completed";
  } else if (isFull) {
    statusLabel = "Full";
  }

  const isDisabled = statusLabel !== "Upcoming";
  const seatPercent = event.totalSeats > 0 ? ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100 : 0;

  return (
    <div className="bg-transparent pb-20">
      {/* Hero Banner */}
      <div className="relative w-full h-[420px] md:h-[520px]">
        <img
          src={event.banner || "https://via.placeholder.com/1200x600"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay using navy tones */}
        <div className="absolute inset-0 bg-linear-to-t from-navy-100 via-navy-200/80 to-transparent"></div>

        <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-end pb-14">
          <Link to="/events" className="inline-flex items-center gap-2 text-sm text-steel-700 hover:text-white transition w-max mb-6">
            <FaArrowLeft /> Back to Events
          </Link>

          <div className="space-y-4 max-w-3xl">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border ${
              statusLabel === "Completed" ? "bg-green-500/20 text-green-300 border-green-500/30" :
              statusLabel === "Full" ? "bg-brick-500/30 text-brick-900 border-brick-500/30" :
              "bg-steel-500/20 text-steel-900 border-steel-500/30"
            }`}>
              {statusLabel === "Completed" ? <FaCheckCircle /> : statusLabel === "Full" ? <FaUsers /> : <FaClock />}
              {statusLabel}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
              {event.title}
            </h1>
            {/* Quick meta pills */}
            <div className="flex flex-wrap gap-4 pt-2">
              <span className="inline-flex items-center gap-2 text-sm text-cream-500 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                <FaCalendarAlt className="text-cream-400" />
                {dayjs(event.date).format("DD MMM YYYY")}
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-cream-500 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                <FaMapMarkerAlt className="text-cream-400" />
                {event.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Left Column - About */}
          <div className="flex-1 space-y-8">
            <div className="bg-white dark:bg-navy-200 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-navy-400/30">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-cream-500 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-brick-500 rounded-full"></span>
                About This Event
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-600 dark:text-steel-700 text-[15px]">
                {event.description}
              </p>
            </div>

            {/* Additional Info Card */}
            <div className="bg-white dark:bg-navy-200 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-navy-400/30">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-cream-500 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-navy-500 rounded-full"></span>
                Event Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-steel-500 font-medium uppercase tracking-wider mb-1">Organized By</p>
                  <p className="font-semibold text-gray-900 dark:text-cream-500">{event.createdBy?.name || "Admin"}</p>
                </div>
                <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-steel-500 font-medium uppercase tracking-wider mb-1">Total Capacity</p>
                  <p className="font-semibold text-gray-900 dark:text-cream-500">{event.totalSeats} seats</p>
                </div>
                <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-steel-500 font-medium uppercase tracking-wider mb-1">Event Status</p>
                  <p className="font-semibold text-gray-900 dark:text-cream-500 capitalize">{event.status}</p>
                </div>
                <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-steel-500 font-medium uppercase tracking-wider mb-1">Created On</p>
                  <p className="font-semibold text-gray-900 dark:text-cream-500">{dayjs(event.createdAt).format("DD MMM YYYY")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Card */}
          <div className="w-full lg:w-[400px] lg:sticky lg:top-24">
            <div className="bg-white dark:bg-navy-200 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-navy-400/30">

              {/* Card Header */}
              <div className="bg-navy-500 dark:bg-navy-300 px-8 py-6">
                <h3 className="text-xl font-bold text-white">Secure Your Spot</h3>
                <p className="text-steel-700 text-sm mt-1">Register now before seats run out</p>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-navy-500/10 dark:bg-navy-400/20 flex items-center justify-center text-navy-600 dark:text-steel-500 shrink-0">
                      <FaCalendarAlt size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Date & Time</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-cream-500 mt-0.5">
                        {dayjs(event.date).format("dddd, MMMM D, YYYY")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-steel-500/10 dark:bg-steel-400/20 flex items-center justify-center text-steel-400 dark:text-steel-500 shrink-0">
                      <FaMapMarkerAlt size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Location</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-cream-500 mt-0.5">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brick-500/10 dark:bg-brick-500/20 flex items-center justify-center text-brick-500 dark:text-brick-700 shrink-0">
                      <FaUsers size={20} />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Availability</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-cream-500">{event.availableSeats} left</p>
                      </div>
                      {/* Seat Progress Bar */}
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-navy-400/30 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            seatPercent > 80 ? "bg-brick-500" : seatPercent > 50 ? "bg-cream-300" : "bg-steel-500"
                          }`}
                          style={{ width: `${seatPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-steel-400 mt-2 text-right">{event.totalSeats} Total Seats</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-navy-400/30">
                  <button
                    disabled={isDisabled}
                    onClick={() => registerForEvent(event._id)}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 ${
                      isDisabled
                        ? "bg-gray-100 dark:bg-navy-400/30 text-gray-400 dark:text-steel-400 cursor-not-allowed shadow-none"
                        : "bg-brick-500 text-white hover:bg-brick-400 shadow-lg shadow-brick-500/25 dark:shadow-none hover:shadow-xl"
                    }`}
                  >
                    {statusLabel === "Upcoming" ? "Register Now" : "Registration Closed"}
                  </button>
                  {statusLabel === "Upcoming" && (
                    <p className="text-center text-xs text-gray-500 dark:text-steel-400 mt-4">
                      By registering, you agree to the campus event policies.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetails;
