import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { Modal } from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { key: "codigo", header: "Codigo" },
  { key: "producto", header: "Producto" },
  { key: "estado", header: "Estado" },
  { key: "asignado", header: "Asignado a" },
  { key: "creado", header: "Creado" },
];

export default function CompanyCodes() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ producto: "", cantidad: "" });

  const handleSubmit = () => {
    toast.info("Funcionalidad proximamente");
    setModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Codigos de Activacion"
        action={{ label: "Generar Codigos", icon: Plus, onClick: () => setModalOpen(true) }}
      />

      <DataTable
        columns={COLUMNS}
        data={[]}
        emptyState={{
          icon: Key,
          title: "No hay codigos",
          description: "Genera codigos para tus productos",
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generar Codigos">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Producto</label>
            <select
              value={form.producto}
              onChange={(e) => setForm((f) => ({ ...f, producto: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">Selecciona un producto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Cantidad</label>
            <input
              type="number"
              value={form.cantidad}
              onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Generar
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
