import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { DataTable } from "@/components/dashboard/DataTable";

const COLUMNS = [
  { key: "periodo", header: "Periodo" },
  { key: "ventas", header: "Ventas" },
  { key: "comision", header: "Comision" },
  { key: "estado", header: "Estado" },
];

export default function VendorCommissions() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-5">
          <p className="text-2xl font-bold">$0</p>
          <p className="text-sm text-muted-foreground mt-1">Total Ganado</p>
        </div>
        <div className="card-premium p-5">
          <p className="text-2xl font-bold">$0</p>
          <p className="text-sm text-muted-foreground mt-1">Pendiente</p>
        </div>
        <div className="card-premium p-5">
          <p className="text-2xl font-bold">$0</p>
          <p className="text-sm text-muted-foreground mt-1">Pagado</p>
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        data={[]}
        emptyState={{
          icon: DollarSign,
          title: "No hay comisiones",
          description: "Las comisiones se generan con cada venta",
        }}
      />
    </motion.div>
  );
}
