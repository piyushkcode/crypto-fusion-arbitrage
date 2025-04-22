
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTradingContext } from '@/contexts/TradingContext';

const Header = () => {
  const { toast } = useToast();
  const { resetTradingState } = useTradingContext();

  const handleReset = () => {
    resetTradingState();
    toast({
      title: "Platform Reset",
      description: "All trades have been reset and balances restored to initial state.",
    });
  };

  return (
    <header className="bg-crypto-card shadow-md py-3 px-6 flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white mr-2">CryptoVantage</h1>
        <span className="text-blue-500 font-medium">Arbitrage</span>
      </div>
      <div className="flex items-center">
        <Button 
          variant="outline"
          size="sm"
          className="mr-4 border-gray-700 text-gray-300 hover:bg-crypto-light-card/50"
          onClick={handleReset}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <div className="flex items-center cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            CV
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
