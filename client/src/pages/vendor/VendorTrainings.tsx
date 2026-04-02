import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, FileText, ExternalLink, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Training {
  id: string;
  title: string;
  description: string;
  type: "video" | "pdf" | "link";
  url: string;
  thumbnail_url: string;
  category: string;
}

const TYPE_CONFIG = {
  video: { icon: Play, label: "Video", color: "bg-red-500" },
  pdf: { icon: FileText, label: "PDF", color: "bg-blue-500" },
  link: { icon: ExternalLink, label: "Link", color: "bg-green-500" },
};

export default function VendorTrainings() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    api.get<{ trainings: Training[] }>("/api/trainings")
      .then(data => setTrainings(data.trainings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(trainings.map(t => t.category))];
  const filtered = filter === "all" ? trainings : trainings.filter(t => t.category === filter);

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 py-6">
      <div>
        <h1 className="text-2xl font-bold">Capacitaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">Aprende y mejora tus habilidades</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors", filter === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground")}
          >
            {cat === "all" ? "Todos" : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card overflow-hidden">
          <EmptyState icon={GraduationCap} title="No hay capacitaciones" description="Las capacitaciones apareceran aqui" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(t => {
            const config = TYPE_CONFIG[t.type];
            const Icon = config.icon;
            return (
              <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="rounded-xl overflow-hidden bg-white shadow-sm border hover:shadow-md transition-shadow">
                  <div className="relative h-32 bg-gray-200">
                    <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover" />
                    <span className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1", config.color)}>
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs bg-white/80 text-foreground font-medium">{t.category}</span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold">{t.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
