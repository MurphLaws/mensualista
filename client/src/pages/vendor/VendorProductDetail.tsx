import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Lock, RefreshCw, Sparkles, ShoppingBag, Info, ShoppingCart,
  Check, X, Target, Users, FileText, Download, Tag, Play, ExternalLink,
  ChevronRight, MessageSquare, HelpCircle, Shield, Crown, Copy
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";
import type { VendorProduct } from "@/lib/types";

type MainTab = "info" | "ventas";
type InfoSubTab = "resumen" | "incluye" | "audiencia" | "venta" | "materiales" | "cupones";

interface Sale {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
  product_name: string;
}

export default function VendorProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<VendorProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saleModal, setSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState({ customer_name: "", customer_email: "", customer_phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("info");
  const [infoSubTab, setInfoSubTab] = useState<InfoSubTab>("resumen");
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);

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

  // Fetch vendor's sales for this product when ventas tab is selected
  useEffect(() => {
    if (mainTab === "ventas" && !salesLoading && sales.length === 0) {
      setSalesLoading(true);
      api.get<{ sales: Sale[] }>("/api/sales")
        .then(data => {
          setSales(data.sales.filter(s => s.product_name === product?.name));
        })
        .catch(console.error)
        .finally(() => setSalesLoading(false));
    }
  }, [mainTab]);

  const handleSale = async () => {
    if (!saleForm.customer_name || !saleForm.customer_email) {
      toast.error("Completa nombre y email del cliente");
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
      setSaleForm({ customer_name: "", customer_email: "", customer_phone: "" });
      // Refresh product data
      const data = await api.get<{ product: VendorProduct }>(`/api/products/${id}`);
      setProduct(data.product);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar venta");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!product) return null;

  const isMensual = product.type === "mensual";
  const commissionAmount = Math.round(product.price * product.commission_pct / 100);
  const platformFee = 0;
  const companyNet = product.price - commissionAmount - platformFee;

  const mainTabs: { id: MainTab; label: string; icon: React.ElementType }[] = [
    { id: "info", label: "Informacion", icon: Info },
    { id: "ventas", label: "Ventas", icon: ShoppingCart },
  ];

  const infoSubTabs: { id: InfoSubTab; label: string; icon: React.ElementType }[] = [
    { id: "resumen", label: "Resumen", icon: Info },
    { id: "incluye", label: "Incluye", icon: Check },
    { id: "audiencia", label: "Audiencia", icon: Users },
    { id: "venta", label: "Venta", icon: Target },
    { id: "materiales", label: "Materiales", icon: FileText },
    { id: "cupones", label: "Cupones", icon: Tag },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 py-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {product.company_name}
      </button>

      {/* Product Header */}
      <div className="flex gap-4">
        <div className="relative rounded-xl overflow-hidden w-28 h-28 sm:w-36 sm:h-36 shrink-0 bg-gray-200">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.company_name}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border",
              isMensual ? "bg-primary/10 text-primary border-primary/20" : "bg-gray-100 text-gray-600 border-gray-200"
            )}>
              {isMensual ? <RefreshCw className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              {isMensual ? "Mensual" : "Unico"}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border",
              product.vendor_status === "active"
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            )}>
              {product.vendor_status === "active" ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {product.vendor_status === "active" ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">{formatCOP(commissionAmount)} COP</span>
            <span className="text-sm text-muted-foreground line-through">{formatCOP(product.price)} COP</span>
            {isMensual && <span className="text-xs text-muted-foreground">/mes</span>}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mis Ventas</p>
          <p className="text-2xl font-bold mt-1">{product.my_sales || 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ganado</p>
          <p className="text-2xl font-bold mt-1">{formatCOP(product.my_earned || 0)} COP</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b">
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                mainTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Info Tab Content */}
      {mainTab === "info" && (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {infoSubTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setInfoSubTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    infoSubTab === tab.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* RESUMEN */}
          {infoSubTab === "resumen" && (
            <div className="space-y-4">
              {/* Training link */}
              {product.training_type && (
                <div className="flex items-center justify-between p-3 rounded-xl border bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Revisar entrenamiento</p>
                      <p className="text-[10px] text-muted-foreground">Vuelve a ver el material</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}

              {/* Description */}
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description || "Sin descripcion disponible."}
                </p>
              </div>

              {/* Sale Breakdown */}
              <div className="rounded-xl border bg-white p-4 space-y-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Desglose de la venta</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Precio del producto</span>
                    <span className="font-medium">{formatCOP(product.price)} COP{isMensual ? "/mes" : ""}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-medium">Tu comision ({product.commission_pct}%)</span>
                    <span className="font-bold text-primary">{formatCOP(commissionAmount)} COP</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Fee plataforma (0%)</span>
                    <span>$0 COP</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span>Neto empresa</span>
                    <span className="font-medium">{formatCOP(companyNet)} COP</span>
                  </div>
                </div>
                {isMensual && (
                  <div className="bg-blue-50 text-blue-700 text-xs p-2.5 rounded-lg">
                    Cobro recurrente mensual. Recibes comision cada mes mientras el cliente mantenga su suscripcion.
                  </div>
                )}
              </div>

              {/* Training & Refund */}
              <div className="grid grid-cols-2 gap-3">
                {product.training_type && (
                  <div className="rounded-xl border bg-white p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrenamiento</p>
                    <p className="text-sm font-medium mt-1 capitalize">{product.training_type}</p>
                    {product.training_duration_min > 0 && (
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        Completada · ~{product.training_duration_min} min
                      </p>
                    )}
                  </div>
                )}
                <div className="rounded-xl border bg-white p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Devoluciones</p>
                  <p className="text-sm font-medium mt-1">{product.refund_window_days} dias</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {product.refund_auto ? "Automatica" : "Con aprobacion"}
                  </p>
                </div>
              </div>

              {/* Website */}
              {product.website_url && (
                <a
                  href={product.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border bg-white hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">Conocer mas</p>
                    <p className="text-[10px] text-muted-foreground">{product.website_url}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
            </div>
          )}

          {/* INCLUYE */}
          {infoSubTab === "incluye" && (
            <div className="space-y-4">
              {product.features && product.features.length > 0 && (
                <div className="rounded-xl border bg-white p-4 space-y-2.5">
                  <p className="text-xs font-semibold text-emerald-600 uppercase">Que incluye</p>
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              )}
              {product.not_included && product.not_included.length > 0 && (
                <div className="rounded-xl border bg-white p-4 space-y-2.5">
                  <p className="text-xs font-semibold text-red-500 uppercase">No incluye</p>
                  {product.not_included.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              )}
              {(!product.features || product.features.length === 0) && (!product.not_included || product.not_included.length === 0) && (
                <div className="text-center py-8">
                  <Check className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin informacion de caracteristicas</p>
                </div>
              )}
            </div>
          )}

          {/* AUDIENCIA */}
          {infoSubTab === "audiencia" && (
            <div className="space-y-4">
              {product.target_audience && (
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Audiencia objetivo</p>
                  <p className="text-sm leading-relaxed">{product.target_audience}</p>
                </div>
              )}
              {product.ideal_client && (
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Cliente ideal</p>
                  <p className="text-sm leading-relaxed">{product.ideal_client}</p>
                </div>
              )}
              {!product.target_audience && !product.ideal_client && (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin informacion de audiencia</p>
                </div>
              )}
            </div>
          )}

          {/* VENTA (Sales Tips) */}
          {infoSubTab === "venta" && (
            <div className="space-y-4">
              {product.pitch_one_line && (
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Pitch de 1 linea</p>
                  <p className="text-sm font-medium leading-relaxed">{product.pitch_one_line}</p>
                </div>
              )}
              {product.pitch_three_lines && (
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Script de 3 lineas</p>
                  <p className="text-sm leading-relaxed">{product.pitch_three_lines}</p>
                </div>
              )}
              {product.objections && product.objections.length > 0 && (
                <div className="rounded-xl border bg-white p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Objeciones y respuestas</p>
                  {product.objections.map((obj, i) => (
                    <div key={i} className="space-y-1.5 pb-3 border-b last:border-0 last:pb-0">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{obj.objection}</p>
                      </div>
                      <div className="flex items-start gap-2 ml-6">
                        <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{obj.response}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!product.pitch_one_line && !product.pitch_three_lines && (!product.objections || product.objections.length === 0) && (
                <div className="text-center py-8">
                  <Target className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin tips de venta disponibles</p>
                </div>
              )}
            </div>
          )}

          {/* MATERIALES */}
          {infoSubTab === "materiales" && (
            <div className="space-y-3">
              {product.sales_material_urls && product.sales_material_urls.length > 0 ? (
                product.sales_material_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Download className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Material {i + 1}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{url}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                  </a>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin materiales de venta disponibles</p>
                </div>
              )}
            </div>
          )}

          {/* CUPONES */}
          {infoSubTab === "cupones" && (
            <div className="space-y-3">
              {product.coupons && product.coupons.length > 0 ? (
                product.coupons.map(coupon => (
                  <div key={coupon.id} className="rounded-xl border bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold font-mono">{coupon.code}</span>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success("Codigo copiado"); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="text-primary font-semibold text-sm">{coupon.discount_pct}% OFF</span>
                      {coupon.max_uses > 0 && (
                        <span>{coupon.used_count}/{coupon.max_uses} usados</span>
                      )}
                      {coupon.expires_at && (
                        <span>Expira {new Date(coupon.expires_at).toLocaleDateString("es-CO")}</span>
                      )}
                    </div>
                    {coupon.max_uses > 0 && (
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, (coupon.used_count / coupon.max_uses) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin cupones disponibles</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ventas Tab Content */}
      {mainTab === "ventas" && (
        <div className="space-y-3">
          {salesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : sales.length > 0 ? (
            sales.map(sale => (
              <div key={sale.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{sale.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground">{sale.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{formatCOP(sale.commission_amount)}</p>
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      sale.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                      sale.status === "pending" ? "bg-amber-50 text-amber-600" :
                      "bg-red-50 text-red-600"
                    )}>
                      {sale.status === "completed" ? "Liberada" :
                       sale.status === "pending" ? "Retenida" : "Devuelta"}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {new Date(sale.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sin ventas para este producto</p>
            </div>
          )}
        </div>
      )}

      {/* Fixed bottom CTA */}
      {product.vendor_status === "active" ? (
        <Button onClick={() => setSaleModal(true)} className="w-full h-12 text-base sticky bottom-4">
          <ShoppingBag className="h-5 w-5 mr-2" />
          Registrar venta
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
          <div>
            <label className="block text-sm font-medium mb-1.5">Telefono (opcional)</label>
            <input
              type="tel"
              value={saleForm.customer_phone}
              onChange={(e) => setSaleForm(f => ({ ...f, customer_phone: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+57 300 000 0000"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Producto</span>
              <span className="font-medium">{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto</span>
              <span className="font-medium">{formatCOP(product.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tu comision ({product.commission_pct}%)</span>
              <span className="font-medium text-primary">{formatCOP(commissionAmount)}</span>
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
