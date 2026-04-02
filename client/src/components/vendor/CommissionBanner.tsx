import { formatCOP } from "@/lib/utils";

interface CommissionBannerProps {
  total: number;
  pendingReturn: number;
  available: number;
}

export function CommissionBanner({ total, pendingReturn, available }: CommissionBannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#2D1B69] to-[#4A2D8A] p-6 text-white">
      <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Comisiones del mes</p>
      <p className="text-3xl font-bold">{formatCOP(total)}</p>
      <div className="flex gap-4 mt-3 text-sm opacity-80">
        <span>{formatCOP(pendingReturn)} en devolucion</span>
        <span>{formatCOP(available)} liberadas</span>
      </div>
    </div>
  );
}
