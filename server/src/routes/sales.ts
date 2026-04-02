import { Router } from "express";
import { pool } from "../db/pool";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// GET /api/sales
router.get("/", authenticate, async (req, res) => {
  try {
    const vendorId = req.user!.id;
    const role = req.user!.role;

    let query = `
      SELECT s.*, p.name as product_name, c.name as company_name
      FROM sales s
      JOIN products p ON p.id = s.product_id
      JOIN companies c ON c.id = p.company_id
    `;
    const params: string[] = [];

    if (role === 'vendor') {
      query += ' WHERE s.vendor_id = $1';
      params.push(vendorId);
    }

    query += ' ORDER BY s.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ sales: result.rows });
  } catch (err) {
    console.error("Sales list error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sales
router.post("/", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const { product_id, customer_name, customer_email } = req.body;
    const vendorId = req.user!.id;

    // Get product details for price/commission calculation
    const prodResult = await pool.query("SELECT price, commission_pct FROM products WHERE id = $1", [product_id]);
    if (prodResult.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const product = prodResult.rows[0];
    const amount = product.price;
    const commission_amount = Math.round(amount * parseFloat(product.commission_pct) / 100);

    // Create sale
    const saleResult = await pool.query(`
      INSERT INTO sales (vendor_id, product_id, customer_name, customer_email, amount, commission_amount, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `, [vendorId, product_id, customer_name, customer_email, amount, commission_amount]);

    const sale = saleResult.rows[0];

    // Create commission record
    await pool.query(`
      INSERT INTO commissions (vendor_id, sale_id, amount, status)
      VALUES ($1, $2, $3, 'pending')
    `, [vendorId, sale.id, commission_amount]);

    res.status(201).json({ sale });
  } catch (err) {
    console.error("Create sale error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
