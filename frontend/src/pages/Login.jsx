
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const API = "/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      /*
       * Save customer information so the
       * rest of the application can use it.
       */
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">

          <div className="login-icon">
            🏠
          </div>

          <span className="login-eyebrow">
            LOCAL SERVE
          </span>

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to manage your local service bookings.
          </p>

        </div>

        {error && (
          <div className="login-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="login-field">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="login-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="login-footer">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create Account
          </Link>

        </div>

        <div className="provider-login-link">

          <span>
            Are you a service provider?
          </span>

          <Link to="/provider-login">
            Provider Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;
