import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Building2, ArrowLeftRight, DollarSign } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";

interface AdminStats {
  total_users: number;
  active_companies: number;
  total_transactions: number;
  total_revenue: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminStats>("/api/admin/dashboard")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Usuarios" value={stats?.total_users || 0} />
        <StatCard icon={Building2} label="Empresas Activas" value={stats?.active_companies || 0} />
        <StatCard icon={ArrowLeftRight} label="Transacciones" value={stats?.total_transactions || 0} />
        <StatCard icon={DollarSign} label="Revenue" value={formatCOP(stats?.total_revenue || 0)} />
      </div>
    </motion.div>
  );
}
