import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    user: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,},
    event: {type: mongoose.Schema.Types.ObjectId,ref: "Event",required: true,},
    registeredAt: {type: Date,default: Date.now,},

    // Payment fields
    paymentStatus: {
      type: String,
      enum: ["free", "pending", "paid", "failed", "refunded"],
      default: "free",
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    amountPaid: { type: Number, default: 0 },

    // Ticket fields
    ticketStatus: {
      type: String,
      enum: ["active", "used", "cancelled"],
      default: "active",
    },
    qrToken: { type: String, unique: true, sparse: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
  },
  {timestamps: true,}
);

registrationSchema.index({ user: 1, event: 1 }, { unique: true });
registrationSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });

const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);

export default Registration;
