import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Client {
  customer_name: string;
  customer_email: string;
  total_purchases: number;
  total_spent: number;
  last_purchase: string;
}

export default function VendorClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ clients: Client[] }>("/api/vendor/clients")
      .then(data => setClients(data.clients))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 py-6">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 py-6">
      <div>
        <h1 className="text-2xl font-bold">Mis Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">{clients.length} clientes</p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border bg-card overflow-hidden">
          <EmptyState icon={Users} title="No tienes clientes aun" description="Tus clientes apareceran aqui cuando registres ventas" />
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.customer_email} className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">{c.customer_name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{c.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{c.customer_email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{c.total_purchases} {c.total_purchases === 1 ? "compra" : "compras"}</p>
                <p className="text-xs text-muted-foreground">{formatCOP(c.total_spent)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
