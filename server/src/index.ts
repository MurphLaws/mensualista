import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { initDb } from "./db/init";
import { seedUsers, seedData } from "./db/seed";
import authRoutes from "./routes/auth";
import healthRoutes from "./routes/health";
import vendorRoutes from "./routes/vendor";
import productRoutes from "./routes/products";
import salesRoutes from "./routes/sales";
import adminRoutes from "./routes/admin";
import companyRoutes from "./routes/company";
import trainingRoutes from "./routes/trainings";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/trainings", trainingRoutes);

// In production, serve the built React client
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

async function start() {
  try {
    await initDb();
    await seedUsers();
    await seedData();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

start();
