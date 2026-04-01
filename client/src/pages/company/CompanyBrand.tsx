import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";

interface BrandData {
  companyName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

const STORAGE_KEY = "mensualista_brand";

function loadBrand(): BrandData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { companyName: "", logo: "", primaryColor: "#5007FA", secondaryColor: "#8B5CF6" };
}

export default function CompanyBrand() {
  const [brand, setBrand] = useState<BrandData>(loadBrand);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBrand(loadBrand());
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBrand((prev) => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brand));
    toast.success("Marca actualizada");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader title="Personalizacion de Marca" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card-premium p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre de la empresa</label>
            <input
              type="text"
              value={brand.companyName}
              onChange={(e) => setBrand((prev) => ({ ...prev, companyName: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tu empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Logo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors"
            >
              {brand.logo ? (
                <img src={brand.logo} alt="Logo" className="h-20 w-20 object-contain rounded-lg" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground/40" />
                  <span className="text-sm text-muted-foreground">Click para seleccionar imagen</span>
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Color primario</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brand.primaryColor}
                onChange={(e) => setBrand((prev) => ({ ...prev, primaryColor: e.target.value }))}
                className="h-10 w-14 rounded-lg border cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{brand.primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Color secundario</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brand.secondaryColor}
                onChange={(e) => setBrand((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                className="h-10 w-14 rounded-lg border cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{brand.secondaryColor}</span>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Guardar cambios
          </Button>
        </div>

        {/* Preview */}
        <div className="card-premium p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Vista previa</h3>
          <div className="rounded-xl border p-6 space-y-4">
            {brand.logo && (
              <img src={brand.logo} alt="Logo preview" className="h-16 w-16 object-contain rounded-lg" />
            )}
            <h2 className="text-xl font-bold">
              {brand.companyName || "Nombre de la empresa"}
            </h2>
            <div className="flex gap-3">
              <div
                className="h-10 w-10 rounded-lg"
                style={{ backgroundColor: brand.primaryColor }}
              />
              <div
                className="h-10 w-10 rounded-lg"
                style={{ backgroundColor: brand.secondaryColor }}
              />
            </div>
            <div
              className="rounded-lg p-4 text-white text-sm font-medium"
              style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})` }}
            >
              {brand.companyName || "Tu marca"} - Tarjeta de ejemplo
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
