import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  const [platformName, setPlatformName] = useState("Mensualista");
  const [commission, setCommission] = useState(15);
  const [maintenance, setMaintenance] = useState(false);

  const handleSave = () => {
    toast.info("Funcionalidad proximamente");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Configuracion de Plataforma" />

      <div className="card-premium p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre de la plataforma</label>
          <input
            type="text"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="w-full rounded-lg border h-10 px-3 text-sm bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Comision por defecto (%)</label>
          <input
            type="number"
            value={commission}
            onChange={(e) => setCommission(Number(e.target.value))}
            className="w-full rounded-lg border h-10 px-3 text-sm bg-white"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Modo mantenimiento</label>
          <button
            type="button"
            onClick={() => setMaintenance(!maintenance)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              maintenance ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                maintenance ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <Button onClick={handleSave}>Guardar cambios</Button>
      </div>
    </motion.div>
  );
}
