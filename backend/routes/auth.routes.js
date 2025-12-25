import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUser } from "../users/users.service.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = findUser(username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({
    token,
    user: { username: user.username, role: user.role }
  });
});

export default router;
