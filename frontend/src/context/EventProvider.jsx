import { useState, useCallback } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { EventContext } from "./EventContext";

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);

  const [eventsLoading, setEventsLoading] = useState(false);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);

  // Fetch all events
  const fetchEvents = useCallback(async () => {
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
  }, []);

  // Fetch logged-in user's registrations
  const fetchMyRegistrations = useCallback(async () => {
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
  }, []);

  // Register for a FREE event
  const registerForEvent = useCallback(async (eventId, numberOfPeople = 1) => {
    try {
      const { data } = await api.post(
        `/api/registrations/${eventId}`,
        { numberOfPeople }
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
  }, [fetchEvents, fetchMyRegistrations]);

  // Unregister from an event
  const unregisterFromEvent = useCallback(async (eventId) => {
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
  }, [fetchEvents, fetchMyRegistrations]);

  // Check if user is registered for a specific event
  const checkRegistration = useCallback(async (eventId) => {
    try {
      const { data } = await api.get(
        `/api/registrations/check/${eventId}`
      );
      return data;
    } catch {
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
  }, []);

  // Create Razorpay order for paid events
  const createPaymentOrder = useCallback(async (eventId, numberOfPeople = 1, couponCode = null) => {
    try {
      const { data } = await api.post("/api/payments/create-order", {
        eventId,
        numberOfPeople,
        couponCode,
      });
      return data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create payment order"
      );
      return null;
    }
  }, []);

  // Verify Razorpay payment
  const verifyPayment = useCallback(async (paymentData) => {
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
  }, [fetchEvents, fetchMyRegistrations]);

  // Handle payment failure
  const handlePaymentFailure = useCallback(async (orderId) => {
    try {
      await api.post("/api/payments/failure", {
        razorpay_order_id: orderId,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update payment status");
    }
  }, []);

  // Get Razorpay configuration
  const getPaymentConfig = useCallback(async () => {
    try {
      const { data } = await api.get("/api/payments/config");
      return data;
    } catch (error) {
      console.error("Failed to fetch payment config:", error);
      return null;
    }
  }, []);

  // Coupon Validation
  const validateCoupon = useCallback(async (code, eventId, numberOfPeople = 1) => {
    try {
      const { data } = await api.post("/api/coupons/validate", {
        code,
        eventId,
        numberOfPeople,
      });
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to validate coupon");
      return null;
    }
  }, []);

  // Admin Coupon CRUD operations
  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await api.get("/api/coupons");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch coupons");
      return [];
    }
  }, []);

  const createCoupon = useCallback(async (couponData) => {
    try {
      const { data } = await api.post("/api/coupons", couponData);
      toast.success("Coupon created successfully");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
      return null;
    }
  }, []);

  const updateCoupon = useCallback(async (id, couponData) => {
    try {
      const { data } = await api.put(`/api/coupons/${id}`, couponData);
      toast.success("Coupon updated successfully");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update coupon");
      return null;
    }
  }, []);

  const deleteCoupon = useCallback(async (id) => {
    try {
      await api.delete(`/api/coupons/${id}`);
      toast.success("Coupon deleted successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
      return false;
    }
  }, []);

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
        getPaymentConfig,
        validateCoupon,
        fetchCoupons,
        createCoupon,
        updateCoupon,
        deleteCoupon,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
