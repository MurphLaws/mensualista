import { pool } from "./pool";

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('vendor', 'admin', 'company')),
      full_name VARCHAR(255) NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      logo_url TEXT,
      primary_color VARCHAR(7) DEFAULT '#5007FA',
      secondary_color VARCHAR(7),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      price INTEGER NOT NULL,
      commission_pct NUMERIC(5,2) NOT NULL,
      type VARCHAR(10) NOT NULL CHECK (type IN ('mensual', 'unico')),
      image_url TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(company_id, name)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendor_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      status VARCHAR(10) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(vendor_id, product_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      customer_name VARCHAR(255),
      customer_email VARCHAR(255),
      amount INTEGER NOT NULL,
      commission_amount INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS commissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
      sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'paid')),
      released_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
  `);

  console.log("Database initialized");
}
