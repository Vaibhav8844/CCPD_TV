import express from "express";
import dashboardState from "../dashboardState.js";

const router = express.Router();

router.get("/dashboard-state", (req, res) => {
  res.json(dashboardState);
});

export default router;
