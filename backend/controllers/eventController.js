import Registration from "../models/Registration.js";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/Event.js";
import cloudinary from 'cloudinary'
import User from "../models/User.js";

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate("createdBy", "name email")
    .sort({ date: 1 });
  res.json(events);
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Admin (auth & role middleware will be added later)
export const createEvent = asyncHandler(async (req, res) => {

  const {
    title,
    description,
    date,
    location,
    totalSeats,
    availableSeats,
    status,
  } = req.body;

  if (
    !title ||
    !description ||
    !date ||
    !location ||
    !totalSeats ||
    !req.file
  ) {
    res.status(400);
    throw new Error("Please provide all required fields including banner image");
  }

  const uploadImage = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
  const imageUrl = uploadImage.secure_url;

  const event = await Event.create({
    title,
    description,
    date,
    location,
    banner: imageUrl,
    totalSeats,
    availableSeats:
      availableSeats !== undefined ? availableSeats : totalSeats,
    status: status || "upcoming",
    createdBy: req.user._id,
  });

  res.status(201).json(event);
});

/* =======================
   ADMIN CONTROLLERS
======================= */

// @desc    Get single event by ID (Admin)
// @route   GET /api/events/:id
// @access  Admin
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "createdBy",
    "name email"
  );

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  res.json(event);
});

// @desc    Update event (Admin)
// @route   PUT /api/events/:id
// @access  Admin
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  const {
    title,
    description,
    date,
    location,
    totalSeats,
    availableSeats,
    status,
  } = req.body;

  // Update banner if new file uploaded
  if (req.file) {
    const uploadImage = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
    });
    event.banner = uploadImage.secure_url;
  }

  event.title = title ?? event.title;
  event.description = description ?? event.description;
  event.date = date ?? event.date;
  event.location = location ?? event.location;
  event.totalSeats = totalSeats ?? event.totalSeats;
  event.availableSeats = availableSeats ?? event.availableSeats;
  event.status = status ?? event.status;

  const updatedEvent = await event.save();
  res.json(updatedEvent);
});

// @desc    Delete event (Admin)
// @route   DELETE /api/events/:id
// @access  Admin
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Admin safety: Delete related registrations first
  await Registration.deleteMany({ event: event._id });
  await event.deleteOne();
  res.json({ message: "Event deleted successfully" });
});

// @desc    Get registrations for an event (Admin)
// @route   GET /api/events/:id/registrations
// @access  Admin
export const getEventRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({
    event: req.params.id,
  })
    .populate("user", "name email")
    .populate("event", "title date location");

  res.json(registrations);
});


/* =======================
   ADMIN DASHBOARD
======================= */

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const totalEvents = await Event.countDocuments();
  const totalRegistrations = await Registration.countDocuments();
  const totalUsers = await User.countDocuments({ role: "student" });

  const upcomingEvents = await Event.countDocuments({
    date: { $gte: new Date() },
  });

  const completedEvents = await Event.countDocuments({
    date: { $lt: new Date() },
  });

  res.json({
    totalEvents,
    totalRegistrations,
    totalUsers,
    upcomingEvents,
    completedEvents,
  });
});