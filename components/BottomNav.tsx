import React from 'react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  frigoCount: number;
  hasProduct?: boolean; // Indique si un produit est sélectionné
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange, frigoCount, hasProduct = false }) => {
  const allNavItems = [
    {
      view: View.Scanner,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      label: 'Scanner',
      showBadge: false
    },
    {
      view: View.Frigo,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      label: 'Frigo',
      showBadge: true,
      badgeCount: frigoCount
    },
    {
      view: View.Product,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Produit',
      showBadge: false,
      requiresProduct: true // Nécessite un produit sélectionné
    },
    {
      view: View.Chat,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      label: 'Chat',
      showBadge: false,
      requiresProduct: true // Nécessite un produit sélectionné
    }
  ];

  // Filtrer les items selon si un produit est sélectionné
  const navItems = allNavItems.filter(item => 
    !item.requiresProduct || hasProduct
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-header border-t border-white/10 safe-area-bottom z-40">
      <div className={`flex items-center px-3 pb-3 pt-2 ${
        navItems.length === 2 ? 'justify-center gap-10' : 'justify-around'
      }`}>
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`
              relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl
              transition-all duration-200 touch-feedback min-w-[64px] flex-1 max-w-[120px] border border-transparent
              ${currentView === item.view 
                ? 'text-[#2563eb] border-white/10 bg-white/[0.03]'
                : 'text-gray-400 hover:text-slate-900'
              }
            `}
          >
            {/* Active indicator */}
            {currentView === item.view && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] rounded-full animate-fade-in" />
            )}
            
            {/* Icon container */}
            <div className={`
              relative p-1.5 rounded-xl transition-all
              ${currentView === item.view 
                ? 'bg-[#2563eb]/15 text-[#2563eb]' 
                : 'hover:bg-slate-100'
              }
            `}>
              {item.icon}
              
              {/* Badge */}
              {item.showBadge && item.badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-gradient-to-r from-[#ff8f5c] to-[#ff5ca0] text-white text-[10px] font-bold rounded-full border-2 border-white shadow-lg animate-scale-in">
                  {item.badgeCount > 99 ? '99+' : item.badgeCount}
                </span>
              )}
            </div>
            
            {/* Label */}
            <span className={`
              text-xs font-medium transition-all
              ${currentView === item.view ? 'font-semibold' : ''}
            `}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

