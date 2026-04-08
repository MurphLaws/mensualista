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

// GET /api/company/chat/vendors - list vendors with last message
router.get("/chat/vendors", authenticate, requireRole("company"), async (req, res) => {
  try {
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;
    if (!companyId) { res.json({ vendors: [] }); return; }

    // Get all vendors linked to this company via vendor_products
    const result = await pool.query(`
      SELECT DISTINCT u.id, u.full_name, u.username,
        (SELECT cm.message FROM chat_messages cm
         WHERE cm.company_id = $1 AND (cm.sender_id = u.id OR cm.receiver_id = u.id)
         ORDER BY cm.created_at DESC LIMIT 1) as last_message,
        (SELECT cm.created_at FROM chat_messages cm
         WHERE cm.company_id = $1 AND (cm.sender_id = u.id OR cm.receiver_id = u.id)
         ORDER BY cm.created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM chat_messages cm
         WHERE cm.company_id = $1 AND cm.sender_id = u.id
         AND cm.created_at > COALESCE(
           (SELECT MAX(cm2.created_at) FROM chat_messages cm2
            WHERE cm2.company_id = $1 AND cm2.sender_id = $2 AND cm2.receiver_id = u.id),
           '1970-01-01'
         ))::int as unread_count
      FROM users u
      JOIN vendor_products vp ON vp.vendor_id = u.id
      JOIN products p ON p.id = vp.product_id AND p.company_id = $1
      ORDER BY last_message_at DESC NULLS LAST, u.full_name ASC
    `, [companyId, req.user!.id]);

    res.json({ vendors: result.rows });
  } catch (err) {
    console.error("Chat vendors error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/company/chat/:vendorId - get messages with a vendor
router.get("/chat/:vendorId", authenticate, requireRole("company"), async (req, res) => {
  try {
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;
    if (!companyId) { res.json({ messages: [] }); return; }

    const result = await pool.query(`
      SELECT cm.id, cm.message, cm.created_at,
        CASE WHEN cm.sender_id = $1 THEN 'company' ELSE 'vendor' END as "from"
      FROM chat_messages cm
      WHERE cm.company_id = $2
        AND (cm.sender_id = $3 OR cm.receiver_id = $3)
      ORDER BY cm.created_at ASC
    `, [req.user!.id, companyId, req.params.vendorId]);

    res.json({ messages: result.rows });
  } catch (err) {
    console.error("Chat messages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/company/chat/:vendorId - send message to vendor
router.post("/chat/:vendorId", authenticate, requireRole("company"), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) { res.status(400).json({ error: "Message required" }); return; }

    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;
    if (!companyId) { res.status(400).json({ error: "No company" }); return; }

    const result = await pool.query(`
      INSERT INTO chat_messages (sender_id, receiver_id, company_id, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, message, created_at
    `, [req.user!.id, req.params.vendorId, companyId, message.trim()]);

    res.status(201).json({ message: { ...result.rows[0], from: 'company' } });
  } catch (err) {
    console.error("Send chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/company/coupons - list coupons
router.get("/coupons", authenticate, requireRole("company"), async (req, res) => {
  try {
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;
    if (!companyId) { res.json({ coupons: [] }); return; }

    const result = await pool.query(`
      SELECT c.*, p.name as product_name
      FROM coupons c
      LEFT JOIN products p ON p.id = c.product_id
      WHERE c.company_id = $1
      ORDER BY c.created_at DESC
    `, [companyId]);

    res.json({ coupons: result.rows });
  } catch (err) {
    console.error("Coupons error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
