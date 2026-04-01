import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";

const COLUMNS = [
  { key: "empresa", header: "Empresa" },
  { key: "plan", header: "Plan" },
  { key: "vendedores", header: "Vendedores" },
  { key: "ventas", header: "Ventas" },
  { key: "estado", header: "Estado" },
];

export default function AdminCompanies() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Empresas" />

      <DataTable
        columns={COLUMNS}
        data={[]}
        emptyState={{
          icon: Building2,
          title: "No hay empresas registradas",
          description: "Las empresas apareceran aqui cuando se registren",
        }}
      />
    </motion.div>
  );
}
