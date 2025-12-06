const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    requestforProposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "requestforproposal",
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
    },
    type: {
      type: String,
      enum: ["sent", "received"],
      required: true,
    },
    subject: {
      type: String,
    },
    body: {
      type: String,
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    messageId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("email-logs", emailLogSchema);
