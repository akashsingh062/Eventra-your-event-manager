import { FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router-dom";

const EventCard = ({ event, onRegister, isListView = false }) => {
  const navigate = useNavigate();
  const {
    title,
    description,
    date,
    location,
    availableSeats,
    totalSeats,
    banner,
    status,
  } = event;

  const isPastEvent = dayjs(date).isBefore(dayjs(), "day");
  const isFull = availableSeats === 0;

  let statusLabel = "Upcoming";

  if (isPastEvent || status === "completed") {
    statusLabel = "Completed";
  } else if (isFull) {
    statusLabel = "Full";
  }

  const isDisabled = statusLabel !== "Upcoming";

  const handleCardClick = () => {
    navigate(`/events/${event._id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group w-full flex bg-white dark:bg-navy-200 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-400/30 overflow-hidden hover:shadow-xl dark:hover:shadow-navy-100/50 hover:border-steel-700 dark:hover:border-steel-300/30 transition-all duration-300 cursor-pointer
        ${isListView ? "flex-col md:flex-row h-auto" : "flex-col h-full"}
      `}
    >
      {/* Banner */}
      <div className={`relative overflow-hidden ${isListView ? "md:w-1/3 h-56 md:h-auto" : "h-56"}`}>
        <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
        <img
          src={banner}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 z-20">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md ${
              event.isFree
                ? "bg-steel-800/80 text-white border border-white/10"
                : "bg-amber-500/90 text-white border border-amber-400/20"
            }`}
          >
            {event.isFree ? "Free" : `₹${event.price}`}
          </span>
        </div>
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
      <div className="flex flex-col justify-between flex-1 p-6">
        <div className="space-y-4">
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-cream-500 group-hover:text-navy-600 dark:group-hover:text-steel-500 transition-colors">
            {title}
          </h2>

          {/* Description */}
          <p className={`text-sm text-gray-600 dark:text-steel-500 ${isListView ? "line-clamp-2 md:line-clamp-3" : "line-clamp-3"}`}>
            {description}
          </p>

          {/* Meta Info */}
          <div className={`flex flex-col gap-3 text-sm text-gray-500 dark:text-steel-500 border-t border-gray-100 dark:border-navy-400/30 pt-5 ${isListView ? "md:flex-row md:flex-wrap md:border-t-0 md:pt-2 md:gap-x-6 md:gap-y-3" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-navy-500/10 dark:bg-navy-500/20 flex items-center justify-center text-navy-600 dark:text-steel-500">
                <FaCalendarAlt />
              </div>
              <span className="font-medium">{dayjs(date).format("DD MMM YYYY")}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-steel-900 dark:bg-steel-300/20 flex items-center justify-center text-steel-400 dark:text-steel-500">
                <FaMapMarkerAlt />
              </div>
              <span className="font-medium truncate">{location}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brick-900/30 dark:bg-brick-500/10 flex items-center justify-center text-brick-500 dark:text-brick-700">
                <FaUsers />
              </div>
              <span className="font-medium">
                {availableSeats} / {totalSeats} seats available
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className={`flex gap-3 border-gray-50 dark:border-navy-400/30 
          ${isListView ? "mt-4 md:mt-0 md:pt-0 pt-5 border-t md:border-t-0 md:flex-col justify-center min-w-[140px]" : "mt-6 pt-5 border-t"}
        `}>
          <Link
            to={`/events/${event._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Details
          </Link>
          <button
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              onRegister();
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
              ${
                isDisabled
                  ? "bg-gray-100 dark:bg-navy-400/30 text-gray-400 dark:text-steel-400 cursor-not-allowed border border-transparent"
                  : "bg-brick-500 text-white hover:bg-brick-400 shadow-md shadow-brick-500/20 dark:shadow-none border border-transparent"
              }`}
          >
            {statusLabel === "Upcoming"
              ? "Register"
              : "Closed"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;