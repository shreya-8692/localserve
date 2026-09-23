const Review = require("../models/Review");
const Booking = require("../models/Booking");


// ===============================
// CREATE REVIEW
// ===============================
const createReview = async (req, res) => {
  try {
    const {
      booking,
      customer,
      provider,
      service,
      rating,
      comment,
    } = req.body;

    if (
      !booking ||
      !customer ||
      !provider ||
      !service ||
      !rating
    ) {
      return res.status(400).json({
        success: false,
        message: "Required review information is missing.",
      });
    }

    const bookingData = await Booking.findById(booking);

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Review only after service completion
    if (bookingData.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "You can review a service only after it is completed.",
      });
    }

    // Make sure booking belongs to this customer
    if (bookingData.customer.toString() !== customer.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot review this booking.",
      });
    }

    // Prevent duplicate review
    const existingReview = await Review.findOne({ booking });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking.",
      });
    }

    const review = await Review.create({
      booking,
      customer,
      provider,
      service,
      rating,
      comment,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("customer", "name")
      .populate("service", "name");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating review.",
      error: error.message,
    });
  }
};


// ===============================
// GET PROVIDER REVIEWS
// ===============================
const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await Review.find({
      provider: providerId,
    })
      .populate("customer", "name")
      .populate("service", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / totalReviews;

    res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Get provider reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while loading reviews.",
      error: error.message,
    });
  }
};


// ===============================
// CHECK BOOKING REVIEW
// ===============================
const getBookingReview = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const review = await Review.findOne({
      booking: bookingId,
    });

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Get booking review error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while checking review.",
      error: error.message,
    });
  }
};


module.exports = {
  createReview,
  getProviderReviews,
  getBookingReview,
};