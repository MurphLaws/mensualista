import { useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";

const COLUMNS = [
  { key: "nombre", header: "Nombre" },
  { key: "username", header: "Username" },
  { key: "rol", header: "Rol" },
  { key: "creado", header: "Creado" },
  { key: "estado", header: "Estado" },
];

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState("todos");

  const allData: Record<string, unknown>[] = [];
  const filteredData = roleFilter === "todos"
    ? allData
    : allData.filter((u) => u.rol === roleFilter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Gestion de Usuarios" />

      <div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border h-10 px-3 text-sm bg-white"
        >
          <option value="todos">Todos</option>
          <option value="vendedor">Vendedor</option>
          <option value="administrador">Administrador</option>
          <option value="empresa">Empresa</option>
        </select>
      </div>

      <DataTable
        columns={COLUMNS}
        data={filteredData}
        emptyState={{
          icon: Users,
          title: "No hay usuarios registrados",
          description: "Los usuarios apareceran aqui",
        }}
      />
    </motion.div>
  );
}
