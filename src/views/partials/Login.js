import { useLayoutEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/auth";
import ValidationError from "../components/ValidationError";

function Login() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  let from = location.state?.from?.pathname || "/";

  useLayoutEffect(() => {
    auth.checksignin(() => {
      navigate(from, { replace: true });
    });
  });

  async function handleSubmit(event) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);

    const user = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    let error = await auth.signin(user, () => {
      navigate(from, { replace: true });
    });
    setErrorMessage(error);
  }

  return (
    <div>
      <p>You must log in to view the page at {from}</p>
      <ValidationError message = {errorMessage}></ValidationError>
      <form onSubmit={handleSubmit}>
      <input
          type="text"
          placeholder="Username"
          name="username"
          className="form-control"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          className="form-control"
        />{" "}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
