import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import "./App.css";
import React from 'react';
//page
import AddSummoner from "./views/AddSummoner";
import ShowSummonerList from "./views/ShowSummonerList";
import SummonerDetails from "./views/SummonerDetails";
import Login from "./views/Login";
import Register from "./views/Register";
//partial
import Navigation from "./views/partials/Navigation";
//auth
import { RequireAuth, AuthProvider } from "./auth/auth";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation></Navigation>
        <div>
          <Routes>
            <Route exact path="/" element={<ShowSummonerList />} />
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
      </Router>
    </AuthProvider>
  );
};

export default App;
