import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/auth";

function Navigation() {
  let auth = useAuth();
  let navigate = useNavigate();

  if (!auth.user) {
    return (
      <div className="logged-out-nav nav">
        <Link to={`/register`}>Register</Link>
        <Link className = "button" to={`/login`}>Login</Link>
      </div>
    );
  }

  return (
    <div className="logged-in-nav nav">
      <div>
        Logged in as {auth.user}
        </div>
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

export default Navigation;
