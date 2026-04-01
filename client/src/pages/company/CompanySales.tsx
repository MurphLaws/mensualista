import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";

const COLUMNS = [
  { key: "fecha", header: "Fecha" },
  { key: "producto", header: "Producto" },
  { key: "vendedor", header: "Vendedor" },
  { key: "monto", header: "Monto" },
  { key: "estado", header: "Estado" },
];

export default function CompanySales() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader title="Dashboard de Ventas" />

      <div className="card-premium p-8">
        <EmptyState
          icon={BarChart3}
          title="Graficos de ventas"
          description="Los graficos de ventas apareceran cuando haya datos"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Ventas Recientes</h3>
        <DataTable
          columns={COLUMNS}
          data={[]}
          emptyState={{
            icon: TrendingUp,
            title: "No hay ventas",
            description: "Las ventas apareceran aqui cuando se registren",
          }}
        />
      </div>
    </motion.div>
  );
}
