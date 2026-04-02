import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, RefreshCw, Sparkles, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";
import type { VendorProduct } from "@/lib/types";

export default function VendorProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<VendorProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saleModal, setSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState({ customer_name: "", customer_email: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await api.get<{ product: VendorProduct }>(`/api/products/${id}`);
        setProduct(data.product);
      } catch {
        toast.error("Producto no encontrado");
        navigate("/vendor/products");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, navigate]);

  const handleSale = async () => {
    if (!saleForm.customer_name || !saleForm.customer_email) {
      toast.error("Completa todos los campos");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/sales", {
        product_id: id,
        customer_name: saleForm.customer_name,
        customer_email: saleForm.customer_email,
      });
      toast.success("Venta registrada exitosamente");
      setSaleModal(false);
      setSaleForm({ customer_name: "", customer_email: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar venta");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!product) return null;

  const isMensual = product.type === "mensual";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      {/* Product image */}
      <div className="relative rounded-xl overflow-hidden h-64 bg-gray-200">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        <span className={cn("absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5", isMensual ? "bg-primary/90 text-white" : "bg-gray-700/80 text-white")}>
          {isMensual ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {isMensual ? "Mensual" : "Unico"}
        </span>
        {product.status === "inactive" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="flex items-center gap-2 bg-black/60 text-white text-sm font-medium px-4 py-2 rounded-full">
              <Lock className="h-4 w-4" />
              Sin activar
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.company_name}</p>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCOP(product.price)}</p>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-lg font-bold text-primary">{product.commission_pct}%</p>
            <p className="text-xs text-muted-foreground">Comision</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-lg font-bold">{formatCOP(Math.round(product.price * product.commission_pct / 100))}</p>
            <p className="text-xs text-muted-foreground">Ganancia por venta</p>
          </div>
        </div>
      </div>

      {/* Action button */}
      {product.status === "active" ? (
        <Button onClick={() => setSaleModal(true)} className="w-full h-12 text-base">
          <ShoppingBag className="h-5 w-5 mr-2" />
          Registrar Venta
        </Button>
      ) : (
        <Button disabled className="w-full h-12 text-base opacity-50">
          <Lock className="h-5 w-5 mr-2" />
          Producto no activado
        </Button>
      )}

      {/* Sale modal */}
      <Modal open={saleModal} onClose={() => setSaleModal(false)} title="Registrar Venta">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre del cliente</label>
            <input
              type="text"
              value={saleForm.customer_name}
              onChange={(e) => setSaleForm(f => ({ ...f, customer_name: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: Carlos Mendez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email del cliente</label>
            <input
              type="email"
              value={saleForm.customer_email}
              onChange={(e) => setSaleForm(f => ({ ...f, customer_email: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="cliente@ejemplo.com"
            />
          </div>
          <div className="bg-muted rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Producto</span>
              <span className="font-medium">{product.name}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Monto</span>
              <span className="font-medium">{formatCOP(product.price)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Tu comision</span>
              <span className="font-medium text-primary">{formatCOP(Math.round(product.price * product.commission_pct / 100))}</span>
            </div>
          </div>
          <Button onClick={handleSale} disabled={submitting} className="w-full">
            {submitting ? "Registrando..." : "Confirmar Venta"}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
