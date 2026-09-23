import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ProvidersMap.css";

import {
  calculateDistance,
  formatDistance,
} from "../utils/distance";

const API = "/api";

const DEFAULT_LOCATION = [19.076, 72.8777];

const providerIcon = new L.DivIcon({
  className: "custom-provider-marker",
  html: `
    <div class="provider-marker-pin">
      <span>🛠️</span>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -40],
});

const customerIcon = new L.DivIcon({
  className: "custom-customer-marker",
  html: `
    <div class="customer-marker-pin">
      <span>📍</span>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -40],
});

/* Move map when customer location changes */
function MapController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.flyTo(location, 13, {
      duration: 1.2,
    });
  }, [location, map]);

  return null;
}

function ProvidersMap() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [customerLocation, setCustomerLocation] = useState(null);

  const [maxDistance, setMaxDistance] = useState(10);

  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     FETCH PROVIDERS
  ========================= */

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/providers`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load providers."
          );
        }

        const validProviders = (data.providers || []).filter(
          (provider) =>
            provider.location?.latitude != null &&
            provider.location?.longitude != null
        );

        setProviders(validProviders);
      } catch (err) {
        console.error("Provider map error:", err);
        setError(
          err.message || "Unable to load service providers."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  /* =========================
     GET CUSTOMER LOCATION
  ========================= */

  const getCustomerLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCustomerLocation({
          latitude,
          longitude,
        });

        setLocationLoading(false);
      },
      (geoError) => {
        console.error(
          "Customer location error:",
          geoError
        );

        if (geoError.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (geoError.code === 2) {
          setError(
            "Unable to determine your location."
          );
        } else if (geoError.code === 3) {
          setError(
            "Location request timed out. Please try again."
          );
        } else {
          setError(
            "Unable to detect your location."
          );
        }

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /* =========================
     PROVIDER DISTANCE
  ========================= */

  const getProviderDistance = (provider) => {
    if (!customerLocation) {
      return null;
    }

    return calculateDistance(
      customerLocation.latitude,
      customerLocation.longitude,
      provider.location.latitude,
      provider.location.longitude
    );
  };

  /* =========================
     FILTER NEARBY PROVIDERS
  ========================= */

  const nearbyProviders = useMemo(() => {
    const providersWithDistance = providers.map(
      (provider) => ({
        ...provider,
        distance: getProviderDistance(provider),
      })
    );

    if (!customerLocation) {
      return providersWithDistance;
    }

    return providersWithDistance
      .filter(
        (provider) =>
          provider.distance !== null &&
          provider.distance <= maxDistance
      )
      .sort(
        (a, b) =>
          a.distance - b.distance
      );
  }, [
    providers,
    customerLocation,
    maxDistance,
  ]);

  /* =========================
     MAP CENTER
  ========================= */

  const mapCenter = customerLocation
    ? [
        customerLocation.latitude,
        customerLocation.longitude,
      ]
    : DEFAULT_LOCATION;

  return (
    <div className="providers-map-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="providers-map-hero">

        <div>
          <span className="map-eyebrow">
            LOCAL SERVICE DISCOVERY
          </span>

          <h1>
            Find Service Providers Near You
          </h1>

          <p>
            Discover nearby local professionals based
            on your current location.
          </p>
        </div>

        <button
          className="location-action-button"
          onClick={getCustomerLocation}
          disabled={locationLoading}
        >
          {locationLoading
            ? "Detecting Location..."
            : customerLocation
            ? "Update My Location"
            : "Use My Location"}
        </button>

      </section>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="map-error">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {/* =========================
          CONTROLS
      ========================= */}

      <section className="map-controls">

        <div className="map-control-info">
          <span>📍</span>

          <div>
            <strong>
              {customerLocation
                ? "Searching around your location"
                : "Location not selected"}
            </strong>

            <small>
              {customerLocation
                ? `${nearbyProviders.length} provider${
                    nearbyProviders.length !== 1
                      ? "s"
                      : ""
                  } found nearby`
                : "Use your location to find nearby providers"}
            </small>
          </div>
        </div>

        <div className="distance-control">

          <label htmlFor="distance">
            Search radius
          </label>

          <select
            id="distance"
            value={maxDistance}
            onChange={(e) =>
              setMaxDistance(
                Number(e.target.value)
              )
            }
          >
            <option value={2}>Within 2 km</option>
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={20}>Within 20 km</option>
            <option value={50}>Within 50 km</option>
          </select>

        </div>

      </section>

      {/* =========================
          MAP + PROVIDERS
      ========================= */}

      <main className="providers-map-content">

        <section className="map-wrapper">

          {loading ? (
            <div className="map-loading">
              <div className="map-loader" />
              <p>
                Loading service providers...
              </p>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={12}
              scrollWheelZoom={true}
              className="providers-leaflet-map"
            >

              <MapController
                location={customerLocation
                  ? [
                      customerLocation.latitude,
                      customerLocation.longitude,
                    ]
                  : null}
              />

              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* CUSTOMER LOCATION */}

              {customerLocation && (
                <Marker
                  position={[
                    customerLocation.latitude,
                    customerLocation.longitude,
                  ]}
                  icon={customerIcon}
                >
                  <Popup>
                    <strong>
                      Your Location
                    </strong>
                    <br />
                    Searching nearby providers.
                  </Popup>
                </Marker>
              )}

              {/* PROVIDER LOCATIONS */}

              {nearbyProviders.map(
                (provider) => (
                  <Marker
                    key={provider._id}
                    position={[
                      provider.location.latitude,
                      provider.location.longitude,
                    ]}
                    icon={providerIcon}
                  >
                    <Popup>

                      <div className="provider-popup">

                        <strong>
                          {provider.name}
                        </strong>

                        <span>
                          {provider.category}
                        </span>

                        {provider.distance !== null && (
                          <small>
                            📍{" "}
                            {formatDistance(
                              provider.distance
                            )}
                          </small>
                        )}

                        <button
                          onClick={() =>
                            navigate(
                              `/providers/${provider._id}`
                            )
                          }
                        >
                          View Provider
                        </button>

                      </div>

                    </Popup>
                  </Marker>
                )
              )}

            </MapContainer>
          )}

        </section>

        {/* =========================
            PROVIDER LIST
        ========================= */}

        <section className="nearby-provider-section">

          <div className="nearby-heading">

            <div>
              <span className="map-eyebrow">
                NEARBY PROVIDERS
              </span>

              <h2>
                {customerLocation
                  ? `Providers within ${maxDistance} km`
                  : "Available Providers"}
              </h2>
            </div>

            <span className="provider-count">
              {nearbyProviders.length}
            </span>

          </div>

          {nearbyProviders.length === 0 ? (

            <div className="no-nearby-providers">

              <div>📍</div>

              <h3>
                No providers found
              </h3>

              <p>
                Try increasing the search radius
                or updating your location.
              </p>

              <button
                onClick={() =>
                  setMaxDistance(50)
                }
              >
                Search within 50 km
              </button>

            </div>

          ) : (

            <div className="nearby-provider-list">

              {nearbyProviders.map(
                (provider) => (
                  <article
                    className="nearby-provider-card"
                    key={provider._id}
                  >

                    <div className="provider-card-avatar">
                      {provider.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div className="nearby-provider-info">

                      <div className="provider-name-row">

                        <h3>
                          {provider.name}
                        </h3>

                        {provider.isAvailable && (
                          <span className="available-dot">
                            Available
                          </span>
                        )}

                      </div>

                      <span className="provider-category">
                        {provider.category}
                      </span>

                      <p>
                        📍{" "}
                        {provider.city ||
                          provider.address ||
                          "Local Area"}
                      </p>

                      {provider.distance !== null && (
                        <strong className="provider-distance">
                          {formatDistance(
                            provider.distance
                          )}
                        </strong>
                      )}

                    </div>

                    <button
                      className="view-provider-button"
                      onClick={() =>
                        navigate(
                          `/providers/${provider._id}`
                        )
                      }
                    >
                      View
                    </button>

                  </article>
                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default ProvidersMap;