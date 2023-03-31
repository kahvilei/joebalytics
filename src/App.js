import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import "./App.css";
import React from 'react';
//page
import Home from "./views/pages/Home"
import AddSummoner from "./views/components/AddSummoner";
import SummonerDetails from "./views/pages/SummonerDetails";
import Login from "./views/components/Login";
import Register from "./views/components/Register";
//partial
import Navigation from "./views/components/Navigation";
import Menu from "./views/components/Menu";
//auth
import { RequireAuth, AuthProvider } from "./auth/auth";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation></Navigation>
        <div className="main">
          <Menu></Menu>
          <div className="content">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/summoner/:region/:name"
              element={<SummonerDetails />}
            />
            <Route
              path="/add-summoner"
              element={
                <RequireAuth>
                  <AddSummoner />
                </RequireAuth>
              }
            />
          </Routes>
          </div>
        </div>
    </Router>
    </AuthProvider> 
  );
};

export default App;
