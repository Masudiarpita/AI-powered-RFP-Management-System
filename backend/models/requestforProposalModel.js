const mongoose = require("mongoose");

const requestforProposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    deliveryTimeline: {
      type: String,
      required: true,
    },
    items: [
      {
        name: String,
        quantity: Number,
        specifications: String,
      },
    ],
    paymentTerms: {
      type: String,
    },
    warrantyRequirements: {
      type: String,
    },
    additionalRequirements: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "closed"],
      default: "draft",
    },
    sentTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vendor",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("requestforproposal", requestforProposalSchema);
