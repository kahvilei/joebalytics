import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import "./App.css";
import React from 'react';
import { ApolloProvider } from '@apollo/client';
//page
import Home from "./views/pages/Home"
// import AddSummoner from "./views/partials/AddSummoner";
// import SummonerDetails from "./views/pages/SummonerDetails";
import Login from "./views/partials/Login";
import Register from "./views/partials/Register";
import Matches from "./views/pages/Matches";
// import Champions from "./views/pages/Champions";
// import ChampionDetails from "./views/pages/ChampionDetails";
//partial
import Navigation from "./views/partials/Navigation";
//auth
import { RequireAuth, AuthProvider, RequireAdmin, client } from "./auth/auth";
import { DataProvider } from './context/DataContext';


function App() {
  return (
    <ApolloProvider client={client}>
    <AuthProvider>
    <DataProvider>
      <Router>
        <Navigation></Navigation> 
        <div className="main">  
          <div className="content">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/matches" element={< Matches/>} />
            {/*<Route path="/champions" element={<Champions />} />
            <Route path="/champion/:id" element={<ChampionDetails />} />
            <Route
              path="/summoner/:region/:name/:page"
              element={<SummonerDetails />}
            />
            <Route
              path="/summoner/:region/:name"
              element={<SummonerDetails />}
            />
            <Route
              path="/add-summoner"
              element={
                <RequireAdmin>
                  <AddSummoner />
                </RequireAdmin>
              }
            /> */} 
          </Routes>
          </div>
        </div>
    </Router>
    </DataProvider>
    </AuthProvider> 
    </ApolloProvider>
  );
};

export default App;
