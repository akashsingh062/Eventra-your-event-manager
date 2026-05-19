import { useEffect, useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaImage, FaPlus, FaPen, FaTrash, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import dayjs from "dayjs";
import api from "../../services/api";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Create form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("upcoming");
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

  const resetForm = () => {
    setTitle("");
    setDate("");
    setLocation("");
    setTotalSeats("");
    setDescription("");
    setStatus("upcoming");
    setBanner(null);
    setBannerPreview(null);
    setEditingId(null);
  };

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
      formData.append("status", status);
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

      resetForm();
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      console.error("Failed to create event", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event? This will also remove all registrations.")) return;
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
    setStatus(event.status || "upcoming");
    setBanner(null);
    setBannerPreview(event.banner);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const inputClass =
    "w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-navy-300/20 border border-gray-200 dark:border-navy-400/30 text-gray-900 dark:text-cream-500 placeholder-gray-400 dark:placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition-all text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Events
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create, edit, and manage your campus events
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
                setShowForm(false);
              } else {
                resetForm();
                setShowForm(true);
              }
            }}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              showForm
                ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                : "bg-brick-500 text-white hover:bg-brick-400 shadow-lg shadow-brick-500/20 dark:shadow-none"
            }`}
          >
            {showForm ? (
              <>
                <FaTimes /> Cancel
              </>
            ) : (
              <>
                <FaPlus /> Create Event
              </>
            )}
          </button>
        </div>

        {/* Create/Edit Event Form */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showForm ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {editingId ? <FaPen className="text-brick-500" /> : <FaPlus className="text-brick-500" />}
                {editingId ? "Update Event" : "Create New Event"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Fill in all the details below to {editingId ? "update" : "publish"} your event.
              </p>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-8">
              {/* Row 1: Title */}
              <div>
                <label className={labelClass}>
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Tech Hackathon 2026"
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Row 2: Date, Location, Seats, Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={labelClass}>
                    <FaCalendarAlt className="inline mr-2 text-navy-600" />
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <FaMapMarkerAlt className="inline mr-2 text-steel-400" />
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium"
                    className={inputClass}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <FaUsers className="inline mr-2 text-pink-500" />
                    Total Seats <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 200"
                    className={inputClass}
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Status
                  </label>
                  <select
                    className={inputClass}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Banner Upload */}
              <div>
                <label className={labelClass}>
                  <FaImage className="inline mr-2 text-amber-500" />
                  Event Banner {!editingId && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1">
                  {bannerPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-48 md:h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <label className="px-6 py-3 bg-white/90 text-gray-900 rounded-xl font-semibold cursor-pointer hover:bg-white transition-colors text-sm">
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleBannerChange}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-navy-400/30 rounded-2xl cursor-pointer hover:border-navy-600 dark:hover:border-steel-500 hover:bg-navy-500/5 dark:hover:bg-navy-500/10 transition-all">
                      <FaCloudUploadAlt className="text-4xl text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Click to upload event banner
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Row 4: Description */}
              <div>
                <label className={labelClass}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Write a detailed description of your event, including agenda, speakers, prerequisites..."
                  className="w-full min-h-36 px-4 py-3 rounded-xl bg-gray-50 dark:bg-navy-300/20 border border-gray-200 dark:border-navy-400/30 text-gray-900 dark:text-cream-500 placeholder-gray-400 dark:placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition-all text-sm resize-y"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-brick-500 text-white rounded-xl font-semibold text-sm hover:bg-brick-400 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brick-500/20 dark:shadow-none transition-all"
                >
                  {submitting
                    ? editingId
                      ? "Updating..."
                      : "Creating..."
                    : editingId
                    ? "Update Event"
                    : "Publish Event"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Events List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              All Events
            </h2>
            <span className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium">
              {events.length} Total
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => {
                const isPast = dayjs(event.date).isBefore(dayjs(), "day") || event.status === "completed";
                const seatPercent = event.totalSeats > 0 ? ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100 : 0;

                return (
                  <div
                    key={event._id}
                    className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Banner */}
                      {event.banner && (
                        <div className="sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden">
                          <img
                            src={event.banner}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 p-5 flex flex-col">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug">
                            {event.title}
                          </h3>
                          <span
                            className={`shrink-0 text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${
                              isPast
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-navy-500/10 dark:bg-navy-500/20 text-navy-600 dark:text-steel-500"
                            }`}
                          >
                            {isPast ? "Completed" : "Upcoming"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <span className="flex items-center gap-1.5">
                            <FaCalendarAlt className="text-navy-600" />
                            {dayjs(event.date).format("DD MMM YYYY")}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-steel-400" />
                            {event.location}
                          </span>
                        </div>

                        {/* Seats Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                            <span>Seats</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {event.availableSeats} / {event.totalSeats} available
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                seatPercent > 80 ? "bg-brick-500" : seatPercent > 50 ? "bg-cream-300" : "bg-steel-500"
                              }`}
                              style={{ width: `${seatPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => handleEdit(event)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-600 dark:text-steel-500 bg-navy-500/10 dark:bg-navy-500/20 hover:bg-navy-500/20 dark:hover:bg-navy-500/30 rounded-lg transition-colors"
                          >
                            <FaPen className="text-xs" /> Edit
                          </button>

                          <button
                            onClick={() => handleDelete(event._id)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                          >
                            <FaTrash className="text-xs" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl py-24 shadow-sm">
              <div className="text-steel-700 dark:text-steel-300 mb-6 flex justify-center">
                <FaCalendarAlt className="w-14 h-14" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Events Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                You haven't created any events. Click the button above to publish your first event!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManageEvents;