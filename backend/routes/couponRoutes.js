import express from "express";
import {
  validateCoupon,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public/Student routes
router.post("/validate", authMiddleware, validateCoupon);

// Admin routes
router.get("/", authMiddleware, roleMiddleware("admin"), getAllCoupons);
router.get("/:id", authMiddleware, roleMiddleware("admin"), getCouponById);
router.post("/", authMiddleware, roleMiddleware("admin"), createCoupon);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateCoupon);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCoupon);

export default router;
