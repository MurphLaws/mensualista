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

export async function seedData() {
  // No seed data — admin creates companies and products through the UI
  console.log("No seed data (clean app)");
}
