
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const provider = JSON.parse(
    localStorage.getItem("provider") || "null"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("provider");

    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <Link
        to="/"
        className="navbar-logo"
        onClick={() => setMenuOpen(false)}
      >
        <span className="logo-icon">L</span>

        <span className="logo-text">
          Local<span>Serve</span>
        </span>
      </Link>

      {/* DESKTOP NAVIGATION */}
      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/services">
          Services
        </Link>

        <Link to="/providers-map">
          Find Providers
        </Link>

        {user && (
          <Link to="/bookings">
            My Bookings
          </Link>
        )}

        {provider && (
          <Link to="/provider-workspace">
            Workspace
          </Link>
        )}

      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-actions">

        {!user && !provider ? (
          <>
            <Link
              to="/login"
              className="navbar-login"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="navbar-register"
            >
              Get Started
            </Link>
          </>
        ) : (
          <>

            {user && (
              <Link
                to="/profile"
                className="navbar-profile"
              >
                <span className="profile-circle">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="profile-name">
                  {user.name?.split(" ")[0] || "Profile"}
                </span>
              </Link>
            )}

            {provider && (
              <Link
                to="/provider-workspace"
                className="navbar-profile"
              >
                <span className="profile-circle">
                  {provider.name?.charAt(0)?.toUpperCase() || "P"}
                </span>

                <span className="profile-name">
                  {provider.name?.split(" ")[0] || "Provider"}
                </span>
              </Link>
            )}

            <button
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </>
        )}

      </div>

      {/* MOBILE BUTTON */}
      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">

          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            to="/services"
            onClick={() => setMenuOpen(false)}
          >
            Services
          </Link>

          <Link
            to="/providers-map"
            onClick={() => setMenuOpen(false)}
          >
            Find Providers
          </Link>

          {user && (
            <Link
              to="/bookings"
              onClick={() => setMenuOpen(false)}
            >
              My Bookings
            </Link>
          )}

          {user && (
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          )}

          {provider && (
            <Link
              to="/provider-workspace"
              onClick={() => setMenuOpen(false)}
            >
              Provider Workspace
            </Link>
          )}

          {!user && !provider && (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}

          {(user || provider) && (
            <button
              className="mobile-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}

        </div>
      )}

    </nav>
  );
}

export default Navbar;

