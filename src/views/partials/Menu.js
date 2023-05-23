import { Link } from "react-router-dom";

function Menu() {
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

  return (
    <div
      onClick={() => {
        toggleMenu();
      }}
      id="menu"
      className="menu"
    >
      <Link to={`/`}>Home</Link>
    </div>
  );
}

export default Menu;
