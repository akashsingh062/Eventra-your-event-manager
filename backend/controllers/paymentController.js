import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import razorpayInstance from "../config/razorpay.js";

/**
 * Generate a secure, unique QR token for a registration.
 */
const generateQRToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Build the QR payload for encoding into QR image.
 */
const buildQRPayload = (registration) => {
  const eventId = registration.event._id || registration.event;
  return JSON.stringify({
    t: registration.qrToken,
    r: registration._id.toString(),
    e: eventId.toString(),
  });
};

// @desc    Create Razorpay order for a paid event
// @route   POST /api/payments/create-order
// @access  Private (student)
export const createOrder = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user._id;

  // Validate event
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  if (event.isFree) {
    res.status(400);
    throw new Error("This is a free event. Use direct registration.");
  }

  if (event.status === "completed") {
    res.status(400);
    throw new Error("Event is already completed");
  }

  if (event.availableSeats <= 0) {
    res.status(400);
    throw new Error("No seats available");
  }

  // Check for existing active registration
  const existingReg = await Registration.findOne({
    user: userId,
    event: eventId,
    paymentStatus: { $in: ["paid", "free"] },
  });

  if (existingReg) {
    res.status(400);
    throw new Error("You are already registered for this event");
  }

  // Check for existing pending registration and reuse its order
  const pendingReg = await Registration.findOne({
    user: userId,
    event: eventId,
    paymentStatus: "pending",
  });

  if (pendingReg && pendingReg.razorpayOrderId) {
    // Return existing pending order
    return res.json({
      orderId: pendingReg.razorpayOrderId,
      amount: event.price * 100,
      currency: process.env.CURRENCY || "INR",
      registrationId: pendingReg._id,
      simulated: pendingReg.razorpayOrderId.startsWith("mock_order_"),
    });
  }

  // Create Razorpay order
  const currency = process.env.CURRENCY || "INR";
  const amountInPaise = Math.round(event.price * 100);

  let order;
  let isSimulated = false;
  try {
    order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `evt_${eventId}_${userId}_${Date.now()}`,
      notes: {
        eventId: eventId.toString(),
        userId: userId.toString(),
        eventTitle: event.title,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("Razorpay API order creation failed in production:", error);
      res.status(500);
      throw new Error("Payment gateway integration failed");
    }
    console.warn("Razorpay API order creation failed, falling back to simulated order mode:", error.message || error);
    isSimulated = true;
    order = {
      id: `mock_order_${crypto.randomBytes(8).toString("hex")}`,
      amount: amountInPaise,
      currency,
    };
  }

  // Reserve seat atomically
  const updatedEvent = await Event.findOneAndUpdate(
    { _id: eventId, availableSeats: { $gt: 0 } },
    { $inc: { availableSeats: -1 } },
    { new: true }
  );

  if (!updatedEvent) {
    res.status(400);
    throw new Error("No seats available");
  }

  // Create pending registration
  try {
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      paymentStatus: "pending",
      razorpayOrderId: order.id,
      amountPaid: event.price,
      ticketStatus: "active",
    });

    res.status(201).json({
      orderId: order.id,
      amount: amountInPaise,
      currency,
      registrationId: registration._id,
      simulated: isSimulated,
    });
  } catch (error) {
    // Rollback seat if registration creation failed
    await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: 1 } });

    if (error.code === 11000) {
      res.status(400);
      throw new Error("You are already registered for this event");
    }
    throw error;
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private (student)
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error("Missing payment verification data");
  }

  // Handle mock orders (starts with mock_order_ or signature is mock_signature) - DEV/TEST ONLY
  const isMockOrder =
    process.env.NODE_ENV !== "production" &&
    (razorpay_order_id.startsWith("mock_order_") || razorpay_signature === "mock_signature");

  if (!isMockOrder) {
    // Verify signature using HMAC SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Payment verification failed — mark as failed
      await Registration.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: "failed", ticketStatus: "cancelled" }
      );

      // Restore seat
      const failedReg = await Registration.findOne({ razorpayOrderId: razorpay_order_id });
      if (failedReg) {
        await Event.findByIdAndUpdate(failedReg.event, { $inc: { availableSeats: 1 } });
      }

      res.status(400);
      throw new Error("Payment verification failed. Invalid signature.");
    }
  }

  // Signature valid — update registration
  const qrToken = generateQRToken();

  const registration = await Registration.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id, paymentStatus: "pending" },
    {
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      qrToken,
    },
    { new: true }
  );

  if (!registration) {
    res.status(404);
    throw new Error("Registration not found or already processed");
  }

  res.json({
    message: "Payment verified successfully",
    registration,
    qrPayload: buildQRPayload(registration),
  });
});

// @desc    Handle payment failure / cancellation
// @route   POST /api/payments/failure
// @access  Private (student)
export const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { razorpay_order_id } = req.body;

  if (!razorpay_order_id) {
    res.status(400);
    throw new Error("Missing order ID");
  }

  // Find the pending registration
  const registration = await Registration.findOne({
    razorpayOrderId: razorpay_order_id,
    paymentStatus: "pending",
  });

  if (!registration) {
    return res.json({ message: "No pending registration found" });
  }

  // Restore seat
  await Event.findOneAndUpdate(
    { _id: registration.event },
    [
      {
        $set: {
          availableSeats: {
            $min: [{ $add: ["$availableSeats", 1] }, "$totalSeats"],
          },
        },
      },
    ]
  );

  // Delete the failed registration
  await registration.deleteOne();

  res.json({
    message: "Payment cancelled. Registration removed.",
  });
});
