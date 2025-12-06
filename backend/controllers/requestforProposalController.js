const { VendorDAO, ProposalDAO, RequestforProposalDAO } = require("../DAO");
const aiService = require("../services/aiService");
const emailService = require("../services/emailService");

const createRFP = async (req, res) => {
  try {
    const { naturalLanguageInput } = req.body;

    if (!naturalLanguageInput) {
      return res
        .status(400)
        .json({ error: "Natural language input is required" });
    }

    const parseResult = await aiService.parseRFPFromNaturalLanguage(
      naturalLanguageInput
    );

    if (!parseResult.success) {
      return res
        .status(500)
        .json({ error: "Failed to parse RFP", details: parseResult.error });
    }

    const rfp = await RequestforProposalDAO.addRequestForProposal(
      parseResult.data
    );

    res.status(201).json({
      success: true,
      message: "RFP created successfully",
      data: rfp,
    });
  } catch (error) {
    console.error("Create RFP error:", error);
    res
      .status(500)
      .json({ error: "Failed to create RFP", details: error.message });
  }
};

const getAllRFPs = async (req, res) => {
  try {
    const rfps = await RequestforProposalDAO.getAllRequestForProposals();

    res.json({
      success: true,
      data: rfps,
    });
  } catch (error) {
    console.error("Get RFPs error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch RFPs", details: error.message });
  }
};

const getRFPById = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "RFP ID is required" });
    }

    const rfp = await RequestforProposalDAO.getRequestForProposalById(id);

    if (!rfp) {
      return res.status(404).json({ error: "RFP not found" });
    }

    res.json({
      success: true,
      data: rfp,
    });
  } catch (error) {
    console.error("Get RFP error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch RFP", details: error.message });
  }
};

const updateRFP = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ error: "RFP ID is required" });
    }

    const rfp = await RequestforProposalDAO.updateRequestForProposal(
      id,
      updateData
    );

    if (!rfp) {
      return res.status(404).json({ error: "RFP not found" });
    }

    res.json({
      success: true,
      message: "RFP updated successfully",
      data: rfp,
    });
  } catch (error) {
    console.error("Update RFP error:", error);
    res
      .status(500)
      .json({ error: "Failed to update RFP", details: error.message });
  }
};

const deleteRFP = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "RFP ID is required" });
    }

    const rfp = await RequestforProposalDAO.deleteRequestForProposal(id);

    if (!rfp) {
      return res.status(404).json({ error: "RFP not found" });
    }

    await ProposalDAO.deleteProposalsByRfpId(id);

    res.json({
      success: true,
      message: "RFP deleted successfully",
    });
  } catch (error) {
    console.error("Delete RFP error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete RFP", details: error.message });
  }
};

const sendRFP = async (req, res) => {
  try {
    const { id, vendorIds } = req.body;

    if (!id) {
      return res.status(400).json({ error: "RFP ID is required" });
    }

    if (!vendorIds || vendorIds.length === 0) {
      return res.status(400).json({ error: "Vendor IDs are required" });
    }

    const rfp = await RequestforProposalDAO.getRequestForProposalById(id);

    if (!rfp) {
      return res.status(404).json({ error: "RFP not found" });
    }

    const vendors = await VendorDAO.getVendorsByIds(vendorIds);

    if (vendors.length === 0) {
      return res.status(404).json({ error: "No valid vendors found" });
    }

    const results = await emailService.sendRFP(rfp, vendors);

    await RequestforProposalDAO.updateRequestForProposalStatusAndVendors(
      id,
      vendorIds
    );

    res.json({
      success: true,
      message: "RFP sent to vendors",
      results,
    });
  } catch (error) {
    console.error("Send RFP error:", error);
    res
      .status(500)
      .json({ error: "Failed to send RFP", details: error.message });
  }
};

const getRFPProposals = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "RFP ID is required" });
    }

    const proposals = await ProposalDAO.getProposalById(id);

    res.json({
      success: true,
      data: proposals,
    });
  } catch (error) {
    console.error("Get proposals error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch proposals", details: error.message });
  }
};

const compareProposals = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "RFP ID is required" });
    }
    const rfp = await RequestforProposalDAO.getRequestForProposalById(id);

    if (!rfp) {
      return res.status(404).json({ error: "RFP not found" });
    }
    const proposals = await ProposalDAO.getProposalsByRfpId(id);

    if (!proposals || proposals.length === 0) {
      return res.status(404).json({ error: "No proposals found for this RFP" });
    }

    const comparisonResult = await aiService.analyzeProposals(rfp, proposals);

    if (!comparisonResult.success) {
      return res.status(500).json({ error: "Failed to analyze proposals" });
    }

    res.json({
      success: true,
      data: {
        rfp,
        proposals,
        comparison: comparisonResult.data,
      },
    });
  } catch (error) {
    console.error("Compare proposals error:", error);
    res.status(500).json({
      error: "Failed to compare proposals",
      details: error.message,
    });
  }
};

module.exports = {
  createRFP,
  getAllRFPs,
  getRFPById,
  updateRFP,
  deleteRFP,
  sendRFP,
  getRFPProposals,
  compareProposals,
};
