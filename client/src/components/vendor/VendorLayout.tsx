import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";

interface SubRoute {
  path: string;
  element: React.ReactNode;
}

interface VendorLayoutProps {
  routes: SubRoute[];
}

export function VendorLayout({ routes }: VendorLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              {routes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
