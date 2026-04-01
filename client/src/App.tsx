import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import VendorDashboard from "@/pages/VendorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import CompanyDashboard from "@/pages/CompanyDashboard";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute role="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company"
            element={
              <ProtectedRoute role="company">
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
