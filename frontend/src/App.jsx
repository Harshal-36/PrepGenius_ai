import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";
import "./index.css"; // Ensure using the updated index.css

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoginView, setIsLoginView] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="app-wrapper">
      {!token ? (
        <>
          <h1 className="app-title">PrepGenius AI</h1>
          <div className="auth-container">
            <div className="auth-wrapper">
              {isLoginView ? (
                <Login setToken={setToken} switchToRegister={() => setIsLoginView(false)} />
              ) : (
                <Register switchToLogin={() => setIsLoginView(true)} />
              )}
            </div>
          </div>
        </>
      ) : (
        <Chat token={token} logout={logout} />
      )}
    </div>
  );
}

export default App;