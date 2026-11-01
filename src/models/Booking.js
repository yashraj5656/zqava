import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    companion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },

    message: { type: String, default: "" },

    hourlyRate: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    serviceFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: { type: String, default: "upi" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked_in",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },

    /* NEW — companion check-in system */
    checkinCode: {
      type: String,
      default: "",
      index: true,
    },
    checkedInAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BookingSchema.index({ companion: 1, date: 1, time: 1 });
BookingSchema.index({ checkinCode: 1 });

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);