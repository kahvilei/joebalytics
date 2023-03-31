import { useLayoutEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ValidationError from "./partials/ValidationError";

import { useAuth } from "../auth/auth";

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
    <div className="login-form">
      <ValidationError message = {errorMessage}></ValidationError>
      <form noValidate onSubmit={(event) => onRegister(event)}>
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
        <input
          type="submit"
          value="Register"
          className="btn btn-outline-warning btn-block mt-4"
        />
      </form>
    </div>
  );
};

export default Register;
