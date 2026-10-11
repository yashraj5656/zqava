
import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator",
      required: true,
      index: true,
    },

    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    attributedAt: {
      type: Date,
      default: Date.now,
    },

    commissionEligibleUntil: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date;
      },
    },

    // Updated by the payment/commission logic after a qualifying transaction.
    totalEligibleProfit: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    payoutStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Referral ||
  mongoose.model("Referral", ReferralSchema);
