const { RequestforProposalModel } = require("../models");

const addRequestForProposal = async (rfpData) => {
  try {
    return await RequestforProposalModel.create(rfpData);
  } catch (error) {
    throw error;
  }
};

const getAllRequestForProposals = async () => {
  try {
    return await RequestforProposalModel.find()
      .populate("sentTo")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

const getRequestForProposalById = async (id) => {
  try {
    return await RequestforProposalModel.findById(id).populate("sentTo");
  } catch (error) {
    throw error;
  }
};

const updateRequestForProposal = async (id, updateData) => {
  try {
    return await RequestforProposalModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw error;
  }
};

const deleteRequestForProposal = async (id) => {
  try {
    return await RequestforProposalModel.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};

const updateRequestForProposalStatusAndVendors = async (id, vendorIds) => {
  try {
    return await RequestforProposalModel.findByIdAndUpdate(
      id,
      {
        status: "sent",
        sentTo: vendorIds,
        updatedAt: Date.now(),
      },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addRequestForProposal,
  getAllRequestForProposals,
  getRequestForProposalById,
  updateRequestForProposal,
  deleteRequestForProposal,
  updateRequestForProposalStatusAndVendors,
};
