import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
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
import { AppShell, MantineProvider, DEFAULT_THEME } from "@mantine/core";
import '@mantine/core/styles.css';


function App() {
  const theme = {
    ...DEFAULT_THEME,
  };
  return (
    <ApolloProvider client={client}>
    <AuthProvider>
    <DataProvider>
      <MantineProvider forceColorScheme="dark" theme={theme}>
      <Router>
        <AppShell>
          <AppShell.Header>
          </AppShell.Header>
          <AppShell.Navbar>
          </AppShell.Navbar>
          <AppShell.Main>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/*<Route path="/matches" element={< Matches/>} />
            <Route path="/champions" element={<Champions />} />
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
          </AppShell.Main>
         </AppShell>
    </Router>
    </MantineProvider>
    </DataProvider>
    </AuthProvider> 
    </ApolloProvider>
  );
};

export default App;
