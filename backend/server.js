import authMiddleware from "./middleware/authMiddleware.js";
import roleMiddleware from "./middleware/roleMiddleware.js";
import { getAdminDashboardStats } from "./controllers/eventController.js";
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import eventRoutes from "./routes/eventRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import connectCloudinary from './config/cloudnary.js';
import adminRoutes from "./routes/adminRoutes.js";

const app = express()
const PORT = process.env.PORT || 4000

connectDB()
connectCloudinary()
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "Eventra API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
/* =======================
   ADMIN ROUTES
======================= */
app.use("/api/admin",  adminRoutes);
// app.get(
//   "/api/admin/dashboard",
//   authMiddleware,
//   roleMiddleware("admin"),
//   getAdminDashboardStats
// );

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})