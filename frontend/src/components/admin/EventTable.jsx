

import dayjs from "dayjs";

const EventTable = ({ events = [], onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Title
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Date
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Location
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Seats
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Status
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {events.length > 0 ? (
            events.map((event) => (
              <tr
                key={event._id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {event.title}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {dayjs(event.date).format("DD MMM YYYY")}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {event.location}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {event.availableSeats} / {event.totalSeats}
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">
                  {event.status}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(event._id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="px-4 py-10 text-center text-gray-500"
              >
                No events found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EventTable;