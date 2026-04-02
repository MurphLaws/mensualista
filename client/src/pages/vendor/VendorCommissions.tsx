import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { DataTable } from "@/components/dashboard/DataTable";
import type { VendorDashboardStats } from "@/lib/types";

interface Commission {
  id: string;
  amount: number;
  status: string;
  product_name: string;
  customer_name: string;
  created_at: string;
}

const COLUMNS = [
  { key: "fecha", header: "Fecha" },
  { key: "producto", header: "Producto" },
  { key: "cliente", header: "Cliente" },
  { key: "monto", header: "Monto" },
  { key: "estado", header: "Estado" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  released: "Liberada",
  paid: "Pagada",
};

export default function VendorCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<VendorDashboardStats["stats"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ commissions: Commission[] }>("/api/vendor/commissions"),
      api.get<VendorDashboardStats>("/api/vendor/dashboard"),
    ]).then(([commData, dashData]) => {
      setCommissions(commData.commissions);
      setStats(dashData.stats);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const tableData = commissions.map(c => ({
    fecha: new Date(c.created_at).toLocaleDateString("es-CO"),
    producto: c.product_name,
    cliente: c.customer_name,
    monto: formatCOP(c.amount),
    estado: STATUS_LABELS[c.status] || c.status,
  }));

  if (loading) {
    return <div className="py-6"><div className="h-64 bg-muted rounded-xl animate-pulse" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 py-6">
      <h1 className="text-2xl font-bold">Comisiones</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-2xl font-bold">{formatCOP(stats?.total_commissions || 0)}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Ganado</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-2xl font-bold">{formatCOP(stats?.pending_return || 0)}</p>
          <p className="text-sm text-muted-foreground mt-1">Pendiente</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-2xl font-bold">{formatCOP(stats?.available || 0)}</p>
          <p className="text-sm text-muted-foreground mt-1">Disponible</p>
        </div>
      </div>

      <DataTable columns={COLUMNS} data={tableData} emptyState={{ icon: DollarSign, title: "No hay comisiones", description: "Las comisiones se generan con cada venta" }} />
    </motion.div>
  );
}
