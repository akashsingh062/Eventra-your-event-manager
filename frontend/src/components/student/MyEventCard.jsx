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
      className="group bg-white dark:bg-navy-200 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-400/30 overflow-hidden hover:shadow-xl dark:hover:shadow-navy-100/50 hover:border-steel-700 dark:hover:border-steel-300/30 transition-all duration-300 flex flex-col h-full cursor-pointer"
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
              statusLabel === "Full" ? "bg-brick-500/90 text-white" :
              "bg-cream-500/90 text-navy-500 dark:bg-navy-300/90 dark:text-cream-500"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 dark:text-cream-500 group-hover:text-navy-600 dark:group-hover:text-steel-500 transition-colors mb-3">
          {actualEvent.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-steel-500 line-clamp-2 mb-6">
          {actualEvent.description}
        </p>

        {/* Date & Location */}
        <div className="mt-auto flex flex-col gap-3 text-sm text-gray-500 dark:text-steel-500 border-t border-gray-100 dark:border-navy-400/30 pt-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy-500/10 dark:bg-navy-500/20 flex items-center justify-center text-navy-600 dark:text-steel-500">
              <FaCalendarAlt />
            </div>
            <span className="font-medium">{dayjs(actualEvent.date).format("DD MMM YYYY")}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-steel-900 dark:bg-steel-300/20 flex items-center justify-center text-steel-400 dark:text-steel-500">
              <FaMapMarkerAlt />
            </div>
            <span className="font-medium truncate">{actualEvent.location}</span>
          </div>
        </div>

        {/* Action */}
        <div className="mt-6 pt-4 border-t border-gray-50 dark:border-navy-400/30">
          <Link
            to={`/events/${actualEvent._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 dark:bg-navy-300/30 hover:bg-navy-500/10 dark:hover:bg-navy-500/20 text-gray-700 dark:text-steel-500 hover:text-navy-600 dark:hover:text-steel-700 text-sm font-semibold rounded-xl transition-colors group/btn"
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