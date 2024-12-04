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
import TagUpdate from "./views/pages/TagUpdate";
// import Champions from "./views/pages/Champions";
// import ChampionDetails from "./views/pages/ChampionDetails";
//partial
import Navigation from "./views/partials/Navigation";
//auth
import { RequireAuth, AuthProvider, RequireAdmin, client } from "./auth/auth";
import { DataProvider } from './context/DataContext';
import { AppShell, MantineProvider, DEFAULT_THEME, createTheme } from "@mantine/core";
import '@mantine/core/styles.css';
import themeJSON from './summon-cloud.json';


function App() {
  const theme = createTheme(themeJSON);
  return (
    <ApolloProvider client={client}>
    <AuthProvider>
  
      <MantineProvider forceColorScheme="dark" theme={theme}>
      <DataProvider>
      <Router>
        <AppShell
         header={{ height: 60 }}
         padding="md"
        >
          <AppShell.Header>
            <Navigation />
          </AppShell.Header>
          <AppShell.Navbar>
          </AppShell.Navbar>
          <AppShell.Main>
          <Routes>
            <Route exact path="/" element={<Matches/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/matches" element={< Matches/>} />
            <Route path="/tag-update" element={<RequireAdmin><TagUpdate /></RequireAdmin>} />
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
          </AppShell.Main>
         </AppShell>
    </Router>
    </DataProvider>
    </MantineProvider>
    
    </AuthProvider> 
    </ApolloProvider>
  );
};

export default App;
