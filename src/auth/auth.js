import { createContext, useContext, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { gql } from "@apollo/client";
import {rootAddress} from '../config/config';

const httpLink = createHttpLink({
  uri: `${rootAddress[process.env.NODE_ENV]}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? token : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      message
      user {
        username
        admin
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password) {
      token
      message
      user {
        username
        admin
      }
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      username
      admin
    }
  }
`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  const signin = async (userData, callback) => {
    try {
      const { data } = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: userData,
      });
      
      localStorage.setItem("token", data.login.token);
      setUser(data.login.user.username);
      setAdmin(data.login.user.admin);
      callback();
      return data.login.message;
    } catch (err) {
      return err.message;
    }
  };

  const signup = async (userData, callback) => {
    try {
      const { data } = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: userData,
      });
      
      localStorage.setItem("token", data.register.token);
      setUser(data.register.user.username);
      setAdmin(data.register.user.admin);
      callback();
      return data.register.message;
    } catch (err) {
      return err.message;
    }
  };

  const checksignin = async (callback = () => {}) => {
    try {
      const { data } = await client.query({
        query: ME_QUERY,
        fetchPolicy: "network-only",
      });
      
      if (data.me) {
        setUser(data.me.username);
        setAdmin(data.me.admin);
        callback(data.me.username, data.me.admin);
      }
    } catch (err) {
      setUser(null);
      setAdmin(false);
    }
  };

  const signout = (callback) => {
    localStorage.removeItem("token");
    setUser(null);
    setAdmin(false);
    client.resetStore();
    callback();
  };

  checksignin();

  return (
    <AuthContext.Provider value={{ user, admin, signin, signup, signout, checksignin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RequireAdmin({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  } else if (!auth.admin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}