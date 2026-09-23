import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Services.css";

const serviceCategories = [
  {
    name: "Plumbing",
    icon: "🔧",
    description: "Pipes, taps, leaks and water-related services.",
  },
  {
    name: "Electrical",
    icon: "⚡",
    description: "Electrical repairs, wiring and installations.",
  },
  {
    name: "Carpentry",
    icon: "🪚",
    description: "Furniture, doors, woodwork and repairs.",
  },
  {
    name: "Cleaning",
    icon: "🧹",
    description: "Home, office and deep-cleaning services.",
  },
  {
    name: "Painting",
    icon: "🎨",
    description: "Interior, exterior and wall painting.",
  },
  {
    name: "Vehicle Repair",
    icon: "🚗",
    description: "Local vehicle repair and maintenance.",
  },
  {
    name: "Appliance Repair",
    icon: "🔌",
    description: "Repair services for household appliances.",
  },
];

function Services() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/providers");
      const data = await response.json();

      if (data.success) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = selectedCategory
    ? providers.filter(
        (provider) =>
          provider.category?.toLowerCase() ===
          selectedCategory.toLowerCase()
      )
    : [];

  return (
    <section className="services-page">

      {/* Hero */}
      <div className="services-hero">
        <span className="hero-tag">LOCAL SERVICES</span>

        <h1>
          Find trusted professionals
          <span> near you.</span>
        </h1>

        <p>
          Choose a service and connect with local professionals
          who can help you get the job done.
        </p>
      </div>

      {/* Categories */}
      <div className="services-container">

        <div className="section-heading">
          <div>
            <span>EXPLORE</span>
            <h2>What service do you need?</h2>
          </div>

          {selectedCategory && (
            <button
              className="clear-button"
              onClick={() => setSelectedCategory("")}
            >
              View All
            </button>
          )}
        </div>

        <div className="service-grid">
          {serviceCategories.map((service, index) => {
            const count = providers.filter(
              (provider) =>
                provider.category?.toLowerCase() ===
                service.name.toLowerCase()
            ).length;

            return (
              <div
                className={`service-card ${
                  selectedCategory === service.name
                    ? "active"
                    : ""
                }`}
                key={service.name}
                style={{
                  animationDelay: `${index * 0.08}s`,
                }}
                onClick={() =>
                  setSelectedCategory(service.name)
                }
              >
                <div className="service-icon">
                  {service.icon}
                </div>

                <h3>{service.name}</h3>

                <p>{service.description}</p>

                <div className="service-bottom">
                  <span>
                    {loading
                      ? "Loading..."
                      : `${count} provider${
                          count !== 1 ? "s" : ""
                        }`}
                  </span>

                  <span className="arrow">→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Providers */}
        {selectedCategory && (
          <section className="providers-section">

            <div className="provider-section-title">
              <div>
                <span>AVAILABLE PROFESSIONALS</span>
                <h2>{selectedCategory} Providers</h2>
              </div>

              <span className="provider-count">
                {filteredProviders.length} found
              </span>
            </div>

            {loading ? (
              <div className="provider-loading">
                Finding professionals...
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="empty-providers">
                <div>🔍</div>

                <h3>No providers found</h3>

                <p>
                  We don't have a {selectedCategory.toLowerCase()}
                  {" "}provider in the system yet.
                </p>
              </div>
            ) : (
              <div className="provider-grid">

                {filteredProviders.map((provider) => (
                  <div
                    className="provider-card"
                    key={provider._id}
                  >
                    <div className="provider-card-top">

                      <div className="provider-small-avatar">
                        {provider.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3>{provider.name}</h3>

                        <span>
                          {provider.category}
                        </span>
                      </div>

                      {provider.isAvailable && (
                        <span className="available-dot">
                          ●
                        </span>
                      )}
                    </div>

                    <div className="provider-card-info">

                      <p>
                        <span>📍</span>
                        {provider.address || provider.city}
                      </p>

                      <p>
                        <span>💼</span>
                        {provider.experience ||
                          "Experience not specified"}
                      </p>

                    </div>

                    <button
                      className="view-provider-button"
                      onClick={() =>
                        navigate(
                          `/providers/${provider._id}`
                        )
                      }
                    >
                      View Profile
                      <span>→</span>
                    </button>
                  </div>
                ))}

              </div>
            )}
          </section>
        )}

      </div>
    </section>
  );
}

export default Services;