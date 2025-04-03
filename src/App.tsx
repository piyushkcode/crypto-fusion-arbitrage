
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TradingProvider } from '@/contexts/TradingContext';
import { Toaster } from '@/components/ui/toaster';

// Import pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Opportunities from '@/pages/Opportunities';
import Arbitrage from '@/pages/Arbitrage';
import Trading from '@/pages/Trading';
import Exchange from '@/pages/Exchange';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TradingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/arbitrage" element={<Arbitrage />} />
              <Route path="/trading" element={<Trading />} />
              <Route path="/exchange" element={<Exchange />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TradingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
