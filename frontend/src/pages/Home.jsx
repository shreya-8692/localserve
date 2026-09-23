import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const categories = [
  {
    name: "Plumbing",
    icon: "🔧",
    description: "Pipes, taps, leaks & repairs",
  },
  {
    name: "Electrical",
    icon: "⚡",
    description: "Wiring, switches & electrical work",
  },
  {
    name: "Carpentry",
    icon: "🪚",
    description: "Furniture, doors & woodwork",
  },
  {
    name: "Cleaning",
    icon: "🧹",
    description: "Home & office cleaning",
  },
  {
    name: "Painting",
    icon: "🎨",
    description: "Interior & exterior painting",
  },
  {
    name: "Vehicle Repair",
    icon: "🚗",
    description: "Vehicle servicing & repairs",
  },
  {
    name: "Appliance Repair",
    icon: "🔌",
    description: "AC, washing machine & appliances",
  },
  {
    name: "Other",
    icon: "🛠️",
    description: "Other local services",
  },
];

function Home() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load services");
        }

        setServices(data.services || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load services right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  const getServiceCount = (categoryName) => {
    return services.filter(
      (service) =>
        service.category?.toLowerCase() === categoryName.toLowerCase()
    ).length;
  };

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content reveal">
          <span className="hero-badge">
            ✨ Smart Local Services
          </span>

          <h1>
            Find Services
            <span> You’re Looking For</span>
          </h1>

          <p>
            Discover trusted local service providers near you.
            From plumbing to electrical work, find the right professional
            for your everyday needs.
          </p>

          <div className="hero-actions">
            <Link to="/services" className="primary-btn">
              Explore Services
              <span>→</span>
            </Link>

            <Link to="/join-provider" className="secondary-btn">
              Become a Provider
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>{services.length || "—"}</strong>
              <span>Services</span>
            </div>

            <div>
              <strong>8+</strong>
              <span>Categories</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Access</span>
            </div>
          </div>
        </div>

        <div className="hero-visual reveal">
          <div className="hero-card main-card">
            <div className="location-icon">📍</div>

            <div>
              <span className="small-label">Find nearby</span>
              <h3>Local Professionals</h3>
              <p>Trusted service providers around you</p>
            </div>

            <span className="status-dot"></span>
          </div>

          <div className="floating-card floating-one">
            🔧 Plumbing
          </div>

          <div className="floating-card floating-two">
            ⚡ Electrical
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="search-section reveal">
        <div className="search-container">
          <div>
            <span className="section-label">QUICK SEARCH</span>
            <h2>What service do you need?</h2>
          </div>

          <div className="search-box">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search plumbing, cleaning, electrical..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services-section">
        <div className="section-heading reveal">
          <div>
            <span className="section-label">OUR SERVICES</span>

            <h2>
              Services for your
              <span> everyday needs</span>
            </h2>
          </div>

          <Link to="/services" className="view-all">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading services...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <span>🔎</span>
            <h3>No category found</h3>
            <p>Try searching for another service.</p>
          </div>
        ) : (
          <div className="category-grid">
            {filteredCategories.map((category, index) => (
              <Link
                to={`/services?category=${encodeURIComponent(
                  category.name
                )}`}
                className="category-card reveal"
                key={category.name}
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <div className="category-icon">
                  {category.icon}
                </div>

                <div className="category-content">
                  <h3>{category.name}</h3>

                  <p>{category.description}</p>

                  <span className="service-count">
                    {getServiceCount(category.name)} available
                  </span>
                </div>

                <div className="arrow">
                  →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-heading centered reveal">
          <span className="section-label">HOW IT WORKS</span>

          <h2>
            Get your service in
            <span> three simple steps</span>
          </h2>
        </div>

        <div className="steps-grid">
          <div className="step-card reveal">
            <div className="step-number">01</div>
            <div className="step-icon">🔎</div>
            <h3>Find a Service</h3>
            <p>
              Choose the service category that matches your requirement.
            </p>
          </div>

          <div className="step-card reveal">
            <div className="step-number">02</div>
            <div className="step-icon">👨‍🔧</div>
            <h3>Choose a Provider</h3>
            <p>
              Explore available local professionals and their services.
            </p>
          </div>

          <div className="step-card reveal">
            <div className="step-number">03</div>
            <div className="step-icon">📅</div>
            <h3>Book Your Service</h3>
            <p>
              Select a suitable date and time and send your booking request.
            </p>
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="provider-cta reveal">
        <div className="cta-content">
          <span className="section-label">FOR SERVICE PROVIDERS</span>

          <h2>
            Turn your skills into
            <span> opportunities.</span>
          </h2>

          <p>
            Join LocalServe and connect with customers looking
            for services in their local area.
          </p>

          <Link to="/join-provider" className="cta-button">
            Join as a Provider →
          </Link>
        </div>

        <div className="cta-decoration">
          <div className="circle circle-one"></div>
          <div className="circle circle-two"></div>
          <span>🛠️</span>
        </div>
      </section>

    </div>
  );
}

export default Home;