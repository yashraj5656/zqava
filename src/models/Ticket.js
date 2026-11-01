import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
      index: true,
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    quantity: { type: Number, required: true, min: 1 },

    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    ticketCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["reserved", "paid", "checked_in", "cancelled", "refunded", "expired"],
      default: "reserved",
    },

    // Razorpay references
    razorpayOrderId: { type: String, default: "", index: true },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
  },
  { timestamps: true }
);

TicketSchema.index({ partyId: 1, buyerId: 1 });

export default mongoose.models.Ticket ||
  mongoose.model("Ticket", TicketSchema);