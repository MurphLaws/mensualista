import { Router } from "express";
import { pool } from "../db/pool";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// GET /api/products - list products (company sees own, others see active)
router.get("/", authenticate, async (req, res) => {
  try {
    const role = req.user!.role;
    let query: string;
    const params: string[] = [];

    if (role === "company") {
      const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
      const companyId = userResult.rows[0]?.company_id;
      if (!companyId) {
        res.json({ products: [] });
        return;
      }
      query = `SELECT p.*, c.name as company_name, c.logo_url as company_logo_url
               FROM products p JOIN companies c ON c.id = p.company_id
               WHERE p.company_id = $1 ORDER BY p.created_at DESC`;
      params.push(companyId);
    } else {
      query = `SELECT p.*, c.name as company_name, c.logo_url as company_logo_url
               FROM products p JOIN companies c ON c.id = p.company_id
               WHERE p.active = true ORDER BY p.created_at DESC`;
    }

    const result = await pool.query(query, params);
    res.json({ products: result.rows });
  } catch (err) {
    console.error("Products list error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products - create product (company role)
router.post("/", authenticate, requireRole("company"), async (req, res) => {
  try {
    const b = req.body;

    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;

    if (!companyId) {
      res.status(400).json({ error: "User not associated with a company" });
      return;
    }

    const result = await pool.query(`
      INSERT INTO products (company_id, name, description, price, commission_pct, type, image_url,
        target_audience, features, not_included, pitch_one_line, pitch_three_lines, objections,
        ideal_client, sales_material_urls, refund_window_days, refund_auto, website_url,
        training_type, training_duration_min)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `, [
      companyId, b.name, b.description || '', b.price, b.commission_pct, b.type, b.image_url || null,
      b.target_audience || '', b.features || [], b.not_included || [],
      b.pitch_one_line || '', b.pitch_three_lines || '',
      JSON.stringify(b.objections || []),
      b.ideal_client || '', b.sales_material_urls || [],
      b.refund_window_days || 7, b.refund_auto || false, b.website_url || '',
      b.training_type || '', b.training_duration_min || 0,
    ]);

    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id - single product with company info + vendor stats
router.get("/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as company_name, c.logo_url as company_logo_url
      FROM products p
      JOIN companies c ON c.id = p.company_id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const product = result.rows[0];

    // If vendor, include their sales stats for this product
    if (req.user!.role === "vendor") {
      const statsResult = await pool.query(`
        SELECT COUNT(*) as my_sales,
          COALESCE(SUM(commission_amount), 0) as my_earned
        FROM sales
        WHERE vendor_id = $1 AND product_id = $2
      `, [req.user!.id, req.params.id]);

      product.my_sales = parseInt(statsResult.rows[0].my_sales);
      product.my_earned = parseInt(statsResult.rows[0].my_earned);

      // Check vendor_products status
      const vpResult = await pool.query(
        `SELECT status FROM vendor_products WHERE vendor_id = $1 AND product_id = $2`,
        [req.user!.id, req.params.id]
      );
      product.vendor_status = vpResult.rows[0]?.status || "inactive";
    }

    // Get active coupons for this product
    const couponsResult = await pool.query(`
      SELECT id, code, discount_pct, max_uses, used_count, expires_at
      FROM coupons
      WHERE (product_id = $1 OR product_id IS NULL)
        AND company_id = $2
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    `, [req.params.id, product.company_id]);

    product.coupons = couponsResult.rows;

    res.json({ product });
  } catch (err) {
    console.error("Product detail error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/products/:id - update product (company role)
router.put("/:id", authenticate, requireRole("company"), async (req, res) => {
  try {
    const b = req.body;
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;

    const prodCheck = await pool.query("SELECT company_id FROM products WHERE id = $1", [req.params.id]);
    if (prodCheck.rows.length === 0 || prodCheck.rows[0].company_id !== companyId) {
      res.status(403).json({ error: "Not your product" });
      return;
    }

    const result = await pool.query(`
      UPDATE products SET
        name = COALESCE($1, name), description = COALESCE($2, description),
        price = COALESCE($3, price), commission_pct = COALESCE($4, commission_pct),
        type = COALESCE($5, type), image_url = COALESCE($6, image_url), active = COALESCE($7, active),
        target_audience = COALESCE($8, target_audience), features = COALESCE($9, features),
        not_included = COALESCE($10, not_included), pitch_one_line = COALESCE($11, pitch_one_line),
        pitch_three_lines = COALESCE($12, pitch_three_lines),
        objections = COALESCE($13, objections), ideal_client = COALESCE($14, ideal_client),
        sales_material_urls = COALESCE($15, sales_material_urls),
        refund_window_days = COALESCE($16, refund_window_days), refund_auto = COALESCE($17, refund_auto),
        website_url = COALESCE($18, website_url), training_type = COALESCE($19, training_type),
        training_duration_min = COALESCE($20, training_duration_min)
      WHERE id = $21 RETURNING *
    `, [
      b.name, b.description, b.price, b.commission_pct, b.type, b.image_url, b.active,
      b.target_audience, b.features, b.not_included,
      b.pitch_one_line, b.pitch_three_lines,
      b.objections != null ? JSON.stringify(b.objections) : null,
      b.ideal_client, b.sales_material_urls,
      b.refund_window_days, b.refund_auto, b.website_url,
      b.training_type, b.training_duration_min,
      req.params.id,
    ]);

    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id/stats - product stats for company view
router.get("/:id/stats", authenticate, requireRole("company"), async (req, res) => {
  try {
    const salesResult = await pool.query(`
      SELECT COUNT(*) as total_sales,
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(commission_amount), 0) as total_commissions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_count
      FROM sales WHERE product_id = $1
    `, [req.params.id]);

    const vendorsResult = await pool.query(`
      SELECT COUNT(DISTINCT vendor_id) as vendor_count
      FROM vendor_products WHERE product_id = $1 AND status = 'active'
    `, [req.params.id]);

    const stats = salesResult.rows[0];
    res.json({
      total_sales: parseInt(stats.total_sales),
      total_revenue: parseInt(stats.total_revenue),
      total_commissions: parseInt(stats.total_commissions),
      pending_count: parseInt(stats.pending_count),
      completed_count: parseInt(stats.completed_count),
      refunded_count: parseInt(stats.refunded_count),
      vendor_count: parseInt(vendorsResult.rows[0].vendor_count),
    });
  } catch (err) {
    console.error("Product stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/products/:id - delete product (company role)
router.delete("/:id", authenticate, requireRole("company"), async (req, res) => {
  try {
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;

    const prodCheck = await pool.query("SELECT company_id FROM products WHERE id = $1", [req.params.id]);
    if (prodCheck.rows.length === 0 || prodCheck.rows[0].company_id !== companyId) {
      res.status(403).json({ error: "Not your product" });
      return;
    }

    await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
