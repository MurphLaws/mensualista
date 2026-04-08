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

// POST /api/admin/companies - create a company
router.post("/companies", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, logo_url, owner_username } = req.body;
    if (!name) {
      res.status(400).json({ error: "Company name is required" });
      return;
    }

    // Check duplicate name
    const existing = await pool.query("SELECT id FROM companies WHERE name = $1", [name]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "A company with that name already exists" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO companies (name, logo_url) VALUES ($1, $2) RETURNING *`,
      [name, logo_url || null]
    );
    const company = result.rows[0];

    // If owner_username provided, link that company user to this company
    if (owner_username) {
      const userResult = await pool.query(
        `UPDATE users SET company_id = $1 WHERE username = $2 AND role = 'company' RETURNING id`,
        [company.id, owner_username]
      );
      if (userResult.rows.length === 0) {
        // User doesn't exist or isn't a company role — still created the company
      }
    }

    res.status(201).json({ company });
  } catch (err) {
    console.error("Create company error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/companies/:id - update a company
router.put("/companies/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, logo_url } = req.body;
    const result = await pool.query(
      `UPDATE companies SET name = COALESCE($1, name), logo_url = COALESCE($2, logo_url) WHERE id = $3 RETURNING *`,
      [name, logo_url, req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json({ company: result.rows[0] });
  } catch (err) {
    console.error("Update company error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/companies/:id - delete a company
router.delete("/companies/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    // Unlink users from this company first
    await pool.query(`UPDATE users SET company_id = NULL WHERE company_id = $1`, [req.params.id]);
    const result = await pool.query(`DELETE FROM companies WHERE id = $1 RETURNING id`, [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error("Delete company error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/users - create a user (any role)
router.post("/users", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { username, password, role, full_name, company_id } = req.body;
    if (!username || !password || !role) {
      res.status(400).json({ error: "username, password, and role are required" });
      return;
    }
    if (!["vendor", "company", "admin"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role, full_name, company_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role, full_name, created_at`,
      [username, hash, role, full_name || '', company_id || null]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Username already exists" });
      return;
    }
    console.error("Create user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/company-users - get unassigned company-role users (for linking)
router.get("/company-users", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, company_id FROM users WHERE role = 'company' ORDER BY full_name`
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Company users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
