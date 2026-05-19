import { FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import dayjs from "dayjs";

const EventCard = ({ event, onRegister }) => {
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
  let statusClasses = "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";

  if (isPastEvent || status === "completed") {
    statusLabel = "Completed";
    statusClasses = "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400";
  } else if (isFull) {
    statusLabel = "Full";
    statusClasses = "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400";
  }

  const isDisabled = statusLabel !== "Upcoming";

  return (
    <div className="w-full flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg dark:shadow-none dark:border dark:border-gray-800 transition">
      {/* Banner */}
      <img
        src={banner}
        alt={title}
        className="h-48 w-full object-cover"
      />

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 p-5">
        <div className="space-y-3">
          {/* Status Badge */}
          <span
            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusClasses}`}
          >
            {statusLabel}
          </span>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-600 dark:text-gray-500" />
              <span>{dayjs(date).format("DD MMM YYYY")}</span>
            </div>

            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-600 dark:text-gray-500" />
              <span>{location}</span>
            </div>

            <div className="flex items-center gap-2">
              <FaUsers className="text-gray-600 dark:text-gray-500" />
              <span>
                {availableSeats} / {totalSeats} seats available
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled={isDisabled}
          onClick={onRegister}
          className={`w-full h-10 mt-4 rounded-md text-sm font-medium transition
            ${
              isDisabled
                ? "bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-500 cursor-not-allowed"
                : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200"
            }`}
        >
          {statusLabel === "Upcoming"
            ? "Register Now"
            : "Registration Closed"}
        </button>
      </div>
    </div>
  );
};

export default EventCard;