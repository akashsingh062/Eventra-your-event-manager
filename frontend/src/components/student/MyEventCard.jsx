import dayjs from "dayjs";
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const MyEventCard = ({ event, onViewTicket }) => {
  const navigate = useNavigate();
  // 🔥 FIX: backend sends registration object, real event is nested
  const actualEvent = event.event || event;
  const isPastEvent = dayjs(actualEvent.date).isBefore(dayjs(), "day");
  let ticketStatusText = "Upcoming";
  let ticketStatusClass = "bg-navy-500/90 text-white border border-white/10";

  if (event.checkedIn) {
    ticketStatusText = "Attended";
    ticketStatusClass = "bg-emerald-600/90 text-white border border-emerald-500/20";
  } else if (isPastEvent || actualEvent.status === "completed") {
    ticketStatusText = "Missed";
    ticketStatusClass = "bg-brick-600/95 text-white border border-brick-500/20";
  }

  const handleCardClick = () => {
    if (onViewTicket) {
      onViewTicket(event);
    } else {
      navigate(`/events/${actualEvent._id}`);
    }
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
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md ${
              actualEvent.isFree
                ? "bg-steel-800/80 text-white border border-white/10"
                : "bg-amber-500/90 text-white border border-amber-400/20"
            }`}
          >
            {actualEvent.isFree ? "Free" : `₹${actualEvent.price}`}
          </span>
          {event.paymentStatus && (
            <span
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full shadow-sm backdrop-blur-md ${
                event.paymentStatus === "paid" ? "bg-green-600/90 text-white" :
                event.paymentStatus === "free" ? "bg-blue-600/90 text-white" :
                "bg-red-500/90 text-white"
              }`}
            >
              {event.paymentStatus}
            </span>
          )}
          {event.numberOfPeople && event.numberOfPeople > 1 && (
            <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full shadow-sm backdrop-blur-md bg-purple-600/90 text-white">
              👥 Group of {event.numberOfPeople}
            </span>
          )}
          {event.couponCode && (
            <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full shadow-sm backdrop-blur-md bg-indigo-600/90 text-white">
              🏷️ {event.couponCode}
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md ${ticketStatusClass}`}
          >
            {ticketStatusText}
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
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-navy-400/30 flex gap-3">
          <Link
            to={`/events/${actualEvent._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 bg-gray-50 dark:bg-navy-300/30 hover:bg-navy-500/10 dark:hover:bg-navy-500/20 text-gray-700 dark:text-steel-600 hover:text-navy-600 dark:hover:text-steel-750 text-xs font-bold rounded-xl transition-colors"
          >
            Details
          </Link>
          {onViewTicket && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewTicket(event);
              }}
              className="flex items-center justify-center gap-1.5 flex-1 py-2.5 bg-brick-500 hover:bg-brick-400 text-white text-xs font-bold rounded-xl shadow-md shadow-brick-500/10 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              View Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEventCard;