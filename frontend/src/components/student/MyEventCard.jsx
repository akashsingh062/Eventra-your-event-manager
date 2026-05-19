import dayjs from "dayjs";
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const MyEventCard = ({ event }) => {
  const navigate = useNavigate();
  // 🔥 FIX: backend sends registration object, real event is nested
  const actualEvent = event.event || event;
  const isPastEvent = dayjs(actualEvent.date).isBefore(dayjs(), "day");
  const isFull = actualEvent.availableSeats === 0;

  let statusLabel = "Upcoming";

  if (isPastEvent || actualEvent.status === "completed") {
    statusLabel = "Completed";
  } else if (isFull) {
    statusLabel = "Full";
  }

  const handleCardClick = () => {
    navigate(`/events/${actualEvent._id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/50 hover:border-teal-200 dark:hover:border-teal-900/50 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Banner */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
        <img
          src={actualEvent.banner || "https://via.placeholder.com/600x400"}
          alt={actualEvent.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 z-20">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md ${
              statusLabel === "Completed" ? "bg-green-500/90 text-white" :
              statusLabel === "Full" ? "bg-red-500/90 text-white" :
              "bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-white"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-3">
          {actualEvent.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-6">
          {actualEvent.description}
        </p>

        {/* Date & Location */}
        <div className="mt-auto flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <FaCalendarAlt />
            </div>
            <span className="font-medium">{dayjs(actualEvent.date).format("DD MMM YYYY")}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FaMapMarkerAlt />
            </div>
            <span className="font-medium truncate">{actualEvent.location}</span>
          </div>
        </div>

        {/* Action */}
        <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800/50">
          <Link
            to={`/events/${actualEvent._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 text-sm font-semibold rounded-xl transition-colors group/btn"
          >
            View Details
            <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyEventCard;