const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      city,
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone and password.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      address: address || "",
      city: city || "",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
      },
    });
  } catch (error) {
    console.error("User registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while registering user.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
};