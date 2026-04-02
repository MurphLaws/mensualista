import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Clock, Wallet, BarChart3, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { CommissionBanner } from "@/components/vendor/CommissionBanner";
import { ProductCard } from "@/components/vendor/ProductCard";
import type { VendorDashboardStats, VendorProduct } from "@/lib/types";

export default function VendorOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashData, prodData] = await Promise.all([
          api.get<VendorDashboardStats>("/api/vendor/dashboard"),
          api.get<{ products: VendorProduct[] }>("/api/vendor/products"),
        ]);
        setStats(dashData);
        setProducts(prodData.products);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded-2xl animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-52 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const s = stats?.stats;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 py-6"
    >
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm">{stats?.greeting || "Hola"}</p>
        <h1 className="text-2xl font-bold">{user?.full_name || user?.username}</h1>
      </div>

      {/* Commission banner */}
      <CommissionBanner
        total={s?.total_commissions || 0}
        pendingReturn={s?.pending_return || 0}
        available={s?.available || 0}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">{s?.total_sales || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Ventas</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-lg font-bold">{formatCOP(s?.pending_return || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Tiempo de devolucion</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-lg font-bold">{formatCOP(s?.available || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Disponible</p>
        </div>
      </div>

      {/* Metrics toggle */}
      <button
        onClick={() => setMetricsOpen(!metricsOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <BarChart3 className="h-4 w-4" />
        <span>Ver metricas y pagos</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${metricsOpen ? "rotate-180" : ""}`} />
      </button>

      {metricsOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white rounded-xl border p-6 text-center text-sm text-muted-foreground"
        >
          Metricas detalladas proximamente
        </motion.div>
      )}

      {/* Products section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mis productos</h2>
        <Link
          to="/vendor/products"
          className="text-sm text-primary font-medium hover:underline"
        >
          Explorar &gt;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No tienes productos asignados aun
        </div>
      )}
    </motion.div>
  );
}
