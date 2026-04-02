import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Modal } from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  commission_pct: number;
  type: string;
  image_url: string;
  active: boolean;
  created_at: string;
}

export default function CompanyProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    comision: "",
    tipo: "mensual" as "mensual" | "unico",
    imagen: "",
  });

  const fetchProducts = () => {
    api.get<{ products: Product[] }>("/api/products")
      .then(data => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async () => {
    if (!form.nombre || !form.precio || !form.comision) {
      toast.error("Completa los campos requeridos");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/products", {
        name: form.nombre,
        description: form.descripcion,
        price: parseInt(form.precio),
        commission_pct: parseFloat(form.comision),
        type: form.tipo,
        image_url: form.imagen || `https://picsum.photos/seed/${Date.now()}/400/300`,
      });
      toast.success("Producto creado exitosamente");
      setModalOpen(false);
      setForm({ nombre: "", descripcion: "", precio: "", comision: "", tipo: "mensual", imagen: "" });
      fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear producto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Producto eliminado");
      setProducts(p => p.filter(prod => prod.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  if (loading) {
    return <div className="space-y-6"><PageHeader title="Productos" /><div className="h-48 bg-muted rounded-xl animate-pulse" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Productos"
        description={`${products.length} productos en tu catalogo`}
        action={{ label: "Agregar Producto", icon: Plus, onClick: () => setModalOpen(true) }}
      />

      {products.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">No hay productos</p>
          <p className="text-sm text-muted-foreground mt-1">Agrega tu primer producto para comenzar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              <img src={p.image_url || "https://picsum.photos/80/80"} alt={p.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.type === "mensual" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}`}>
                    {p.type === "mensual" ? "Mensual" : "Unico"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{formatCOP(p.price)} &middot; {p.commission_pct}% comision</p>
              </div>
              <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar Producto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: Plan Mensual Premium" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Descripcion</label>
            <textarea value={form.descripcion} onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Precio (COP) *</label>
              <input type="number" value={form.precio} onChange={(e) => setForm(f => ({ ...f, precio: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="50000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Comision % *</label>
              <input type="number" min={0} max={100} value={form.comision} onChange={(e) => setForm(f => ({ ...f, comision: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="15" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value as "mensual" | "unico" }))} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
              <option value="mensual">Mensual</option>
              <option value="unico">Unico</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">URL de imagen</label>
            <input type="url" value={form.imagen} onChange={(e) => setForm(f => ({ ...f, imagen: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://ejemplo.com/imagen.jpg (opcional)" />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Creando..." : "Crear Producto"}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
