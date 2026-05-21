import mongoose from "mongoose";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

/**
 * Generate a secure, unique QR token for a registration.
 */
const generateQRToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Build the QR payload that gets encoded into the QR code image.
 * Contains enough info for verification but no raw sensitive data.
 */
const buildQRPayload = (registration) => {
  const eventId = registration.event._id || registration.event;
  return JSON.stringify({
    t: registration.qrToken,       // verification token
    r: registration._id.toString(), // registration ID
    e: eventId.toString(), // event ID
  });
};

// @desc    Register logged-in user for an event (FREE events only)
// @route   POST /api/registrations/:eventId
// @access  Private (student)
export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;
  const numberOfPeople = req.body.numberOfPeople ? parseInt(req.body.numberOfPeople, 10) : 1;

  if (isNaN(numberOfPeople) || numberOfPeople < 1 || numberOfPeople > 6) {
    res.status(400);
    throw new Error("Invalid number of people. Must be between 1 and 6.");
  }

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Paid events must go through payment flow
  if (!event.isFree) {
    res.status(400);
    throw new Error("This is a paid event. Please use the payment flow to register.");
  }

  if (event.status === "completed") {
    res.status(400);
    throw new Error("Event is already completed");
  }

  if (event.availableSeats < numberOfPeople) {
    res.status(400);
    throw new Error(`Only ${event.availableSeats} seats available`);
  }

  // Check for existing registration
  const existingReg = await Registration.findOne({ user: userId, event: eventId });
  if (existingReg) {
    res.status(400);
    throw new Error("You are already registered for this event");
  }

  const qrToken = generateQRToken();

  // Use atomic operations (no transaction required — works without replica set)
  const updatedEvent = await Event.findOneAndUpdate(
    { _id: eventId, availableSeats: { $gte: numberOfPeople } },
    { $inc: { availableSeats: -numberOfPeople } },
    { new: true }
  );

  if (!updatedEvent) {
    res.status(400);
    throw new Error("No seats available");
  }

  try {
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      paymentStatus: "free",
      ticketStatus: "active",
      qrToken,
      amountPaid: 0,
      numberOfPeople,
    });

    res.status(201).json({
      message: "Successfully registered for event",
      registration,
      qrPayload: buildQRPayload(registration),
    });
  } catch (error) {
    // Rollback seat decrement if registration failed
    await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: numberOfPeople } });

    if (error.code === 11000) {
      res.status(400);
      throw new Error("You are already registered for this event");
    }
    throw error;
  }
});

// @desc    Unregister logged-in user from an event
// @route   DELETE /api/registrations/:eventId
// @access  Private (student)
export const unregisterFromEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  // Find the registration
  const registration = await Registration.findOne({
    user: userId,
    event: eventId,
  });

  if (!registration) {
    res.status(404);
    throw new Error("You are not registered for this event");
  }

  // Prevent unregistering from paid events (no refund flow)
  if (registration.paymentStatus === "paid") {
    res.status(400);
    throw new Error("Cannot unregister from a paid event. Please contact the organizer for refunds.");
  }

  // Find the event
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Prevent unregistering from completed events
  if (event.status === "completed") {
    res.status(400);
    throw new Error("Cannot unregister from a completed event");
  }

  const seatsToRestore = registration.numberOfPeople || 1;

  // Delete registration (atomic, no transaction needed)
  await Registration.findByIdAndDelete(registration._id);

  // Restore seats (atomic, capped at totalSeats)
  await Event.updateOne(
    { _id: eventId, availableSeats: { $lt: event.totalSeats } },
    { $inc: { availableSeats: seatsToRestore } }
  );

  res.json({
    message: "Successfully unregistered from event",
  });
});

// @desc    Check if user is registered for an event
// @route   GET /api/registrations/check/:eventId
// @access  Private (student)
export const checkRegistration = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  const registration = await Registration.findOne({
    user: userId,
    event: eventId,
  });

  if (registration) {
    res.json({
      isRegistered: true,
      registrationId: registration._id,
      paymentStatus: registration.paymentStatus,
      ticketStatus: registration.ticketStatus,
      qrToken: registration.qrToken,
      checkedIn: registration.checkedIn,
      qrPayload: buildQRPayload(registration),
    });
  } else {
    res.json({
      isRegistered: false,
      registrationId: null,
      paymentStatus: null,
      ticketStatus: null,
      qrToken: null,
      checkedIn: false,
      qrPayload: null,
    });
  }
});

// @desc    Get logged-in user's registrations
// @route   GET /api/registrations/my
// @access  Private (student)
export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({
    user: req.user._id,
  })
    .populate({
      path: "event",
      select:
        "title description date location banner totalSeats availableSeats status organizerName contactInfo isFree price",
    })
    .sort({ createdAt: -1 });

  // Add qrPayload to each registration
  const registrationsWithQR = registrations.map((reg) => {
    const regObj = reg.toObject();
    regObj.qrPayload = buildQRPayload(reg);
    return regObj;
  });

  res.json(registrationsWithQR);
});


/* =======================
   ADMIN CONTROLLERS
======================= */

// @desc    Get all registrations (Admin)
// @route   GET /api/registrations
// @access  Admin
export const getAllRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find()
    .populate("user", "name email")
    .populate(
      "event",
      "title date location totalSeats availableSeats status isFree price"
    )
    .sort({ createdAt: -1 });

  res.json(registrations);
});

// @desc    Get registrations for a specific event (Admin)
// @route   GET /api/registrations/event/:eventId
// @access  Admin
export const getRegistrationsByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const registrations = await Registration.find({ event: eventId })
    .populate("user", "name email")
    .populate(
      "event",
      "title date location totalSeats availableSeats status isFree price"
    )
    .sort({ createdAt: -1 });

  res.json(registrations);
});

// @desc    Delete a registration (Admin)
// @route   DELETE /api/registrations/:id
// @access  Admin
export const deleteRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error("Registration not found");
  }

  const seatsToRestore = registration.numberOfPeople || 1;

  // Restore seat count (atomic, capped at totalSeats)
  const event = await Event.findById(registration.event);
  if (event) {
    await Event.updateOne(
      { _id: registration.event, availableSeats: { $lt: event.totalSeats } },
      { $inc: { availableSeats: seatsToRestore } }
    );
  }

  await registration.deleteOne();

  res.json({ message: "Registration deleted successfully" });
});