import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Requisiciones from "./pages/Requisiciones";
import Reportes from "./pages/Reportes";
import Diligenciar from "./pages/Diligenciar";
import Exportar from "./pages/Exportar";
import InventarioExcluido from "./pages/InventarioExcluido";
import DiasEntregaProveedor from "./pages/DiasEntregaProveedor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            } />
            <Route path="/requisiciones" element={
              <ProtectedRoute>
                <Requisiciones />
              </ProtectedRoute>
            } />
            <Route path="/diligenciar" element={
              <ProtectedRoute>
                <Diligenciar />
              </ProtectedRoute>
            } />
            <Route path="/exportar" element={
              <ProtectedRoute>
                <Exportar />
              </ProtectedRoute>
            } />
            <Route path="/reportes" element={
              <ProtectedRoute>
                <Reportes />
              </ProtectedRoute>
            } />
            <Route path="/inventario-excluido" element={
              <ProtectedRoute>
                <InventarioExcluido />
              </ProtectedRoute>
            } />
            <Route path="/dias-entrega-proveedor" element={
              <ProtectedRoute>
                <DiasEntregaProveedor />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
