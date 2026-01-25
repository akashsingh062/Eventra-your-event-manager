import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

// @desc    Register logged-in user for an event
// @route   POST /api/registrations/:eventId
// @access  Private (student)
export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);

    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }

    if (event.status === "completed") {
      res.status(400);
      throw new Error("Event is already completed");
    }

    if (event.availableSeats <= 0) {
      res.status(400);
      throw new Error("No seats available");
    }

    // Create registration (DB unique index prevents duplicates)
    const registration = await Registration.create(
      [
        {
          user: userId,
          event: eventId,
        },
      ],
      { session }
    );

    // Decrease available seats
    event.availableSeats -= 1;
    await event.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Successfully registered for event",
      registration: registration[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Handle duplicate registration error
    if (error.code === 11000) {
      res.status(400);
      throw new Error("You are already registered for this event");
    }

    throw error;
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
        "title description date location banner totalSeats availableSeats status",
    })
    .sort({ createdAt: -1 });

  res.json(registrations);
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
      "title date location totalSeats availableSeats status"
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
      "title date location totalSeats availableSeats status"
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

  // Restore seat count
  const event = await Event.findById(registration.event);
  if (event) {
    event.availableSeats += 1;
    await event.save();
  }

  await registration.deleteOne();

  res.json({ message: "Registration deleted successfully" });
});