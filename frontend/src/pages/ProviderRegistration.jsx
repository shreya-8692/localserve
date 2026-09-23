import { useState } from "react";
import "./ProviderRegistration.css";
import { useNavigate } from "react-router-dom";

function ProviderRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    category: "",
    experience: "",
    address: "",
    city: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Provider Registration:", formData);

    try {
      setLoading(true);

      const response = await fetch(
        "/api/providers/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log("Registration API Response:", data);

      if (!response.ok) {
        alert(
          data.message || "Provider registration failed."
        );
        return;
      }

      alert("Provider registered successfully!");

      navigate("/provider-login");
    } catch (error) {
      console.error("Registration error:", error);

      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="provider-register-page">
      <div className="provider-register-card">

        <div className="provider-register-header">
          <h1>Join as a Provider</h1>

          <p>
            Register your services and connect with customers
            in your local area.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10 digit number"
                maxLength="10"
                pattern="[0-9]{10}"
                required
              />
            </div>

          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Service Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select service
                </option>

                <option value="Plumbing">
                  Plumbing
                </option>

                <option value="Electrical">
                  Electrical
                </option>

                <option value="Carpentry">
                  Carpentry
                </option>

                <option value="Cleaning">
                  Cleaning
                </option>

                <option value="Painting">
                  Painting
                </option>

                <option value="Vehicle Repair">
                  Vehicle Repair
                </option>

                <option value="Appliance Repair">
                  Appliance Repair
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience</label>

              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Years"
                min="0"
              />
            </div>

          </div>

          <div className="form-group">
            <label>Address</label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your service address"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>City</label>

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter your city"
              required
            />
          </div>

          <div className="form-group">
            <label>About Your Service</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your experience and services"
              rows="4"
            />
          </div>

          <button
            type="submit"
            className="provider-register-button"
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register as Provider"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default ProviderRegistration;