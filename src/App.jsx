// src/App.jsx
import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import HockeyLeagueApp from "./components/HockeyLeagueApp";
import Login from "./components/Login";
import { useAuth } from "./contexts/AuthContext";

const AuthenticatedApp = () => {
  const { user } = useAuth();
  const [isGuest, setIsGuest] = useState(false);

  if (user || isGuest) {
    return <HockeyLeagueApp isGuest={isGuest} />;
  }

  return <Login onSkip={() => setIsGuest(true)} />;
};

const App = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
