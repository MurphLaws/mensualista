import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { Modal } from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { key: "codigo", header: "Codigo" },
  { key: "descuento", header: "Descuento" },
  { key: "tipo", header: "Tipo" },
  { key: "expiracion", header: "Expiracion" },
  { key: "usos", header: "Usos" },
  { key: "estado", header: "Estado" },
];

export default function CompanyCoupons() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    descuento: "",
    tipo: "Porcentaje",
    expiracion: "",
    usosMaximos: "",
  });

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
        title="Cupones de Descuento"
        action={{ label: "Crear Cupon", icon: Plus, onClick: () => setModalOpen(true) }}
      />

      <DataTable
        columns={COLUMNS}
        data={[]}
        emptyState={{
          icon: Tag,
          title: "No hay cupones",
          description: "Crea cupones para incentivar las ventas",
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Crear Cupon">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Codigo</label>
            <input
              type="text"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Descuento</label>
              <input
                type="number"
                value={form.descuento}
                onChange={(e) => setForm((f) => ({ ...f, descuento: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="Porcentaje">Porcentaje</option>
                <option value="Monto fijo">Monto fijo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Fecha de expiracion</label>
            <input
              type="date"
              value={form.expiracion}
              onChange={(e) => setForm((f) => ({ ...f, expiracion: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Usos maximos</label>
            <input
              type="number"
              value={form.usosMaximos}
              onChange={(e) => setForm((f) => ({ ...f, usosMaximos: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Crear Cupon
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
