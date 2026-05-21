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

  // Register for a FREE event
  const registerForEvent = async (eventId) => {
    try {
      const { data } = await api.post(
        `/api/registrations/${eventId}`
      );
      toast.success(data.message || "Registered successfully");

      // Refresh relevant data
      fetchEvents();
      fetchMyRegistrations();
      return data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
      return null;
    }
  };

  // Unregister from an event
  const unregisterFromEvent = async (eventId) => {
    try {
      const { data } = await api.delete(
        `/api/registrations/${eventId}`
      );
      toast.success(data.message || "Unregistered successfully");

      // Refresh relevant data
      fetchEvents();
      fetchMyRegistrations();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to unregister"
      );
      return false;
    }
  };

  // Check if user is registered for a specific event
  const checkRegistration = async (eventId) => {
    try {
      const { data } = await api.get(
        `/api/registrations/check/${eventId}`
      );
      return data;
    } catch (error) {
      return {
        isRegistered: false,
        registrationId: null,
        paymentStatus: null,
        ticketStatus: null,
        qrToken: null,
        checkedIn: false,
        qrPayload: null,
      };
    }
  };

  // Create Razorpay order for paid events
  const createPaymentOrder = async (eventId) => {
    try {
      const { data } = await api.post("/api/payments/create-order", {
        eventId,
      });
      return data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create payment order"
      );
      return null;
    }
  };

  // Verify Razorpay payment
  const verifyPayment = async (paymentData) => {
    try {
      const { data } = await api.post(
        "/api/payments/verify",
        paymentData
      );
      toast.success("Payment verified! You're registered.");

      // Refresh relevant data
      fetchEvents();
      fetchMyRegistrations();
      return data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Payment verification failed"
      );
      return null;
    }
  };

  // Handle payment failure
  const handlePaymentFailure = async (orderId) => {
    try {
      await api.post("/api/payments/failure", {
        razorpay_order_id: orderId,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update payment status");
    }
  };

  // Fetch logged-in user's registrations
  const fetchMyRegistrations = async () => {
    setRegistrationsLoading(true);
    try {
      const { data } = await api.get("/api/registrations/my");
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
        unregisterFromEvent,
        checkRegistration,
        createPaymentOrder,
        verifyPayment,
        handlePaymentFailure,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);