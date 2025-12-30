import express from "express";
import dashboardState from "../dashboardState.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { saveDashboardState } from "../utils/saveDashboardState.js";

const router = express.Router();

router.post("/update-layout", requireAuth, async (req, res) => {
  dashboardState.layout = req.body.layout;
  dashboardState.layoutTemplate = req.body.layoutTemplate;
  dashboardState.widgetSlots = req.body.widgetSlots;
  req.io.emit("DASHBOARD_UPDATE", dashboardState);
  
  // Auto-save to Drive
  saveDashboardState(dashboardState).catch(err => 
    console.error("Auto-save failed:", err.message)
  );
  
  res.json({ success: true });
});

router.post("/clear-widgets", requireAuth, async (req, res) => {
  dashboardState.layout = [];
  dashboardState.layoutTemplate = null;
  dashboardState.widgetSlots = {};
  req.io.emit("DASHBOARD_UPDATE", dashboardState);
  
  // Auto-save to Drive
  saveDashboardState(dashboardState).catch(err => 
    console.error("Auto-save failed:", err.message)
  );
  
  res.json({ success: true });
});

export default router;
