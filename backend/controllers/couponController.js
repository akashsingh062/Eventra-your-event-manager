import asyncHandler from "../utils/asyncHandler.js";
import Coupon from "../models/Coupon.js";
import Event from "../models/Event.js";

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private (student/admin)
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, eventId, numberOfPeople = 1 } = req.body;

  if (!code || !eventId) {
    res.status(400);
    throw new Error("Coupon code and Event ID are required");
  }

  // Find event
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  if (event.isFree) {
    res.status(400);
    throw new Error("Coupons are not applicable for free events");
  }

  // Find coupon
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon code is invalid");
  }

  // Check if active
  if (!coupon.isActive) {
    res.status(400);
    throw new Error("This coupon is currently inactive");
  }

  // Check expiry
  if (new Date(coupon.expiresAt) < new Date()) {
    res.status(400);
    throw new Error("This coupon has expired");
  }

  // Check usage limit
  if (coupon.usedCount >= coupon.maxUses) {
    res.status(400);
    throw new Error("This coupon usage limit has been reached");
  }

  // Check applicable events
  if (coupon.applicableEvents && coupon.applicableEvents.length > 0) {
    const isApplicable = coupon.applicableEvents.some(
      (id) => id.toString() === eventId.toString()
    );
    if (!isApplicable) {
      res.status(400);
      throw new Error("This coupon is not applicable to this event");
    }
  }

  // Calculations
  const subtotal = event.price * numberOfPeople;
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === "fixed") {
    discount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed subtotal
  discount = Math.min(discount, subtotal);
  const finalTotal = Math.max(0, subtotal - discount);

  res.json({
    valid: true,
    couponCode: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    originalTotal: subtotal,
    discountAmount: discount,
    finalTotal,
  });
});

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Admin
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Get single coupon (Admin only)
// @route   GET /api/coupons/:id
// @access  Admin
export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  res.json(coupon);
});

// @desc    Create a new coupon (Admin only)
// @route   POST /api/coupons
// @access  Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    expiresAt,
    maxUses,
    isActive,
    applicableEvents,
  } = req.body;

  if (!code || !discountType || discountValue === undefined || !expiresAt) {
    res.status(400);
    throw new Error("Code, discount type, value and expiry date are required");
  }

  const normalizedCode = code.toUpperCase().trim();

  // Check if coupon exists
  const existingCoupon = await Coupon.findOne({ code: normalizedCode });
  if (existingCoupon) {
    res.status(400);
    throw new Error("Coupon code already exists");
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    discountType,
    discountValue,
    expiresAt,
    maxUses: maxUses || 100,
    isActive: isActive !== undefined ? isActive : true,
    applicableEvents: applicableEvents || [],
  });

  res.status(201).json(coupon);
});

// @desc    Update a coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    expiresAt,
    maxUses,
    isActive,
    applicableEvents,
  } = req.body;

  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  if (code) {
    const normalizedCode = code.toUpperCase().trim();
    if (normalizedCode !== coupon.code) {
      // Check if duplicate code exists
      const existingCoupon = await Coupon.findOne({ code: normalizedCode });
      if (existingCoupon) {
        res.status(400);
        throw new Error("Coupon code already exists");
      }
      coupon.code = normalizedCode;
    }
  }

  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = discountValue;
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
  if (maxUses !== undefined) coupon.maxUses = maxUses;
  if (isActive !== undefined) coupon.isActive = isActive;
  if (applicableEvents !== undefined) coupon.applicableEvents = applicableEvents;

  const updatedCoupon = await coupon.save();
  res.json(updatedCoupon);
});

// @desc    Delete a coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  await coupon.deleteOne();
  res.json({ message: "Coupon deleted successfully" });
});
