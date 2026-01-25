import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
} from "../controllers/eventController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public: Get all events
router.get("/", getAllEvents);

// Admin: Create new event (with banner upload)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("banner"),
  createEvent
);

/* =======================
   ADMIN EVENT ROUTES
======================= */

// Admin: Get single event by ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getEventById
);

// Admin: Update event (with optional banner update)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("banner"),
  updateEvent
);

// Admin: Delete event
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteEvent
);

// Admin: Get all registrations for an event
router.get(
  "/:id/registrations",
  authMiddleware,
  roleMiddleware("admin"),
  getEventRegistrations
);

export default router;
