import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Coupon from "../models/Coupon.js";
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
  const { eventId, numberOfPeople = 1, couponCode = null } = req.body;
  const userId = req.user._id;

  const peopleCount = parseInt(numberOfPeople, 10);
  if (isNaN(peopleCount) || peopleCount < 1 || peopleCount > 6) {
    res.status(400);
    throw new Error("Invalid registration count. Must be between 1 and 6.");
  }

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

  if (event.availableSeats < peopleCount) {
    res.status(400);
    throw new Error(`Only ${event.availableSeats} seats available`);
  }

  // Check for existing active registration
  const existingReg = await Registration.findOne({
    user: userId,
    event: eventId,
    paymentStatus: { $in: ["paid", "free"] },
    isCancelled: false,
  });

  if (existingReg) {
    res.status(400);
    throw new Error("You are already registered for this event");
  }

  // If there's a pending registration, clean it up and restore its reserved resources first
  const pendingReg = await Registration.findOne({
    user: userId,
    event: eventId,
    paymentStatus: "pending",
    isCancelled: false,
  });
  if (pendingReg) {
    const seatsToRestore = pendingReg.numberOfPeople || 1;
    await Event.updateOne(
      { _id: eventId },
      { $inc: { availableSeats: seatsToRestore } }
    );
    if (pendingReg.couponCode) {
      await Coupon.updateOne(
        { code: pendingReg.couponCode.toUpperCase() },
        { $inc: { usedCount: -1 } }
      );
    }
    await pendingReg.deleteOne();
  }

  // Calculate pricing
  const subtotal = event.price * peopleCount;
  let discountAmount = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      res.status(400);
      throw new Error("Coupon code is invalid");
    }
    if (!coupon.isActive) {
      res.status(400);
      throw new Error("This coupon is inactive");
    }
    if (new Date(coupon.expiresAt) < new Date()) {
      res.status(400);
      throw new Error("This coupon has expired");
    }
    if (coupon.usedCount >= coupon.maxUses) {
      res.status(400);
      throw new Error("This coupon usage limit has been reached");
    }
    if (coupon.applicableEvents && coupon.applicableEvents.length > 0) {
      const isApplicable = coupon.applicableEvents.some(
        (id) => id.toString() === eventId.toString()
      );
      if (!isApplicable) {
        res.status(400);
        throw new Error("This coupon is not applicable to this event");
      }
    }

    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Reserve seat atomically
  const updatedEvent = await Event.findOneAndUpdate(
    { _id: eventId, availableSeats: { $gte: peopleCount } },
    { $inc: { availableSeats: -peopleCount } },
    { new: true }
  );

  if (!updatedEvent) {
    res.status(400);
    throw new Error("No seats available");
  }

  // Reserve coupon usage atomically if coupon was applied
  if (coupon) {
    const updatedCoupon = await Coupon.findOneAndUpdate(
      {
        code: coupon.code,
        isActive: true,
        expiresAt: { $gt: new Date() },
        $expr: { $lt: ["$usedCount", "$maxUses"] }
      },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
    if (!updatedCoupon) {
      // Rollback seats
      await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: peopleCount } });
      res.status(400);
      throw new Error("Coupon is no longer available or limit reached");
    }
  }

  // Case 1: Final total is 0 (100% coupon discount)
  // Skip Razorpay payment checkout entirely and complete registration immediately
  if (finalTotal === 0) {
    try {
      const qrToken = crypto.randomBytes(32).toString("hex");
      const registration = await Registration.create({
        user: userId,
        event: eventId,
        paymentStatus: "paid",
        amountPaid: 0,
        numberOfPeople: peopleCount,
        couponCode: coupon ? coupon.code : null,
        discountAmount,
        ticketStatus: "active",
        qrToken,
      });

      return res.status(201).json({
        registrationCompleted: true,
        registrationId: registration._id,
        message: "Coupon covered full ticket cost. Registration successful!",
      });
    } catch (error) {
      // Rollback seats and coupon usage
      await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: peopleCount } });
      if (coupon) {
        await Coupon.updateOne({ code: coupon.code }, { $inc: { usedCount: -1 } });
      }
      throw error;
    }
  }

  // Case 2: Regular flow with Razorpay checkout
  const currency = process.env.CURRENCY || "INR";
  const amountInPaise = Math.round(finalTotal * 100);

  const hasRazorpay = razorpayInstance !== null && !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;

  let order;
  let isSimulated = false;

  if (!hasRazorpay) {
    console.warn("Razorpay API credentials not configured. Falling back to simulated order mode.");
    isSimulated = true;
    order = {
      id: `mock_order_${crypto.randomBytes(8).toString("hex")}`,
      amount: amountInPaise,
      currency,
    };
  } else {
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
      console.error("Razorpay API order creation failed:", error);
      // Rollback reserved resources on failure
      await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: peopleCount } });
      if (coupon) {
        await Coupon.updateOne({ code: coupon.code }, { $inc: { usedCount: -1 } });
      }
      res.status(500);
      throw new Error(`Payment gateway integration failed: ${error.message || error}`);
    }
  }

  // Create pending registration
  try {
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      paymentStatus: "pending",
      razorpayOrderId: order.id,
      amountPaid: finalTotal,
      numberOfPeople: peopleCount,
      couponCode: coupon ? coupon.code : null,
      discountAmount,
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
    // Rollback seat and coupon usage if registration creation failed
    await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: peopleCount } });
    if (coupon) {
      await Coupon.updateOne({ code: coupon.code }, { $inc: { usedCount: -1 } });
    }

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

  // Handle mock orders (starts with mock_order_ or signature is mock_signature) - permitted if keys are not configured
  const isMockOrder =
    (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) &&
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
        { paymentStatus: "failed", ticketStatus: "cancelled", isCancelled: true }
      );

      // Restore seats and coupon count
      const failedReg = await Registration.findOne({ razorpayOrderId: razorpay_order_id });
      if (failedReg) {
        const seatsToRestore = failedReg.numberOfPeople || 1;
        await Event.findByIdAndUpdate(failedReg.event, { $inc: { availableSeats: seatsToRestore } });
        if (failedReg.couponCode) {
          await Coupon.updateOne(
            { code: failedReg.couponCode.toUpperCase() },
            { $inc: { usedCount: -1 } }
          );
        }
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

  // Restore seats (atomic, capped at totalSeats)
  const seatsToRestore = registration.numberOfPeople || 1;
  const event = await Event.findById(registration.event);
  if (event) {
    await Event.updateOne(
      { _id: registration.event, availableSeats: { $lt: event.totalSeats } },
      { $inc: { availableSeats: seatsToRestore } }
    );
  }

  // Restore coupon usage count
  if (registration.couponCode) {
    await Coupon.updateOne(
      { code: registration.couponCode.toUpperCase() },
      { $inc: { usedCount: -1 } }
    );
  }

  // Delete the failed registration
  await registration.deleteOne();

  res.json({
    message: "Payment cancelled. Registration removed.",
  });
});

// @desc    Get Razorpay public key and configuration state
// @route   GET /api/payments/config
// @access  Private (student)
export const getPaymentConfig = asyncHandler(async (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || null,
    isSimulated: !(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  });
});

