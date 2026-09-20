import mongoose from "mongoose";

const BankDetailsSchema = new mongoose.Schema(
  {
    companion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    branchName: {
      type: String,
      default: "",
      trim: true,
    },

    upiId: {
      type: String,
      default: "",
      trim: true,
    },

    accountType: {
      type: String,
      enum: ["savings", "current"],
      default: "savings",
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.BankDetails ||
  mongoose.model("BankDetails", BankDetailsSchema);