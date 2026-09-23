import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProviderDetails.css";

function ProviderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await fetch(`/api/providers/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load provider"
          );
        }

        setProvider(data.provider);
      } catch (error) {
        console.error("Provider details error:", error);
        setError("Unable to load provider details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  if (loading) {
    return (
      <section className="page">
        <div className="loading-state">
          Loading provider...
        </div>
      </section>
    );
  }

  if (error || !provider) {
    return (
      <section className="page">
        <div className="error-state">
          <h2>Provider not found</h2>
          <p>{error}</p>

          <button onClick={() => navigate("/services")}>
            Back to Services
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="provider-details-page">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="provider-details-card">
        <div className="provider-header">
          <div className="provider-avatar">
            {provider.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <span className="provider-category">
              {provider.category}
            </span>

            <h1>{provider.name}</h1>

            <p>{provider.city}</p>
          </div>

          {provider.isAvailable && (
            <span className="availability-badge">
              ● Available
            </span>
          )}
        </div>

        <div className="provider-info-grid">
          <div>
            <span>Experience</span>
            <strong>
              {provider.experience || "Not specified"}
            </strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{provider.phone}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>
              {provider.address || provider.city}
            </strong>
          </div>

          <div>
            <span>Working Hours</span>
            <strong>
              {provider.availability?.startTime || "09:00"} -{" "}
              {provider.availability?.endTime || "18:00"}
            </strong>
          </div>
        </div>

        <div className="provider-description">
          <h2>About this provider</h2>
          <p>
            {provider.description ||
              "Professional local service provider."}
          </p>
        </div>

        <div className="provider-actions">
          <button
            className="primary-button"
            onClick={() =>
              navigate(`/bookings?provider=${provider._id}`)
            }
          >
            Book Service
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProviderDetails;