import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import dayjs from "dayjs";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowLeft } from "react-icons/fa";
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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 dark:text-gray-400">{error || "Event not found"}</p>
        <Link to="/events" className="text-blue-600 dark:text-blue-400 hover:underline">
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

  return (
    <div className="bg-transparent pb-16">
      {/* Hero Banner with Overlay */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <img
          src={event.banner || "https://via.placeholder.com/1200x600"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12">
          <Link to="/events" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition w-max mb-6">
            <FaArrowLeft /> Back to Events
          </Link>
          
          <div className="space-y-4 max-w-3xl">
            <span className={`inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border ${
              statusLabel === "Completed" ? "bg-green-500/20 text-green-300 border-green-500/30" :
              statusLabel === "Full" ? "bg-red-500/20 text-red-300 border-red-500/30" :
              "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
            }`}>
              {statusLabel}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Split Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Column - Description */}
          <div className="flex-1 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About This Event</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                <p className="whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Sticky Card */}
          <div className="w-full lg:w-[400px] sticky top-24">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 space-y-8">
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Event Details</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FaCalendarAlt size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Date & Time</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                      {dayjs(event.date).format("dddd, MMMM D, YYYY")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <FaMapMarkerAlt size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Location</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                    <FaUsers size={20} />
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Availability</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{event.availableSeats} left</p>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full ${
                          event.availableSeats < 10 ? 'bg-red-500' : 'bg-pink-500'
                        }`}
                        style={{ width: `${(1 - (event.availableSeats / event.totalSeats)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">{event.totalSeats} Total Seats</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  disabled={isDisabled}
                  onClick={() => registerForEvent(event._id)}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 ${
                    isDisabled
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl"
                  }`}
                >
                  {statusLabel === "Upcoming" ? "Register Now" : "Registration Closed"}
                </button>
                {statusLabel === "Upcoming" && (
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                    By registering, you agree to the campus event policies.
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetails;
