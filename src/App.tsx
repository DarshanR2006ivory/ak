import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import Chat from "./pages/dashboard/Chat.tsx";
import Schemes from "./pages/dashboard/Schemes.tsx";
import Farming from "./pages/dashboard/Farming.tsx";
import Mandi from "./pages/dashboard/Mandi.tsx";
import Jobs from "./pages/dashboard/Jobs.tsx";
import Alerts from "./pages/dashboard/Alerts.tsx";
import Community from "./pages/dashboard/Community.tsx";
import { AppShell } from "./components/layout/AppShell.tsx";
import { I18nProvider } from "./lib/I18nProvider.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/app" element={<AppShell><Dashboard /></AppShell>} />
            <Route path="/app/chat" element={<AppShell><Chat /></AppShell>} />
            <Route path="/app/schemes" element={<AppShell><Schemes /></AppShell>} />
            <Route path="/app/farming" element={<AppShell><Farming /></AppShell>} />
            <Route path="/app/mandi" element={<AppShell><Mandi /></AppShell>} />
            <Route path="/app/jobs" element={<AppShell><Jobs /></AppShell>} />
            <Route path="/app/alerts" element={<AppShell><Alerts /></AppShell>} />
            <Route path="/app/community" element={<AppShell><Community /></AppShell>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
