import { useState, useEffect } from "react";
import Login from "./components/Login";
import LayoutEditor from "./components/LayoutEditor";
import api from "./services/api";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [initialState, setInitialState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("adminToken");
    if (token) {
      // Fetch dashboard state and auto-login
      api.get("/dashboard-state")
        .then((res) => {
          setInitialState(res.data);
          setLoggedIn(true);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return loggedIn ? (
    <LayoutEditor initialState={initialState} />
  ) : (
    <Login
      onLogin={(state) => {
        setInitialState(state);
        setLoggedIn(true);
      }}
    />
  );
}
