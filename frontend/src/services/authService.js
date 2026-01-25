import api from "./api";

/**
 * Login user
 * POST /api/auth/login
 */
export const loginUser = (credentials) => {
  return api.post("/api/auth/login", credentials);
};

/**
 * Register user
 * POST /api/auth/register
 */
export const registerUser = (data) => {
  return api.post("/api/auth/register", data);
};

/**
 * Get logged-in user profile
 * GET /api/auth/me
 */
export const getProfile = () => {
  return api.get("/api/auth/me");
};