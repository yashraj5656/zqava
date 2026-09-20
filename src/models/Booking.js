import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    message: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    /*
     * Razorpay handles the actual payment methods.
     * The actual method can be recorded from Razorpay later.
     */
    paymentMethod: {
      type: String,
      default: "razorpay",
    },

    razorpayOrderId: {
      type: String,
      default: "",
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    payoutPaid: {
      type: Boolean,
      default: false,
    },
    
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
      ],
      default: "pending",
    },

  },
  {
    timestamps: true,
  }
);

/*
 * Prevent the same Razorpay payment/order from
 * being attached to multiple bookings.
 *
 * sparse=true allows older bookings that don't
 * have these fields yet.
 */
BookingSchema.index(
  { razorpayOrderId: 1 },
  {
    unique: true,
    sparse: true,
  }
);

BookingSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    sparse: true,
  }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);