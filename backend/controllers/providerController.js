const ServiceProvider = require("../models/ServiceProvider");

const registerProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      category,
      experience,
      address,
      city,
      description,
    } = req.body;

    // Check required fields
    if (!name || !email || !phone || !password || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check whether provider already exists
    const existingProvider = await ServiceProvider.findOne({
      email: email.toLowerCase(),
    });

    if (existingProvider) {
      return res.status(409).json({
        success: false,
        message: "Provider with this email already exists",
      });
    }

    // Create provider
    const provider = await ServiceProvider.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      category,
      experience,
      address,
      city,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Provider registered successfully",
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        category: provider.category,
        city: provider.city,
      },
    });
  } catch (error) {
    console.error("Provider registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const loginProvider = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    const provider = await ServiceProvider.findOne({
      email: email.toLowerCase(),
    });

    if (!provider) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (provider.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Provider login successful",
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        category: provider.category,
        experience: provider.experience,
        address: provider.address,
        city: provider.city,
        description: provider.description,
        isAvailable: provider.isAvailable,
      },
    });
  } catch (error) {
    console.error("Provider login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const getAllProviders = async (req, res) => {
  try {
    const providers = await ServiceProvider.find({
      isAvailable: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    console.error("Get providers error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const updateProviderLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { address, latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude === null ||
      longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    const provider = await ServiceProvider.findByIdAndUpdate(
      id,
      {
        location: {
          address: address || "",
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Provider location updated successfully.",
      provider,
    });
  } catch (error) {
    console.error("Update provider location error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating location.",
      error: error.message,
    });
  }
};
const getProviderById = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(
      req.params.id
    ).select("-password");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    res.status(200).json({
      success: true,
      provider,
    });
  } catch (error) {
    console.error("Get provider error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  registerProvider,
  loginProvider,
  getAllProviders,
  getProviderById,
};