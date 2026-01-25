import dayjs from "dayjs";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

const MyEventCard = ({ event }) => {
  // 🔥 FIX: backend sends registration object, real event is nested
  const actualEvent = event.event || event;
  const isPastEvent = dayjs(actualEvent.date).isBefore(dayjs(), "day");
  const isFull = actualEvent.availableSeats === 0;

  let statusLabel = "Upcoming";
  let statusClasses = "bg-gray-100 text-gray-700";

  if (isPastEvent || actualEvent.status === "completed") {
    statusLabel = "Completed";
    statusClasses = "bg-green-100 text-green-700";
  } else if (isFull) {
    statusLabel = "Full";
    statusClasses = "bg-red-100 text-red-700";
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Banner */}
      <img
        src={actualEvent.banner || "https://via.placeholder.com/600x400"}
        alt={actualEvent.title}
        className="w-full h-48 object-cover"
      />

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {actualEvent.title}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2">
          {actualEvent.description}
        </p>

        {/* Date & Location */}
        <div className="flex my-3 items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-600" />
            <span>{dayjs(actualEvent.date).format("DD MMM YYYY")}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-600" />
            <span>{actualEvent.location}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-2">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${statusClasses}`}
          >
            {statusLabel}
          </span>

          <button className="text-sm font-medium text-gray-700 hover:underline">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyEventCard;