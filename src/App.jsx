// src/App.jsx
import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import HockeyLeagueApp from "./components/HockeyLeagueApp";
import Login from "./components/Login";
import { useAuth } from "./contexts/AuthContext";

const AuthenticatedApp = () => {
  const { user } = useAuth();
  return user ? <HockeyLeagueApp /> : <Login />;
};

const App = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
