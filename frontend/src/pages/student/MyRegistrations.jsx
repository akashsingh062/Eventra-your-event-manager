import { useEffect } from "react";
import { useEvent } from "../../context/EventContext";
import MyEventCard from "../../components/student/MyEventCard";

const MyRegistrations = () => {
  const {
    myRegistrations,
    fetchMyRegistrations,
    registrationsLoading: loading,
  } = useEvent();

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  return (
    <div className="bg-transparent">
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Page Heading */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-navy-200 via-navy-300 to-navy-400 shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-steel-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-navy-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 px-8 py-16 text-center max-w-3xl mx-auto flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
              My <span className="text-transparent bg-clip-text bg-linear-to-r from-cream-400 to-cream-300">Registrations</span>
            </h1>
            <p className="text-lg text-steel-700 max-w-xl font-light">
              Keep track of all the events you've successfully registered for.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your registrations...</p>
            </div>
          ) : myRegistrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {myRegistrations.map((event) => (
                <MyEventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center bg-white dark:bg-navy-200 border border-gray-200 dark:border-navy-400/30 rounded-3xl py-24 shadow-sm max-w-2xl mx-auto">
              <div className="text-steel-500/50 mb-6 flex justify-center">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Registrations Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                You haven't registered for any events. Check out our upcoming events and secure your spot!
              </p>
              <a href="/events" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-brick-500 hover:bg-brick-400 transition-colors">
                Browse Events
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyRegistrations;
