import express from "express";
import dashboardState from "../dashboardState.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/update-layout", requireAuth, (req, res) => {
  dashboardState.layout = req.body.layout;
  req.io.emit("DASHBOARD_UPDATE", dashboardState);
  res.json({ success: true });
});

router.post("/clear-widgets", requireAuth, (req, res) => {
  dashboardState.layout = [];
  req.io.emit("DASHBOARD_UPDATE", dashboardState);
  res.json({ success: true });
});

export default router;
