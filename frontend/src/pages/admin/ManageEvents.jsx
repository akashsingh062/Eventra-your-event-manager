import { useEffect, useState } from "react";
import api from "../../services/api";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [banner, setBanner] = useState(null);
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/events");
      setEvents(data || []);
    } catch (err) {
      console.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const isEdit = Boolean(editingId);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("totalSeats", Number(totalSeats));
      formData.append("description", description);
      if (banner) {
        formData.append("banner", banner);
      }

      if (isEdit) {
        await api.put(`/api/events/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/events", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setTitle("");
      setDate("");
      setLocation("");
      setTotalSeats("");
      setDescription("");
      setBanner(null);
      setEditingId(null);

      fetchEvents();
    } catch (err) {
      console.error("Failed to create event", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/api/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Failed to delete event");
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setTitle(event.title);
    setDate(event.date.slice(0, 10));
    setLocation(event.location);
    setTotalSeats(event.totalSeats);
    setDescription(event.description);
    setBanner(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Events
          </h1>
          <p className="text-gray-600">
            Create, view, and delete campus events
          </p>
        </div>

        {/* Create Event */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Event
          </h2>

          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Event title"
              className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              type="date"
              className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Location"
              className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Total seats"
              className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value)}
              required
            />
            <input
              type="file"
              accept="image/*"
              className="md:col-span-2 text-sm text-gray-600"
              onChange={(e) => setBanner(e.target.files[0])}
            />

            <textarea
              placeholder="Description"
              className="md:col-span-2 min-h-24 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-6 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-60"
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                  ? "Update Event"
                  : "Create Event"}
              </button>
            </div>
          </form>
        </section>

        {/* Events List */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Existing Events
          </h2>

          {loading ? (
            <div className="text-gray-500 py-12">
              Loading events...
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  {/* Banner */}
                  {event.banner && (
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="h-36 w-full object-cover"
                    />
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-gray-900 leading-snug">
                        {event.title}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                        {event.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      • {event.location}
                    </p>
                    <p className="text-sm text-gray-600">
                       • {new Date(event.date).toDateString()}
                    </p>

                    <p className="text-sm text-gray-600">
                      Seats:{" "}
                      <span className="font-medium text-gray-900">
                        {event.availableSeats} / {event.totalSeats}
                      </span>
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-sm font-medium text-gray-800 hover:underline"
                      >
                        Update
                      </button>

                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 py-12">
              No events created yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManageEvents;