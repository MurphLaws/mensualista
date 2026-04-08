import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package, Plus, Search, RefreshCw, Sparkles, Lightbulb,
  ChevronRight, X, Check, HelpCircle, Target, Users, FileText, Tag
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
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
  refund_window_days: number;
  created_at: string;
}

type Step = "basics" | "pricing" | "content" | "details";

const STEPS: { id: Step; label: string }[] = [
  { id: "basics", label: "Basicos" },
  { id: "pricing", label: "Precio" },
  { id: "content", label: "Contenido" },
  { id: "details", label: "Detalles" },
];

const tutorialSteps = [
  { title: "Tus productos y servicios", description: "Aqui gestionas todos los servicios que ofreces a traves de la plataforma. Cada uno tiene su precio, comision, material de ventas y capacitacion." },
  { title: "Crear un producto", description: "Agrega toda la informacion que tus vendedores necesitan: descripcion, audiencia, pitch de venta, objeciones y materiales." },
  { title: "Gestionar vendedores", description: "Asigna vendedores a tus productos y define niveles de comision para motivar mejores resultados." },
  { title: "Monitorear ventas", description: "Revisa las metricas de cada producto: ventas mensuales, codigos disponibles y rendimiento de tu red." },
];

export default function CompanyProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>("basics");

  const [showTutorial, setShowTutorial] = useState(() =>
    localStorage.getItem("products-tutorial-dismissed") !== "true"
  );
  const [tutorialIdx, setTutorialIdx] = useState(0);

  const [form, setForm] = useState({
    name: "", description: "", price: "", commission_pct: "", type: "mensual" as "mensual" | "unico",
    image_url: "", target_audience: "", features: [""], not_included: [""],
    pitch_one_line: "", pitch_three_lines: "", ideal_client: "",
    objections: [{ objection: "", response: "" }],
    refund_window_days: "7", refund_auto: false, website_url: "",
    training_type: "", training_duration_min: "",
  });

  const fetchProducts = () => {
    api.get<{ products: Product[] }>("/api/products")
      .then(data => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("products-tutorial-dismissed", "true");
  };

  const resetForm = () => {
    setForm({
      name: "", description: "", price: "", commission_pct: "", type: "mensual",
      image_url: "", target_audience: "", features: [""], not_included: [""],
      pitch_one_line: "", pitch_three_lines: "", ideal_client: "",
      objections: [{ objection: "", response: "" }],
      refund_window_days: "7", refund_auto: false, website_url: "",
      training_type: "", training_duration_min: "",
    });
    setStep("basics");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.commission_pct) {
      toast.error("Completa nombre, precio y comision");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/products", {
        name: form.name, description: form.description,
        price: parseInt(form.price), commission_pct: parseFloat(form.commission_pct),
        type: form.type, image_url: form.image_url || `https://picsum.photos/seed/${Date.now()}/800/400`,
        target_audience: form.target_audience,
        features: form.features.filter(f => f.trim()),
        not_included: form.not_included.filter(f => f.trim()),
        pitch_one_line: form.pitch_one_line, pitch_three_lines: form.pitch_three_lines,
        ideal_client: form.ideal_client,
        objections: form.objections.filter(o => o.objection.trim()),
        refund_window_days: parseInt(form.refund_window_days) || 7,
        refund_auto: form.refund_auto, website_url: form.website_url,
        training_type: form.training_type, training_duration_min: parseInt(form.training_duration_min) || 0,
      });
      toast.success("Producto creado");
      setModalOpen(false);
      resetForm();
      setLoading(true);
      fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear producto");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stepIdx = STEPS.findIndex(s => s.id === step);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Tutorial */}
      {showTutorial && (
        <div className="rounded-xl border bg-white p-5">
          <div className="flex gap-1 mb-4">
            {tutorialSteps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= tutorialIdx ? "bg-primary" : "bg-gray-200"}`} />
            ))}
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                Paso {tutorialIdx + 1} de {tutorialSteps.length}
              </p>
              <h3 className="text-sm font-bold mb-1">{tutorialSteps[tutorialIdx].title}</h3>
              <p className="text-xs text-muted-foreground">{tutorialSteps[tutorialIdx].description}</p>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={dismissTutorial} className="text-[11px] text-muted-foreground hover:text-foreground">Saltar tutorial</button>
                <Button size="sm" className="h-7 text-xs px-4" onClick={() => {
                  if (tutorialIdx < tutorialSteps.length - 1) setTutorialIdx(i => i + 1);
                  else dismissTutorial();
                }}>
                  {tutorialIdx < tutorialSteps.length - 1 ? "Siguiente" : "Entendido"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Mis Productos"
        description={`${products.length} productos creados`}
        action={{ label: "Nuevo producto", icon: Plus, onClick: () => setModalOpen(true) }}
      />

      {/* Search */}
      {products.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {/* Product Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const isMensual = p.type === "mensual";
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/company/products/${p.id}`)}
                className="rounded-xl border bg-white overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/30 transition-all"
              >
                {/* Cover Image */}
                <div className="relative h-44 bg-gray-200 overflow-hidden">
                  <img
                    src={p.image_url || "https://picsum.photos/seed/default/800/400"}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Type badge */}
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full text-white ${
                    isMensual ? "bg-primary/90" : "bg-gray-700/80"
                  }`}>
                    {isMensual ? <RefreshCw className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                    {isMensual ? "Recurrente" : "Unico"}
                  </span>
                  {/* Status */}
                  {!p.active && (
                    <span className="absolute top-3 right-3 text-[10px] font-medium px-2 py-1 rounded-full bg-red-500/90 text-white">
                      Inactivo
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                  )}
                  {/* Footer stats */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{p.refund_window_days || 7}d</span>
                      <span>{p.commission_pct}%</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{formatCOP(p.price)} COP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={searchQuery ? "Sin resultados" : "No hay productos"}
          description={searchQuery ? "Prueba otra busqueda" : "Agrega tu primer producto para comenzar"}
          actionLabel={searchQuery ? undefined : "Nuevo producto"}
          onAction={searchQuery ? undefined : () => setModalOpen(true)}
        />
      )}

      {/* Multi-Step Create Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title="Nuevo producto">
        {/* Step indicator */}
        <div className="flex gap-1 mb-5">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(s.id)}
              className={`flex-1 text-center py-1.5 text-[10px] font-medium rounded-full transition-colors ${
                i <= stepIdx ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* STEP: BASICS */}
          {step === "basics" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nombre del producto *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: Plan Full Gym Mensual" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Descripcion</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" rows={3}
                  placeholder="Describe lo que incluye tu producto..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["mensual", "unico"] as const).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        form.type === t ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {t === "mensual" ? "Recurrente (mensual)" : "Unico (pago unico)"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">URL de imagen</label>
                <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://... (opcional)" />
              </div>
            </>
          )}

          {/* STEP: PRICING */}
          {step === "pricing" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Precio (COP) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="189000" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Comision vendedor % *</label>
                  <input type="number" min={0} max={100} value={form.commission_pct} onChange={e => setForm(f => ({ ...f, commission_pct: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="15" />
                </div>
              </div>
              {form.price && form.commission_pct && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Precio</span><span className="font-medium">{formatCOP(parseInt(form.price))} COP</span></div>
                  <div className="flex justify-between"><span className="text-primary">Comision vendedor ({form.commission_pct}%)</span><span className="font-medium text-primary">{formatCOP(Math.round(parseInt(form.price) * parseFloat(form.commission_pct) / 100))} COP</span></div>
                  <div className="flex justify-between border-t pt-1"><span>Neto empresa</span><span className="font-medium">{formatCOP(parseInt(form.price) - Math.round(parseInt(form.price) * parseFloat(form.commission_pct) / 100))} COP</span></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Ventana de devolucion</label>
                  <select value={form.refund_window_days} onChange={e => setForm(f => ({ ...f, refund_window_days: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="7">7 dias</option>
                    <option value="14">14 dias</option>
                    <option value="30">30 dias</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Devolucion automatica</label>
                  <button onClick={() => setForm(f => ({ ...f, refund_auto: !f.refund_auto }))}
                    className={`w-full p-2 rounded-lg border text-sm font-medium transition-colors ${
                      form.refund_auto ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-600"
                    }`}>
                    {form.refund_auto ? "Si, automatica" : "No, con aprobacion"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Sitio web del producto</label>
                <input type="url" value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
              </div>
            </>
          )}

          {/* STEP: CONTENT */}
          {step === "content" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Audiencia objetivo</label>
                <textarea value={form.target_audience} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" rows={2}
                  placeholder="Describe tu cliente ideal..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Pitch de 1 linea</label>
                <input type="text" value={form.pitch_one_line} onChange={e => setForm(f => ({ ...f, pitch_one_line: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Un resumen corto y convincente..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Guion corto (3 lineas)</label>
                <textarea value={form.pitch_three_lines} onChange={e => setForm(f => ({ ...f, pitch_three_lines: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" rows={3}
                  placeholder="Script de venta en 3 lineas..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Cliente ideal</label>
                <input type="text" value={form.ideal_client} onChange={e => setForm(f => ({ ...f, ideal_client: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Perfil del comprador ideal..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Objeciones y respuestas</label>
                {form.objections.map((obj, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="Objecion" value={obj.objection}
                      onChange={e => { const o = [...form.objections]; o[i] = { ...o[i], objection: e.target.value }; setForm(f => ({ ...f, objections: o })); }}
                      className="flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input placeholder="Respuesta" value={obj.response}
                      onChange={e => { const o = [...form.objections]; o[i] = { ...o[i], response: e.target.value }; setForm(f => ({ ...f, objections: o })); }}
                      className="flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
                    {form.objections.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, objections: f.objections.filter((_, j) => j !== i) }))}
                        className="p-1 text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm(f => ({ ...f, objections: [...f.objections, { objection: "", response: "" }] }))}
                  className="text-xs text-primary font-medium hover:underline">+ Agregar objecion</button>
              </div>
            </>
          )}

          {/* STEP: DETAILS */}
          {step === "details" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Que incluye</label>
                {form.features.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="Caracteristica" value={f}
                      onChange={e => { const a = [...form.features]; a[i] = e.target.value; setForm(fm => ({ ...fm, features: a })); }}
                      className="flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
                    {form.features.length > 1 && (
                      <button onClick={() => setForm(fm => ({ ...fm, features: fm.features.filter((_, j) => j !== i) }))}
                        className="p-1 text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm(fm => ({ ...fm, features: [...fm.features, ""] }))}
                  className="text-xs text-primary font-medium hover:underline">+ Agregar</button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">No incluye</label>
                {form.not_included.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="No incluye..." value={f}
                      onChange={e => { const a = [...form.not_included]; a[i] = e.target.value; setForm(fm => ({ ...fm, not_included: a })); }}
                      className="flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
                    {form.not_included.length > 1 && (
                      <button onClick={() => setForm(fm => ({ ...fm, not_included: fm.not_included.filter((_, j) => j !== i) }))}
                        className="p-1 text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm(fm => ({ ...fm, not_included: [...fm.not_included, ""] }))}
                  className="text-xs text-primary font-medium hover:underline">+ Agregar</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tipo de entrenamiento</label>
                  <select value={form.training_type} onChange={e => setForm(f => ({ ...f, training_type: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Sin entrenamiento</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Duracion (min)</label>
                  <input type="number" value={form.training_duration_min} onChange={e => setForm(f => ({ ...f, training_duration_min: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="15" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-5 pt-4 border-t">
          {stepIdx > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(STEPS[stepIdx - 1].id)}>Atras</Button>
          ) : <div />}
          {stepIdx < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep(STEPS[stepIdx + 1].id)}>Siguiente</Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Creando..." : "Crear producto"}
            </Button>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}
