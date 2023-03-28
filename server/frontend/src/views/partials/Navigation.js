import { Link, useNavigate } from "react-router-dom";
import "../../App.css";
import { useAuth } from "../../auth/auth";

function Navigation() {
  let auth = useAuth();
  let navigate = useNavigate();

  if (!auth.user) {
    return (
      <div className="login">
        <p>You are not logged in.</p>
        <Link to={`/login`}>Login</Link>
        <Link to={`/register`}>Register</Link>
      </div>
    );
  }

  return (
    <div className="logout">
      <p>
        Welcome {auth.user}!{" "}
        <button
          onClick={() => {
            auth.signout(() => navigate("/"));
          }}
        >
          Sign out
        </button>
      </p>
    </div>
  );
}

export default Navigation;
