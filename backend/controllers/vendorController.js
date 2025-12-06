const { VendorDAO } = require("../DAO");

const createVendor = async (req, res) => {
  try {
    const vendor = await VendorDAO.addVendor(req.body);

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Vendor with this email already exists" });
    }
    console.error("Create vendor error:", error);
    res
      .status(500)
      .json({ error: "Failed to create vendor", details: error.message });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await VendorDAO.getAllVendors();

    res.json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error("Get vendors error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch vendors", details: error.message });
  }
};

const getVendorById = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    const vendor = await VendorDAO.getVendorById(id);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Get vendor error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch vendor", details: error.message });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    const vendor = await VendorDAO.updateVendor(id, updateData);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Update vendor error:", error);
    res
      .status(500)
      .json({ error: "Failed to update vendor", details: error.message });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    const vendor = await VendorDAO.deleteVendor(id);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Delete vendor error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete vendor", details: error.message });
  }
};

module.exports = {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
};
