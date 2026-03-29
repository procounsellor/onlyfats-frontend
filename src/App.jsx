import { useState } from "react";
import useAuth from "./hooks/useAuth";
import Loader from "./components/common/Loader";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";

export default function App() {
  const [mode, setMode] = useState("landing");

  const { currentUser, checkingAuth, login, signup, guestLogin, logout, loadMe } = useAuth();

  if (checkingAuth) {
    return <Loader />;
  }

  if (!currentUser) {
    if (mode === "landing") {
      return (
        <LandingPage
          onLogin={() => setMode("login")}
          onSignup={() => setMode("signup")}
        />
      );
    }
    return (
      <LoginPage
        mode={mode}
        setMode={setMode}
        onLogin={login}
        onSignup={signup}
        onGuest={guestLogin}
      />
    );
  }

  return <UserDashboard currentUser={currentUser} onLogout={logout} onProfileUpdate={loadMe} />;
}
