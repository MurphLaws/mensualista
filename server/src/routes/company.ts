import { Router } from "express";
import { pool } from "../db/pool";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// GET /api/company/dashboard
router.get("/dashboard", authenticate, requireRole("company"), async (req, res) => {
  try {
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;

    if (!companyId) {
      res.json({ active_vendors: 0, monthly_sales: 0, revenue: 0, products: 0 });
      return;
    }

    const vendors = await pool.query(`
      SELECT COUNT(DISTINCT vp.vendor_id) as count
      FROM vendor_products vp JOIN products p ON p.id = vp.product_id
      WHERE p.company_id = $1 AND vp.status = 'active'
    `, [companyId]);

    const sales = await pool.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(s.amount), 0) as total
      FROM sales s JOIN products p ON p.id = s.product_id
      WHERE p.company_id = $1
    `, [companyId]);

    const products = await pool.query("SELECT COUNT(*) as count FROM products WHERE company_id = $1", [companyId]);

    res.json({
      active_vendors: parseInt(vendors.rows[0].count),
      monthly_sales: parseInt(sales.rows[0].count),
      revenue: parseInt(sales.rows[0].total),
      products: parseInt(products.rows[0].count),
    });
  } catch (err) {
    console.error("Company dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/company/vendors
router.get("/vendors", authenticate, requireRole("company"), async (req, res) => {
  try {
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;

    if (!companyId) { res.json({ vendors: [] }); return; }

    const result = await pool.query(`
      SELECT u.id, u.full_name, u.username, u.created_at,
        COUNT(DISTINCT s.id) as total_sales,
        COALESCE(SUM(s.commission_amount), 0) as total_commission
      FROM users u
      JOIN vendor_products vp ON vp.vendor_id = u.id
      JOIN products p ON p.id = vp.product_id AND p.company_id = $1
      LEFT JOIN sales s ON s.vendor_id = u.id AND s.product_id = p.id
      GROUP BY u.id, u.full_name, u.username, u.created_at
      ORDER BY total_sales DESC
    `, [companyId]);

    res.json({ vendors: result.rows });
  } catch (err) {
    console.error("Company vendors error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/company/sales
router.get("/sales", authenticate, requireRole("company"), async (req, res) => {
  try {
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;

    if (!companyId) { res.json({ sales: [] }); return; }

    const result = await pool.query(`
      SELECT s.*, p.name as product_name, u.full_name as vendor_name
      FROM sales s
      JOIN products p ON p.id = s.product_id
      JOIN users u ON u.id = s.vendor_id
      WHERE p.company_id = $1
      ORDER BY s.created_at DESC
    `, [companyId]);

    res.json({ sales: result.rows });
  } catch (err) {
    console.error("Company sales error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
