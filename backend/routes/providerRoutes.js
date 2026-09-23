const express = require("express");
const router = express.Router();

const {
  registerProvider,
  loginProvider,
  getAllProviders,
  getProviderById,
} = require("../controllers/providerController");

router.post("/register", registerProvider);
router.post("/login", loginProvider);
router.get("/", getAllProviders);

router.get("/:id", getProviderById);

module.exports = router;