import { Router } from "express";
import { pool } from "../db/pool";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// GET /api/admin/dashboard
router.get("/dashboard", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) as count FROM users");
    const companies = await pool.query("SELECT COUNT(*) as count FROM companies");
    const sales = await pool.query("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM sales");

    res.json({
      total_users: parseInt(users.rows[0].count),
      active_companies: parseInt(companies.rows[0].count),
      total_transactions: parseInt(sales.rows[0].count),
      total_revenue: parseInt(sales.rows[0].total),
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users
router.get("/users", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.query;
    let query = "SELECT id, username, full_name, role, created_at FROM users";
    const params: string[] = [];

    if (role && role !== "todos") {
      query += " WHERE role = $1";
      params.push(role as string);
    }
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/companies
router.get("/companies", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM products WHERE company_id = c.id) as product_count,
        (SELECT COUNT(DISTINCT vp.vendor_id) FROM vendor_products vp JOIN products p ON p.id = vp.product_id WHERE p.company_id = c.id) as vendor_count,
        (SELECT COALESCE(SUM(s.amount), 0) FROM sales s JOIN products p ON p.id = s.product_id WHERE p.company_id = c.id) as total_sales
      FROM companies c
      ORDER BY c.created_at DESC
    `);
    res.json({ companies: result.rows });
  } catch (err) {
    console.error("Admin companies error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
