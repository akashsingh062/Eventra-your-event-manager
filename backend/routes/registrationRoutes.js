import express from "express";
import {
  registerForEvent,
  unregisterFromEvent,
  checkRegistration,
  getMyRegistrations,
} from "../controllers/registrationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in user's registrations (must be before /:eventId)
router.get(
  "/my",
  authMiddleware,
  getMyRegistrations
);

// Check if user is registered for an event
router.get(
  "/check/:eventId",
  authMiddleware,
  checkRegistration
);

// Register for an event
router.post(
  "/:eventId",
  authMiddleware,
  registerForEvent
);

// Unregister from an event
router.delete(
  "/:eventId",
  authMiddleware,
  unregisterFromEvent
);

export default router;
