const { ProposalModel } = require("../models");

const addProposal = async (proposalData) => {
  try {
    return await ProposalModel.create(proposalData);
  } catch (error) {
    throw error;
  }
};

const getProposalsByRfpId = async (rfpId) => {
  try {
    return await ProposalModel.find({ requestforProposal: rfpId })
      .populate({ path: "vendor", strictPopulate: false })
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

const getProposalById = async (id) => {
  try {
    return await ProposalModel.findById(id).populate({
      path: "vendor",
      strictPopulate: false,
    });
  } catch (error) {
    throw error;
  }
};

const updateProposal = async (id, updateData) => {
  try {
    return await ProposalModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

const deleteProposalsByRfpId = async (rfpId) => {
  try {
    return await ProposalModel.deleteMany({ rfpId });
  } catch (error) {
    throw error;
  }
};

const getProposalByVendorAndRfp = async (vendorId, rfpId) => {
  try {
    return await ProposalModel.findOne({ vendorId, rfpId });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addProposal,
  getProposalsByRfpId,
  getProposalById,
  updateProposal,
  deleteProposalsByRfpId,
  getProposalByVendorAndRfp,
};
