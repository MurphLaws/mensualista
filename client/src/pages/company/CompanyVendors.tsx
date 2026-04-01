import { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { Modal } from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { key: "nombre", header: "Nombre" },
  { key: "email", header: "Email" },
  { key: "estado", header: "Estado" },
  { key: "ventas", header: "Ventas" },
  { key: "comision", header: "Comision" },
];

export default function CompanyVendors() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });

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
        title="Vendedores"
        action={{ label: "Invitar Vendedor", icon: UserPlus, onClick: () => setModalOpen(true) }}
      />

      <DataTable
        columns={COLUMNS}
        data={[]}
        emptyState={{
          icon: Users,
          title: "No hay vendedores",
          description: "Invita a tu primer vendedor",
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Invitar Vendedor">
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
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Mensaje</label>
            <textarea
              value={form.mensaje}
              onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Enviar Invitacion
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
