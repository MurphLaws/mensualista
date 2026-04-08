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

// GET /api/vendor/profile
router.get("/profile", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const vendorId = req.user!.id;
    const userResult = await pool.query(
      "SELECT id, username, full_name, role, created_at FROM users WHERE id = $1",
      [vendorId]
    );

    const statsResult = await pool.query(`
      SELECT
        COUNT(DISTINCT s.id) as total_sales,
        COALESCE(SUM(c.amount), 0) as total_commissions
      FROM sales s
      LEFT JOIN commissions c ON c.sale_id = s.id
      WHERE s.vendor_id = $1
    `, [vendorId]);

    res.json({
      user: userResult.rows[0],
      stats: {
        total_sales: parseInt(statsResult.rows[0].total_sales),
        total_commissions: parseInt(statsResult.rows[0].total_commissions),
      }
    });
  } catch (err) {
    console.error("Vendor profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/vendor/clients
router.get("/clients", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const vendorId = req.user!.id;
    const result = await pool.query(`
      SELECT
        customer_name, customer_email,
        COUNT(*) as total_purchases,
        SUM(amount) as total_spent,
        MAX(created_at) as last_purchase
      FROM sales
      WHERE vendor_id = $1 AND customer_email IS NOT NULL
      GROUP BY customer_email, customer_name
      ORDER BY last_purchase DESC
    `, [vendorId]);

    res.json({ clients: result.rows });
  } catch (err) {
    console.error("Vendor clients error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/vendor/commissions
router.get("/commissions", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const vendorId = req.user!.id;
    const result = await pool.query(`
      SELECT c.*, s.customer_name, p.name as product_name
      FROM commissions c
      JOIN sales s ON s.id = c.sale_id
      JOIN products p ON p.id = s.product_id
      WHERE c.vendor_id = $1
      ORDER BY c.created_at DESC
    `, [vendorId]);

    res.json({ commissions: result.rows });
  } catch (err) {
    console.error("Vendor commissions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/vendor/chat - get messages grouped by company
router.get("/chat", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const vendorId = req.user!.id;

    const result = await pool.query(`
      SELECT cm.id, cm.message, cm.created_at, cm.company_id,
        c.name as company_name,
        CASE WHEN cm.sender_id = $1 THEN 'vendor' ELSE 'company' END as "from"
      FROM chat_messages cm
      JOIN companies c ON c.id = cm.company_id
      WHERE cm.sender_id = $1 OR cm.receiver_id = $1
      ORDER BY cm.created_at ASC
    `, [vendorId]);

    res.json({ messages: result.rows });
  } catch (err) {
    console.error("Vendor chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/vendor/chat/:companyId - send message to company
router.post("/chat/:companyId", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) { res.status(400).json({ error: "Message required" }); return; }

    const vendorId = req.user!.id;
    // Find the company owner user
    const companyUser = await pool.query(
      `SELECT id FROM users WHERE company_id = $1 AND role = 'company' LIMIT 1`,
      [req.params.companyId]
    );
    if (companyUser.rows.length === 0) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const result = await pool.query(`
      INSERT INTO chat_messages (sender_id, receiver_id, company_id, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, message, created_at
    `, [vendorId, companyUser.rows[0].id, req.params.companyId, message.trim()]);

    res.status(201).json({ message: { ...result.rows[0], from: 'vendor' } });
  } catch (err) {
    console.error("Vendor send chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
