const express = require("express");

const router = express.Router();

const {
  createReview,
  getProviderReviews,
  getBookingReview,
} = require("../controllers/reviewController");


// Create review
router.post("/", createReview);


// Get all reviews of provider
router.get("/provider/:providerId", getProviderReviews);


// Check whether booking has already been reviewed
router.get("/booking/:bookingId", getBookingReview);


module.exports = router;