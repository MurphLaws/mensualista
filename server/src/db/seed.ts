import bcrypt from "bcryptjs";
import { pool } from "./pool";

const SEED_USERS = [
  { username: "vendor", role: "vendor", full_name: "Vendedor Demo" },
  { username: "admin", role: "admin", full_name: "Admin Demo" },
  { username: "empresa", role: "company", full_name: "Empresa Demo" },
];

export async function seedUsers() {
  const hash = await bcrypt.hash("123", 10);

  for (const u of SEED_USERS) {
    await pool.query(
      `INSERT INTO users (username, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      [u.username, hash, u.role, u.full_name]
    );
  }
  console.log("Seed users ready");
}

interface CompanyDef {
  name: string;
  logo_url: string;
  products: {
    name: string;
    price: number;
    commission_pct: number;
    type: "mensual" | "unico";
    image_url: string;
  }[];
}

const COMPANIES: CompanyDef[] = [
  {
    name: "IronHaus",
    logo_url: "https://picsum.photos/seed/ironhaus/100/100",
    products: [
      { name: "Plan Full Gym Mensual", price: 28350, commission_pct: 15, type: "mensual", image_url: "https://picsum.photos/seed/gym1/400/300" },
      { name: "Plan Premium + Entrenador", price: 62820, commission_pct: 15, type: "mensual", image_url: "https://picsum.photos/seed/gym2/400/300" },
    ],
  },
  {
    name: "Prana Studio",
    logo_url: "https://picsum.photos/seed/prana/100/100",
    products: [
      { name: "Membresia Prana Ilimitada", price: 39600, commission_pct: 18, type: "mensual", image_url: "https://picsum.photos/seed/yoga1/400/300" },
      { name: "Retiro Wellness 3 Dias", price: 195800, commission_pct: 18, type: "unico", image_url: "https://picsum.photos/seed/yoga2/400/300" },
    ],
  },
  {
    name: "Salon Elite",
    logo_url: "https://picsum.photos/seed/salon/100/100",
    products: [
      { name: "Paquete Corte + Color Premium", price: 50400, commission_pct: 15, type: "unico", image_url: "https://picsum.photos/seed/salon1/400/300" },
      { name: "Plan Belleza Mensual", price: 52500, commission_pct: 15, type: "mensual", image_url: "https://picsum.photos/seed/salon2/400/300" },
    ],
  },
];

async function getOrInsertCompany(name: string, logo_url: string): Promise<string> {
  const result = await pool.query(
    `INSERT INTO companies (name, logo_url) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id`,
    [name, logo_url]
  );
  if (result.rows.length > 0) return result.rows[0].id;
  const existing = await pool.query(`SELECT id FROM companies WHERE name = $1`, [name]);
  return existing.rows[0].id;
}

async function getOrInsertProduct(
  companyId: string,
  p: CompanyDef["products"][number]
): Promise<string> {
  const result = await pool.query(
    `INSERT INTO products (company_id, name, description, price, commission_pct, type, image_url)
     VALUES ($1, $2, '', $3, $4, $5, $6)
     ON CONFLICT (company_id, name) DO NOTHING RETURNING id`,
    [companyId, p.name, p.price, p.commission_pct, p.type, p.image_url]
  );
  if (result.rows.length > 0) return result.rows[0].id;
  const existing = await pool.query(
    `SELECT id FROM products WHERE company_id = $1 AND name = $2`,
    [companyId, p.name]
  );
  return existing.rows[0].id;
}

export async function seedData() {
  // 1. Seed companies and products
  const allProductIds: string[] = [];

  for (const company of COMPANIES) {
    const companyId = await getOrInsertCompany(company.name, company.logo_url);
    for (const product of company.products) {
      const productId = await getOrInsertProduct(companyId, product);
      allProductIds.push(productId);
    }
  }

  // 2. Get vendor user
  const vendorResult = await pool.query(
    `SELECT id FROM users WHERE username = 'vendor'`
  );
  if (vendorResult.rows.length === 0) {
    console.log("Vendor user not found, skipping seed data");
    return;
  }
  const vendorId = vendorResult.rows[0].id;

  // 3. Assign all 6 products to vendor (first 2 active, rest inactive)
  for (let i = 0; i < allProductIds.length; i++) {
    const status = i < 2 ? "active" : "inactive";
    await pool.query(
      `INSERT INTO vendor_products (vendor_id, product_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (vendor_id, product_id) DO NOTHING`,
      [vendorId, allProductIds[i], status]
    );
  }

  // 4. Create 7 sales with commissions
  // Target: pending commissions ~56700, released commissions ~142500
  // We'll use the first two products (active ones) for sales
  const salesData = [
    // Released commissions (completed sales) - total ~142500
    { productIdx: 0, customerName: "Carlos Mendez", customerEmail: "carlos@test.com", status: "completed", commissionStatus: "released", amount: 28350, commissionAmount: 4253 },
    { productIdx: 1, customerName: "Maria Lopez", customerEmail: "maria@test.com", status: "completed", commissionStatus: "released", amount: 62820, commissionAmount: 9423 },
    { productIdx: 0, customerName: "Juan Perez", customerEmail: "juan@test.com", status: "completed", commissionStatus: "released", amount: 28350, commissionAmount: 4253 },
    { productIdx: 1, customerName: "Sofia Garcia", customerEmail: "sofia@test.com", status: "completed", commissionStatus: "released", amount: 62820, commissionAmount: 9423 },
    { productIdx: 0, customerName: "Andres Rios", customerEmail: "andres@test.com", status: "completed", commissionStatus: "released", amount: 28350, commissionAmount: 115148 },
    // Pending commissions - total ~56700
    { productIdx: 1, customerName: "Laura Torres", customerEmail: "laura@test.com", status: "pending", commissionStatus: "pending", amount: 62820, commissionAmount: 47277 },
    { productIdx: 0, customerName: "Diego Vargas", customerEmail: "diego@test.com", status: "pending", commissionStatus: "pending", amount: 28350, commissionAmount: 9423 },
  ];

  // Check if sales already exist for this vendor
  const existingSales = await pool.query(
    `SELECT COUNT(*) as cnt FROM sales WHERE vendor_id = $1`,
    [vendorId]
  );
  if (parseInt(existingSales.rows[0].cnt) > 0) {
    console.log("Seed data already exists, skipping");
    return;
  }

  for (const s of salesData) {
    const saleResult = await pool.query(
      `INSERT INTO sales (vendor_id, product_id, customer_name, customer_email, amount, commission_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [vendorId, allProductIds[s.productIdx], s.customerName, s.customerEmail, s.amount, s.commissionAmount, s.status]
    );
    const saleId = saleResult.rows[0].id;

    await pool.query(
      `INSERT INTO commissions (vendor_id, sale_id, amount, status)
       VALUES ($1, $2, $3, $4)`,
      [vendorId, saleId, s.commissionAmount, s.commissionStatus]
    );
  }

  console.log("Seed data ready");
}
