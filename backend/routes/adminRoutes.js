

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  getAdminDashboardStats,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
} from "../controllers/eventController.js";

import {
  getAllRegistrations,
  getRegistrationsByEvent,
  deleteRegistration,
} from "../controllers/registrationController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =======================
   ADMIN ROUTES
======================= */

// Admin Dashboard Stats
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminDashboardStats
);

/* =======================
   ADMIN EVENT MANAGEMENT
======================= */

// Get single event (for edit)
router.get(
  "/events/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getEventById
);

// Update event
router.put(
  "/events/:id",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("banner"),
  updateEvent
);

// Delete event
router.delete(
  "/events/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteEvent
);

// Get registrations for an event
router.get(
  "/events/:id/registrations",
  authMiddleware,
  roleMiddleware("admin"),
  getEventRegistrations
);

/* =======================
   ADMIN REGISTRATIONS
======================= */

// Get all registrations
router.get(
  "/registrations",
  authMiddleware,
  roleMiddleware("admin"),
  getAllRegistrations
);

// Get registrations by event
router.get(
  "/registrations/event/:eventId",
  authMiddleware,
  roleMiddleware("admin"),
  getRegistrationsByEvent
);

// Delete registration
router.delete(
  "/registrations/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteRegistration
);

export default router;