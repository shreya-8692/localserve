const express = require("express");

const router = express.Router();

const {
  createService,
  getProviderServices,
  getAllServices,
  deleteService,
} = require("../controllers/serviceController");


router.post("/", createService);

router.get("/provider/:providerId", getProviderServices);

router.get("/", getAllServices);

router.delete("/:id", deleteService);


module.exports = router;