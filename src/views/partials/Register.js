import { useLayoutEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ValidationError from "../components/ValidationError";

import { useAuth } from "../../auth/auth";

const Register = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  let from = location.state?.from?.pathname || "/";

  async function onRegister(event) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);

    const user = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    let error = await auth.signup(user, () => {
      navigate(from, { replace: true });
    });
    setErrorMessage(error);
  }

  useLayoutEffect(() => {
    auth.checksignin(() => {
      navigate(from, { replace: true });
    });
  });

  return (
    <div className="login-page register">
      <h2>Register</h2>
      <form className="login-form" noValidate onSubmit={(event) => onRegister(event)}>
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
        />
        <button
          type="submit"
        >Register</button>

        <ValidationError message = {errorMessage}></ValidationError>
      </form>
      <a href="/login">I already have an account</a>
      <div className="form-disclaimer">
        <h3>What does registering allow me to do?</h3>
        <p> 
          Not much! Unless personally granted an admin account, registering will only allow you to refresh individual summoner data.
        </p>
        <h3>How do I get an admin account?</h3>
        <p>Not here :)</p>
      </div>
      
    </div>
  );
};

export default Register;