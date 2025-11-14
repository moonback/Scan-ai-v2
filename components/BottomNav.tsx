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
    <nav 
      className="md:hidden fixed inset-x-0 bottom-1.5 z-40 flex justify-center px-2.5 safe-area-bottom sm:bottom-2 sm:px-3"
      aria-label="Navigation principale"
    >
      <div className="floating-nav pointer-events-auto flex w-full max-w-xs items-center gap-1 rounded-2xl border border-white/20 px-2 py-1 shadow-[0_14px_32px_rgba(15,23,42,0.14)] sm:px-3 sm:py-1.5 bg-white/90 backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`
                relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-0.5 text-[10px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 sm:px-1.5 sm:py-1 sm:text-xs touch-feedback
                ${isActive ? 'text-[var(--accent)] scale-[1.05]' : 'text-slate-400 hover:text-slate-800'}
              `}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              tabIndex={0}
              type="button"
            >
              {isActive && (
                <span className="absolute -top-1 left-1/2 h-1.5 w-7 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#4f46e5] to-[#0ea5e9] opacity-90 sm:-top-1.5 sm:h-1.5 sm:w-10 transition-all duration-150" />
              )}
              <span
                className={`
                  relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-150 sm:h-10 sm:w-10
                  ${isActive
                    ? 'border-transparent bg-gradient-to-br from-[#eef2ff] to-[#dbeafe] text-[var(--accent)] shadow-inner scale-[1.08]'
                    : 'border-white/30 bg-white/60 text-slate-500'}
                `}
                tabIndex={-1}
                aria-hidden="true"
              >
                {item.icon}
                {item.showBadge && item.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white/70 bg-gradient-to-r from-[#fb7185] to-[#f472b6] px-1 text-[9px] font-bold text-white shadow-lg">
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                )}
              </span>
              <span
                className={`transition-opacity duration-200 ${isActive ? 'opacity-100 font-bold' : 'opacity-50 font-normal'} select-none`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

