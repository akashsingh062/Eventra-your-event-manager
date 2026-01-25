import { useEffect } from "react";
import { useEvent } from "../../context/EventContext";
import EventCard from "../../components/student/EventCard";

const Events = () => {
  const {
    events,
    fetchEvents,
    registerForEvent,
    loading,
  } = useEvent();

  useEffect(() => {
    fetchEvents();
    console.log(events)
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        
        {/* Hero / Banner Section */}
        <section className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="px-8 py-14 md:px-12 md:py-20 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Discover <span className="text-gray-700">Campus Events</span>
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              Explore upcoming workshops, tech fests, cultural nights, and talks.
              <br />
              Register easily and never miss an opportunity.
            </p>
          </div>
        </section>

        {/* Events Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center">
            Events
          </h2>

          {loading ? (
            <div className="text-center text-gray-500 py-24">
              Loading events...
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onRegister={() => registerForEvent(event._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-24">
              No events are available at the moment.
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Events;
