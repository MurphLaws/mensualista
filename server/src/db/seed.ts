import bcrypt from "bcryptjs";
import { pool } from "./pool";

const SEED_USERS = [
  { username: "vendor", role: "vendor", full_name: "Vendedor Demo" },
  { username: "admin", role: "admin", full_name: "Admin Demo" },
  { username: "empresa", role: "company", full_name: "Empresa Demo" },
];

export async function seedUsers() {
  const hash = await bcrypt.hash("123", 10);

  for (const u of SEED_USERS) {
    await pool.query(
      `INSERT INTO users (username, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      [u.username, hash, u.role, u.full_name]
    );
  }
  console.log("Seed users ready");
}

interface ProductDef {
  name: string;
  price: number;
  commission_pct: number;
  type: "mensual" | "unico";
  image_url: string;
  description?: string;
  target_audience?: string;
  features?: string[];
  not_included?: string[];
  pitch_one_line?: string;
  pitch_three_lines?: string;
  objections?: { objection: string; response: string }[];
  ideal_client?: string;
  sales_material_urls?: string[];
  refund_window_days?: number;
  refund_auto?: boolean;
  website_url?: string;
  training_type?: string;
  training_duration_min?: number;
}

interface CompanyDef {
  name: string;
  logo_url: string;
  products: ProductDef[];
}

const COMPANIES: CompanyDef[] = [
  {
    name: "IronHaus",
    logo_url: "https://picsum.photos/seed/ironhaus/100/100",
    products: [
      {
        name: "Plan Full Gym Mensual",
        price: 189000,
        commission_pct: 15,
        type: "mensual",
        image_url: "https://picsum.photos/seed/gym1/400/300",
        description: "Acceso ilimitado a todas las maquinas, area de peso libre y cardio. Incluye evaluacion fisica inicial.",
        target_audience: "Personas entre 18-45 anos que buscan mejorar su condicion fisica, perder peso o ganar masa muscular en Bogota.",
        features: [
          "Acceso ilimitado a todas las maquinas",
          "Area de peso libre y cardio",
          "Evaluacion fisica inicial gratuita",
          "Casilleros y duchas disponibles",
          "App de seguimiento de rutinas",
          "Acceso a clases grupales basicas",
        ],
        not_included: [
          "Entrenador personal",
          "Suplementos nutricionales",
          "Clases especializadas (spinning, crossfit)",
          "Toallas",
        ],
        pitch_one_line: "Transforma tu cuerpo con acceso ilimitado al mejor gimnasio de la zona por menos de $6,300/dia.",
        pitch_three_lines: "IronHaus tiene las mejores instalaciones de la zona con equipos de ultima generacion. El Plan Full incluye todo lo que necesitas para empezar: maquinas, peso libre, cardio y una evaluacion fisica gratis. Ademas, es mensual sin compromiso - si no te gusta, cancelas cuando quieras.",
        objections: [
          { objection: "Es muy caro", response: "Son menos de $6,300 al dia. Compara con una clase suelta que cuesta $25,000. Ademas incluye evaluacion fisica gratis que normalmente cuesta $80,000." },
          { objection: "No tengo tiempo", response: "IronHaus abre de 5am a 11pm. Puedes ir antes del trabajo, en tu hora de almuerzo o en la noche. Solo necesitas 45 minutos 3 veces por semana." },
          { objection: "Ya tengo otro gimnasio", response: "Te invito a conocer nuestras instalaciones sin compromiso. Muchos clientes se cambian cuando ven la diferencia en equipos y limpieza." },
          { objection: "Puedo hacer ejercicio en casa", response: "En casa no tienes la variedad de maquinas ni el ambiente motivador. El 90% de las personas que entrenan en casa abandonan en el primer mes." },
        ],
        ideal_client: "Profesional joven (25-40 anos) que trabaja en oficina, quiere mejorar su salud y busca un gimnasio completo cerca de su zona.",
        refund_window_days: 7,
        refund_auto: false,
        website_url: "https://www.ironhaus.co",
        training_type: "video",
        training_duration_min: 15,
      },
      {
        name: "Plan Premium + Entrenador",
        price: 389000,
        commission_pct: 18,
        type: "mensual",
        image_url: "https://picsum.photos/seed/gym2/400/300",
        description: "Todo lo del Plan Full mas 8 sesiones mensuales con entrenador personal certificado y plan nutricional personalizado.",
        target_audience: "Personas con objetivos especificos (competicion, rehabilitacion, transformacion corporal) que necesitan guia profesional.",
        features: [
          "Todo lo incluido en Plan Full",
          "8 sesiones/mes con entrenador personal",
          "Plan nutricional personalizado",
          "Seguimiento semanal de progreso",
          "Acceso a clases especializadas",
          "Toalla y agua incluidas",
          "Prioridad en horarios pico",
        ],
        not_included: [
          "Suplementos nutricionales",
          "Sesiones adicionales de entrenador",
        ],
        pitch_one_line: "Resultados garantizados con tu entrenador personal y plan nutricional por menos de lo que cuesta un nutricionista.",
        pitch_three_lines: "El Plan Premium incluye 8 sesiones al mes con un entrenador certificado que crea tu rutina personalizada. Tambien recibes un plan nutricional adaptado a tus objetivos. Nuestros clientes Premium logran resultados 3 veces mas rapido que entrenando solos.",
        objections: [
          { objection: "Es muy caro comparado con el plan basico", response: "Un entrenador personal independiente cobra $50,000 por sesion. Aqui obtienes 8 sesiones ($400,000 en valor) mas nutricionista, todo por $389,000." },
          { objection: "No necesito entrenador", response: "El 80% de las personas que entrenan solas no ven resultados despues de 3 meses. Con entrenador, garantizamos progreso medible cada mes." },
        ],
        ideal_client: "Persona comprometida con resultados especificos que valora la guia profesional y esta dispuesta a invertir en su salud.",
        refund_window_days: 7,
        refund_auto: false,
        website_url: "https://www.ironhaus.co",
        training_type: "video",
        training_duration_min: 20,
      },
    ],
  },
  {
    name: "Prana Studio",
    logo_url: "https://picsum.photos/seed/prana/100/100",
    products: [
      {
        name: "Membresia Prana Ilimitada",
        price: 220000,
        commission_pct: 18,
        type: "mensual",
        image_url: "https://picsum.photos/seed/yoga1/400/300",
        description: "Clases ilimitadas de yoga, pilates y meditacion. Incluye mat y acceso a todas las sedes.",
        target_audience: "Mujeres y hombres 25-55 anos interesados en bienestar integral, reduccion de estres y flexibilidad.",
        features: [
          "Clases ilimitadas de yoga y pilates",
          "Sesiones de meditacion guiada",
          "Mat incluido en cada clase",
          "Acceso a todas las sedes",
          "App con clases on-demand",
        ],
        not_included: ["Retiros", "Clases privadas", "Certificaciones"],
        pitch_one_line: "Bienestar integral con clases ilimitadas de yoga y pilates en el estudio mas premiado de la ciudad.",
        pitch_three_lines: "Prana Studio ofrece mas de 40 clases semanales entre yoga, pilates y meditacion. La membresia ilimitada te da acceso a todo, incluyendo nuestra app con clases on-demand para practicar desde casa. Es la inversion mas inteligente en tu bienestar.",
        objections: [
          { objection: "Nunca he hecho yoga", response: "Tenemos clases para principiantes absolutos. El 60% de nuestros miembros empezaron sin experiencia." },
        ],
        ideal_client: "Persona que busca equilibrio entre cuerpo y mente, reduce estres laboral y quiere una practica constante.",
        refund_window_days: 14,
        refund_auto: true,
        website_url: "https://www.pranastudio.co",
        training_type: "video",
        training_duration_min: 10,
      },
      {
        name: "Retiro Wellness 3 Dias",
        price: 850000,
        commission_pct: 20,
        type: "unico",
        image_url: "https://picsum.photos/seed/yoga2/400/300",
        description: "Experiencia de 3 dias con yoga, meditacion, alimentacion saludable y conexion con la naturaleza.",
        target_audience: "Profesionales estresados que necesitan desconectar y recargar energias.",
        features: [
          "3 dias y 2 noches todo incluido",
          "Sesiones diarias de yoga y meditacion",
          "Alimentacion organica y saludable",
          "Caminatas en naturaleza",
          "Taller de manejo del estres",
          "Kit de bienvenida",
        ],
        not_included: ["Transporte al retiro", "Tratamientos spa adicionales"],
        pitch_one_line: "Desconecta 3 dias para reconectar contigo mismo en el retiro wellness mas exclusivo.",
        ideal_client: "Ejecutivo o profesional con alto nivel de estres que necesita una pausa significativa.",
        refund_window_days: 30,
        refund_auto: false,
        website_url: "https://www.pranastudio.co/retiros",
        training_type: "pdf",
        training_duration_min: 10,
      },
    ],
  },
  {
    name: "Salon Elite",
    logo_url: "https://picsum.photos/seed/salon/100/100",
    products: [
      {
        name: "Paquete Corte + Color Premium",
        price: 280000,
        commission_pct: 15,
        type: "unico",
        image_url: "https://picsum.photos/seed/salon1/400/300",
        description: "Corte de cabello con estilista senior mas coloracion premium con productos importados.",
        target_audience: "Mujeres 20-50 anos que buscan un cambio de look profesional con productos de alta calidad.",
        features: [
          "Consulta de imagen personalizada",
          "Corte con estilista senior",
          "Coloracion con productos premium importados",
          "Tratamiento de hidratacion post-color",
          "Peinado final incluido",
        ],
        not_included: ["Tratamientos capilares especiales", "Extensiones", "Queratina"],
        pitch_one_line: "Renueva tu look con los mejores estilistas y productos premium importados.",
        ideal_client: "Mujer profesional que invierte en su imagen personal y aprecia la calidad en productos y servicio.",
        refund_window_days: 3,
        refund_auto: false,
        website_url: "https://www.salonelite.co",
        training_type: "pdf",
        training_duration_min: 10,
      },
      {
        name: "Plan Belleza Mensual",
        price: 350000,
        commission_pct: 15,
        type: "mensual",
        image_url: "https://picsum.photos/seed/salon2/400/300",
        description: "Plan mensual que incluye corte, mantenimiento de color y tratamiento capilar cada mes.",
        target_audience: "Clientas frecuentes que visitan el salon al menos 1 vez al mes.",
        features: [
          "1 corte mensual",
          "Retoque de color mensual",
          "1 tratamiento capilar mensual",
          "10% descuento en servicios adicionales",
          "Prioridad en citas",
        ],
        not_included: ["Peinados para eventos", "Maquillaje", "Manicure/Pedicure"],
        pitch_one_line: "Manten tu look impecable todo el mes con nuestro plan todo incluido.",
        ideal_client: "Mujer que visita el salon regularmente y quiere ahorro + comodidad con citas prioritarias.",
        refund_window_days: 7,
        refund_auto: true,
        website_url: "https://www.salonelite.co",
        training_type: "video",
        training_duration_min: 12,
      },
    ],
  },
];

async function getOrInsertCompany(name: string, logo_url: string): Promise<string> {
  const result = await pool.query(
    `INSERT INTO companies (name, logo_url) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id`,
    [name, logo_url]
  );
  if (result.rows.length > 0) return result.rows[0].id;
  const existing = await pool.query(`SELECT id FROM companies WHERE name = $1`, [name]);
  return existing.rows[0].id;
}

async function getOrInsertProduct(
  companyId: string,
  p: ProductDef
): Promise<string> {
  const result = await pool.query(
    `INSERT INTO products (company_id, name, description, price, commission_pct, type, image_url,
      target_audience, features, not_included, pitch_one_line, pitch_three_lines, objections,
      ideal_client, sales_material_urls, refund_window_days, refund_auto, website_url,
      training_type, training_duration_min)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
     ON CONFLICT (company_id, name) DO UPDATE SET
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      commission_pct = EXCLUDED.commission_pct,
      target_audience = EXCLUDED.target_audience,
      features = EXCLUDED.features,
      not_included = EXCLUDED.not_included,
      pitch_one_line = EXCLUDED.pitch_one_line,
      pitch_three_lines = EXCLUDED.pitch_three_lines,
      objections = EXCLUDED.objections,
      ideal_client = EXCLUDED.ideal_client,
      sales_material_urls = EXCLUDED.sales_material_urls,
      refund_window_days = EXCLUDED.refund_window_days,
      refund_auto = EXCLUDED.refund_auto,
      website_url = EXCLUDED.website_url,
      training_type = EXCLUDED.training_type,
      training_duration_min = EXCLUDED.training_duration_min
     RETURNING id`,
    [
      companyId, p.name, p.description || '', p.price, p.commission_pct, p.type, p.image_url,
      p.target_audience || '', p.features || [], p.not_included || [],
      p.pitch_one_line || '', p.pitch_three_lines || '',
      JSON.stringify(p.objections || []),
      p.ideal_client || '', p.sales_material_urls || [],
      p.refund_window_days || 7, p.refund_auto || false, p.website_url || '',
      p.training_type || '', p.training_duration_min || 0,
    ]
  );
  return result.rows[0].id;
}

export async function seedData() {
  // 1. Seed companies and products
  const allProductIds: string[] = [];

  for (const company of COMPANIES) {
    const companyId = await getOrInsertCompany(company.name, company.logo_url);
    for (const product of company.products) {
      const productId = await getOrInsertProduct(companyId, product);
      allProductIds.push(productId);
    }
  }

  // 2. Get vendor user
  const vendorResult = await pool.query(
    `SELECT id FROM users WHERE username = 'vendor'`
  );
  if (vendorResult.rows.length === 0) {
    console.log("Vendor user not found, skipping seed data");
    return;
  }
  const vendorId = vendorResult.rows[0].id;

  // 3. Assign all 6 products to vendor (first 2 active, rest inactive)
  for (let i = 0; i < allProductIds.length; i++) {
    const status = i < 2 ? "active" : "inactive";
    await pool.query(
      `INSERT INTO vendor_products (vendor_id, product_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (vendor_id, product_id) DO NOTHING`,
      [vendorId, allProductIds[i], status]
    );
  }

  // 4. Create 7 sales with commissions
  // Target: pending commissions ~56700, released commissions ~142500
  // We'll use the first two products (active ones) for sales
  const salesData = [
    // Released commissions (completed sales) - total ~142500
    { productIdx: 0, customerName: "Carlos Mendez", customerEmail: "carlos@test.com", status: "completed", commissionStatus: "released", amount: 28350, commissionAmount: 4253 },
    { productIdx: 1, customerName: "Maria Lopez", customerEmail: "maria@test.com", status: "completed", commissionStatus: "released", amount: 62820, commissionAmount: 9423 },
    { productIdx: 0, customerName: "Juan Perez", customerEmail: "juan@test.com", status: "completed", commissionStatus: "released", amount: 28350, commissionAmount: 4253 },
    { productIdx: 1, customerName: "Sofia Garcia", customerEmail: "sofia@test.com", status: "completed", commissionStatus: "released", amount: 62820, commissionAmount: 9423 },
    { productIdx: 0, customerName: "Andres Rios", customerEmail: "andres@test.com", status: "completed", commissionStatus: "released", amount: 28350, commissionAmount: 115148 },
    // Pending commissions - total ~56700
    { productIdx: 1, customerName: "Laura Torres", customerEmail: "laura@test.com", status: "pending", commissionStatus: "pending", amount: 62820, commissionAmount: 47277 },
    { productIdx: 0, customerName: "Diego Vargas", customerEmail: "diego@test.com", status: "pending", commissionStatus: "pending", amount: 28350, commissionAmount: 9423 },
  ];

  // Check if sales already exist for this vendor
  const existingSales = await pool.query(
    `SELECT COUNT(*) as cnt FROM sales WHERE vendor_id = $1`,
    [vendorId]
  );
  if (parseInt(existingSales.rows[0].cnt) > 0) {
    console.log("Seed data already exists, skipping");
    return;
  }

  for (const s of salesData) {
    const saleResult = await pool.query(
      `INSERT INTO sales (vendor_id, product_id, customer_name, customer_email, amount, commission_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [vendorId, allProductIds[s.productIdx], s.customerName, s.customerEmail, s.amount, s.commissionAmount, s.status]
    );
    const saleId = saleResult.rows[0].id;

    await pool.query(
      `INSERT INTO commissions (vendor_id, sale_id, amount, status)
       VALUES ($1, $2, $3, $4)`,
      [vendorId, saleId, s.commissionAmount, s.commissionStatus]
    );
  }

  console.log("Seed data ready");

  // Seed trainings
  const trainings = [
    { title: "Como vender planes mensuales", description: "Aprende las mejores tecnicas para cerrar ventas de planes mensuales", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail_url: "https://picsum.photos/seed/train1/400/225", category: "Ventas" },
    { title: "Guia de comisiones", description: "Entiende como funcionan las comisiones y como maximizar tus ganancias", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", thumbnail_url: "https://picsum.photos/seed/train2/400/225", category: "Comisiones" },
    { title: "Atencion al cliente", description: "Tecnicas de comunicacion efectiva con clientes potenciales", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail_url: "https://picsum.photos/seed/train3/400/225", category: "Clientes" },
    { title: "Plataforma Mensualista - Tutorial", description: "Aprende a usar todas las funcionalidades de la plataforma", type: "link", url: "https://mensualista.com/docs", thumbnail_url: "https://picsum.photos/seed/train4/400/225", category: "Plataforma" },
    { title: "Estrategias de marketing digital", description: "Como usar redes sociales para atraer clientes", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail_url: "https://picsum.photos/seed/train5/400/225", category: "Marketing" },
    { title: "Manual del vendedor", description: "Guia completa con todas las politicas y procedimientos", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", thumbnail_url: "https://picsum.photos/seed/train6/400/225", category: "General" },
  ];

  for (const t of trainings) {
    await pool.query(
      `INSERT INTO trainings (title, description, type, url, thumbnail_url, category)
       SELECT $1, $2, $3, $4, $5, $6
       WHERE NOT EXISTS (SELECT 1 FROM trainings WHERE title = $1)`,
      [t.title, t.description, t.type, t.url, t.thumbnail_url, t.category]
    );
  }

  // Link empresa user to first company
  const firstCompany = await pool.query(`SELECT id FROM companies ORDER BY created_at LIMIT 1`);
  if (firstCompany.rows.length > 0) {
    await pool.query(
      `UPDATE users SET company_id = $1 WHERE username = 'empresa' AND company_id IS NULL`,
      [firstCompany.rows[0].id]
    );
  }

  // Seed chat messages between vendor and empresa
  const empresaResult = await pool.query(`SELECT id, company_id FROM users WHERE username = 'empresa'`);
  if (empresaResult.rows.length > 0 && empresaResult.rows[0].company_id) {
    const empresaId = empresaResult.rows[0].id;
    const empresaCompanyId = empresaResult.rows[0].company_id;

    const existingChats = await pool.query(`SELECT COUNT(*) as cnt FROM chat_messages WHERE company_id = $1`, [empresaCompanyId]);
    if (parseInt(existingChats.rows[0].cnt) === 0) {
      const chatMessages = [
        { sender: vendorId, receiver: empresaId, message: "Hola! Como funciona el codigo de activacion para el Plan Full Gym?" },
        { sender: empresaId, receiver: vendorId, message: "Hola! El codigo se genera automaticamente al registrar la venta. Lo recibes por email junto con las instrucciones." },
        { sender: vendorId, receiver: empresaId, message: "Perfecto, gracias! Ya tengo un cliente interesado." },
        { sender: empresaId, receiver: vendorId, message: "Genial! Recuerda que el periodo de retencion es de 7 dias. Si necesitas materiales adicionales me avisas." },
      ];

      for (const msg of chatMessages) {
        await pool.query(
          `INSERT INTO chat_messages (sender_id, receiver_id, company_id, message) VALUES ($1, $2, $3, $4)`,
          [msg.sender, msg.receiver, empresaCompanyId, msg.message]
        );
        // Small delay to ensure different timestamps
        await new Promise(r => setTimeout(r, 10));
      }
      console.log("Chat messages seeded");
    }
  }

  // Seed coupons for first company
  if (firstCompany.rows.length > 0) {
    const companyId = firstCompany.rows[0].id;
    const existingCoupons = await pool.query(`SELECT COUNT(*) as cnt FROM coupons WHERE company_id = $1`, [companyId]);
    if (parseInt(existingCoupons.rows[0].cnt) === 0) {
      const coupons = [
        { code: "BIENVENIDO20", discount_pct: 20, max_uses: 50, product_id: null },
        { code: "AMIGO10", discount_pct: 10, max_uses: 100, product_id: null },
      ];
      for (const c of coupons) {
        await pool.query(
          `INSERT INTO coupons (company_id, product_id, code, discount_pct, max_uses) VALUES ($1, $2, $3, $4, $5)`,
          [companyId, c.product_id, c.code, c.discount_pct, c.max_uses]
        );
      }
      console.log("Coupons seeded");
    }
  }
}
