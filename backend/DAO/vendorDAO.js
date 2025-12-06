const { VendorModel } = require("../models");

const addVendor = async (vendorData) => {
  try {
    return await VendorModel.create(vendorData);
  } catch (error) {
    throw error;
  }
};

const getAllVendors = async () => {
  try {
    return await VendorModel.find().sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

const getVendorById = async (id) => {
  try {
    return await VendorModel.findById(id);
  } catch (error) {
    throw error;
  }
};

const getVendorByEmail = async (email) => {
  try {
    return await VendorModel.findOne({ email });
  } catch (error) {
    throw error;
  }
};

const getVendorsByIds = async (ids) => {
  try {
    return await VendorModel.find({ _id: { $in: ids } });
  } catch (error) {
    throw error;
  }
};

const updateVendor = async (id, updateData) => {
  try {
    return await VendorModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    throw error;
  }
};

const deleteVendor = async (id) => {
  try {
    return await VendorModel.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addVendor,
  getAllVendors,
  getVendorById,
  getVendorByEmail,
  getVendorsByIds,
  updateVendor,
  deleteVendor,
};
