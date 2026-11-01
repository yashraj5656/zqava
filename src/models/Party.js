import mongoose from "mongoose";

const PartySchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      enum: [
        "House Party",
        "Rooftop",
        "Club",
        "Bonfire",
        "Pool Party",
        "Dinner",
        "Games Night",
        "Other",
      ],
      default: "House Party",
    },

    city: { type: String, required: true, index: true },
    venue: { type: String, required: true },
    coverImage: { type: String, default: "" },

    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true }, // "20:00"
    endTime: { type: String, required: true },

    ticketPrice: { type: Number, required: true, min: 0 },
    totalTickets: { type: Number, required: true, min: 1 },
    ticketsSold: { type: Number, default: 0 },

    maxGuestsPerBooking: { type: Number, default: 4, min: 1 },

    ageLimit: { type: Number, default: 18 },

    tags: [{ type: String }],

    status: {
      type: String,
      enum: ["draft", "live", "sold_out", "cancelled", "completed"],
      default: "live",
      index: true,
    },

    paidToBank: {
      type: Number,
      default: 0,
      min: 0,
    },

    verifiedHost: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PartySchema.virtual("ticketsLeft").get(function () {
  return Math.max(0, this.totalTickets - this.ticketsSold);
});

PartySchema.set("toJSON", { virtuals: true });
PartySchema.set("toObject", { virtuals: true });

export default mongoose.models.Party ||
  mongoose.model("Party", PartySchema);