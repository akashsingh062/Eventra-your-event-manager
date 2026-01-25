import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {type: String,required: true,trim: true,},
    description: {type: String,required: true,trim: true,},
    date: {type: Date,required: true,},
    location: {type: String,required: true,trim: true,},
    banner: {
      type: String,
      required: true,
      trim: true,
    },
    totalSeats: {type: Number,required: true,min: 1,},
    availableSeats: {type: Number,required: true,min: 0,},
    status: {type: String,enum: ["upcoming", "completed"],default: "upcoming",},
    createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,},
  },
  {timestamps: true,}
);

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;