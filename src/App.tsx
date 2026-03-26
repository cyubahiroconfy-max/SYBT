import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SavingsProvider } from "@/contexts/SavingsContext";
import MainLayout from "@/layouts/MainLayout";
import SavePage from "@/pages/SavePage";
import SpendPage from "@/pages/SpendPage";
import HistoryPage from "@/pages/HistoryPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SavingsProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<SavePage />} />
              <Route path="/spend" element={<SpendPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SavingsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
