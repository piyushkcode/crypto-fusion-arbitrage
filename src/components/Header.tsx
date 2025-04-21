
import React from 'react';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-md py-3 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800 mr-2">CryptoVantage</h1>
        <span className="text-blue-600 font-medium">Arbitrage</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mr-2">
            CV
          </div>
          <span className="text-sm text-gray-700 hidden md:block">User</span>
          <ChevronDown className="h-4 w-4 text-gray-600 ml-1" />
        </div>
      </div>
    </header>
  );
};

export default Header;
