import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";

interface Vendor {
  id: string;
  full_name: string;
  username: string;
  total_sales: number;
  total_commission: number;
  created_at: string;
}

const COLUMNS = [
  { key: "nombre", header: "Nombre" },
  { key: "username", header: "Username" },
  { key: "ventas", header: "Ventas" },
  { key: "comision", header: "Comision Total" },
];

export default function CompanyVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ vendors: Vendor[] }>("/api/company/vendors")
      .then(data => setVendors(data.vendors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tableData = vendors.map(v => ({
    nombre: v.full_name || v.username,
    username: v.username,
    ventas: v.total_sales,
    comision: formatCOP(v.total_commission),
  }));

  if (loading) {
    return <div className="space-y-6"><PageHeader title="Vendedores" /><div className="h-48 bg-muted rounded-xl animate-pulse" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Vendedores" />
      <DataTable columns={COLUMNS} data={tableData} emptyState={{ icon: Users, title: "No hay vendedores", description: "Los vendedores que vendan tus productos apareceran aqui" }} />
    </motion.div>
  );
}
