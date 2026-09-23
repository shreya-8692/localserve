import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProviderLogin.css";

function ProviderLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

       const response = await fetch(
          "/api/providers/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      console.log("Provider login response:", data);

      if (!response.ok) {
        alert(data.message || "Login failed.");
        return;
      }

      if (!data.provider) {
        alert("Provider information was not returned by the server.");
        return;
      }

      // Save the complete provider information
      localStorage.setItem(
        "provider",
        JSON.stringify(data.provider)
      );

      alert("Login successful!");

      navigate("/provider-workspace");
    } catch (error) {
      console.error("Provider login error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="provider-login-page">
      <div className="provider-login-card">
        <h1>Provider Login</h1>

        <p>
          Login to manage your services and customer requests.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="provider-login-register">
          Don't have a provider account?{" "}
          <button
            type="button"
            onClick={() =>
              navigate("/provider-registration")
            }
          >
            Register as Provider
          </button>
        </p>
      </div>
    </section>
  );
}

export default ProviderLogin;