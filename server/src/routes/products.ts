import { Router } from "express";
import { pool } from "../db/pool";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// GET /api/products - list all active products (for marketplace/explore)
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as company_name, c.logo_url as company_logo_url
      FROM products p
      JOIN companies c ON c.id = p.company_id
      WHERE p.active = true
      ORDER BY p.created_at DESC
    `);
    res.json({ products: result.rows });
  } catch (err) {
    console.error("Products list error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products - create product (company role)
router.post("/", authenticate, requireRole("company"), async (req, res) => {
  try {
    const { name, description, price, commission_pct, type, image_url } = req.body;

    // Get company_id from user
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;

    if (!companyId) {
      res.status(400).json({ error: "User not associated with a company" });
      return;
    }

    const result = await pool.query(`
      INSERT INTO products (company_id, name, description, price, commission_pct, type, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [companyId, name, description || '', price, commission_pct, type, image_url || null]);

    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
