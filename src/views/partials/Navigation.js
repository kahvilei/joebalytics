import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/auth";
import Menu from "./Menu";

function Navigation() {
  let auth = useAuth();
  let navigate = useNavigate();

  function toggleMenu() {
    let menu = document.getElementById("menu");
    let navButton = document.getElementById("nav-collapse");
    if (!menu.className.includes("active")) {
      menu.className = "menu active";
      navButton.className = "active";
    } else {
      menu.className = "menu";
      navButton.className = "";
    }
  }

  function UserTools() {
    if (!auth.user) {
      return (
        <div className="loggedin-status">
          <Link to={`/register`}>Register</Link>
          <Link className="button" to={`/login`}>
            Login
          </Link>
        </div>
      );
    }
    return (
      <div className="loggedin-status">
        <div>Logged in as {auth.user}</div>
        <button
          onClick={() => {
            auth.signout(() => navigate("/"));
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="logged-in-nav nav">
        <div
          onClick={() => {
            toggleMenu();
          }}
          id="nav-collapse"
        >
          <div className="hamburger-lines">
            <span className="line line1"></span>
            <span className="line line2"></span>
            <span className="line line3"></span>
          </div>
        </div>
        <Menu />
        <h3>Joebalytics</h3>
      <UserTools />
    </div>
  );
}

export default Navigation;