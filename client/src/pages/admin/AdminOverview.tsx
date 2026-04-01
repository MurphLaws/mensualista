import { motion } from "framer-motion";
import { Users, Building2, ArrowLeftRight, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function AdminOverview() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Usuarios" value={0} />
        <StatCard icon={Building2} label="Empresas Activas" value={0} />
        <StatCard icon={ArrowLeftRight} label="Transacciones" value={0} />
        <StatCard icon={DollarSign} label="Revenue" value="$0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold mb-2">Actividad reciente</h3>
          <EmptyState
            icon={Clock}
            title="No hay actividad reciente"
            description="La actividad de la plataforma aparecera aqui"
          />
        </div>
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold mb-2">Alertas del sistema</h3>
          <EmptyState
            icon={AlertTriangle}
            title="No hay alertas"
            description="El sistema esta funcionando correctamente"
          />
        </div>
      </div>
    </motion.div>
  );
}
