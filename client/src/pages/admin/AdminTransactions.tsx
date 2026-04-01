import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";

const COLUMNS = [
  { key: "id", header: "ID" },
  { key: "fecha", header: "Fecha" },
  { key: "empresa", header: "Empresa" },
  { key: "monto", header: "Monto" },
  { key: "tipo", header: "Tipo" },
  { key: "estado", header: "Estado" },
];

export default function AdminTransactions() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Transacciones" />

      <DataTable
        columns={COLUMNS}
        data={[]}
        emptyState={{
          icon: ArrowLeftRight,
          title: "No hay transacciones",
          description: "Las transacciones apareceran aqui",
        }}
      />
    </motion.div>
  );
}
