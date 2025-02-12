import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ViewProvider } from "./contexts/ViewContext";
import { AnswersProvider } from "./contexts/AnswersContext";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Home from "./pages/Home";
import Applications from "./pages/Applications";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Documentation from "./pages/Documentation";
import Reports from "./components/Reports/pages/ReportDashboard";
import { DashboardRoutes } from "./components/Dashboard/DashboardDemo";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="light">
        <ViewProvider>
          <AnswersProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/questionnaire"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route path="/dashboard/*" element={<DashboardRoutes />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documentation"
                  element={
                    <ProtectedRoute>
                      <Documentation />
                    </ProtectedRoute>
                  }
                />
                <Route path="/applications" element={<Applications />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </BrowserRouter>
          </AnswersProvider>
        </ViewProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;