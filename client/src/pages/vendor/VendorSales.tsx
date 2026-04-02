import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { DataTable } from "@/components/dashboard/DataTable";

interface Sale {
  id: string;
  product_name: string;
  customer_name: string;
  amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

const COLUMNS = [
  { key: "fecha", header: "Fecha" },
  { key: "producto", header: "Producto" },
  { key: "cliente", header: "Cliente" },
  { key: "monto", header: "Monto" },
  { key: "comision", header: "Comision" },
  { key: "estado", header: "Estado" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completada",
  refunded: "Reembolsada",
};

export default function VendorSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ sales: Sale[] }>("/api/sales")
      .then(data => setSales(data.sales))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tableData = sales.map(s => ({
    fecha: new Date(s.created_at).toLocaleDateString("es-CO"),
    producto: s.product_name,
    cliente: s.customer_name,
    monto: formatCOP(s.amount),
    comision: formatCOP(s.commission_amount),
    estado: STATUS_LABELS[s.status] || s.status,
  }));

  if (loading) {
    return <div className="py-6"><div className="h-64 bg-muted rounded-xl animate-pulse" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 py-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de Ventas</h1>
        <p className="text-sm text-muted-foreground mt-1">{sales.length} ventas registradas</p>
      </div>
      <DataTable columns={COLUMNS} data={tableData} emptyState={{ icon: ShoppingBag, title: "No hay ventas registradas", description: "Tus ventas apareceran aqui" }} />
    </motion.div>
  );
}
