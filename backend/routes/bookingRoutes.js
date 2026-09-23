const express = require("express");

const router = express.Router();

const {
  createBooking,
  getProviderBookings,
  getCustomerBookings,
  updateBookingStatus,
  cancelBooking,
} = require("../controllers/bookingController");


// Create booking
router.post("/", createBooking);


// Provider bookings
router.get("/provider/:providerId", getProviderBookings);


// Customer bookings
router.get("/customer/:customerId", getCustomerBookings);
router.put("/:bookingId/status", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("customer", "name email")
      .populate("provider", "name")
      .populate("service", "name price");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.status = status;

    await booking.save();

    const notification = {
      type: "BOOKING_STATUS",
      title: "Booking Updated",
      message: `Your booking is now ${status}.`,
      bookingId: booking._id,
      status,
      createdAt: new Date(),
    };

    const sendNotification = req.app.get("sendNotification");

    if (booking.customer?._id) {
      sendNotification(
        booking.customer._id,
        notification
      );
    }

    res.json({
      success: true,
      message: "Booking status updated.",
      booking,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update booking.",
    });
  }
});


// Update booking status
router.put("/:id/status", updateBookingStatus);

router.put("/:id/cancel", cancelBooking);


module.exports = router;