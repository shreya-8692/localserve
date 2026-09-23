import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CustomerTracking.css";

const API = "/api";

const statusFlow = [
  "Accepted",
  "On The Way",
  "In Progress",
  "Completed",
];

function CustomerTracking() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchBooking = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API}/bookings/${bookingId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load booking."
        );
      }

      setBooking(data.booking);
    } catch (err) {
      console.error("Booking fetch error:", err);
      setError(
        err.message || "Unable to load booking."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is missing.");
      setLoading(false);
      return;
    }

    fetchBooking(true);

    const interval = setInterval(() => {
      fetchBooking(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [bookingId]);

  const currentIndex = useMemo(() => {
    if (!booking?.status) return -1;

    return statusFlow.indexOf(booking.status);
  }, [booking]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooking(false);
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const calculateDistance = () => {
    const providerLat =
      booking?.provider?.location?.latitude;

    const providerLng =
      booking?.provider?.location?.longitude;

    const customerLat =
      booking?.location?.latitude;

    const customerLng =
      booking?.location?.longitude;

    if (
      providerLat == null ||
      providerLng == null ||
      customerLat == null ||
      customerLng == null
    ) {
      return null;
    }

    const R = 6371;

    const dLat =
      ((providerLat - customerLat) * Math.PI) / 180;

    const dLng =
      ((providerLng - customerLng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
      Math.cos(
        (customerLat * Math.PI) / 180
      ) *
        Math.cos(
          (providerLat * Math.PI) / 180
        ) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c =
      2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(1);
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="tracking-loading">
          <div className="tracking-spinner" />
          <p>Loading your booking...</p>
        </div>

        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <main className="tracking-page">
          <div className="tracking-error">
            <div className="tracking-error-icon">
              ⚠️
            </div>

            <h2>Unable to load booking</h2>

            <p>{error}</p>

            <button
              className="tracking-primary-button"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (!booking) {
    return null;
  }

  const distance = calculateDistance();

  return (
    <>
      <Navbar />

      <main className="tracking-page">

        {/* HEADER */}

        <section className="tracking-header">

          <div>
            <span className="tracking-eyebrow">
              Service Tracking
            </span>

            <h1>
              Track Your Service
            </h1>

            <p>
              Follow the progress of your service request
              in real time.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </section>

        {/* STATUS CARD */}

        <section className="tracking-card status-card">

          <div className="tracking-card-header">

            <div>
              <span className="tracking-eyebrow">
                Current Status
              </span>

              <h2>
                {booking.status}
              </h2>
            </div>

            <span
              className={`tracking-status ${
                booking.status
                  ?.toLowerCase()
                  .replaceAll(" ", "-")
              }`}
            >
              {booking.status}
            </span>

          </div>

          <div className="status-timeline">

            {statusFlow.map(
              (status, index) => {

                const completed =
                  index <= currentIndex;

                const current =
                  index === currentIndex;

                return (
                  <div
                    className={`timeline-step ${
                      completed ? "completed" : ""
                    } ${
                      current ? "current" : ""
                    }`}
                    key={status}
                  >

                    <div className="timeline-circle">
                      {completed
                        ? "✓"
                        : index + 1}
                    </div>

                    <span>
                      {status}
                    </span>

                    {index <
                      statusFlow.length - 1 && (
                      <div
                        className={`timeline-line ${
                          index < currentIndex
                            ? "completed"
                            : ""
                        }`}
                      />
                    )}

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* MAIN GRID */}

        <div className="tracking-grid">

          {/* BOOKING DETAILS */}

          <section className="tracking-card">

            <span className="tracking-eyebrow">
              Booking Details
            </span>

            <h2>
              {booking.service?.name ||
                "Requested Service"}
            </h2>

            <div className="tracking-details">

              <div className="tracking-detail">
                <span>📅</span>

                <div>
                  <small>Date</small>
                  <strong>
                    {formatDate(
                      booking.bookingDate
                    )}
                  </strong>
                </div>
              </div>

              <div className="tracking-detail">
                <span>🕐</span>

                <div>
                  <small>Time</small>
                  <strong>
                    {booking.bookingTime ||
                      "Not specified"}
                  </strong>
                </div>
              </div>

              <div className="tracking-detail">
                <span>📍</span>

                <div>
                  <small>Service Location</small>

                  <strong>
                    {booking.location?.address ||
                      "Location not specified"}
                  </strong>
                </div>
              </div>

              <div className="tracking-detail">
                <span>💰</span>

                <div>
                  <small>Service Price</small>

                  <strong>
                    ₹
                    {booking.service?.price ??
                      "—"}
                  </strong>
                </div>
              </div>

            </div>

            {booking.description && (
              <div className="customer-requirement">

                <small>
                  Your Requirement
                </small>

                <p>
                  {booking.description}
                </p>

              </div>
            )}

          </section>

          {/* PROVIDER */}

          <section className="tracking-card provider-card">

            <span className="tracking-eyebrow">
              Service Provider
            </span>

            <div className="tracking-provider">

              <div className="provider-tracking-avatar">
                {booking.provider?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "P"}
              </div>

              <div>

                <h2>
                  {booking.provider?.name ||
                    "Service Provider"}
                </h2>

                <p>
                  {booking.provider?.category ||
                    "Local Service Provider"}
                </p>

              </div>

            </div>

            <div className="provider-contact">

              {booking.provider?.phone && (
                <div>
                  <span>📞</span>
                  <strong>
                    {booking.provider.phone}
                  </strong>
                </div>
              )}

              {booking.provider?.city && (
                <div>
                  <span>📍</span>
                  <strong>
                    {booking.provider.city}
                  </strong>
                </div>
              )}

            </div>

          </section>

        </div>

        {/* LOCATION */}

        <section className="tracking-card location-tracking-card">

          <div className="location-heading">

            <div>
              <span className="tracking-eyebrow">
                Location
              </span>

              <h2>
                Provider Location
              </h2>

              <p>
                {booking.provider?.location
                  ?.latitude != null
                  ? "Provider location is available."
                  : "Provider location has not been shared yet."}
              </p>
            </div>

            {distance && (
              <div className="distance-box">

                <span>
                  Approx. Distance
                </span>

                <strong>
                  {distance} km
                </strong>

              </div>
            )}

          </div>

          <div className="map-placeholder">

            {booking.provider?.location
              ?.latitude != null &&
            booking.provider?.location
              ?.longitude != null ? (
              <iframe
                title="Provider Location"
                className="tracking-map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  booking.provider.location.longitude -
                  0.01
                }%2C${
                  booking.provider.location.latitude -
                  0.01
                }%2C${
                  booking.provider.location.longitude +
                  0.01
                }%2C${
                  booking.provider.location.latitude +
                  0.01
                }&layer=mapnik&marker=${
                  booking.provider.location.latitude
                }%2C${
                  booking.provider.location.longitude
                }`}
                loading="lazy"
              />
            ) : (
              <div className="no-location">

                <div>
                  📍
                </div>

                <h3>
                  Provider location unavailable
                </h3>

                <p>
                  The provider has not added their
                  current location yet.
                </p>

              </div>
            )}

          </div>

        </section>

        {/* COMPLETED */}

        {booking.status === "Completed" && (
          <section className="completed-message">

            <div className="completed-icon">
              ✓
            </div>

            <div>
              <h2>
                Service Completed
              </h2>

              <p>
                Your service request has been
                successfully completed.
              </p>
            </div>

          </section>
        )}

      </main>

      <Footer />
    </>
  );
}

export default CustomerTracking;