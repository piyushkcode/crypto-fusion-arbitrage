
import React from 'react';
import { BarChart3, Zap, RefreshCw, Book, CircleDollarSign, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
  { icon: Zap, label: 'Opportunities', path: '/opportunities' },
  { icon: RefreshCw, label: 'Arbitrage', path: '/arbitrage' },
  { icon: Book, label: 'Trading', path: '/trading' },
  { icon: CircleDollarSign, label: 'Exchange', path: '/exchange' },
];

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="w-[200px] min-w-[70px] hidden md:block bg-crypto-card border-r border-gray-800 min-h-[calc(100vh-64px)]">
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm cursor-pointer",
                  isActive
                    ? "bg-crypto-light-card text-white"
                    : "text-gray-400 hover:text-white hover:bg-crypto-light-card/50"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-crypto-burgundy" : "text-gray-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="absolute bottom-4 left-4 space-y-2">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm cursor-pointer",
            location.pathname === "/settings"
              ? "bg-crypto-light-card text-white"
              : "text-gray-400 hover:text-white hover:bg-crypto-light-card/50"
          )}
        >
          <Settings className={cn("h-5 w-5", location.pathname === "/settings" ? "text-crypto-burgundy" : "text-gray-400")} />
          <span>Settings</span>
        </Link>
        <div className="flex items-center gap-x-2 rounded-md px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-crypto-light-card/50 cursor-pointer">
          <HelpCircle className="h-5 w-5" />
          <span>Help</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
