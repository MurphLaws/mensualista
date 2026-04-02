import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";

interface Sale {
  id: string;
  product_name: string;
  vendor_name: string;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const COLUMNS = [
  { key: "fecha", header: "Fecha" },
  { key: "producto", header: "Producto" },
  { key: "vendedor", header: "Vendedor" },
  { key: "monto", header: "Monto" },
  { key: "estado", header: "Estado" },
];

const STATUS_LABELS: Record<string, string> = { pending: "Pendiente", completed: "Completada", refunded: "Reembolsada" };

export default function CompanySales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ sales: Sale[] }>("/api/company/sales")
      .then(data => setSales(data.sales))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tableData = sales.map(s => ({
    fecha: new Date(s.created_at).toLocaleDateString("es-CO"),
    producto: s.product_name,
    vendedor: s.vendor_name,
    monto: formatCOP(s.amount),
    estado: STATUS_LABELS[s.status] || s.status,
  }));

  if (loading) {
    return <div className="space-y-6"><PageHeader title="Ventas" /><div className="h-48 bg-muted rounded-xl animate-pulse" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Ventas" />
      <DataTable columns={COLUMNS} data={tableData} emptyState={{ icon: TrendingUp, title: "No hay ventas", description: "Las ventas apareceran aqui cuando se registren" }} />
    </motion.div>
  );
}
