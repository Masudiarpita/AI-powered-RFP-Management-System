const express = require("express");
const {
  RequestforProposalController,
  VendorController,
} = require("../controllers");

const router = express.Router();


router.post("/rfps/create", RequestforProposalController.createRFP);
router.post("/rfps/getAll", RequestforProposalController.getAllRFPs);
router.post("/rfps/getById", RequestforProposalController.getRFPById);
router.put("/rfps/update", RequestforProposalController.updateRFP);
router.put("/rfps/delete", RequestforProposalController.deleteRFP);
router.post("/rfps/send", RequestforProposalController.sendRFP);
router.post("/rfps/getProposals", RequestforProposalController.getRFPProposals);
router.post("/rfps/compare", RequestforProposalController.compareProposals);


router.post("/vendors/create", VendorController.createVendor);
router.post("/vendors/getAll", VendorController.getAllVendors);
router.post("/vendors/getById", VendorController.getVendorById);
router.put("/vendors/update", VendorController.updateVendor);
router.put("/vendors/delete", VendorController.deleteVendor);

module.exports = router;
