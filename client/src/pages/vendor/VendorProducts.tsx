import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/vendor/ProductCard";
import type { VendorProduct } from "@/lib/types";

export default function VendorProducts() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [filter, setFilter] = useState<"all" | "mensual" | "unico">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await api.get<{ products: VendorProduct[] }>("/api/vendor/products");
        setProducts(data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filtered = filter === "all" ? products : products.filter(p => p.type === filter);

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-52 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 py-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Mis Productos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {products.length} productos asignados
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "mensual", "unico"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all" ? "Todos" : f === "mensual" ? "Mensual" : "Unico"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No hay productos en esta categoria
        </div>
      )}
    </motion.div>
  );
}
