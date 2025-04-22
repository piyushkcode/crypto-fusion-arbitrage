
import React from 'react';

const Header = () => {
  return (
    <header className="bg-crypto-card shadow-md py-3 px-6 flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white mr-2">CryptoVantage</h1>
        <span className="text-blue-500 font-medium">Arbitrage</span>
      </div>
      <div className="flex items-center">
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
