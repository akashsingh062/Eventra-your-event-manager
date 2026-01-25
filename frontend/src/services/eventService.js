import api from "./api";

/**
 * Fetch all events
 * GET /api/events
 */
export const getAllEvents = () => {
  return api.get("/api/events");
};

/**
 * Fetch single event by ID
 * GET /api/events/:id
 */
export const getEventById = (id) => {
  return api.get(`/api/events/${id}`);
};

/**
 * Register logged-in user for an event
 * POST /api/registrations/:eventId
 */
export const registerForEvent = (eventId) => {
  return api.post(`/api/registrations/${eventId}`);
};

/**
 * Fetch logged-in user's registrations
 * GET /api/registrations/my
 */
export const getMyRegistrations = () => {
  return api.get("/api/registrations/my");
};