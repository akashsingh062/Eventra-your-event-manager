import { useEffect } from "react";
import { useEvent } from "../../context/EventContext";
import MyEventCard from "../../components/student/MyEventCard";

const MyRegistrations = () => {
  const {
    myRegistrations,
    fetchMyRegistrations,
    loading,
  } = useEvent();

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Page Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            My Registrations
          </h1>
          <p className="text-gray-600">
            Events you have successfully registered for
          </p>
        </div>

        {/* Content */}
        <div className="flex items-center justify-center">
          {loading ? (
            <div className="text-gray-500 py-24">
              Loading your registrations...
            </div>
          ) : myRegistrations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRegistrations.map((event) => (
                <MyEventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-24">
              You have not registered for any events yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyRegistrations;
