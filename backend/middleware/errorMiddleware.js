import fs from "fs";

const errorMiddleware = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server Error";

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Resource not found";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  console.error("Error caught in middleware:", err);
  
  // Extract error message dynamically
  let displayMessage = message;
  if (!err.message && typeof err === "object") {
    displayMessage = err.error?.description || err.description || JSON.stringify(err);
  }

  // Write to a local log file for easy agent access
  try {
    const errorDetails = typeof err === "object" ? JSON.stringify(err, null, 2) : String(err);
    fs.appendFileSync(
      "./error.log",
      `[${new Date().toISOString()}] Message: ${displayMessage}\nDetails: ${errorDetails}\nStack: ${err.stack || "No stack trace"}\n\n`
    );
  } catch (e) {
    console.error("Failed to write to error.log", e);
  }

  res.status(statusCode).json({
    success: false,
    message: displayMessage || "Server Error",
    stack: err.stack || null,
  });
};

export default errorMiddleware;