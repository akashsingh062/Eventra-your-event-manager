import { createContext, useContext, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);

  const [eventsLoading, setEventsLoading] = useState(false);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);

  // Fetch all events
  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const { data } = await api.get("/api/events");
      setEvents(data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load events"
      );
    } finally {
      setEventsLoading(false);
    }
  };

  // Register for an event
  const registerForEvent = async (eventId) => {
    try {
      const { data } = await api.post(
        `/api/registrations/${eventId}`
      );
      toast.success(data.message || "Registered successfully");

      // Refresh relevant data
      fetchEvents();
      fetchMyRegistrations();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
      return false;
    }
  };

  // Fetch logged-in user's registrations
  const fetchMyRegistrations = async () => {
    setRegistrationsLoading(true);
    try {
      const { data } = await api.get("/api/registrations/my");
      console.log("my", data)
      setMyRegistrations(data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load registrations"
      );
    } finally {
      setRegistrationsLoading(false);
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        myRegistrations,
        eventsLoading,
        registrationsLoading,
        fetchEvents,
        fetchMyRegistrations,
        registerForEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);