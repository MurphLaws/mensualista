import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { Modal } from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { key: "nombre", header: "Nombre" },
  { key: "precio", header: "Precio" },
  { key: "comision", header: "Comision %" },
  { key: "tipoActivacion", header: "Tipo Activacion" },
  { key: "estado", header: "Estado" },
];

export default function CompanyProducts() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    comision: "",
    tipoActivacion: "Manual",
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
        title="Productos"
        description="Gestiona tu catalogo de productos"
        action={{ label: "Agregar Producto", icon: Plus, onClick: () => setModalOpen(true) }}
      />

      <DataTable
        columns={COLUMNS}
        data={[]}
        emptyState={{
          icon: Package,
          title: "No hay productos",
          description: "Agrega tu primer producto para comenzar",
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar Producto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Descripcion</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Precio</label>
              <input
                type="number"
                value={form.precio}
                onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Comision %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.comision}
                onChange={(e) => setForm((f) => ({ ...f, comision: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tipo de Activacion</label>
            <select
              value={form.tipoActivacion}
              onChange={(e) => setForm((f) => ({ ...f, tipoActivacion: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="Manual">Manual</option>
              <option value="Automatica">Automatica</option>
            </select>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Crear Producto
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
