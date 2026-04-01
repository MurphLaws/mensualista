import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function VendorProducts() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Mis Productos"
        description="Productos asignados por tu empresa"
      />

      <div className="card-premium p-6">
        <EmptyState
          icon={Package}
          title="No tienes productos asignados"
          description="Tu empresa asignara productos a tu cuenta"
        />
      </div>
    </motion.div>
  );
}
