import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Modal } from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  product_count: number;
  vendor_count: number;
  total_sales: number;
  created_at: string;
}

interface CompanyUser {
  id: string;
  username: string;
  full_name: string;
  company_id: string | null;
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", logo_url: "", owner_username: "" });
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = () => {
    Promise.all([
      api.get<{ companies: Company[] }>("/api/admin/companies"),
      api.get<{ users: CompanyUser[] }>("/api/admin/company-users"),
    ]).then(([compData, userData]) => {
      setCompanies(compData.companies);
      setCompanyUsers(userData.users);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    setCreating(true);
    try {
      await api.post("/api/admin/companies", {
        name: form.name.trim(),
        logo_url: form.logo_url.trim() || null,
        owner_username: form.owner_username || null,
      });
      toast.success("Empresa creada");
      setShowCreate(false);
      setForm({ name: "", logo_url: "", owner_username: "" });
      setLoading(true);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear empresa");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/api/admin/companies/${id}`);
      toast.success("Empresa eliminada");
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  // Company users not yet assigned to a company
  const unassignedUsers = companyUsers.filter(u => !u.company_id);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Empresas" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Empresas"
        description={`${companies.length} empresas registradas`}
        action={{ label: "Crear empresa", icon: Plus, onClick: () => setShowCreate(true) }}
      />

      {companies.length > 0 ? (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F4F0FA]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Productos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vendedores</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ventas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Propietario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => {
                  const owner = companyUsers.find(u => u.company_id === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-muted/50 transition-colors border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {c.logo_url ? (
                            <img src={c.logo_url} alt={c.name} className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <span className="text-sm font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{c.product_count}</td>
                      <td className="px-4 py-3 text-sm">{c.vendor_count}</td>
                      <td className="px-4 py-3 text-sm">{formatCOP(c.total_sales)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {owner ? `@${owner.username}` : <span className="text-amber-500">Sin asignar</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString("es-CO")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No hay empresas registradas"
          description="Crea la primera empresa para empezar"
          actionLabel="Crear empresa"
          onAction={() => setShowCreate(true)}
        />
      )}

      {/* Create Company Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear empresa">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre de la empresa *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: IronHaus"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">URL del logo (opcional)</label>
            <input
              type="url"
              value={form.logo_url}
              onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Asignar a usuario empresa (opcional)</label>
            <select
              value={form.owner_username}
              onChange={e => setForm(f => ({ ...f, owner_username: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">— Sin asignar —</option>
              {unassignedUsers.map(u => (
                <option key={u.id} value={u.username}>
                  {u.full_name || u.username} (@{u.username})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground mt-1">
              Solo se muestran usuarios con rol "empresa" sin empresa asignada.
            </p>
          </div>
          <Button onClick={handleCreate} disabled={creating} className="w-full">
            {creating ? "Creando..." : "Crear empresa"}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
