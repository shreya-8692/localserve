import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Booking.css";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data will come from ProviderDetails.jsx
  const provider = location.state?.provider;
  const service = location.state?.service;

  const [formData, setFormData] = useState({
    bookingDate: "",
    bookingTime: "",
    address: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!provider || !service) {
      setError(
        "Provider or service information is missing."
      );
      return;
    }

    if (
      !formData.bookingDate ||
      !formData.bookingTime ||
      !formData.address
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    try {
      setLoading(true);

      // Get logged-in customer
      const storedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("customer");

      if (!storedUser) {
        setError(
          "Please login before booking a service."
        );
        setLoading(false);
        return;
      }

      const customer = JSON.parse(storedUser);

      const customerId =
        customer._id || customer.id;

      if (!customerId) {
        setError(
          "Customer information is invalid."
        );
        setLoading(false);
        return;
      }

      const providerId =
        provider._id || provider.id;

      const serviceId =
        service._id || service.id;

      const response = await fetch(
        "/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer: customerId,
            provider: providerId,
            service: serviceId,

            bookingDate:
              formData.bookingDate,

            bookingTime:
              formData.bookingTime,

            location: {
              address: formData.address,
              latitude:
                customer.latitude ||
                customer.location?.latitude ||
                null,
              longitude:
                customer.longitude ||
                customer.location?.longitude ||
                null,
            },

            description:
              formData.description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create booking."
        );
      }

      setSuccess(
        "Booking request sent successfully!"
      );

      setTimeout(() => {
        navigate("/bookings");
      }, 1200);
    } catch (err) {
      console.error(
        "Booking error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while creating booking."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!provider || !service) {
    return (
      <div className="booking-page">
        <div className="booking-error-card">
          <div className="booking-error-icon">
            ⚠️
          </div>

          <h2>
            Booking information not found
          </h2>

          <p>
            Please select a service from a
            provider before booking.
          </p>

          <button
            onClick={() =>
              navigate("/services")
            }
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">

      {/* Header */}
      <section className="booking-header">
        <span>
          LOCAL SERVICE BOOKING
        </span>

        <h1>
          Book Your Service
        </h1>

        <p>
          Schedule a trusted local
          professional at your preferred
          time.
        </p>
      </section>

      <div className="booking-container">

        {/* Left Side */}
        <div className="booking-summary">

          <div className="summary-card">

            <div className="summary-avatar">
              {provider.name
                ?.charAt(0)
                .toUpperCase() || "P"}
            </div>

            <div>
              <h2>
                {provider.name}
              </h2>

              <p>
                {provider.category}
              </p>
            </div>

          </div>

          <div className="service-summary">

            <span className="summary-label">
              SELECTED SERVICE
            </span>

            <h2>
              {service.name}
            </h2>

            <p>
              {service.description ||
                "Professional local service"}
            </p>

            <div className="price-row">
              <span>
                Service Price
              </span>

              <strong>
                ₹{service.price}
              </strong>
            </div>

          </div>

          <div className="provider-location">

            <span className="summary-label">
              PROVIDER LOCATION
            </span>

            <p>
              📍{" "}
              {provider.location?.address ||
                provider.address ||
                provider.city ||
                "Location available"}
            </p>

          </div>

        </div>

        {/* Right Side */}
        <div className="booking-form-card">

          <form onSubmit={handleBooking}>

            <div className="form-section-title">
              <span>01</span>

              <div>
                <h3>
                  Select Date & Time
                </h3>

                <p>
                  Choose when you need the
                  service.
                </p>
              </div>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>
                  Service Date *
                </label>

                <input
                  type="date"
                  name="bookingDate"
                  value={
                    formData.bookingDate
                  }
                  onChange={handleChange}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Preferred Time *
                </label>

                <input
                  type="time"
                  name="bookingTime"
                  value={
                    formData.bookingTime
                  }
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-section-title">
              <span>02</span>

              <div>
                <h3>
                  Service Location
                </h3>

                <p>
                  Where should the provider
                  come?
                </p>
              </div>
            </div>

            <div className="form-group">

              <label>
                Complete Address *
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete service address..."
                rows="4"
                required
              />

            </div>

            <div className="form-section-title">
              <span>03</span>

              <div>
                <h3>
                  Service Requirement
                </h3>

                <p>
                  Tell the provider what you
                  need.
                </p>
              </div>
            </div>

            <div className="form-group">

              <label>
                Additional Details
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="Example: Kitchen tap is leaking and needs replacement..."
                rows="4"
              />

            </div>

            {error && (
              <div className="booking-alert error">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="booking-alert success">
                ✓ {success}
              </div>
            )}

            <button
              type="submit"
              className="confirm-booking-button"
              disabled={loading}
            >
              {loading
                ? "Sending Request..."
                : "Confirm Booking →"}
            </button>

            <p className="booking-note">
              Your booking will first be sent
              to the provider for confirmation.
            </p>

          </form>

        </div>

      </div>
    </div>
  );
};

export default Booking;