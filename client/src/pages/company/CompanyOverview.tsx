import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Package } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";

interface CompanyStats {
  active_vendors: number;
  monthly_sales: number;
  revenue: number;
  products: number;
}

export default function CompanyOverview() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<CompanyStats>("/api/company/dashboard")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Vendedores Activos" value={stats?.active_vendors || 0} />
        <StatCard icon={TrendingUp} label="Ventas Totales" value={stats?.monthly_sales || 0} />
        <StatCard icon={DollarSign} label="Ingresos" value={formatCOP(stats?.revenue || 0)} />
        <StatCard icon={Package} label="Productos" value={stats?.products || 0} />
      </div>
    </motion.div>
  );
}
