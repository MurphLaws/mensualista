import { Router } from "express";
import { pool } from "../db/pool";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM trainings ORDER BY created_at DESC");
    res.json({ trainings: result.rows });
  } catch (err) {
    console.error("Trainings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
