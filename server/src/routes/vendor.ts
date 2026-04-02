import { Router } from "express";
import { pool } from "../db/pool";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// GET /api/vendor/dashboard
router.get("/dashboard", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const vendorId = req.user!.id;

    // Sales count
    const salesResult = await pool.query(
      "SELECT COUNT(*) as total_sales FROM sales WHERE vendor_id = $1",
      [vendorId]
    );

    // Commission aggregates
    const commResult = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_return,
        COALESCE(SUM(CASE WHEN status = 'released' THEN amount ELSE 0 END), 0) as available,
        COALESCE(SUM(amount), 0) as total_commissions
      FROM commissions WHERE vendor_id = $1
    `, [vendorId]);

    const hour = new Date().getHours();
    let greeting = "Buenos dias";
    if (hour >= 18) greeting = "Buenas noches";
    else if (hour >= 12) greeting = "Buenas tardes";

    res.json({
      greeting,
      stats: {
        total_sales: parseInt(salesResult.rows[0].total_sales),
        pending_return: parseInt(commResult.rows[0].pending_return),
        available: parseInt(commResult.rows[0].available),
        total_commissions: parseInt(commResult.rows[0].total_commissions),
      }
    });
  } catch (err) {
    console.error("Vendor dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/vendor/products
router.get("/products", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const vendorId = req.user!.id;

    const result = await pool.query(`
      SELECT
        p.id, p.name, p.description, p.price, p.commission_pct, p.type, p.image_url,
        vp.status,
        c.name as company_name, c.logo_url as company_logo_url,
        COALESCE(s.sales_count, 0) as sales_count
      FROM vendor_products vp
      JOIN products p ON p.id = vp.product_id
      JOIN companies c ON c.id = p.company_id
      LEFT JOIN (
        SELECT product_id, COUNT(*) as sales_count
        FROM sales WHERE vendor_id = $1
        GROUP BY product_id
      ) s ON s.product_id = p.id
      WHERE vp.vendor_id = $1
      ORDER BY vp.assigned_at DESC
    `, [vendorId]);

    res.json({ products: result.rows });
  } catch (err) {
    console.error("Vendor products error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
