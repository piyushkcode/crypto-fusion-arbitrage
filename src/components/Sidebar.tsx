
import React from 'react';
import { BarChart3, Zap, RefreshCw, Book, CircleDollarSign, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { icon: BarChart3, label: 'Dashboard', active: true },
  { icon: Zap, label: 'Opportunities' },
  { icon: RefreshCw, label: 'Arbitrage' },
  { icon: Book, label: 'Trading' },
  { icon: CircleDollarSign, label: 'Exchange' },
];

const Sidebar = () => {
  return (
    <aside className="w-[200px] min-w-[70px] hidden md:block bg-crypto-card border-r border-gray-800 min-h-[calc(100vh-64px)]">
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm cursor-pointer",
                item.active
                  ? "bg-crypto-light-card text-white"
                  : "text-gray-400 hover:text-white hover:bg-crypto-light-card/50"
              )}
            >
              <item.icon className={cn("h-5 w-5", item.active ? "text-crypto-purple" : "text-gray-400")} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
      <div className="absolute bottom-4 left-4 space-y-2">
        <div className="flex items-center gap-x-2 rounded-md px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-crypto-light-card/50 cursor-pointer">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-x-2 rounded-md px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-crypto-light-card/50 cursor-pointer">
          <HelpCircle className="h-5 w-5" />
          <span>Help</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
