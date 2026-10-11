
import mongoose from "mongoose";

const CreatorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    commissionRate: {
      type: Number,
      default: 25,
      min: 0,
      max: 100,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Creator ||
  mongoose.model("Creator", CreatorSchema);
