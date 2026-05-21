import express from "express";
import {
  createOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentConfig,
} from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Razorpay configuration / public key
router.get("/config", authMiddleware, getPaymentConfig);

// Create Razorpay order
router.post("/create-order", authMiddleware, createOrder);

// Verify payment
router.post("/verify", authMiddleware, verifyPayment);

// Handle payment failure / cancellation
router.post("/failure", authMiddleware, handlePaymentFailure);

export default router;

