const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },

    password: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Plumbing",
        "Electrical",
        "Carpentry",
        "Cleaning",
        "Painting",
        "Vehicle Repair",
        "Appliance Repair",
        "Other",
      ],
    },

    experience: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    availability: {
      startTime: {
        type: String,
        default: "09:00",
      },

      endTime: {
        type: String,
        default: "18:00",
      },
    },

    location: {
      address: {
        type: String,
        default: "",
      },

      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);