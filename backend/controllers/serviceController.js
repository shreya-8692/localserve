const Service = require("../models/Service");


// Add new service
const createService = async (req, res) => {
  try {
    const {
      provider,
      name,
      category,
      price,
      description,
    } = req.body;

    if (!provider || !name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const service = await Service.create({
      provider,
      name,
      category,
      price,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Get services of a provider
const getProviderServices = async (req, res) => {
  try {
    const { providerId } = req.params;

    const services = await Service.find({
      provider: providerId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Get services error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({
      isActive: true,
    })
      .populate(
        "provider",
        "name email phone category city location"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Get all services error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  createService,
  getProviderServices,
  getAllServices,
  deleteService,
};