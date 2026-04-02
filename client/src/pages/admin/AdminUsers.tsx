import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { api } from "@/lib/api";

interface UserRow {
  id: string;
  username: string;
  full_name: string;
  role: string;
  created_at: string;
}

const COLUMNS = [
  { key: "nombre", header: "Nombre" },
  { key: "username", header: "Username" },
  { key: "rol", header: "Rol" },
  { key: "creado", header: "Creado" },
];

const ROLE_LABELS: Record<string, string> = {
  vendor: "Vendedor",
  admin: "Administrador",
  company: "Empresa",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roleFilter, setRoleFilter] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = roleFilter !== "todos" ? `?role=${roleFilter}` : "";
    api.get<{ users: UserRow[] }>(`/api/admin/users${params}`)
      .then(data => setUsers(data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const tableData = users.map(u => ({
    nombre: u.full_name || u.username,
    username: u.username,
    rol: ROLE_LABELS[u.role] || u.role,
    creado: new Date(u.created_at).toLocaleDateString("es-CO"),
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <PageHeader title="Gestion de Usuarios" />
      <div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setLoading(true); }}
          className="rounded-lg border h-10 px-3 text-sm bg-white"
        >
          <option value="todos">Todos</option>
          <option value="vendor">Vendedor</option>
          <option value="admin">Administrador</option>
          <option value="company">Empresa</option>
        </select>
      </div>
      {loading ? (
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      ) : (
        <DataTable columns={COLUMNS} data={tableData} emptyState={{ icon: Users, title: "No hay usuarios", description: "Los usuarios apareceran aqui" }} />
      )}
    </motion.div>
  );
}
