import React from 'react';
import { PlusCircle, List, BarChart2, Target, Award } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'entry' | 'history' | 'stats' | 'goals' | 'badges';
  onTabChange: (tab: 'entry' | 'history' | 'stats' | 'goals' | 'badges') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'entry', label: 'Log', icon: PlusCircle },
    { id: 'history', label: 'History', icon: List },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'goals', label: 'Goals', icon: Target },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-700 pb-safe z-50 transition-colors duration-300">
      <div className="flex justify-between px-6 items-center h-16 max-w-md mx-auto sm:max-w-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                isActive ? 'text-neon-600 dark:text-neon-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={24} className={`mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium uppercase tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};