import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border bg-white p-5"
      style={{ boxShadow: "0 1px 4px rgba(80,7,250,0.06)" }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#F4F0FA] flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <span className="text-xs text-muted-foreground">{trend}</span>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
