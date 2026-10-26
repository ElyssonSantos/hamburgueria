import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { useFavicon } from "@/hooks/useFavicon";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Hamburguers from "./pages/Hamburguers";
import Pizzas from "./pages/Pizzas";
import Sorvetes from "./pages/Sorvetes";
import Acai from "./pages/Acai";
import Sobremesas from "./pages/Sobremesas";
import Bebidas from "./pages/Bebidas";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import DynamicCategory from "./pages/DynamicCategory";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => {
  useFavicon();
  useRealtimeNotifications(); // Ativar listener de notificações em tempo real
  
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/hamburguers" element={<Hamburguers />} />
              <Route path="/pizzas" element={<Pizzas />} />
              <Route path="/sorvetes" element={<Sorvetes />} />
              <Route path="/acai" element={<Acai />} />
              <Route path="/sobremesas" element={<Sobremesas />} />
              <Route path="/bebidas" element={<Bebidas />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/categoria/:slug" element={<DynamicCategory />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;