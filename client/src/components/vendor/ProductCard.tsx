import { Link } from "react-router-dom";
import { Lock, RefreshCw, Sparkles } from "lucide-react";
import { formatCOP } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { VendorProduct } from "@/lib/types";

interface ProductCardProps {
  product: VendorProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const isMensual = product.type === "mensual";

  return (
    <Link to={`/vendor/products/${product.id}`} className="block">
      <div className="rounded-xl overflow-hidden bg-white shadow-sm border hover:shadow-md transition-shadow">
        {/* Image section */}
        <div className="relative h-40 bg-gray-200">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          <span className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1", isMensual ? "bg-primary/90 text-white" : "bg-gray-700/80 text-white")}>
            {isMensual ? <RefreshCw className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
            {isMensual ? "Mensual" : "Unico"}
          </span>
          {product.status === "inactive" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="flex items-center gap-1.5 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <Lock className="h-3 w-3" />
                Sin activar
              </span>
            </div>
          )}
          <span className="absolute bottom-3 right-3 text-white font-bold text-sm drop-shadow-lg">
            {formatCOP(product.price)}
          </span>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{product.company_name}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-medium text-primary">Desde {product.commission_pct}%</span>
            <span className="text-xs text-muted-foreground">{product.sales_count} {product.sales_count === 1 ? "venta" : "ventas"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
