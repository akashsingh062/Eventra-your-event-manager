import express from "express";
import {
  registerForEvent,
  getMyRegistrations,
} from "../controllers/registrationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Register for an event
router.post(
  "/:eventId",
  authMiddleware,
  registerForEvent
);

// Get logged-in user's registrations
router.get(
  "/my",
  authMiddleware,
  getMyRegistrations
);

export default router;
