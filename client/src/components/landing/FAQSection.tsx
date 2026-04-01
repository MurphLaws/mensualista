import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Building2, DollarSign, Users, HelpCircle } from "lucide-react";

type FAQCategory = "empresas" | "vendedores" | "pagos";

const faqData: Record<FAQCategory, { question: string; answer: string }[]> = {
  empresas: [
    {
      question: "Que es Mensualista exactamente?",
      answer: "Mensualista es un software B2B que le permite a tu empresa tener su propia plataforma de vendedores independientes. Tu personalizas la plataforma con tu marca, publicas tus productos, invitas a tus vendedores y ellos venden por ti. Nosotros nos encargamos de la tecnologia, comisiones y pagos.",
    },
    {
      question: "Puedo empezar sin pagar nada?",
      answer: "Si, el plan Freemium es completamente gratis. Puedes registrar tu empresa, personalizar tu plataforma y publicar hasta 5 productos. Solo cobramos un 15% de fee por venta + los costos de pasarela (3% + $1.000 COP por transferencia).",
    },
    {
      question: "Que diferencia hay entre los planes?",
      answer: "Freemium: hasta 5 productos, codigos manuales, fee del 15%. Premium ($460.000/mes): productos ilimitados, sin fee del 15%, cupones de descuento y chat vendedor-empresa. Enterprise ($1.380.000/mes): todo lo de Premium + integracion automatica de codigos, dominio personalizado y marca blanca.",
    },
    {
      question: "Mis vendedores ven la marca de Mensualista?",
      answer: "En los planes Premium y Enterprise, la experiencia es completamente personalizada con tu marca. En el plan Freemium tambien puedes configurar tu logo y colores, aunque la plataforma muestra la marca Mensualista en algunas partes. En Enterprise es marca blanca completa con dominio propio.",
    },
  ],
  vendedores: [
    {
      question: "Como llegan los vendedores a mi plataforma?",
      answer: "Tu traes a tus vendedores por tus propios medios (redes sociales, referidos, etc.). Les compartes el enlace de tu plataforma personalizada y ellos se registran directamente. Mensualista NO es un marketplace de vendedores.",
    },
    {
      question: "Cuantos vendedores puedo tener?",
      answer: "No hay limite de vendedores en ningun plan. Puedes tener todos los que quieras.",
    },
    {
      question: "Los vendedores necesitan capacitarse?",
      answer: "Tu decides. Puedes subir materiales de entrenamiento (PDFs, videos) y requerirlos antes de que el vendedor pueda empezar a vender, o puedes dejarlo opcional.",
    },
    {
      question: "Los vendedores pueden vender para otras empresas?",
      answer: "No, en Mensualista cada empresa tiene su red privada de vendedores. Los vendedores que registras solo ven y venden tus productos.",
    },
  ],
  pagos: [
    {
      question: "Como funcionan los pagos a vendedores?",
      answer: "Los pagos se procesan automaticamente. Cuando un vendedor cierra una venta, la comision se calcula y se programa para pago. Los costos de pasarela (3% + $1.000 COP) se descuentan de cada transaccion.",
    },
    {
      question: "Que es el fee del 15% en Freemium?",
      answer: "En el plan gratuito, Mensualista cobra un 15% adicional sobre cada venta como fee de plataforma, ademas de los costos de pasarela. Este fee NO aplica en Premium ni Enterprise.",
    },
    {
      question: "Puedo cambiar de plan en cualquier momento?",
      answer: "Si, puedes subir o bajar de plan cuando quieras. Si subes de plan, se te cobra la diferencia prorrateada. Si bajas, el cambio aplica al proximo ciclo de facturacion.",
    },
    {
      question: "Que cupones de descuento puedo crear?",
      answer: "En Premium y Enterprise puedes crear cupones de descuento que los vendedores aplican al registrar una venta. Esto incentiva a los vendedores a cerrar mas ventas ofreciendo descuentos a clientes.",
    },
  ],
};

const categories: { id: FAQCategory; label: string; icon: React.ElementType }[] = [
  { id: "empresas", label: "Para empresas", icon: Building2 },
  { id: "vendedores", label: "Vendedores", icon: Users },
  { id: "pagos", label: "Pagos y planes", icon: DollarSign },
];

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("empresas");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4F0FA] text-primary text-sm font-medium mb-4 border border-border">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Todo lo que necesitas saber antes de empezar.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:border-primary/30 text-foreground"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {faqData[activeCategory].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-premium overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left group"
              >
                <span className="font-medium pr-4 text-foreground group-hover:text-primary transition-colors">{faq.question}</span>
                <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{ height: openIndex === index ? "auto" : 0, opacity: openIndex === index ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
