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
    const { name, description, price, commission_pct, type, image_url, active } = req.body;
    const userResult = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user!.id]);
    const companyId = userResult.rows[0]?.company_id;

    // Verify product belongs to user's company
    const prodCheck = await pool.query("SELECT company_id FROM products WHERE id = $1", [req.params.id]);
    if (prodCheck.rows.length === 0 || prodCheck.rows[0].company_id !== companyId) {
      res.status(403).json({ error: "Not your product" });
      return;
    }

    const result = await pool.query(`
      UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description),
        price = COALESCE($3, price), commission_pct = COALESCE($4, commission_pct),
        type = COALESCE($5, type), image_url = COALESCE($6, image_url), active = COALESCE($7, active)
      WHERE id = $8 RETURNING *
    `, [name, description, price, commission_pct, type, image_url, active, req.params.id]);

    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error("Update product error:", err);
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
