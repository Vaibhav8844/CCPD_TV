import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { BACKEND_URL } from "../config";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const res = await api.get(`${BACKEND_URL}/dashboard-state`);
        setDashboard(res.data);
      } catch (err) {
        // Silent fail - user will see login screen
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, []);

  return (
    <DashboardContext.Provider value={{ dashboard, setDashboard, loading }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
