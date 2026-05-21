import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGO_URI}/eventra`);
    console.log("✅ MongoDB connected");

    // Programmatically drop old unique index user_1_event_1 if it exists without partialFilterExpression
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections({ name: "registrations" }).toArray();
      if (collections.length > 0) {
        const indexes = await db.collection("registrations").indexes();
        const hasOldIndex = indexes.some(idx => idx.name === "user_1_event_1");
        if (hasOldIndex) {
          const oldIndex = indexes.find(idx => idx.name === "user_1_event_1");
          if (!oldIndex.partialFilterExpression) {
            console.log("🔄 Dropping old unique index 'user_1_event_1'...");
            await db.collection("registrations").dropIndex("user_1_event_1");
            console.log("✅ Old unique index dropped successfully!");
          }
        }
      }
    } catch (indexError) {
      console.warn("⚠️ Failed to check/drop old registration index:", indexError.message);
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
