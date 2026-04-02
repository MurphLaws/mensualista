import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  product_count: number;
  vendor_count: number;
  total_sales: number;
  created_at: string;
}

const COLUMNS = [
  { key: "empresa", header: "Empresa" },
  { key: "productos", header: "Productos" },
  { key: "vendedores", header: "Vendedores" },
  { key: "ventas", header: "Ventas Totales" },
  { key: "creado", header: "Creado" },
];

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ companies: Company[] }>("/api/admin/companies")
      .then(data => setCompanies(data.companies))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tableData = companies.map(c => ({
    empresa: c.name,
    productos: c.product_count,
    vendedores: c.vendor_count,
    ventas: formatCOP(c.total_sales),
    creado: new Date(c.created_at).toLocaleDateString("es-CO"),
  }));

  if (loading) {
    return <div className="space-y-6"><PageHeader title="Empresas" /><div className="h-48 bg-muted rounded-xl animate-pulse" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <PageHeader title="Empresas" />
      <DataTable columns={COLUMNS} data={tableData} emptyState={{ icon: Building2, title: "No hay empresas registradas", description: "Las empresas apareceran aqui" }} />
    </motion.div>
  );
}
