const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    requestforProposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "requestforproposal",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
      required: true,
    },
    rawContent: {
      type: String,
      required: true,
    },
    parsedData: {
      totalPrice: Number,
      breakdown: [
        {
          item: String,
          unitPrice: Number,
          quantity: Number,
          totalPrice: Number,
        },
      ],
      deliveryTimeline: String,
      paymentTerms: String,
      warranty: String,
      additionalTerms: String,
    },
    aiAnalysis: {
      score: { type: Number, min: 0, max: 100 },
      strengths: [String],
      weaknesses: [String],
      summary: String,
      recommendation: String,
    },
    emailMetadata: {
      messageId: String,
      receivedAt: Date,
      subject: String,
      from: String,
    },
    attachments: [
      {
        filename: String,
        contentType: String,
        size: Number,
        content: String,
      },
    ],
    status: {
      type: String,
      enum: ["received", "parsed", "analyzed"],
      default: "received",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("proposal",proposalSchema)
