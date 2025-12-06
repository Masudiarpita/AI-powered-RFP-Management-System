const { EmailLogModel } = require("../models");

const addEmailLog = async (logData) => {
  try {
    return await EmailLogModel.create(logData);
  } catch (error) {
    throw error;
  }
};

const getLatestSentEmailToVendor = async (vendorId) => {
  try {
    return await EmailLogModel.findOne({
      vendor: vendorId,
      type: "sent",
    })
      .sort({ createdAt: -1 })
      .populate("requestforProposal");
  } catch (error) {
    throw error;
  }
};

const getEmailLogsByRfpId = async (rfpId) => {
  try {
    return await EmailLogModel.find({ rfpId }).sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

const getEmailLogsByType = async (type) => {
  try {
    return await EmailLogModel.find({ type }).sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addEmailLog,
  getLatestSentEmailToVendor,
  getEmailLogsByRfpId,
  getEmailLogsByType,
};
