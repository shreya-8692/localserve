const Booking = require("../models/Booking");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      customer,
      provider,
      service,
      bookingDate,
      bookingTime,
      location,
      description,
    } = req.body;

    // Check required fields
    if (
      !customer ||
      !provider ||
      !service ||
      !bookingDate ||
      !bookingTime ||
      !location?.address
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details.",
      });
    }

    const booking = await Booking.create({
      customer,
      provider,
      service,
      bookingDate,
      bookingTime,
      location: {
        address: location.address,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
      },
      description: description || "",
      status: "Pending",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("provider", "name email phone category city")
      .populate("service", "name category price")
      .populate("customer", "name email phone");

    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating booking.",
      error: error.message,
    });
  }
};


// Get bookings for a provider
const getProviderBookings = async (req, res) => {
  try {
    const { providerId } = req.params;

    const bookings = await Booking.find({
      provider: providerId,
    })
      .populate("customer", "name email phone")
      .populate("service", "name category price")
      .populate("provider", "name email phone category city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get provider bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching provider bookings.",
      error: error.message,
    });
  }
};
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Customer can cancel only a pending booking
    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be cancelled.",
      });
    }

    booking.status = "Cancelled";

    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("provider", "name phone category city")
      .populate("service", "name category price")
      .populate("customer", "name email phone");

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while cancelling booking.",
      error: error.message,
    });
  }
};


// Get bookings for a customer
const getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    const bookings = await Booking.find({
      customer: customerId,
    })
      .populate("provider", "name email phone category city")
      .populate("service", "name category price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get customer bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching customer bookings.",
      error: error.message,
    });
  }
};


// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Accepted",
      "Rejected",
      "On The Way",
      "In Progress",
      "Completed",
      "Cancelled",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer", "name email phone")
      .populate("provider", "name email phone category city")
      .populate("service", "name category price");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating booking.",
      error: error.message,
    });
  }
};


module.exports = {
  createBooking,
  getProviderBookings,
  getCustomerBookings,
  cancelBooking,
  updateBookingStatus,
};