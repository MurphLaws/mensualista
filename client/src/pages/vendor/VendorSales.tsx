import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";

const COLUMNS = [
  { key: "fecha", header: "Fecha" },
  { key: "producto", header: "Producto" },
  { key: "cliente", header: "Cliente" },
  { key: "monto", header: "Monto" },
  { key: "estado", header: "Estado" },
];

export default function VendorSales() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader title="Historial de Ventas" />

      <DataTable
        columns={COLUMNS}
        data={[]}
        emptyState={{
          icon: ShoppingBag,
          title: "No hay ventas registradas",
          description: "Tus ventas apareceran aqui",
        }}
      />
    </motion.div>
  );
}
