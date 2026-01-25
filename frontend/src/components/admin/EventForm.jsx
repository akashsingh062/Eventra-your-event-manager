const EventForm = ({
  title,
  setTitle,
  date,
  setDate,
  location,
  setLocation,
  totalSeats,
  setTotalSeats,
  banner,
  setBanner,
  description,
  setDescription,
  onSubmit,
  submitting = false,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
    >
      <input
        type="text"
        placeholder="Event title"
        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="date"
        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Location"
        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Total seats"
        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
        value={totalSeats}
        onChange={(e) => setTotalSeats(e.target.value)}
        required
      />
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Banner
        </label>
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-medium
                     file:bg-gray-100 file:text-gray-700
                     hover:file:bg-gray-200"
          onChange={(e) => setBanner(e.target.files[0])}
        />
      </div>

      <textarea
        placeholder="Event description"
        className="md:col-span-2 min-h-28 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="h-12 w-full md:w-auto px-6 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save Event"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;