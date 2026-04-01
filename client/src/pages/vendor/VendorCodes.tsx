import { useState } from "react";
import { motion } from "framer-motion";
import { Key } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { key: "codigo", header: "Codigo" },
  { key: "producto", header: "Producto" },
  { key: "fecha", header: "Fecha" },
  { key: "estado", header: "Estado" },
];

export default function VendorCodes() {
  const [code, setCode] = useState("");

  const handleActivate = () => {
    toast.info("Funcionalidad proximamente");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Codigos de Activacion"
        description="Ingresa codigos para activar productos"
      />

      <div className="card-premium p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ingresa el codigo de activacion"
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <Button onClick={handleActivate}>Activar</Button>
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        data={[]}
        emptyState={{
          icon: Key,
          title: "No hay codigos usados",
          description: "Los codigos activados apareceran aqui",
        }}
      />
    </motion.div>
  );
}
