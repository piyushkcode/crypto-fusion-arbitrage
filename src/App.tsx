
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TradingProvider } from './contexts/TradingContext';

import Dashboard from '@/pages/Dashboard';
import Trading from '@/pages/Trading';
import Exchange from '@/pages/Exchange';
import Opportunities from '@/pages/Opportunities';

import '@/App.css';

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TradingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trading" element={<Trading />} />
              <Route path="/exchange" element={<Exchange />} />
              <Route path="/opportunities" element={<Opportunities />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </TradingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
