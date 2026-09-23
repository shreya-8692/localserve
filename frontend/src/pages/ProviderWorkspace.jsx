import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProviderWorkspace.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "/api";

const statusFlow = [
  "Accepted",
  "On The Way",
  "In Progress",
  "Completed",
];

function ProviderWorkspace() {
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] =
    useState("dashboard");

  /* =====================================================
     LOAD PROVIDER
  ===================================================== */

  useEffect(() => {
    const storedProvider =
      localStorage.getItem("provider");

    if (!storedProvider) {
      navigate("/provider-login");
      return;
    }

    try {
      setProvider(JSON.parse(storedProvider));
    } catch (error) {
      console.error("Provider storage error:", error);

      localStorage.removeItem("provider");
      navigate("/provider-login");
    }
  }, [navigate]);

  /* =====================================================
     LOAD SERVICES + BOOKINGS
  ===================================================== */

  useEffect(() => {
    const providerId =
      provider?.id || provider?._id;

    if (!providerId) return;

    const loadWorkspace = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          servicesResponse,
          bookingsResponse,
        ] = await Promise.all([
          fetch(
            `${API}/services/provider/${providerId}`
          ),
          fetch(
            `${API}/bookings/provider/${providerId}`
          ),
        ]);

        const servicesData =
          await servicesResponse.json();

        const bookingsData =
          await bookingsResponse.json();

        if (!servicesResponse.ok) {
          throw new Error(
            servicesData.message ||
              "Unable to load services."
          );
        }

        if (!bookingsResponse.ok) {
          throw new Error(
            bookingsData.message ||
              "Unable to load bookings."
          );
        }

        setServices(
          servicesData.services || []
        );

        setBookings(
          bookingsData.bookings || []
        );
      } catch (error) {
        console.error(
          "Workspace loading error:",
          error
        );

        setError(
          error.message ||
            "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [provider?.id, provider?._id]);

  /* =====================================================
     BOOKING FILTERS
  ===================================================== */

  const pendingBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "Pending"
      ),
    [bookings]
  );

  const activeBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        [
          "Accepted",
          "On The Way",
          "In Progress",
        ].includes(booking.status)
      ),
    [bookings]
  );

  const completedBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "Completed"
      ),
    [bookings]
  );

  const rejectedBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "Rejected"
      ),
    [bookings]
  );

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const notifications = useMemo(() => {
    const generatedNotifications = [];

    bookings.forEach((booking) => {
      const customerName =
        booking.customer?.name ||
        "Customer";

      const serviceName =
        booking.service?.name ||
        "Service";

      if (booking.status === "Pending") {
        generatedNotifications.push({
          bookingId: booking._id,
          title: "New Service Request",
          message: `${customerName} requested ${serviceName}.`,
          createdAt:
            booking.createdAt ||
            booking.updatedAt ||
            new Date(),
          status: "Pending",
        });
      }

      if (booking.status === "Accepted") {
        generatedNotifications.push({
          bookingId: booking._id,
          title: "Booking Accepted",
          message: `You accepted ${customerName}'s ${serviceName} request.`,
          createdAt:
            booking.updatedAt ||
            booking.createdAt ||
            new Date(),
          status: "Accepted",
        });
      }

      if (booking.status === "On The Way") {
        generatedNotifications.push({
          bookingId: booking._id,
          title: "Job In Progress",
          message: `You are on the way to ${customerName} for ${serviceName}.`,
          createdAt:
            booking.updatedAt ||
            booking.createdAt ||
            new Date(),
          status: "On The Way",
        });
      }

      if (booking.status === "In Progress") {
        generatedNotifications.push({
          bookingId: booking._id,
          title: "Service Started",
          message: `${serviceName} for ${customerName} is currently in progress.`,
          createdAt:
            booking.updatedAt ||
            booking.createdAt ||
            new Date(),
          status: "In Progress",
        });
      }

      if (booking.status === "Completed") {
        generatedNotifications.push({
          bookingId: booking._id,
          title: "Service Completed",
          message: `${serviceName} for ${customerName} has been completed.`,
          createdAt:
            booking.updatedAt ||
            booking.createdAt ||
            new Date(),
          status: "Completed",
        });
      }

      if (booking.status === "Rejected") {
        generatedNotifications.push({
          bookingId: booking._id,
          title: "Request Rejected",
          message: `The ${serviceName} request from ${customerName} was rejected.`,
          createdAt:
            booking.updatedAt ||
            booking.createdAt ||
            new Date(),
          status: "Rejected",
        });
      }
    });

    return generatedNotifications.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );
  }, [bookings]);

  /* =====================================================
     UPDATE BOOKING STATUS
  ===================================================== */

  const updateBookingStatus = async (
    bookingId,
    status
  ) => {
    try {
      setActionLoading(
        `${bookingId}-${status}`
      );

      setError("");

      const response = await fetch(
        `${API}/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update booking."
        );
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? data.booking
            : booking
        )
      );
    } catch (error) {
      console.error(
        "Booking status error:",
        error
      );

      setError(
        error.message ||
          "Unable to update booking."
      );
    } finally {
      setActionLoading("");
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("provider");
    navigate("/provider-login");
  };

  /* =====================================================
     SAVE PROVIDER LOCATION
  ===================================================== */

  const handleSaveLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setActionLoading("location");
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const providerId =
            provider.id || provider._id;

          const response = await fetch(
            `/api/providers/${providerId}/location`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                latitude,
                longitude,
                address:
                  provider.city || "",
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to save location."
            );
          }

          const updatedProvider = {
            ...provider,
            ...data.provider,

            id:
              provider.id ||
              data.provider?._id,

            location:
              data.provider?.location,
          };

          setProvider(updatedProvider);

          localStorage.setItem(
            "provider",
            JSON.stringify(
              updatedProvider
            )
          );

          alert(
            "Location updated successfully."
          );
        } catch (error) {
          console.error(
            "Location update error:",
            error
          );

          setError(
            error.message ||
              "Unable to update location."
          );
        } finally {
          setActionLoading("");
        }
      },

      (geoError) => {
        console.error(
          "Geolocation error:",
          geoError
        );

        if (geoError.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (
          geoError.code === 2
        ) {
          setError(
            "Unable to determine your location."
          );
        } else if (
          geoError.code === 3
        ) {
          setError(
            "Location request timed out. Please try again."
          );
        } else {
          setError(
            "Unable to detect your location."
          );
        }

        setActionLoading("");
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /* =====================================================
     NEXT STATUS
  ===================================================== */

  const getNextStatus = (status) => {
    const index =
      statusFlow.indexOf(status);

    if (
      index === -1 ||
      index === statusFlow.length - 1
    ) {
      return null;
    }

    return statusFlow[index + 1];
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     INITIAL LOADING
  ===================================================== */

  if (!provider) {
    return (
      <div className="workspace-loading">
        <div className="workspace-spinner" />

        <p>
          Loading workspace...
        </p>
      </div>
    );
  }

  /* =====================================================
     MAIN WORKSPACE
  ===================================================== */

  return (
    <>
      <Navbar />

      <div className="provider-workspace">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="workspace-hero">

          <div className="hero-content">

            <div className="provider-avatar">
              {provider.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>

              <span className="welcome-label">
                Provider Workspace
              </span>

              <h1>
                Welcome,{" "}
                {provider.name?.split(
                  " "
                )[0]}
              </h1>

              <p>
                Manage your services,
                requests and active jobs
                from one place.
              </p>

              <div className="provider-meta">

                <span>
                  🔧 {provider.category}
                </span>

                <span>
                  📍{" "}
                  {provider.city ||
                    "Location not set"}
                </span>

                <span className="availability-pill">

                  <span className="availability-dot" />

                  {provider.isAvailable
                    ? "Available"
                    : "Unavailable"}

                </span>

              </div>

            </div>

            <button
              className="workspace-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </section>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="workspace-navigation">

          <button
            className={
              activeSection ===
              "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "dashboard"
              )
            }
          >
            Overview
          </button>

          <button
            className={
              activeSection ===
              "requests"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "requests"
              )
            }
          >
            Requests

            {pendingBookings.length >
              0 && (
              <span className="nav-count">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            className={
              activeSection ===
              "services"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "services"
              )
            }
          >
            My Services
          </button>

          <button
            className={
              activeSection ===
              "jobs"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "jobs"
              )
            }
          >
            Active Jobs

            {activeBookings.length >
              0 && (
              <span className="nav-count">
                {activeBookings.length}
              </span>
            )}
          </button>

          <button
            className={
              activeSection ===
              "notifications"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "notifications"
              )
            }
          >
            Notifications

            {notifications.length >
              0 && (
              <span className="nav-count">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            className={
              activeSection ===
              "profile"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "profile"
              )
            }
          >
            Profile
          </button>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="workspace-container">

          {error && (
            <div className="workspace-error">

              <span>⚠️</span>

              <p>
                {error}
              </p>

              <button
                onClick={() =>
                  setError("")
                }
              >
                ×
              </button>

            </div>
          )}

          {loading ? (
            <WorkspaceSkeleton />
          ) : (
            <>

              {/* =================================================
                  DASHBOARD
              ================================================= */}

              {activeSection ===
                "dashboard" && (
                <section className="workspace-section fade-up">

                  <SectionTitle
                    eyebrow="Dashboard"
                    title="Your business overview"
                    description="Keep track of requests, services and ongoing work."
                  />

                  <div className="stats-grid">

                    <StatCard
                      icon="🧰"
                      label="Total Services"
                      value={
                        services.length
                      }
                    />

                    <StatCard
                      icon="📩"
                      label="Pending Requests"
                      value={
                        pendingBookings.length
                      }
                      highlight
                    />

                    <StatCard
                      icon="⚡"
                      label="Active Jobs"
                      value={
                        activeBookings.length
                      }
                    />

                    <StatCard
                      icon="✓"
                      label="Completed Jobs"
                      value={
                        completedBookings.length
                      }
                    />

                  </div>

                  <div className="dashboard-grid">

                    <div className="workspace-card">

                      <div className="card-header">

                        <div>

                          <span className="section-eyebrow">
                            Incoming work
                          </span>

                          <h3>
                            Recent Requests
                          </h3>

                        </div>

                        {pendingBookings.length >
                          0 && (
                          <button
                            className="text-button"
                            onClick={() =>
                              setActiveSection(
                                "requests"
                              )
                            }
                          >
                            View all →
                          </button>
                        )}

                      </div>

                      {pendingBookings.length ===
                      0 ? (
                        <EmptyState
                          icon="📭"
                          title="No pending requests"
                          text="New customer requests will appear here."
                        />
                      ) : (
                        <div className="mini-bookings">

                          {pendingBookings
                            .slice(0, 3)
                            .map(
                              (
                                booking
                              ) => (
                                <BookingCard
                                  key={
                                    booking._id
                                  }
                                  booking={
                                    booking
                                  }
                                  actionLoading={
                                    actionLoading
                                  }
                                  onStatusChange={
                                    updateBookingStatus
                                  }
                                  formatDate={
                                    formatDate
                                  }
                                />
                              )
                            )}

                        </div>
                      )}

                    </div>

                    <div className="workspace-card quick-card">

                      <div className="card-header">

                        <div>

                          <span className="section-eyebrow">
                            Quick overview
                          </span>

                          <h3>
                            Provider Profile
                          </h3>

                        </div>

                      </div>

                      <div className="quick-profile">

                        <div className="large-avatar">
                          {provider.name
                            ?.charAt(
                              0
                            )
                            ?.toUpperCase()}
                        </div>

                        <h3>
                          {provider.name}
                        </h3>

                        <span>
                          {provider.category}
                        </span>

                        <div className="profile-info">

                          <div>
                            <strong>
                              📞
                            </strong>

                            <span>
                              {
                                provider.phone
                              }
                            </span>
                          </div>

                          <div>
                            <strong>
                              ✉️
                            </strong>

                            <span>
                              {
                                provider.email
                              }
                            </span>
                          </div>

                          <div>
                            <strong>
                              📍
                            </strong>

                            <span>
                              {provider.address ||
                                provider.city ||
                                "Not set"}
                            </span>
                          </div>

                        </div>

                        <button
                          className="outline-button full-button"
                          onClick={() =>
                            setActiveSection(
                              "profile"
                            )
                          }
                        >
                          View Profile
                        </button>

                      </div>

                    </div>

                  </div>

                </section>
              )}

              {/* =================================================
                  REQUESTS
              ================================================= */}

              {activeSection ===
                "requests" && (
                <section className="workspace-section fade-up">

                  <SectionTitle
                    eyebrow="Customer requests"
                    title="Incoming Requests"
                    description="Review and respond to customers who requested your services."
                  />

                  {pendingBookings.length ===
                  0 ? (
                    <div className="workspace-card">

                      <EmptyState
                        icon="📭"
                        title="No pending requests"
                        text="You are all caught up. New requests will appear here."
                      />

                    </div>
                  ) : (
                    <div className="booking-list">

                      {pendingBookings.map(
                        (booking) => (
                          <BookingCard
                            key={
                              booking._id
                            }
                            booking={
                              booking
                            }
                            actionLoading={
                              actionLoading
                            }
                            onStatusChange={
                              updateBookingStatus
                            }
                            formatDate={
                              formatDate
                            }
                          />
                        )
                      )}

                    </div>
                  )}

                </section>
              )}

              {/* =================================================
                  SERVICES
              ================================================= */}

              {activeSection ===
                "services" && (
                <section className="workspace-section fade-up">

                  <SectionTitle
                    eyebrow="Your offerings"
                    title="My Services"
                    description="Services currently available to customers."
                  />

                  {services.length ===
                  0 ? (
                    <div className="workspace-card">

                      <EmptyState
                        icon="🧰"
                        title="No services added"
                        text="Your service offerings will appear here."
                      />

                    </div>
                  ) : (
                    <div className="services-grid">

                      {services.map(
                        (service) => (
                          <div
                            className="provider-service-card"
                            key={
                              service._id
                            }
                          >

                            <div className="service-card-top">

                              <div className="service-icon">
                                {getServiceIcon(
                                  service.category
                                )}
                              </div>

                              <span
                                className={
                                  service.isActive
                                    ? "service-active"
                                    : "service-inactive"
                                }
                              >
                                {service.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>

                            </div>

                            <h3>
                              {
                                service.name
                              }
                            </h3>

                            <span className="service-category">
                              {
                                service.category
                              }
                            </span>

                            <p>
                              {service.description ||
                                "Professional local service."}
                            </p>

                            <div className="service-price">

                              <span>
                                Starting from
                              </span>

                              <strong>
                                ₹
                                {
                                  service.price
                                }
                              </strong>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </section>
              )}

              {/* =================================================
                  ACTIVE JOBS
              ================================================= */}

              {activeSection ===
                "jobs" && (
                <section className="workspace-section fade-up">

                  <SectionTitle
                    eyebrow="Work in progress"
                    title="Active Jobs"
                    description="Update customers as you progress with their service."
                  />

                  {activeBookings.length ===
                  0 ? (
                    <div className="workspace-card">

                      <EmptyState
                        icon="📋"
                        title="No active jobs"
                        text="Accepted customer bookings will appear here."
                      />

                    </div>
                  ) : (
                    <div className="booking-list">

                      {activeBookings.map(
                        (booking) => {

                          const nextStatus =
                            getNextStatus(
                              booking.status
                            );

                          const currentIndex =
                            statusFlow.indexOf(
                              booking.status
                            );

                          return (
                            <div
                              className="active-job-card"
                              key={
                                booking._id
                              }
                            >

                              <div className="job-top">

                                <div>

                                  <span className="job-service">
                                    {
                                      booking
                                        .service
                                        ?.name
                                    }
                                  </span>

                                  <h3>
                                    {
                                      booking
                                        .customer
                                        ?.name
                                    }
                                  </h3>

                                </div>

                                <StatusBadge
                                  status={
                                    booking.status
                                  }
                                />

                              </div>

                              <div className="job-details">

                                <span>
                                  📅{" "}
                                  {formatDate(
                                    booking.bookingDate
                                  )}
                                </span>

                                <span>
                                  🕐{" "}
                                  {
                                    booking.bookingTime
                                  }
                                </span>

                                <span>
                                  📍{" "}
                                  {booking
                                    .location
                                    ?.address ||
                                    "Location not specified"}
                                </span>

                              </div>

                              <div className="job-progress">

                                {statusFlow.map(
                                  (
                                    status,
                                    index
                                  ) => (
                                    <div
                                      className={`progress-step ${
                                        index <=
                                        currentIndex
                                          ? "done"
                                          : ""
                                      } ${
                                        status ===
                                        booking.status
                                          ? "current"
                                          : ""
                                      }`}
                                      key={
                                        status
                                      }
                                    >

                                      <div className="progress-circle">
                                        {index <=
                                        currentIndex
                                          ? "✓"
                                          : index +
                                            1}
                                      </div>

                                      <span>
                                        {
                                          status
                                        }
                                      </span>

                                    </div>
                                  )
                                )}

                              </div>

                              {nextStatus && (
                                <button
                                  className="primary-button"
                                  disabled={
                                    actionLoading ===
                                    `${booking._id}-${nextStatus}`
                                  }
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking._id,
                                      nextStatus
                                    )
                                  }
                                >
                                  {actionLoading ===
                                  `${booking._id}-${nextStatus}`
                                    ? "Updating..."
                                    : `Mark as ${nextStatus}`}
                                </button>
                              )}

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </section>
              )}

              {/* =================================================
                  NOTIFICATIONS
              ================================================= */}

              {activeSection ===
                "notifications" && (
                <section className="workspace-section fade-up">

                  <SectionTitle
                    eyebrow="Updates"
                    title="Notifications"
                    description="Stay updated about your bookings and customer requests."
                  />

                  {notifications.length ===
                  0 ? (
                    <div className="workspace-card">

                      <EmptyState
                        icon="🔔"
                        title="No notifications"
                        text="New booking updates will appear here."
                      />

                    </div>
                  ) : (
                    <div className="notification-list">

                      {notifications.map(
                        (
                          notification,
                          index
                        ) => (
                          <div
                            className="notification-card"
                            key={`${notification.bookingId}-${notification.status}-${index}`}
                          >

                            <div className="notification-icon">
                              🔔
                            </div>

                            <div className="notification-content">

                              <h3>
                                {
                                  notification.title
                                }
                              </h3>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                              <small>
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </small>

                            </div>

                            <span
                              className={`notification-status ${notification.status
                                ?.toLowerCase()
                                .replaceAll(
                                  " ",
                                  "-"
                                )}`}
                            >
                              {
                                notification.status
                              }
                            </span>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </section>
              )}

              {/* =================================================
                  PROFILE
              ================================================= */}

              {activeSection ===
                "profile" && (
                <section className="workspace-section fade-up">

                  <SectionTitle
                    eyebrow="Business information"
                    title="Provider Profile"
                    description="Information customers can use to understand your service."
                  />

                  <div className="profile-layout">

                    <div className="workspace-card profile-main">

                      <div className="profile-cover">

                        <div className="profile-avatar-large">
                          {provider.name
                            ?.charAt(
                              0
                            )
                            ?.toUpperCase()}
                        </div>

                      </div>

                      <div className="profile-body">

                        <h2>
                          {provider.name}
                        </h2>

                        <span className="profile-category">
                          {
                            provider.category
                          }
                        </span>

                        <p>
                          {provider.description ||
                            "Professional local service provider."}
                        </p>

                        <div className="profile-details-grid">

                          <ProfileItem
                            label="Email"
                            value={
                              provider.email
                            }
                            icon="✉️"
                          />

                          <ProfileItem
                            label="Phone"
                            value={
                              provider.phone
                            }
                            icon="📞"
                          />

                          <ProfileItem
                            label="Experience"
                            value={
                              provider.experience ||
                              "Not specified"
                            }
                            icon="🏆"
                          />

                          <ProfileItem
                            label="City"
                            value={
                              provider.city ||
                              "Not specified"
                            }
                            icon="📍"
                          />

                          <ProfileItem
                            label="Address"
                            value={
                              provider.address ||
                              "Not specified"
                            }
                            icon="🏠"
                          />

                          <ProfileItem
                            label="Availability"
                            value={
                              provider.isAvailable
                                ? "Available"
                                : "Unavailable"
                            }
                            icon="🟢"
                          />

                        </div>

                      </div>

                    </div>

                    <div className="workspace-card availability-card">

                      <span className="section-eyebrow">
                        Service availability
                      </span>

                      <h3>
                        Current Status
                      </h3>

                      <div
                        className={`availability-large ${
                          provider.isAvailable
                            ? "available"
                            : "offline"
                        }`}
                      >

                        <span />

                        {provider.isAvailable
                          ? "Currently Available"
                          : "Currently Unavailable"}

                      </div>

                      <p>
                        Customers can see
                        your availability
                        when browsing
                        providers.
                      </p>

                    </div>

                  </div>

                  {/* LOCATION */}

                  <div className="location-card">

                    <div className="location-card-content">

                      <div className="location-icon">
                        📍
                      </div>

                      <div>

                        <span className="section-eyebrow">
                          Provider location
                        </span>

                        <h3>
                          Service Location
                        </h3>

                        <p>
                          {provider?.location
                            ?.latitude !=
                            null &&
                          provider?.location
                            ?.longitude !=
                            null
                            ? "Your service location is saved. Customers can use it to find nearby services."
                            : "Add your current location so customers can find you nearby."}
                        </p>

                        {provider?.location
                          ?.latitude !=
                          null &&
                          provider?.location
                            ?.longitude !=
                            null && (
                            <div className="saved-location">

                              <span>
                                Latitude:{" "}
                                {typeof provider
                                  .location
                                  .latitude ===
                                "number"
                                  ? provider.location.latitude.toFixed(
                                      5
                                    )
                                  : provider.location.latitude}
                              </span>

                              <span>
                                Longitude:{" "}
                                {typeof provider
                                  .location
                                  .longitude ===
                                "number"
                                  ? provider.location.longitude.toFixed(
                                      5
                                    )
                                  : provider.location.longitude}
                              </span>

                            </div>
                          )}

                      </div>

                    </div>

                    <button
                      className="location-button"
                      onClick={
                        handleSaveLocation
                      }
                      disabled={
                        actionLoading ===
                        "location"
                      }
                    >
                      {actionLoading ===
                      "location"
                        ? "Detecting Location..."
                        : provider?.location
                            ?.latitude !=
                            null &&
                          provider?.location
                            ?.longitude !=
                            null
                        ? "Update Location"
                        : "Add My Location"}
                    </button>

                  </div>

                </section>
              )}

            </>
          )}

        </main>

      </div>

      <Footer />
    </>
  );
}

/* =====================================================
   SERVICE ICON
===================================================== */

function getServiceIcon(category) {
  switch (category) {
    case "Plumbing":
      return "🔧";

    case "Electrical":
      return "⚡";

    case "Cleaning":
      return "🧹";

    case "Painting":
      return "🎨";

    case "Carpentry":
      return "🪚";

    case "Vehicle Repair":
      return "🚗";

    case "Appliance Repair":
      return "🔌";

    default:
      return "🛠️";
  }
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
  highlight,
}) {
  return (
    <div
      className={`stat-card ${
        highlight ? "highlight" : ""
      }`}
    >

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}

/* =====================================================
   SECTION TITLE
===================================================== */

function SectionTitle({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="section-heading">

      <div>

        <span className="section-eyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   BOOKING CARD
===================================================== */

function BookingCard({
  booking,
  actionLoading,
  onStatusChange,
  formatDate,
}) {
  return (
    <div className="request-card">

      <div className="request-main">

        <div className="customer-avatar">

          {booking.customer?.name
            ?.charAt(0)
            ?.toUpperCase() || "C"}

        </div>

        <div className="request-info">

          <div className="request-title">

            <h3>
              {booking.customer?.name ||
                "Customer"}
            </h3>

            <StatusBadge
              status={booking.status}
            />

          </div>

          <strong>
            {booking.service?.name ||
              "Service"}
          </strong>

          <div className="request-meta">

            <span>
              📅{" "}
              {formatDate(
                booking.bookingDate
              )}
            </span>

            <span>
              🕐{" "}
              {booking.bookingTime}
            </span>

            <span>
              📍{" "}
              {booking.location
                ?.address ||
                "Location not specified"}
            </span>

          </div>

          {booking.description && (
            <div className="customer-note">

              <span>
                Customer requirement
              </span>

              <p>
                {booking.description}
              </p>

            </div>
          )}

        </div>

      </div>

      <div className="request-side">

        <div className="request-price">

          <span>
            Service price
          </span>

          <strong>
            ₹
            {booking.service?.price ??
              "—"}
          </strong>

        </div>

        {booking.status ===
          "Pending" && (
          <div className="request-actions">

            <button
              className="reject-button"
              disabled={
                actionLoading ===
                `${booking._id}-Rejected`
              }
              onClick={() =>
                onStatusChange(
                  booking._id,
                  "Rejected"
                )
              }
            >
              {actionLoading ===
              `${booking._id}-Rejected`
                ? "..."
                : "Reject"}
            </button>

            <button
              className="accept-button"
              disabled={
                actionLoading ===
                `${booking._id}-Accepted`
              }
              onClick={() =>
                onStatusChange(
                  booking._id,
                  "Accepted"
                )
              }
            >
              {actionLoading ===
              `${booking._id}-Accepted`
                ? "..."
                : "Accept"}
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ status }) {
  const className = status
    ?.toLowerCase()
    .replaceAll(" ", "-");

  return (
    <span
      className={`status-badge ${className}`}
    >
      {status}
    </span>
  );
}

/* =====================================================
   PROFILE ITEM
===================================================== */

function ProfileItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="profile-item">

      <span className="profile-item-icon">
        {icon}
      </span>

      <div>

        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div className="empty-state">

      <div className="empty-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}

/* =====================================================
   WORKSPACE SKELETON
===================================================== */

function WorkspaceSkeleton() {
  return (
    <div className="skeleton-wrapper">

      <div className="skeleton skeleton-title" />

      <div className="skeleton-stats">

        <div className="skeleton skeleton-stat" />

        <div className="skeleton skeleton-stat" />

        <div className="skeleton skeleton-stat" />

        <div className="skeleton skeleton-stat" />

      </div>

      <div className="skeleton skeleton-large" />

    </div>
  );
}

export default ProviderWorkspace;