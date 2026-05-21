import asyncHandler from "../utils/asyncHandler.js";
import Registration from "../models/Registration.js";

// @desc    Verify ticket by QR token
// @route   POST /api/admin/checkin/verify
// @access  Admin
export const verifyTicket = asyncHandler(async (req, res) => {
  const { qrPayload } = req.body;

  if (!qrPayload) {
    res.status(400);
    throw new Error("QR payload is required");
  }

  let parsed;
  try {
    parsed = JSON.parse(qrPayload);
  } catch {
    res.status(400);
    throw new Error("Invalid QR code data");
  }

  const { t: qrToken, r: registrationId, e: eventId } = parsed;

  if (!qrToken || !registrationId) {
    res.status(400);
    throw new Error("Invalid QR code format");
  }

  // Find registration by QR token and registration ID
  const registration = await Registration.findOne({
    _id: registrationId,
    qrToken,
  })
    .populate("user", "name email")
    .populate("event", "title date location organizerName isFree price");

  if (!registration) {
    res.status(404);
    throw new Error("Invalid ticket. Registration not found.");
  }

  if (registration.ticketStatus === "cancelled") {
    res.status(400);
    throw new Error("This ticket has been cancelled");
  }

  res.json({
    valid: true,
    registration: {
      _id: registration._id,
      user: registration.user,
      event: registration.event,
      paymentStatus: registration.paymentStatus,
      ticketStatus: registration.ticketStatus,
      checkedIn: registration.checkedIn,
      checkedInAt: registration.checkedInAt,
      amountPaid: registration.amountPaid,
      registeredAt: registration.registeredAt,
    },
  });
});

// @desc    Confirm check-in for an attendee
// @route   POST /api/admin/checkin/confirm
// @access  Admin
export const checkInAttendee = asyncHandler(async (req, res) => {
  const { registrationId } = req.body;

  if (!registrationId) {
    res.status(400);
    throw new Error("Registration ID is required");
  }

  const registration = await Registration.findById(registrationId)
    .populate("user", "name email")
    .populate("event", "title date location");

  if (!registration) {
    res.status(404);
    throw new Error("Registration not found");
  }

  if (registration.ticketStatus === "cancelled") {
    res.status(400);
    throw new Error("This ticket has been cancelled");
  }

  if (registration.checkedIn) {
    res.status(400);
    throw new Error(
      `Already checked in at ${new Date(registration.checkedInAt).toLocaleString()}`
    );
  }

  // Only allow check-in for paid or free registrations
  if (registration.paymentStatus === "pending" || registration.paymentStatus === "failed") {
    res.status(400);
    throw new Error("Payment not completed. Cannot check in.");
  }

  registration.checkedIn = true;
  registration.checkedInAt = new Date();
  registration.ticketStatus = "used";
  await registration.save();

  res.json({
    message: "Check-in successful!",
    registration: {
      _id: registration._id,
      user: registration.user,
      event: registration.event,
      checkedIn: registration.checkedIn,
      checkedInAt: registration.checkedInAt,
      ticketStatus: registration.ticketStatus,
      paymentStatus: registration.paymentStatus,
    },
  });
});
