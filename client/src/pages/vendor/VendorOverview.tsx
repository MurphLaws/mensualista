import { motion } from "framer-motion";
import { ShoppingBag, DollarSign, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function VendorOverview() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={ShoppingBag} label="Ventas" value={0} />
        <StatCard icon={DollarSign} label="Comisiones" value="$0" />
        <StatCard icon={Clock} label="Pagos Pendientes" value="$0" />
      </div>

      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold mb-4">Actividad reciente</h3>
        <EmptyState
          icon={Clock}
          title="No hay actividad reciente"
          description="Tu actividad de ventas aparecera aqui"
        />
      </div>
    </motion.div>
  );
}
