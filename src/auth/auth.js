import {rootAddress} from '../config/config';

import * as React from "react";
import { useLocation, Navigate } from "react-router-dom";
import axios from "axios";

const authProviderAPI = {
  isAuthenticated: false,
  async signin(user, callback) {
    try {
      const res = await axios.post(
        rootAddress[process.env.NODE_ENV] + "/api/user/login",
        user,
        {
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const data = res.data;
      localStorage.setItem("token", data.token);
      authProviderAPI.isAuthenticated = true;
      callback();
      return data.msg;
    } catch (err) {
      authProviderAPI.isAuthenticated = false;
      const data = err.response.data;
      return data.msg;
    }
  },
  async signup(user, callback) {
    try {
      const res = await axios.post(
        rootAddress[process.env.NODE_ENV] + "/api/user/register",
        user,
        {
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const data = await res.data;
      localStorage.setItem("token", data.token);
      authProviderAPI.isAuthenticated = true;
      callback();
      return data.msg;
    } catch (err) {
      authProviderAPI.isAuthenticated = false;
      return err.response.data.msg;
    }
  },
  async checksignin(callback) {
    try {
      let res = await axios.get(rootAddress[process.env.NODE_ENV] + "/api/user/isLoggedIn", {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      });
      const username = res.data.username;
      const admin = res.data.admin;
      if(username && admin){
        authProviderAPI.isAuthenticated = true;
        callback(username, admin);
      }
    } catch (err) {
      authProviderAPI.isAuthenticated = false;
    }
  },
  signout(callback) {
    localStorage.removeItem("token");
    authProviderAPI.isAuthenticated = false;
    callback();
  },
};

let AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  let [user, setUser] = React.useState(null);
  let [admin, setAdmin] = React.useState(null);

  let signin = (newUser, callback) => {
    return authProviderAPI.signin(newUser, () => {
      setUser(newUser.username);
      setAdmin(newUser.admin);
      callback();
    });
  };
  let signup = (newUser, callback) => {
    return authProviderAPI.signup(newUser, () => {
      setUser(newUser.username);
      setAdmin(newUser.admin);
      callback();
    });
  };

  let checksignin = (callback) => {
    return authProviderAPI.checksignin((username, admin) => {
      setUser(username);
      setAdmin(admin);
      callback();
    });
  };
  checksignin();

  let signout = (callback) => {
    return authProviderAPI.signout(() => {
      setUser(null);
      setAdmin(false);
      callback();
    });
  };

  let value = { user, admin, signin, signup, signout, checksignin };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return React.useContext(AuthContext);
}

async function RequireAuth({ children }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// checks to see if the user is an admin
function RequireAdmin({ children }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }else if(!auth.admin){
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}


export { AuthProvider, RequireAuth, RequireAdmin, useAuth };
