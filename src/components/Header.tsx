
import React from 'react';
import { Bell, Settings, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  return (
    <header className="bg-crypto-card shadow-md py-3 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white mr-2">CryptoVantage</h1>
        <span className="text-crypto-purple font-medium">Arbitrage</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-gray-400" />
          </Button>
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-crypto-red"></span>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5 text-gray-400" />
        </Button>
        <div className="flex items-center cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-crypto-purple flex items-center justify-center text-white font-medium mr-2">
            CV
          </div>
          <span className="text-sm text-gray-300 hidden md:block">User</span>
          <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
        </div>
      </div>
    </header>
  );
};

export default Header;
