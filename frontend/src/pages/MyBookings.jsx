import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyBookings.css";
import ReviewModel from "../components/ReviewModel";

const API = "/api";

const STATUS_FLOW = [
  "Pending",
  "Accepted",
  "On The Way",
  "In Progress",
  "Completed",
];

function MyBookings() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [cancellingId, setCancellingId] = useState("");

  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewedBookings, setReviewedBookings] = useState({});

  const checkBookingReview = useCallback(async (bookingId) => {
    try {
      const response = await fetch(
        `${API}/reviews/booking/${bookingId}`
      );

      const data = await response.json();

      if (response.ok && data.review) {
        setReviewedBookings((current) => ({
          ...current,
          [bookingId]: true,
        }));
      }
    } catch (error) {
      console.error("Review check error:", error);
    }
  }, []);

  const getStoredCustomer = useCallback(() => {
    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("customer");

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }, []);

  const fetchBookings = useCallback(
    async (showRefresh = false) => {
      const storedCustomer = getStoredCustomer();

      if (!storedCustomer) {
        setCustomer(null);
        setBookings([]);
        setLoading(false);
        return;
      }

      const customerId =
        storedCustomer._id ||
        storedCustomer.id ||
        storedCustomer.userId;

      if (!customerId) {
        setCustomer(storedCustomer);
        setBookings([]);
        setError("Your customer account ID could not be found.");
        setLoading(false);
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");
        setCustomer(storedCustomer);

        const response = await fetch(
          `${API}/bookings/customer/${customerId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load your bookings."
          );
        }

        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Fetch customer bookings error:", err);
        setError(err.message || "Unable to load your bookings.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getStoredCustomer]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Check reviews AFTER bookings are loaded
  useEffect(() => {
    const completedBookings = bookings.filter(
      (booking) => booking.status === "Completed"
    );

    completedBookings.forEach((booking) => {
      checkBookingReview(booking._id);
    });
  }, [bookings, checkBookingReview]);

  const cancelBooking = async (bookingId) => {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!shouldCancel) return;

    try {
      setCancellingId(bookingId);
      setError("");

      const response = await fetch(
        `${API}/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel booking."
        );
      }

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId ? data.booking : booking
        )
      );
    } catch (err) {
      console.error("Cancel booking error:", err);
      setError(err.message || "Unable to cancel booking.");
    } finally {
      setCancellingId("");
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit review."
        );
      }

      setReviewedBookings((current) => ({
        ...current,
        [reviewData.bookingId]: true,
      }));

      setReviewBooking(null);

      alert("Thank you! Your review has been submitted.");
    } catch (error) {
      console.error("Review submission error:", error);
      alert(error.message || "Unable to submit review.");
    }
  };

  const filteredBookings = useMemo(() => {
    if (filter === "All") return bookings;

    if (filter === "Active") {
      return bookings.filter((booking) =>
        [
          "Pending",
          "Accepted",
          "On The Way",
          "In Progress",
        ].includes(booking.status)
      );
    }

    return bookings.filter(
      (booking) => booking.status === filter
    );
  }, [bookings, filter]);

  const stats = useMemo(
    () => ({
      total: bookings.length,

      pending: bookings.filter(
        (b) => b.status === "Pending"
      ).length,

      active: bookings.filter((b) =>
        [
          "Accepted",
          "On The Way",
          "In Progress",
        ].includes(b.status)
      ).length,

      completed: bookings.filter(
        (b) => b.status === "Completed"
      ).length,
    }),
    [bookings]
  );

  const formatDate = (date) => {
    if (!date) return "Date not specified";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!customer && !loading) {
    return (
      <div className="my-bookings-page">
        <section className="bookings-empty-page">
          <div className="empty-page-icon">📋</div>

          <span className="section-eyebrow">
            MY BOOKINGS
          </span>

          <h1>Sign in to view your bookings</h1>

          <p>
            Your service requests and booking status will
            appear here after you sign in as a customer.
          </p>

          <Link
            className="primary-booking-button"
            to="/register"
          >
            Continue to Customer Account
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">

      <section className="bookings-hero">
        <div className="bookings-hero-inner">

          <div>
            <span className="section-eyebrow">
              SERVICE ACTIVITY
            </span>

            <h1>
              {customer?.name
                ? `${customer.name.split(" ")[0]}'s Bookings`
                : "My Bookings"}
            </h1>

            <p>
              Track your service requests, provider responses
              and job progress from one place.
            </p>
          </div>

          <button
            className="refresh-bookings-button"
            onClick={() => fetchBookings(true)}
            disabled={refreshing}
          >
            <span>{refreshing ? "↻" : "⟳"}</span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>
      </section>

      <main className="bookings-container">

        {error && (
          <div className="booking-error">

            <span>⚠️</span>

            <div>
              <strong>
                Could not load bookings
              </strong>

              <p>{error}</p>
            </div>

            <button
              onClick={() => fetchBookings()}
            >
              Try Again
            </button>

          </div>
        )}

        <section className="booking-stats">

          <StatCard
            label="Total Bookings"
            value={stats.total}
            icon="📋"
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon="⏳"
          />

          <StatCard
            label="Active Jobs"
            value={stats.active}
            icon="🔧"
          />

          <StatCard
            label="Completed"
            value={stats.completed}
            icon="✓"
          />

        </section>

        <section className="bookings-toolbar">

          <div>
            <span className="section-eyebrow">
              YOUR REQUESTS
            </span>

            <h2>Booking History</h2>
          </div>

          <div className="booking-filters">

            {[
              "All",
              "Active",
              "Completed",
              "Rejected",
              "Cancelled",
            ].map((item) => (
              <button
                key={item}
                className={
                  filter === item
                    ? "filter active"
                    : "filter"
                }
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}

          </div>

        </section>

        {loading ? (
          <BookingsSkeleton />
        ) : filteredBookings.length === 0 ? (

          <section className="no-bookings-card">

            <div className="empty-page-icon">
              🧰
            </div>

            <h3>
              {bookings.length === 0
                ? "No bookings yet"
                : `No ${filter.toLowerCase()} bookings`}
            </h3>

            <p>
              {bookings.length === 0
                ? "Find a local service provider and book your first service."
                : "Try another filter to view your other bookings."}
            </p>

            {bookings.length === 0 && (
              <button
                className="primary-booking-button"
                onClick={() => navigate("/services")}
              >
                Explore Services
              </button>
            )}

          </section>

        ) : (

          <section className="booking-list">

            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                formatDate={formatDate}
                cancelling={
                  cancellingId === booking._id
                }
                onCancel={cancelBooking}
                onReview={() =>
                  setReviewBooking(booking)
                }
                reviewed={
                  reviewedBookings[booking._id]
                }
              />
            ))}

          </section>
        )}

      </main>

      {reviewBooking && (
        <ReviewModel
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

    </div>
  );
}

function BookingCard({
  booking,
  formatDate,
  cancelling,
  onCancel,
  onReview,
  reviewed,
}) {
  const status = booking.status || "Pending";

  const currentIndex =
    STATUS_FLOW.indexOf(status);

  const isRejectedOrCancelled = [
    "Rejected",
    "Cancelled",
  ].includes(status);

  return (
    <article className="customer-booking-card">

      <div className="booking-card-header">

        <div className="booking-service-heading">

          <div className="booking-service-icon">
            {getServiceIcon(
              booking.service?.category
            )}
          </div>

          <div>

            <span>
              {booking.service?.category ||
                "Local Service"}
            </span>

            <h3>
              {booking.service?.name ||
                "Service Booking"}
            </h3>

            <p>
              Provider:{" "}
              <strong>
                {booking.provider?.name ||
                  "Provider information unavailable"}
              </strong>
            </p>

          </div>

        </div>

        <StatusBadge status={status} />

      </div>

      <div className="booking-details-grid">

        <Detail
          icon="📅"
          label="Date"
          value={formatDate(
            booking.bookingDate
          )}
        />

        <Detail
          icon="🕐"
          label="Time"
          value={
            booking.bookingTime ||
            "Not specified"
          }
        />

        <Detail
          icon="📍"
          label="Service Location"
          value={
            booking.location?.address ||
            "Location not specified"
          }
        />

        <Detail
          icon="💰"
          label="Service Price"
          value={
            booking.service?.price != null
              ? `₹${booking.service.price}`
              : "To be confirmed"
          }
        />

      </div>

      {booking.description && (
        <div className="customer-requirement">

          <span>Your requirement</span>

          <p>{booking.description}</p>

        </div>
      )}

      {!isRejectedOrCancelled && (
        <div className="booking-progress">

          <div className="progress-line" />

          {STATUS_FLOW.map((step, index) => {

            const completed =
              currentIndex >= index;

            const current =
              currentIndex === index;

            return (
              <div
                className={`customer-progress-step ${
                  completed ? "completed" : ""
                } ${
                  current ? "current" : ""
                }`}
                key={step}
              >

                <div className="customer-progress-dot">
                  {completed && !current
                    ? "✓"
                    : index + 1}
                </div>

                <span>{step}</span>

              </div>
            );
          })}

        </div>
      )}

      <div className="booking-card-footer">

        <span>
          Booking ID:{" "}
          <strong>
            #
            {booking._id
              ?.slice(-8)
              .toUpperCase()}
          </strong>
        </span>

        <span>
          Requested{" "}
          {booking.createdAt
            ? new Date(
                booking.createdAt
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )
            : "recently"}
        </span>

        {status === "Pending" && (
          <button
            className="cancel-booking-button"
            onClick={() =>
              onCancel(booking._id)
            }
            disabled={cancelling}
          >
            {cancelling
              ? "Cancelling..."
              : "Cancel Booking"}
          </button>
        )}

        {status === "Completed" && (
          <button
            className={
              reviewed
                ? "review-booking-button review-submitted"
                : "review-booking-button"
            }
            onClick={onReview}
            disabled={reviewed}
          >
            {reviewed
              ? "✓ Review Submitted"
              : "⭐ Write a Review"}
          </button>
        )}

      </div>

    </article>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="booking-detail">

      <span className="detail-icon">
        {icon}
      </span>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="booking-stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>

    </div>
  );
}

function StatusBadge({ status }) {
  const className = status
    .toLowerCase()
    .replaceAll(" ", "-");

  return (
    <span
      className={`customer-status ${className}`}
    >
      {status}
    </span>
  );
}

function getServiceIcon(category) {
  const icons = {
    Plumbing: "🔧",
    Electrical: "⚡",
    Carpentry: "🪚",
    Cleaning: "🧹",
    Painting: "🎨",
    "Vehicle Repair": "🚗",
    "Appliance Repair": "🔌",
    Other: "🛠️",
  };

  return icons[category] || "🛠️";
}

function BookingsSkeleton() {
  return (
    <div className="booking-skeleton-list">

      {[1, 2].map((item) => (
        <div
          className="booking-skeleton-card"
          key={item}
        >

          <div className="skeleton-row">
            <span className="skeleton-circle" />
            <span className="skeleton-wide" />
            <span className="skeleton-small" />
          </div>

          <div className="skeleton-details">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="skeleton-progress" />

        </div>
      ))}

    </div>
  );
}

export default MyBookings;