
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-brand">

          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">
              L
            </span>

            <span>
              Local<span>Serve</span>
            </span>
          </Link>

          <p>
            Connecting customers with trusted local
            service providers quickly and easily.
          </p>

        </div>

        <div className="footer-column">

          <h3>
            Explore
          </h3>

          <Link to="/">
            Home
          </Link>

          <Link to="/services">
            Services
          </Link>

          <Link to="/providers-map">
            Find Providers
          </Link>

        </div>

        <div className="footer-column">

          <h3>
            Account
          </h3>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

          <Link to="/bookings">
            My Bookings
          </Link>

        </div>

        <div className="footer-column">

          <h3>
            For Providers
          </h3>

          <Link to="/join-provider">
            Join LocalServe
          </Link>

          <Link to="/provider-login">
            Provider Login
          </Link>

          <Link to="/provider-registration">
            Provider Registration
          </Link>

        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © 2026 LocalServe. All rights reserved.
        </p>

        <p>
          Smart Local Service Management System
        </p>

      </div>

    </footer>
  );
}

export default Footer;

