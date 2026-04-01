import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, BarChart3, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function CompanyOverview() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Vendedores Activos" value={0} />
        <StatCard icon={TrendingUp} label="Ventas Mensuales" value="$0" />
        <StatCard icon={DollarSign} label="Ingresos" value="$0" />
        <StatCard icon={BarChart3} label="Conversion" value="0%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold mb-4">Actividad reciente</h3>
          <EmptyState
            icon={Clock}
            title="No hay actividad reciente"
            description="La actividad de tu empresa aparecera aqui"
          />
        </div>
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold mb-4">Vendedores destacados</h3>
          <EmptyState
            icon={Users}
            title="No hay vendedores registrados"
            description="Invita vendedores para ver su rendimiento aqui"
          />
        </div>
      </div>
    </motion.div>
  );
}
